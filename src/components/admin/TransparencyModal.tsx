import React, { useState, useEffect } from "react";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import { TransparencyReport } from "@/src/types";
import { transparencyService, CreateTransparencyInput } from "@/src/services/transparencyService";
import { Modal } from "@/src/components/common/Modal";
import { Button } from "@/src/components/common/Button";
import { FileUploadField } from "@/src/components/common/FileUploadField";

interface TransparencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportToEdit: TransparencyReport | null;
  onSuccess: (savedReportTitle: string) => void;
}

export const TransparencyModal: React.FC<TransparencyModalProps> = ({
  isOpen,
  onClose,
  reportToEdit,
  onSuccess,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reportType, setReportType] = useState("Annual Report");
  const [financialYear, setFinancialYear] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [auditRating, setAuditRating] = useState("");
  const [auditorFirm, setAuditorFirm] = useState("");
  const [statutoryType, setStatutoryType] = useState("");
  const [totalDisbursal, setTotalDisbursal] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isKumbhRelated, setIsKumbhRelated] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormError(null);
      if (reportToEdit) {
        setTitle(reportToEdit.title || "");
        setDescription(reportToEdit.description || "");
        setReportType(reportToEdit.reportType || "Annual Report");
        setFinancialYear(reportToEdit.financialYear || "FY 2024-25");
        setFileUrl(reportToEdit.fileUrl || "");
        setCoverImage(reportToEdit.coverImage || "");
        setFileSize(reportToEdit.fileSize || "");
        setAuditRating(reportToEdit.auditRating || "");
        setAuditorFirm(reportToEdit.auditorFirm || "");
        setStatutoryType(reportToEdit.statutoryType || "");
        setTotalDisbursal(reportToEdit.totalDisbursal || "");
        setIsPublished(reportToEdit.isPublished !== undefined ? reportToEdit.isPublished : true);
        setIsFeatured(!!reportToEdit.isFeatured);
        setIsKumbhRelated(!!reportToEdit.isKumbhRelated);
      } else {
        setTitle("");
        setDescription("");
        setReportType("Annual Report");
        setFinancialYear("FY 2024-25");
        setFileUrl("");
        setCoverImage("");
        setFileSize("");
        setAuditRating("");
        setAuditorFirm("");
        setStatutoryType("");
        setTotalDisbursal("");
        setIsPublished(true);
        setIsFeatured(false);
        setIsKumbhRelated(false);
      }
    }
  }, [isOpen, reportToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError("Report title is required.");
      return;
    }
    if (!description.trim()) {
      setFormError("Report description is required.");
      return;
    }
    if (!financialYear.trim()) {
      setFormError("Financial year is required (e.g. FY 2024-25).");
      return;
    }

    setIsSaving(true);
    try {
      const payload: CreateTransparencyInput = {
        title: title.trim(),
        description: description.trim(),
        reportType,
        financialYear: financialYear.trim(),
        fileUrl: fileUrl.trim() || undefined,
        coverImage: coverImage.trim() || undefined,
        fileSize: fileSize.trim() || undefined,
        auditRating: auditRating.trim() || undefined,
        auditorFirm: auditorFirm.trim() || undefined,
        statutoryType: statutoryType.trim() || undefined,
        totalDisbursal: totalDisbursal.trim() || undefined,
        isPublished,
        isFeatured,
        isKumbhRelated,
      };

      if (reportToEdit) {
        await transparencyService.updateReport(reportToEdit.id, payload);
      } else {
        await transparencyService.createReport(payload);
      }

      onSuccess(title.trim());
      onClose();
    } catch (err: any) {
      console.error("Failed to save transparency report:", err);
      setFormError(err?.message || "Failed to save transparency report.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={reportToEdit ? `Edit Report: ${reportToEdit.title}` : "Publish New Statutory / Audit Report"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {formError && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        {/* Title */}
        <div className="space-y-1">
          <label className="font-semibold text-stone-800 block">
            Report Title <span className="text-rose-600">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Annual Audited Financial Statements & Balance Sheet"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-700"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Report Type */}
          <div className="space-y-1">
            <label className="font-semibold text-stone-800 block">
              Report Type <span className="text-rose-600">*</span>
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-700"
            >
              <option value="Annual Report">Annual Report</option>
              <option value="Financial Report">Financial Report</option>
              <option value="Audit Report">Audit Report</option>
              <option value="Impact Report">Impact Report</option>
              <option value="Donation Utilization Report">Donation Utilization Report</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Financial Year */}
          <div className="space-y-1">
            <label className="font-semibold text-stone-800 block">
              Financial Year <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. FY 2024-25"
              value={financialYear}
              onChange={(e) => setFinancialYear(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-700"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="font-semibold text-stone-800 block">
            Executive Summary / Overview <span className="text-rose-600">*</span>
          </label>
          <textarea
            required
            rows={3}
            placeholder="Brief summary of disclosures, audit findings, trust activities, or donor fund deployments..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-700 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Auditor Firm */}
          <div className="space-y-1">
            <label className="font-semibold text-stone-800 block">
              Auditor Firm / Certifying CA
            </label>
            <input
              type="text"
              placeholder="e.g. M/s K. B. Deshmukh & Associates"
              value={auditorFirm}
              onChange={(e) => setAuditorFirm(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-700"
            />
          </div>

          {/* Statutory Type */}
          <div className="space-y-1">
            <label className="font-semibold text-stone-800 block">
              Statutory Filing / Document Type
            </label>
            <input
              type="text"
              placeholder="e.g. Annual Audit Report or Institutional Review"
              value={statutoryType}
              onChange={(e) => setStatutoryType(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-700"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Total Disbursal */}
          <div className="space-y-1">
            <label className="font-semibold text-stone-800 block">
              Reported Charitable Disbursal
            </label>
            <input
              type="text"
              placeholder="e.g. ₹1,42,80,000"
              value={totalDisbursal}
              onChange={(e) => setTotalDisbursal(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-700"
            />
          </div>

          {/* Audit Rating */}
          <div className="space-y-1">
            <label className="font-semibold text-stone-800 block">
              Audit Rating / Opinion
            </label>
            <input
              type="text"
              placeholder="e.g. Unqualified Clean Opinion"
              value={auditRating}
              onChange={(e) => setAuditRating(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-700"
            />
          </div>
        </div>

        {/* PDF Report Document Upload & URL */}
        <FileUploadField
          label="Annual/Financial Report Document (PDF)"
          category="DOCUMENT"
          value={fileUrl}
          onChange={(url) => setFileUrl(url)}
          onFileSizeChange={(sizeStr) => setFileSize(sizeStr)}
          placeholder="https://... or click upload above"
          helperText="Upload official PDF (under 10MB) or paste a verified document link."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* File Size */}
          <div className="space-y-1">
            <label className="font-semibold text-stone-800 block text-xs">
              File Size / Format Indicator
            </label>
            <input
              type="text"
              placeholder="e.g. PDF (2.4 MB)"
              value={fileSize}
              onChange={(e) => setFileSize(e.target.value)}
              className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-700 text-xs"
            />
          </div>

          {/* Cover Image */}
          <FileUploadField
            label="Report Cover Image (Optional)"
            category="IMAGE"
            value={coverImage}
            onChange={(url) => setCoverImage(url)}
            placeholder="https://... or click upload above"
            helperText="Optional report preview image."
          />
        </div>

        {/* Checkboxes */}
        <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 space-y-2.5">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-800 focus:ring-emerald-700 accent-emerald-800"
            />
            <span className="font-semibold text-stone-800">Publish immediately (Make visible on live website)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 accent-amber-600"
            />
            <span className="font-semibold text-stone-800">Mark as Featured (Pin at top of Transparency page)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isKumbhRelated}
              onChange={(e) => setIsKumbhRelated(e.target.checked)}
              className="w-4 h-4 rounded text-amber-700 focus:ring-amber-600 accent-amber-700"
            />
            <span className="font-semibold text-stone-800">Nashik Simhastha Kumbh 2027 Special Audit / Disclosure</span>
          </label>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isSaving}
            className="bg-[#14532d] hover:bg-[#0f4023] text-white inline-flex items-center gap-1.5"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving to MongoDB...</span>
              </>
            ) : (
              <span>{reportToEdit ? "Update Report" : "Publish to Live Website"}</span>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
