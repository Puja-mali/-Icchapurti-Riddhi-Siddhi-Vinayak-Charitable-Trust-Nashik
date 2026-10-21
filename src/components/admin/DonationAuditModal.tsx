import React from "react";
import { DonationRecord } from "@/src/types";
import { Modal } from "@/src/components/common/Modal";
import { Button } from "@/src/components/common/Button";
import { formatCurrency } from "@/src/lib/utils";

interface DonationAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  donation: DonationRecord | null;
}

export const DonationAuditModal: React.FC<DonationAuditModalProps> = ({
  isOpen,
  onClose,
  donation,
}) => {
  if (!isOpen || !donation) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Donation Audit Record: ${donation.receiptNumber || donation.id}`}
      size="lg"
    >
      <div className="space-y-4 font-mono text-xs">
        <div className="grid grid-cols-2 gap-3 p-4 bg-stone-50 border border-stone-200 rounded-md">
          <div>
            <span className="text-stone-400 block text-[10px]">RECORD ID</span>
            <span className="text-stone-900 break-all">{donation.id}</span>
          </div>
          <div>
            <span className="text-stone-400 block text-[10px]">GATEWAY STATUS</span>
            <span
              className={`font-bold ${
                donation.status === "SUCCESS"
                  ? "text-emerald-700"
                  : "text-amber-700"
              }`}
            >
              {donation.status}
            </span>
          </div>

          <div>
            <span className="text-stone-400 block text-[10px]">RECEIPT NUMBER</span>
            <span className="text-stone-900 font-bold">
              {donation.receiptNumber || "None Issued (Not Captured)"}
            </span>
          </div>

          <div>
            <span className="text-stone-400 block text-[10px]">AMOUNT</span>
            <span className="font-bold text-emerald-800 text-sm">
              {formatCurrency(donation.amount)} {donation.currency}
            </span>
          </div>

          <div>
            <span className="text-stone-400 block text-[10px]">DONOR NAME</span>
            <span className="text-stone-900">{donation.donorName}</span>
          </div>

          <div>
            <span className="text-stone-400 block text-[10px]">DONOR EMAIL</span>
            <span className="text-stone-900">{donation.donorEmail}</span>
          </div>

          {donation.donorPhone && (
            <div>
              <span className="text-stone-400 block text-[10px]">DONOR PHONE</span>
              <span className="text-stone-900">{donation.donorPhone}</span>
            </div>
          )}

          <div>
            <span className="text-stone-400 block text-[10px]">CAUSE ALLOCATION</span>
            <span className="text-stone-900 font-sans">
              {typeof donation.causeId === "object" && donation.causeId !== null
                ? donation.causeId.title
                : donation.purpose || "General Trust Corpus"}
            </span>
          </div>

          <div>
            <span className="text-stone-400 block text-[10px]">RAZORPAY ORDER ID</span>
            <span className="text-stone-900 break-all">
              {donation.razorpayOrderId || "N/A"}
            </span>
          </div>

          <div>
            <span className="text-stone-400 block text-[10px]">RAZORPAY PAYMENT ID</span>
            <span className="text-stone-900 break-all">
              {donation.razorpayPaymentId || "N/A"}
            </span>
          </div>

          <div>
            <span className="text-stone-400 block text-[10px]">CREATED TIMESTAMP</span>
            <span className="text-stone-700">
              {new Date(donation.createdAt).toLocaleString("en-IN")}
            </span>
          </div>

          <div>
            <span className="text-stone-400 block text-[10px]">VERIFICATION TIMESTAMP</span>
            <span className="text-stone-700">
              {donation.paymentVerifiedAt
                ? new Date(donation.paymentVerifiedAt).toLocaleString("en-IN")
                : "Not Verified"}
            </span>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onClose}
          >
            Close Audit Record
          </Button>
        </div>
      </div>
    </Modal>
  );
};
