import { Router } from 'express';
import { DonationController } from '../controllers/donation.controller';
import { authenticate, authorize, optionalAuthenticate } from '../middleware/auth';
import { paymentLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * @route   GET /api/donations/config
 * @desc    Get public Razorpay configuration status (key ID, currency)
 * @access  Public
 */
router.get('/config', DonationController.getPaymentConfig);

/**
 * @route   POST /api/donations/create-order (alias: /order)
 * @desc    Generate Razorpay order and create pending donation pledge
 * @access  Public / Authenticated (links user account if logged in)
 */
router.post('/create-order', paymentLimiter, optionalAuthenticate, DonationController.createOrder);
router.post('/order', paymentLimiter, optionalAuthenticate, DonationController.createOrder);

/**
 * @route   POST /api/donations/verify-payment (alias: /verify)
 * @desc    Verify Razorpay HMAC signature & payment state, mark PAID/SUCCESS, increment Cause raisedAmount
 * @access  Public / Authenticated
 */
router.post('/verify-payment', paymentLimiter, optionalAuthenticate, DonationController.verifyPayment);
router.post('/verify', paymentLimiter, optionalAuthenticate, DonationController.verifyPayment);

/**
 * @route   POST /api/donations/webhook
 * @desc    Razorpay webhook listener for asynchronous capture/failure events
 * @access  Public (guarded by HMAC webhook signature)
 */
router.post('/webhook', DonationController.handleWebhook);

/**
 * @route   GET /api/donations/my
 * @desc    Retrieve logged-in donor's historical verified contributions
 * @access  Private (DONOR, ADMIN, STAFF)
 */
router.get(
  '/my',
  authenticate,
  authorize('DONOR', 'ADMIN', 'STAFF'),
  DonationController.getMyDonations
);

/**
 * @route   GET /api/donations
 * @desc    List all donations across campaigns with administrative filtering and summary metrics
 * @access  Private (ADMIN, STAFF only)
 */
router.get(
  '/',
  authenticate,
  authorize('ADMIN', 'STAFF'),
  DonationController.listAllDonations
);

/**
 * @route   GET /api/donations/receipt/:receiptNumber
 * @desc    Retrieve donation receipt by official receipt number
 * @access  Public / Authenticated (with IDOR ownership check if logged in)
 */
router.get(
  '/receipt/:receiptNumber',
  optionalAuthenticate,
  DonationController.getReceiptByNumber
);

/**
 * @route   GET /api/donations/:id
 * @desc    Retrieve donation details by ID with IDOR ownership validation
 * @access  Private (Donation Owner or ADMIN, STAFF)
 */
router.get(
  '/:id',
  authenticate,
  authorize('DONOR', 'ADMIN', 'STAFF'),
  DonationController.getDonationById
);

export default router;
