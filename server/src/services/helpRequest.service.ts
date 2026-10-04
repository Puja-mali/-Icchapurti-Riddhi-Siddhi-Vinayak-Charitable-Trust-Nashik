import mongoose from 'mongoose';
import { HelpRequest, IHelpRequest } from '../models/HelpRequest';
import {
  CreateHelpRequestInput,
  UpdateHelpRequestAdminInput,
  HelpRequestQueryParams,
} from '../validators/helpRequest.validator';
import { AppError } from '../utils/apiResponse';
import { NotificationService } from './notification.service';
import { EmailService } from './email.service';
import { logger } from '../utils/logger';

export interface PaginatedHelpRequests {
  requests: IHelpRequest[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  metrics?: {
    total: number;
    pending: number;
    underReview: number;
    approved: number;
    rejected: number;
    inProgress: number;
    resolved: number;
    closed: number;
  };
}

export class HelpRequestService {
  /**
   * Helper to verify DB readiness
   */
  private static checkDatabaseConnection(): void {
    if (mongoose.connection.readyState !== 1) {
      throw new AppError('Database service is currently unavailable. Please try again later.', 503);
    }
  }

  /**
   * Submit a new help request (authenticated user ID derived when available, or null for public)
   */
  public static async createHelpRequest(
    data: CreateHelpRequestInput,
    authenticatedUserId?: string
  ): Promise<IHelpRequest> {
    this.checkDatabaseConnection();

    let requesterObjectId: mongoose.Types.ObjectId | null = null;
    if (authenticatedUserId) {
      if (!mongoose.Types.ObjectId.isValid(authenticatedUserId)) {
        throw new AppError('Invalid authenticated user identity', 401);
      }
      requesterObjectId = new mongoose.Types.ObjectId(authenticatedUserId);
    }

    const request = await HelpRequest.create({
      requesterId: requesterObjectId,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim(),
      requestType: data.requestType,
      description: data.description.trim(),
      location: data.location.trim(),
      urgency: data.urgency || 'MEDIUM',
      status: 'PENDING',
      adminNotes: '',
    });

    const trackingId = `SCT-REQ-${request._id.toString().slice(-6).toUpperCase()}`;

    // Send confirmation email non-blockingly
    EmailService.sendHelpRequestReceivedEmail({
      email: request.email,
      requesterName: request.name,
      trackingId,
      category: request.requestType,
    }).catch((err) => logger.error(`[HelpRequestService] Email error: ${err.message}`));

    // In-app notification for authenticated requester
    if (request.requesterId) {
      NotificationService.createNotification({
        recipientId: request.requesterId,
        type: 'HELP_REQUEST_SUBMITTED',
        title: 'Aid Request Lodged',
        message: `Your request for ${request.requestType} assistance was registered with ID: ${trackingId}.`,
        link: '/dashboard',
        relatedEntity: { entityType: 'HelpRequest', entityId: request._id },
        metadata: { trackingId, category: request.requestType },
      }).catch((err) => logger.error(`[HelpRequestService] Notification error: ${err.message}`));
    }

    // Notify Admins of new incoming help request
    NotificationService.notifyAdmins({
      type: 'HELP_REQUEST_SUBMITTED',
      title: `New Seva Aid Request (${request.urgency})`,
      message: `${request.name} requested ${request.requestType} assistance in ${request.location}.`,
      link: '/admin',
      metadata: { requestId: request._id.toString(), trackingId },
    }).catch((err) => logger.error(`[HelpRequestService] Admin notification error: ${err.message}`));

    return request;
  }

  /**
   * Get all requests created by the authenticated user
   */
  public static async getMyHelpRequests(authenticatedUserId: string): Promise<IHelpRequest[]> {
    if (mongoose.connection.readyState !== 1) {
      return [];
    }

    if (!mongoose.Types.ObjectId.isValid(authenticatedUserId)) {
      throw new AppError('Invalid authenticated user identity', 401);
    }

    const requests = await HelpRequest.find({
      requesterId: new mongoose.Types.ObjectId(authenticatedUserId),
    })
      .sort({ createdAt: -1 })
      .select('-adminNotes') // Sensitive admin notes protected from ordinary user view
      .lean()
      .exec();

    return requests as unknown as IHelpRequest[];
  }

  /**
   * Get single request with strict IDOR ownership check
   */
  public static async getHelpRequestById(
    requestId: string,
    authenticatedUserId: string,
    isAdmin: boolean = false
  ): Promise<IHelpRequest> {
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      throw new AppError('Invalid help request ID format', 400);
    }

    this.checkDatabaseConnection();

    const request = await HelpRequest.findById(requestId)
      .populate('requesterId', 'name email phone')
      .populate('assignedTo', 'name email')
      .exec();

    if (!request) {
      throw new AppError('Help request not found', 404);
    }

    // IDOR ownership verification
    const requesterIdStr = request.requesterId
      ? ((request.requesterId as any)._id || request.requesterId).toString()
      : null;

    const isOwner = Boolean(requesterIdStr && requesterIdStr === authenticatedUserId.toString());

    if (!isOwner && !isAdmin) {
      throw new AppError('Forbidden: You are not authorized to view another user’s help request.', 403);
    }

    // If requester is viewing, protect admin notes
    if (!isAdmin) {
      const sanitized = request.toObject();
      delete (sanitized as any).adminNotes;
      return sanitized as IHelpRequest;
    }

    return request;
  }

