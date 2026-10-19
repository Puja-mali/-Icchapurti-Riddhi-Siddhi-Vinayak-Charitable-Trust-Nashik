import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Donation } from '../models/Donation';
import { Cause } from '../models/Cause';
import { RazorpayService } from '../services/razorpay.service';
import { NotificationService } from '../services/notification.service';
import { EmailService } from '../services/email.service';
import { env } from '../config/env';
import { sendSuccess, sendError, AppError } from '../utils/apiResponse';
import { logger } from '../utils/logger';
import {
  createDonationOrderSchema,
  verifyDonationPaymentSchema,
} from '../validators/donation.validator';

export class DonationController {
  /**
   * Get public Razorpay payment configuration
   * @access Public
   */
  public static async getPaymentConfig(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const config = RazorpayService.getPublicConfig();
      sendSuccess(res, config, 'Payment gateway configuration status');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create Razorpay Order and record pending Donation
   * @access Public / Authenticated (links donorId if logged in)
   */
  public static async createOrder(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // 1. Validate request payload first
      const validated = createDonationOrderSchema.parse(req.body);

      // 2. Database readiness check
      if (mongoose.connection.readyState !== 1) {
        throw new AppError('Database connection is temporarily unavailable. Please try again shortly.', 503);
      }

      // 3. Validate gateway configuration
      if (!RazorpayService.isConfigured()) {
        throw new AppError(
          'Razorpay payment gateway is not configured on the server. RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in the server environment.',
          503
        );
      }

      // Verify Cause if specified
      let cause = null;
      if (validated.causeId) {
        cause = await Cause.findById(validated.causeId);
        if (!cause) {
          throw new AppError('The specified cause or campaign was not found.', 404);
        }
        if (cause.status === 'ARCHIVED') {
          throw new AppError('This campaign has been archived and cannot receive contributions.', 400);
        }
        if (cause.status === 'DRAFT') {
          const isPrivileged = req.user && (req.user.role === 'ADMIN' || req.user.role === 'STAFF');
          if (!isPrivileged) {
            throw new AppError('This campaign is currently in draft mode and not accepting public contributions.', 400);
          }
        }
      }

      // Create internal initial donation record (status: CREATED, paymentStatus: CREATED)
      const donation = await Donation.create({
        donorId: req.user ? new mongoose.Types.ObjectId(req.user._id) : null,
        donorName: validated.donorName,
        donorEmail: validated.donorEmail,
        donorPhone: validated.donorPhone || '',
        amount: validated.amount,
        currency: validated.currency || 'INR',
        causeId: cause ? cause._id : null,
        purpose: validated.purpose || (cause ? `Support for: ${cause.title}` : 'General Trust Corpus'),
        status: 'CREATED',
        paymentStatus: 'CREATED',
        isTestMode: true,
      });

      // Create corresponding order in Razorpay
      const receiptTag = `rcpt_${donation._id.toString().slice(-8)}`;
      let razorpayOrder;
      try {
        razorpayOrder = await RazorpayService.createOrder({
          amount: validated.amount,
          currency: validated.currency || 'INR',
          receipt: receiptTag,
          notes: {
            donationId: donation._id.toString(),
            causeId: cause ? cause._id.toString() : '',
            donorEmail: validated.donorEmail,
            donorName: validated.donorName,
          },
        });
      } catch (err: any) {
        // Order creation failed with Razorpay gateway
        donation.status = 'FAILED';
        donation.paymentStatus = 'FAILED';
        donation.failureReason = err.error?.description || err.message || 'Razorpay order creation failed';
        await donation.save();
        logger.error(`Razorpay order creation failed: ${err.message || err}`);
        throw new AppError(
          `Payment gateway order generation failed: ${err.error?.description || err.message || 'Gateway error'}`,
          502
        );
      }

      // Update donation with official Razorpay order ID and move to PENDING
      donation.razorpayOrderId = razorpayOrder.id;
      donation.status = 'PENDING';
      donation.paymentStatus = 'PENDING';
      await donation.save();

      sendSuccess(
        res,
        {
          orderId: razorpayOrder.id,
          amount: razorpayOrder.amount, // in paise
          currency: razorpayOrder.currency,
          donationId: donation._id,
          keyId: env.RAZORPAY_KEY_ID,
          donor: {
            name: donation.donorName,
            email: donation.donorEmail,
            phone: donation.donorPhone,
          },
          causeTitle: cause ? cause.title : 'General Trust Corpus',
        },
        'Razorpay order created successfully',
        201
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cryptographically verify payment signature, validate transaction with Razorpay,
   * mark donation PAID/SUCCESS, atomically increment Cause raisedAmount, and generate receipt.
   * Enforces IDOR authorization and duplicate replay protection.
   * @access Public / Authenticated
   */
  public static async verifyPayment(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const validated = verifyDonationPaymentSchema.parse(req.body);

      if (mongoose.connection.readyState !== 1) {
        throw new AppError('Database connection is temporarily unavailable. Please try again shortly.', 503);
      }

      if (!RazorpayService.isConfigured()) {
        throw new AppError('Payment gateway configuration is missing.', 503);
      }

      // 1. Locate donation record
      const donation = await Donation.findOne({ razorpayOrderId: validated.razorpayOrderId });
      if (!donation) {
        throw new AppError('Donation record matching the provided Razorpay Order ID was not found.', 404);
      }

      // 2. IDOR / Authorization check: Prevent a user from verifying another user's order
      if (donation.donorId) {
        if (!req.user) {
          throw new AppError(
            'Authentication required to verify this registered user donation. Please log in with the donor account.',
            401
          );
        }
        const isOwner = donation.donorId.toString() === req.user._id.toString();
        const isStaffOrAdmin = req.user.role === 'ADMIN' || req.user.role === 'STAFF';
        if (!isOwner && !isStaffOrAdmin) {
          throw new AppError(
            'Forbidden: You are not authorized to verify another donor’s payment order.',
            403
          );
        }
      }

      // 3. Idempotent check: If already paid and verified, return existing record
      if (
        donation.status === 'PAID' ||
        donation.status === 'SUCCESS' ||
        donation.paymentStatus === 'PAID' ||
        donation.paymentStatus === 'SUCCESS'
      ) {
        const populated = await Donation.findById(donation._id).populate('causeId', 'title slug');
        sendSuccess(res, { donation: populated }, 'Donation was already verified.');
        return;
      }

      // 4. Duplicate / Replay Protection: Ensure payment ID has not already been used on a different donation
      const existingWithPayment = await Donation.findOne({
        razorpayPaymentId: validated.razorpayPaymentId,
        _id: { $ne: donation._id },
      });
      if (existingWithPayment) {
        throw new AppError(
          'This Razorpay Payment ID has already been credited to another contribution record.',
          400
        );
      }

      // 5. Cryptographic signature check (Server-side HMAC-SHA256 with RAZORPAY_KEY_SECRET)
      const isSignatureValid = RazorpayService.verifySignature({
        orderId: validated.razorpayOrderId,
        paymentId: validated.razorpayPaymentId,
        signature: validated.razorpaySignature,
      });

      if (!isSignatureValid) {
        await Donation.updateOne(
          { _id: donation._id, status: { $nin: ['PAID', 'SUCCESS'] } },
          {
            $set: {
              status: 'FAILED',
              paymentStatus: 'FAILED',
              failureReason: 'Cryptographic signature mismatch / invalid Razorpay signature',
              razorpayPaymentId: validated.razorpayPaymentId,
              razorpaySignature: validated.razorpaySignature,
            },
          }
        );
        logger.warn(
          `Tampered or invalid signature for order ${validated.razorpayOrderId} / payment ${validated.razorpayPaymentId}`
        );
        throw new AppError(
          'Payment verification failed: cryptographic signature mismatch. Transaction not authorized.',
          400
        );
      }

      // 6. Verify payment directly against Razorpay API
      let paymentDetails: any;
      try {
        paymentDetails = await RazorpayService.fetchPayment(validated.razorpayPaymentId);
      } catch (err: any) {
        logger.error(`Failed to fetch payment details from Razorpay: ${err.message || err}`);
        throw new AppError('Could not verify payment status with payment gateway.', 502);
      }

      // Cross-check payment parameters
      if (paymentDetails.order_id !== validated.razorpayOrderId) {
        throw new AppError('Payment transaction does not match this donation order.', 400);
      }

      const acceptableStatuses = ['captured', 'authorized'];
      if (!acceptableStatuses.includes(paymentDetails.status)) {
        throw new AppError(
          `Payment is in '${paymentDetails.status}' state. Only captured payments can be completed.`,
          400
        );
      }

      const expectedSubunits = Math.round(donation.amount * 100);
      if (Number(paymentDetails.amount) !== expectedSubunits) {
        logger.error(
          `Amount mismatch on payment ${validated.razorpayPaymentId}: expected ${expectedSubunits}, received ${paymentDetails.amount}`
        );
        throw new AppError('Payment amount mismatch between gateway and recorded pledge.', 400);
      }

      // 7. Generate unique official receipt number
      const receiptNumber = `SCT-REC-${Date.now().toString(36).toUpperCase()}-${Math.floor(
        1000 + Math.random() * 9000
      )}`;

      const paymentMethod = paymentDetails.method || 'online';

      // 8. Idempotent Atomic Update & Transaction Support: Only proceed if status is not already PAID/SUCCESS
      const now = new Date();
      let updatedDonation: any = null;

      let session: mongoose.ClientSession | null = null;
      let transactionCommitted = false;

      try {
        session = await mongoose.startSession();
        session.startTransaction();

        updatedDonation = await Donation.findOneAndUpdate(
          {
            _id: donation._id,
            status: { $nin: ['PAID', 'SUCCESS'] },
          },
          {
            $set: {
              status: 'PAID',
              paymentStatus: 'PAID',
              razorpayPaymentId: validated.razorpayPaymentId,
              razorpaySignature: validated.razorpaySignature,
              paymentMethod,
              paidAt: now,
              paymentVerifiedAt: now,
              receiptNumber,
              receiptUrl: `/api/donations/receipt/${receiptNumber}`,
              failureReason: null,
              isTestMode: true,
            },
          },
          { new: true, session }
        ).populate('causeId', 'title slug');

        if (updatedDonation && updatedDonation.causeId) {
          await Cause.findByIdAndUpdate(
            updatedDonation.causeId,
            {
              $inc: {
                raisedAmount: updatedDonation.amount,
                donorCount: 1,
              },
            },
            { session }
          );
        }

        await session.commitTransaction();
        transactionCommitted = true;
      } catch (txErr: any) {
        // Multi-document transaction not supported (e.g. standalone Mongo) or failed
        if (session && !transactionCommitted) {
          try {
            await session.abortTransaction();
          } catch (_) {}
        }

        // Safe atomic fallback without transaction session
        updatedDonation = await Donation.findOneAndUpdate(
          {
            _id: donation._id,
            status: { $nin: ['PAID', 'SUCCESS'] },
          },
          {
            $set: {
              status: 'PAID',
              paymentStatus: 'PAID',
              razorpayPaymentId: validated.razorpayPaymentId,
              razorpaySignature: validated.razorpaySignature,
              paymentMethod,
              paidAt: now,
              paymentVerifiedAt: now,
              receiptNumber,
              receiptUrl: `/api/donations/receipt/${receiptNumber}`,
              failureReason: null,
              isTestMode: true,
            },
          },
          { new: true }
        ).populate('causeId', 'title slug');

        if (updatedDonation && updatedDonation.causeId) {
          await Cause.findByIdAndUpdate(updatedDonation.causeId, {
            $inc: {
              raisedAmount: updatedDonation.amount,
              donorCount: 1,
            },
          });
        }
      } finally {
        if (session) {
          await session.endSession().catch(() => {});
        }
      }

      logger.info(
        `Donation ${updatedDonation._id} verified successfully. Receipt: ${updatedDonation.receiptNumber}`
      );

      // Trigger In-App Notification and Email Receipt in non-blocking background tasks
      const causeTitle = (updatedDonation.causeId as any)?.title || 'General Trust Corpus';
      if (updatedDonation.donorId) {
        NotificationService.createNotification({
          recipientId: updatedDonation.donorId,
          type: 'DONATION_SUCCESS',
          title: `Donation Verified: ₹${updatedDonation.amount.toLocaleString('en-IN')}`,
          message: `Your contribution of ₹${updatedDonation.amount.toLocaleString(
            'en-IN'
          )} for "${causeTitle}" was verified. Receipt #${updatedDonation.receiptNumber} issued.`,
          link: '/dashboard',
          relatedEntity: { entityType: 'Donation', entityId: updatedDonation._id },
          metadata: {
            receiptNumber: updatedDonation.receiptNumber,
            amount: updatedDonation.amount,
            causeTitle,
          },
        }).catch((err) => logger.error(`Error creating donor notification: ${err.message}`));
      }

      if (updatedDonation.donorEmail) {
        EmailService.sendDonationSuccessEmail({
          donorEmail: updatedDonation.donorEmail,
          donorName: updatedDonation.donorName,
          amount: updatedDonation.amount,
          receiptNumber: updatedDonation.receiptNumber!,
          causeTitle,
          receiptUrl: updatedDonation.receiptUrl ?? undefined,
          paymentId: updatedDonation.razorpayPaymentId,
        }).catch((err) => logger.error(`Error sending donation success email: ${err.message}`));
      }

      // Notify Trust Admins
      NotificationService.notifyAdmins({
        type: 'DONATION_SUCCESS',
        title: `Contribution Received: ₹${updatedDonation.amount.toLocaleString('en-IN')}`,
        message: `Donor ${updatedDonation.donorName} contributed ₹${updatedDonation.amount.toLocaleString(
          'en-IN'
        )} towards "${causeTitle}".`,
        link: '/admin',
        metadata: {
          donationId: updatedDonation._id.toString(),
          receiptNumber: updatedDonation.receiptNumber,
        },
      }).catch((err) => logger.error(`Error notifying admins of donation: ${err.message}`));

      sendSuccess(
        res,
        { donation: updatedDonation },
        'Payment verified successfully. Official trust receipt generated.',
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle Razorpay Webhooks idempotently
   * Uses raw body for cryptographic HMAC verification
   * @access Public (guarded by HMAC webhook signature)
   */
  public static async handleWebhook(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const signature = (req.headers['x-razorpay-signature'] ||
        req.headers['X-Razorpay-Signature']) as string;
      const rawBody = (req as any).rawBodyBuffer || (req as any).rawBody;

      if (!signature) {
        sendError(res, 'Missing webhook signature', 400);
        return;
      }

      if (!rawBody) {
        logger.error('Raw request body is unavailable for webhook signature verification');
        sendError(res, 'Raw request body unavailable for signature verification', 400);
        return;
      }

      const isValid = RazorpayService.verifyWebhookSignature(rawBody, signature);
      if (!isValid) {
        logger.warn('Invalid Razorpay webhook signature received');
        sendError(res, 'Invalid webhook signature', 400);
        return;
      }

      const event = req.body;
      const eventType = event.event;

      logger.info(`Razorpay webhook received: ${eventType}`);

      if (eventType === 'payment.captured' || eventType === 'order.paid') {
        const paymentEntity = event.payload?.payment?.entity;
        const orderId = paymentEntity?.order_id || event.payload?.order?.entity?.id;
        const paymentId = paymentEntity?.id;
        const method = paymentEntity?.method || 'online';

        if (orderId) {
          const donation = await Donation.findOne({ razorpayOrderId: orderId });
          if (
            donation &&
            donation.status !== 'PAID' &&
            donation.status !== 'SUCCESS' &&
            donation.paymentStatus !== 'PAID'
          ) {
            const receiptNumber = `SCT-REC-${Date.now().toString(36).toUpperCase()}-${Math.floor(
              1000 + Math.random() * 9000
            )}`;
            const now = new Date();

            const updatedDonation = await Donation.findOneAndUpdate(
              {
                _id: donation._id,
                status: { $nin: ['PAID', 'SUCCESS'] },
              },
              {
                $set: {
                  status: 'PAID',
                  paymentStatus: 'PAID',
                  razorpayPaymentId: paymentId || donation.razorpayPaymentId,
                  paymentMethod: method,
                  paidAt: now,
                  paymentVerifiedAt: now,
                  receiptNumber,
                  receiptUrl: `/api/donations/receipt/${receiptNumber}`,
                  failureReason: null,
                  isTestMode: true,
                },
              },
              { new: true }
            );

            if (updatedDonation && updatedDonation.causeId) {
              await Cause.findByIdAndUpdate(updatedDonation.causeId, {
                $inc: {
                  raisedAmount: updatedDonation.amount,
                  donorCount: 1,
                },
              });
              logger.info(
                `[Webhook] Cause ${updatedDonation.causeId} incremented by ₹${updatedDonation.amount}`
              );
            }

            if (updatedDonation) {
              const cause = updatedDonation.causeId ? await Cause.findById(updatedDonation.causeId).select('title').lean() : null;
              const causeTitle = cause?.title || 'General Trust Corpus';

              if (updatedDonation.donorId) {
                NotificationService.createNotification({
                  recipientId: updatedDonation.donorId,
                  type: 'DONATION_SUCCESS',
                  title: `Donation Verified: ₹${updatedDonation.amount.toLocaleString('en-IN')}`,
                  message: `Your donation of ₹${updatedDonation.amount.toLocaleString('en-IN')} for "${causeTitle}" was verified. Receipt #${updatedDonation.receiptNumber}.`,
                  link: '/dashboard',
                  relatedEntity: { entityType: 'Donation', entityId: updatedDonation._id },
                  metadata: { receiptNumber: updatedDonation.receiptNumber, amount: updatedDonation.amount },
                }).catch((err) => logger.error(`[Webhook] Notification error: ${err.message}`));
              }

              if (updatedDonation.donorEmail) {
                EmailService.sendDonationSuccessEmail({
                  donorEmail: updatedDonation.donorEmail,
                  donorName: updatedDonation.donorName,
                  amount: updatedDonation.amount,
                  receiptNumber: updatedDonation.receiptNumber!,
                  causeTitle,
                  receiptUrl: updatedDonation.receiptUrl ?? undefined,
                  paymentId: updatedDonation.razorpayPaymentId,
                }).catch((err) => logger.error(`[Webhook] Email error: ${err.message}`));
              }
            }
          }
        }
      } else if (eventType === 'payment.failed') {
        const paymentEntity = event.payload?.payment?.entity;
        const orderId = paymentEntity?.order_id;
        const errorDescription =
          paymentEntity?.error_description || paymentEntity?.error_reason || 'Payment failed';

        if (orderId) {
          const failedDonation = await Donation.findOneAndUpdate(
            { razorpayOrderId: orderId, status: { $nin: ['PAID', 'SUCCESS'] } },
            {
              $set: {
                status: 'FAILED',
                paymentStatus: 'FAILED',
                failureReason: errorDescription,
              },
            },
            { new: true }
          );

          if (failedDonation) {
            if (failedDonation.donorId) {
              NotificationService.createNotification({
                recipientId: failedDonation.donorId,
                type: 'DONATION_FAILED',
                title: `Donation Transaction Failed: ₹${failedDonation.amount.toLocaleString('en-IN')}`,
                message: `Payment attempt of ₹${failedDonation.amount.toLocaleString('en-IN')} failed: ${errorDescription}`,
                link: '/donate',
                relatedEntity: { entityType: 'Donation', entityId: failedDonation._id },
                metadata: { amount: failedDonation.amount, failureReason: errorDescription },
              }).catch((err) => logger.error(`[Webhook] Fail notification error: ${err.message}`));
            }

            if (failedDonation.donorEmail) {
              EmailService.sendDonationFailedEmail({
                donorEmail: failedDonation.donorEmail,
                donorName: failedDonation.donorName,
                amount: failedDonation.amount,
                failureReason: errorDescription,
              }).catch((err) => logger.error(`[Webhook] Fail email error: ${err.message}`));
            }
          }
        }
      }

      // Acknowledge webhook immediately to Razorpay
      res.status(200).json({ status: 'ok', received: true });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get authenticated user's personal verified donations
   * @access Private (DONOR, ADMIN, STAFF)
   */
  public static async getMyDonations(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (mongoose.connection.readyState !== 1) {
        sendSuccess(res, { donations: [] }, 'Personal contribution records retrieved successfully');
        return;
      }

      const donorId = new mongoose.Types.ObjectId(req.user!._id);
      const donations = await Donation.find({ donorId })
        .populate('causeId', 'title slug category imageUrl')
        .sort({ createdAt: -1 })
        .lean();

      sendSuccess(res, { donations }, 'Personal contribution records retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * List all donations across the trust with filtering, search, and metrics
   * @access Private (ADMIN, STAFF only)
   */
  public static async listAllDonations(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
      const skip = (page - 1) * limit;

      if (mongoose.connection.readyState !== 1) {
        sendSuccess(res, {
          donations: [],
          pagination: { page, limit, total: 0, totalPages: 0 },
          metrics: {
            totalCollected: 0,
            totalVerifiedDonations: 0,
            pendingDonations: 0,
            failedDonations: 0,
          },
        }, 'Donations ledger retrieved successfully');
        return;
      }

      const filter: Record<string, any> = {};

      if (req.query.status && req.query.status !== 'ALL') {
        filter.status = req.query.status;
      }

      if (req.query.causeId && mongoose.Types.ObjectId.isValid(req.query.causeId as string)) {
        filter.causeId = new mongoose.Types.ObjectId(req.query.causeId as string);
      }

      if (req.query.search) {
        const searchRegex = new RegExp(String(req.query.search).trim(), 'i');
        filter.$or = [
          { receiptNumber: searchRegex },
          { razorpayOrderId: searchRegex },
          { razorpayPaymentId: searchRegex },
          { donorName: searchRegex },
          { donorEmail: searchRegex },
        ];
      }

      const [donations, total, stats] = await Promise.all([
        Donation.find(filter)
          .populate('donorId', 'name email phone')
          .populate('causeId', 'title slug category')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Donation.countDocuments(filter),
        Donation.aggregate([
          {
            $group: {
              _id: '$status',
              totalAmount: { $sum: '$amount' },
              count: { $sum: 1 },
            },
          },
        ]),
      ]);

      const metrics = {
        totalCollected: stats
          .filter((s) => s._id === 'SUCCESS' || s._id === 'PAID')
          .reduce((acc, curr) => acc + curr.totalAmount, 0),
        totalVerifiedDonations: stats
          .filter((s) => s._id === 'SUCCESS' || s._id === 'PAID')
          .reduce((acc, curr) => acc + curr.count, 0),
        pendingDonations: stats.find((s) => s._id === 'PENDING')?.count || 0,
        failedDonations: stats.find((s) => s._id === 'FAILED')?.count || 0,
      };

      sendSuccess(
        res,
        {
          donations,
          metrics,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
        'All trust donations retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single donation by MongoDB _id with strict IDOR prevention
   * @access Private (Donation Owner or ADMIN, STAFF)
   */
  public static async getDonationById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError('Invalid donation ID format.', 400);
      }

      const donation = await Donation.findById(id)
        .populate('donorId', 'name email phone')
        .populate('causeId', 'title slug category')
        .lean();

      if (!donation) {
        throw new AppError('Donation record not found.', 404);
      }

      // Strict IDOR ownership validation
      const donorIdStr = (donation.donorId as any)?._id
        ? (donation.donorId as any)._id.toString()
        : donation.donorId?.toString();
      const isOwner = Boolean(donorIdStr && donorIdStr === req.user!._id);
      const isAuthorizedStaff = req.user?.role === 'ADMIN' || req.user?.role === 'STAFF';

      if (!isOwner && !isAuthorizedStaff) {
        throw new AppError(
          'Forbidden: You are not authorized to view another donor’s contribution record.',
          403
        );
      }

      sendSuccess(res, { donation }, 'Donation details retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get verified donation receipt by receipt number
   * @access Private / Public with ownership validation
   */
  public static async getReceiptByNumber(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { receiptNumber } = req.params;
      const donation = await Donation.findOne({
        receiptNumber,
        status: { $in: ['SUCCESS', 'PAID'] },
      })
        .populate('causeId', 'title slug category')
        .lean();

      if (!donation) {
        throw new AppError(`Verified receipt '${receiptNumber}' not found.`, 404);
      }

      // Strict IDOR ownership and authentication validation
      const receiptDonorIdStr = (donation.donorId as any)?._id
        ? (donation.donorId as any)._id.toString()
        : donation.donorId?.toString();

      if (receiptDonorIdStr) {
        // Registered donor donation requires authenticated owner or admin/staff
        if (!req.user) {
          throw new AppError(
            'Authentication required to access this donor tax receipt. Please log in.',
            401
          );
        }
        const isOwner = receiptDonorIdStr === req.user._id;
        const isStaff = req.user.role === 'ADMIN' || req.user.role === 'STAFF';

        if (!isOwner && !isStaff) {
          throw new AppError(
            'Forbidden: You are not authorized to access another donor’s tax receipt.',
            403
          );
        }
      } else {
        // Guest donation: if unauthenticated or non-privileged caller, sanitize PII
        const isPrivileged = req.user?.role === 'ADMIN' || req.user?.role === 'STAFF';
        if (!isPrivileged) {
          if (donation.donorEmail) {
            const [local, domain] = donation.donorEmail.split('@');
            donation.donorEmail = `${local.slice(0, 2)}***@${domain || ''}`;
          }
          if (donation.donorPhone && donation.donorPhone.length > 4) {
            donation.donorPhone = `${donation.donorPhone.slice(0, 2)}****${donation.donorPhone.slice(-2)}`;
          }
        }
      }

      sendSuccess(res, { receipt: donation }, 'Official trust receipt retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}
