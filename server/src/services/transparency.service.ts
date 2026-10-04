import mongoose from 'mongoose';
import { TransparencyReport, ITransparencyReport } from '../models/TransparencyReport';
import { AppError } from '../utils/apiResponse';
import {
  TransparencyQueryParams,
  CreateTransparencyInput,
  UpdateTransparencyInput,
} from '../validators/transparency.validator';

export class TransparencyService {
  /**
   * Retrieve publicly available, published transparency reports
   */
  public static async getPublishedReports(query: TransparencyQueryParams): Promise<{
    reports: ITransparencyReport[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const page = Math.max(1, parseInt(query.page || '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || '20', 10) || 20));
    const skip = (page - 1) * limit;

    // Fast-exit if database is disconnected to avoid buffering hang
    if (mongoose.connection.readyState !== 1) {
      return {
        reports: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
      };
    }

    const filter: Record<string, any> = { isPublished: true };

    if (query.reportType && query.reportType !== 'All') {
      filter.reportType = query.reportType;
    }

    if (query.financialYear && query.financialYear !== 'All') {
      filter.financialYear = query.financialYear;
    }

    if (query.isFeatured !== undefined) {
      filter.isFeatured = query.isFeatured === 'true';
    }

    if (query.isKumbhRelated !== undefined) {
      filter.isKumbhRelated = query.isKumbhRelated === 'true';
    }

    if (query.search && query.search.trim()) {
      const escaped = query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(escaped, 'i');
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { financialYear: searchRegex },
        { auditorFirm: searchRegex },
        { statutoryType: searchRegex },
      ];
    }

    const [reports, total] = await Promise.all([
      TransparencyReport.find(filter)
        .sort({ isFeatured: -1, financialYear: -1, publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name email')
        .exec(),
      TransparencyReport.countDocuments(filter),
    ]);

    return {
      reports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Retrieve a single report by ID
   */
  public static async getReportById(
    id: string,
    isAdmin: boolean = false
  ): Promise<ITransparencyReport> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid transparency report ID format', 400);
    }

    if (mongoose.connection.readyState !== 1) {
      throw new AppError('Database service is currently unavailable. Please try again later.', 503);
    }

    const query: Record<string, any> = { _id: id };
    if (!isAdmin) {
      query.isPublished = true;
    }

    const report = await TransparencyReport.findOne(query)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .exec();

    if (!report) {
      throw new AppError('Transparency report not found or currently unavailable', 404);
    }

    return report;
  }

  /**
   * Admin: Retrieve all transparency reports with full status visibility
   */
  public static async getAllReportsAdmin(query: TransparencyQueryParams): Promise<{
    reports: ITransparencyReport[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const page = Math.max(1, parseInt(query.page || '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || '50', 10) || 50));
    const skip = (page - 1) * limit;

    if (mongoose.connection.readyState !== 1) {
      return {
        reports: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
      };
    }

    const filter: Record<string, any> = {};

    if (query.reportType && query.reportType !== 'All') {
      filter.reportType = query.reportType;
    }

    if (query.financialYear && query.financialYear !== 'All') {
      filter.financialYear = query.financialYear;
    }

    if (query.isPublished && query.isPublished !== 'ALL') {
      filter.isPublished = query.isPublished === 'true';
    }

    if (query.isFeatured !== undefined) {
      filter.isFeatured = query.isFeatured === 'true';
    }

    if (query.isKumbhRelated !== undefined) {
      filter.isKumbhRelated = query.isKumbhRelated === 'true';
    }

    if (query.search && query.search.trim()) {
      const escaped = query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(escaped, 'i');
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { financialYear: searchRegex },
        { auditorFirm: searchRegex },
        { statutoryType: searchRegex },
      ];
    }

    const [reports, total] = await Promise.all([
      TransparencyReport.find(filter)
        .sort({ isFeatured: -1, financialYear: -1, publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email')
        .exec(),
      TransparencyReport.countDocuments(filter),
    ]);

    return {
      reports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Admin: Create a new transparency report
   */
  public static async createReport(
    data: CreateTransparencyInput,
    userId: string | mongoose.Types.ObjectId
  ): Promise<ITransparencyReport> {
    if (mongoose.connection.readyState !== 1) {
      throw new AppError('Database service is currently unavailable. Please try again later.', 503);
    }

    const report = new TransparencyReport({
      title: data.title,
      description: data.description,
      reportType: data.reportType,
      financialYear: data.financialYear,
      periodStart: data.periodStart ? new Date(data.periodStart) : undefined,
      periodEnd: data.periodEnd ? new Date(data.periodEnd) : undefined,
      fileUrl: data.fileUrl || '',
      coverImage: data.coverImage || '',
      fileSize: data.fileSize || '',
      auditRating: data.auditRating || '',
      auditorFirm: data.auditorFirm || '',
      statutoryType: data.statutoryType || '',
      totalDisbursal: data.totalDisbursal || '',
      isPublished: data.isPublished ?? true,
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : new Date(),
      isFeatured: data.isFeatured ?? false,
      isKumbhRelated: data.isKumbhRelated ?? false,
      createdBy: new mongoose.Types.ObjectId(userId.toString()),
      updatedBy: new mongoose.Types.ObjectId(userId.toString()),
    });

    await report.save();
    return report;
  }

  /**
   * Admin: Update an existing report
   */
  public static async updateReport(
    id: string,
    data: UpdateTransparencyInput,
    userId: string | mongoose.Types.ObjectId
  ): Promise<ITransparencyReport> {
    if (mongoose.connection.readyState !== 1) {
      throw new AppError('Database service is currently unavailable. Please try again later.', 503);
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid transparency report ID format', 400);
    }

    const report = await TransparencyReport.findById(id);
    if (!report) {
      throw new AppError('Transparency report not found to update', 404);
    }

    if (data.title !== undefined) report.title = data.title;
    if (data.description !== undefined) report.description = data.description;
    if (data.reportType !== undefined) report.reportType = data.reportType;
    if (data.financialYear !== undefined) report.financialYear = data.financialYear;
    if (data.periodStart !== undefined) {
      report.periodStart = data.periodStart ? new Date(data.periodStart) : undefined;
    }
    if (data.periodEnd !== undefined) {
      report.periodEnd = data.periodEnd ? new Date(data.periodEnd) : undefined;
    }
    if (data.fileUrl !== undefined) report.fileUrl = data.fileUrl;
    if (data.coverImage !== undefined) report.coverImage = data.coverImage;
    if (data.fileSize !== undefined) report.fileSize = data.fileSize;
    if (data.auditRating !== undefined) report.auditRating = data.auditRating;
    if (data.auditorFirm !== undefined) report.auditorFirm = data.auditorFirm;
    if (data.statutoryType !== undefined) report.statutoryType = data.statutoryType;
    if (data.totalDisbursal !== undefined) report.totalDisbursal = data.totalDisbursal;
    if (data.isPublished !== undefined) report.isPublished = data.isPublished;
    if (data.publishedAt !== undefined) {
      report.publishedAt = data.publishedAt ? new Date(data.publishedAt) : report.publishedAt;
    }
    if (data.isFeatured !== undefined) report.isFeatured = data.isFeatured;
    if (data.isKumbhRelated !== undefined) report.isKumbhRelated = data.isKumbhRelated;

    report.updatedBy = new mongoose.Types.ObjectId(userId.toString());

    await report.save();
    return report;
  }

  /**
   * Admin: Permanently delete a transparency report
   */
  public static async deleteReport(id: string): Promise<void> {
    if (mongoose.connection.readyState !== 1) {
      throw new AppError('Database service is currently unavailable. Please try again later.', 503);
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid transparency report ID format', 400);
    }

    const report = await TransparencyReport.findByIdAndDelete(id);
    if (!report) {
      throw new AppError('Transparency report not found to delete', 404);
    }
  }
}