  /**
   * Admin: List all requests with filters, search, and real database status counts
   */
  public static async getAllRequestsAdmin(
    params: HelpRequestQueryParams
  ): Promise<PaginatedHelpRequests> {
    if (mongoose.connection.readyState !== 1) {
      return {
        requests: [],
        pagination: {
          page: params.page || 1,
          limit: params.limit || 20,
          total: 0,
          totalPages: 0,
        },
        metrics: {
          total: 0,
          pending: 0,
          underReview: 0,
          approved: 0,
          rejected: 0,
          inProgress: 0,
          resolved: 0,
          closed: 0,
        },
      };
    }

    const { page = 1, limit = 20, status, requestType, urgency, search } = params;
    const filter: Record<string, any> = {};

    if (status && status !== 'ALL') {
      filter.status = status;
    }

    if (requestType && requestType !== 'ALL') {
      filter.requestType = requestType;
    }

    if (urgency && urgency !== 'ALL') {
      filter.urgency = urgency;
    }

    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
        { location: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [requests, total, statusCounts] = await Promise.all([
      HelpRequest.find(filter)
        .populate('requesterId', 'name email phone')
        .populate('assignedTo', 'name email')
        .populate('reviewedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      HelpRequest.countDocuments(filter),
      HelpRequest.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const countMap: Record<string, number> = {};
    let totalAll = 0;
    statusCounts.forEach((c: { _id: string; count: number }) => {
      countMap[c._id] = c.count;
      totalAll += c.count;
    });

    const metrics = {
      total: totalAll,
      pending: countMap['PENDING'] || 0,
      underReview: countMap['UNDER_REVIEW'] || 0,
      approved: countMap['APPROVED'] || 0,
      rejected: countMap['REJECTED'] || 0,
      inProgress: countMap['IN_PROGRESS'] || 0,
      resolved: countMap['RESOLVED'] || 0,
      closed: countMap['CLOSED'] || 0,
    };

    return {
      requests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      metrics,
    };
  }

  /**
   * Admin: Get single request by ID with complete populate
   */
  public static async getAdminRequestById(requestId: string): Promise<IHelpRequest> {
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      throw new AppError('Invalid help request ID format', 400);
    }

    this.checkDatabaseConnection();

    const request = await HelpRequest.findById(requestId)
      .populate('requesterId', 'name email phone role createdAt')
      .populate('assignedTo', 'name email role')
      .populate('reviewedBy', 'name email role')
      .exec();

    if (!request) {
      throw new AppError('Help request not found', 404);
    }

    return request;
  }

  /**
   * Admin: Update status, adminNotes, assignment
   */
  public static async updateRequestAdmin(
    requestId: string,
    data: UpdateHelpRequestAdminInput,
    adminUserId: string
  ): Promise<IHelpRequest> {
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      throw new AppError('Invalid help request ID format', 400);
    }

    this.checkDatabaseConnection();

    const existing = await HelpRequest.findById(requestId);
    if (!existing) {
      throw new AppError('Help request not found to update', 404);
    }

    const isStatusChanged = Boolean(data.status && data.status !== existing.status);
    const updatePayload: Record<string, any> = {};

    if (data.status) {
      updatePayload.status = data.status;
      if (data.status === 'RESOLVED' || data.status === 'CLOSED') {
        updatePayload.resolvedAt = new Date();
      }
    }

    if (data.adminNotes !== undefined) {
      updatePayload.adminNotes = data.adminNotes.trim();
    }

    if (data.urgency) {
      updatePayload.urgency = data.urgency;
    }

    if (data.assignedTo !== undefined) {
      updatePayload.assignedTo = data.assignedTo
        ? new mongoose.Types.ObjectId(data.assignedTo)
        : null;
    }

    // Always record audit trail of review
    updatePayload.reviewedBy = new mongoose.Types.ObjectId(adminUserId);
    updatePayload.reviewedAt = new Date();

    const updated = await HelpRequest.findByIdAndUpdate(requestId, updatePayload, {
      new: true,
      runValidators: true,
    })
      .populate('requesterId', 'name email phone')
      .populate('assignedTo', 'name email')
      .populate('reviewedBy', 'name email')
      .exec();

    if (!updated) {
      throw new AppError('Help request not found to update', 404);
    }

    const trackingId = `SCT-REQ-${updated._id.toString().slice(-6).toUpperCase()}`;

    // If status was changed, send email and notification
    if (isStatusChanged) {
      EmailService.sendHelpRequestStatusUpdatedEmail({
        email: updated.email,
        requesterName: updated.name,
        trackingId,
        status: updated.status,
        adminNotes: updated.adminNotes,
      }).catch((err) => logger.error(`[HelpRequestService] Status email error: ${err.message}`));

      if (updated.requesterId) {
        NotificationService.createNotification({
          recipientId: (updated.requesterId as any)._id || updated.requesterId,
          type: 'HELP_REQUEST_STATUS_UPDATED',
          title: `Aid Request Status: ${updated.status}`,
          message: `Your aid request (${trackingId}) status has been updated to ${updated.status}.`,
          link: '/dashboard',
          relatedEntity: { entityType: 'HelpRequest', entityId: updated._id },
          metadata: { status: updated.status, trackingId },
        }).catch((err) => logger.error(`[HelpRequestService] Status notification error: ${err.message}`));
      }
    }

    return updated;
  }

  /**
   * Admin: Permanently delete help request record
   */
  public static async deleteRequestAdmin(requestId: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      throw new AppError('Invalid help request ID format', 400);
    }

    this.checkDatabaseConnection();

    const deleted = await HelpRequest.findByIdAndDelete(requestId).exec();
    if (!deleted) {
      throw new AppError('Help request not found to delete', 404);
    }
  }
}
