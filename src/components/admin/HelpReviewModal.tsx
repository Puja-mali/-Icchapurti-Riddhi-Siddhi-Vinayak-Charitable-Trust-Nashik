import React, { useState, useEffect } from "react";
import { AlertCircle, Loader2, Trash2 } from "lucide-react";
import { HelpRequest, HelpRequestStatus } from "@/src/types";
import { helpRequestService } from "@/src/services/helpRequestService";
import { Modal } from "@/src/components/common/Modal";
import { Button } from "@/src/components/common/Button";
import { formatDate } from "@/src/lib/utils";

interface HelpReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  helpRequest: HelpRequest | null;
  onSuccess: (updated: HelpRequest) => void;
  onDelete: (id: string) => void;
}

export const HelpReviewModal: React.FC<HelpReviewModalProps> = ({
  isOpen,
  onClose,
  helpRequest,
  onSuccess,
  onDelete,
}) => {
  const [modalStatusChoice, setModalStatusChoice] = useState<HelpRequestStatus>("PENDING");
  const [modalAdminNotes, setModalAdminNotes] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (helpRequest) {
      setModalStatusChoice(helpRequest.status);
      setModalAdminNotes(helpRequest.adminNotes || "");
      setError(null);
    }
  }, [helpRequest]);

  if (!isOpen || !helpRequest) return null;

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      const updated = await helpRequestService.updateAdminHelpRequest(helpRequest.id, {
        status: modalStatusChoice,
        adminNotes: modalAdminNotes,
      });
      onSuccess(updated);
      onClose();
    } catch (err: any) {
      console.error("Failed to update help request:", err);
      setError(err.message || "Failed to update aid application.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete aid application #${helpRequest.id}? This action is permanent.`)) {
      return;
    }
    try {
      setIsDeleting(true);
      setError(null);
      await helpRequestService.deleteAdminHelpRequest(helpRequest.id);
      onDelete(helpRequest.id);
      onClose();
    } catch (err: any) {
      console.error("Failed to delete help request:", err);
      setError(err.message || "Failed to delete aid application.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Review Aid Application Docket: ${helpRequest.id}`}
      size="lg"
    >
      <div className="space-y-4 text-xs sm:text-sm">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Applicant & Case Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-stone-50 rounded-lg border border-stone-200">
          <div>
            <span className="text-stone-400 block text-[10px] uppercase font-semibold">Applicant Name</span>
            <span className="font-semibold text-stone-900">{helpRequest.name}</span>
          </div>
          <div>
            <span className="text-stone-400 block text-[10px] uppercase font-semibold">Category of Need</span>
            <span className="font-semibold text-stone-900">{helpRequest.requestType}</span>
          </div>
          <div>
            <span className="text-stone-400 block text-[10px] uppercase font-semibold">Contact Details</span>
            <span className="text-stone-800 font-mono">{helpRequest.phone} | {helpRequest.email}</span>
          </div>
          <div>
            <span className="text-stone-400 block text-[10px] uppercase font-semibold">Location / District</span>
            <span className="text-stone-800">{helpRequest.location}</span>
          </div>
          <div>
            <span className="text-stone-400 block text-[10px] uppercase font-semibold">Urgency Classification</span>
            <span className="font-semibold text-amber-800">{helpRequest.urgency}</span>
          </div>
          <div>
            <span className="text-stone-400 block text-[10px] uppercase font-semibold">Submission Date</span>
            <span className="text-stone-800">{formatDate(helpRequest.createdAt)}</span>
          </div>
        </div>

        {/* Circumstances / Description */}
        <div className="space-y-1.5">
          <span className="font-semibold text-stone-800 block text-xs">Hardship Case Narrative:</span>
          <p className="text-xs text-stone-700 bg-white p-3.5 rounded-lg border border-stone-200 leading-relaxed max-h-40 overflow-y-auto">
            {helpRequest.description}
          </p>
        </div>

        {/* Status & Review Controls */}
        <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1">
                Application Status:
              </label>
              <select
                value={modalStatusChoice}
                onChange={(e) => setModalStatusChoice(e.target.value as HelpRequestStatus)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-md bg-white text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-700"
              >
                <option value="PENDING">PENDING</option>
                <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                <option value="APPROVED">APPROVED</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="REJECTED">REJECTED</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1">
                Last Reviewer Audit:
              </label>
              <div className="text-xs text-stone-600 pt-1.5">
                {helpRequest.reviewedAt ? (
                  <span>Reviewed on {formatDate(helpRequest.reviewedAt)}</span>
                ) : (
                  <span className="text-stone-400 italic">Not yet formally reviewed</span>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1">
              Internal Trust Secretariat Notes (Saved to MongoDB):
            </label>
            <textarea
              rows={3}
              value={modalAdminNotes}
              onChange={(e) => setModalAdminNotes(e.target.value)}
              placeholder="Record verification notes, hospital contact, sanctions amount, or reason for decline..."
              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-md bg-white text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-700"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-between items-center gap-2 pt-2 border-t border-stone-200">
          <Button
            size="sm"
            variant="outline"
            disabled={isDeleting}
            className="text-rose-700 border-rose-200 hover:bg-rose-50 text-xs"
            onClick={handleDelete}
          >
            {isDeleting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
            ) : (
              <Trash2 className="w-3.5 h-3.5 mr-1" />
            )}
            Delete Application
          </Button>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onClose}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={isSaving}
              className="bg-[#14532d] hover:bg-[#0f4023] text-white text-xs"
              onClick={handleSave}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  Saving...
                </>
              ) : (
                "Save Review & Notes"
              )}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
