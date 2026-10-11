import React, { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  CheckCircle2,
  Clock,
  Circle,
  ShieldCheck,
  Building2,
  Heart,
  Receipt,
  FileText,
  Eye,
} from "lucide-react";
import { PassportStage, ImpactPassportRecord } from "@/src/types";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { cn, formatCurrency } from "@/src/lib/utils";

interface ImpactTimelineProps {
  passport: ImpactPassportRecord;
  showCardWrapper?: boolean;
  className?: string;
}

export const ImpactTimeline: React.FC<ImpactTimelineProps> = ({
  passport,
  showCardWrapper = true,
  className,
}) => {
  const [selectedDoc, setSelectedDoc] = useState<{
    stage: PassportStage;
    type: string;
  } | null>(null);

  const shouldReduceMotion = useReducedMotion();

  const getStageIcon = (stage: PassportStage["stage"]) => {
    switch (stage) {
      case "Donation":
        return <Receipt className="w-4 h-4 text-[#14532d]" />;
      case "Allocation":
        return <Building2 className="w-4 h-4 text-[#14532d]" />;
      case "Verification":
        return <ShieldCheck className="w-4 h-4 text-[#14532d]" />;
      case "Impact":
        return <Heart className="w-4 h-4 text-[#14532d]" />;
    }
  };

  const getStatusBadge = (status: PassportStage["status"]) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300/80">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Verified Complete
          </span>
        );
      case "current":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
            <Clock className="w-3 h-3 text-amber-700" />
            In Field Review
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
            <Circle className="w-2.5 h-2.5 text-stone-400" />
            Scheduled
          </span>
        );
    }
  };

  const content = (
    <div className="space-y-6">
      {/* Credible Trust Passport Header Bar */}
      <motion.div
        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="bg-[#112a1d] text-white rounded-md p-5 sm:p-6 border border-emerald-900 shadow-2xs"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                Audited Record
              </span>
              <span className="font-mono text-xs text-stone-300 font-medium">
                #{passport.passportNumber}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Verified Trust Record
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-serif font-bold text-white mt-1">
              {passport.causeTitle}
            </h3>
            <p className="text-xs text-stone-300">
              Donor: <span className="text-white font-medium">{passport.donorName}</span> •
              Amount:{" "}
              <span className="text-amber-300 font-semibold font-mono">
                {formatCurrency(passport.amount)}
              </span>{" "}
              • Logged {passport.donationDate}
            </p>
          </div>

          <div className="bg-stone-900/80 p-3 rounded border border-stone-700/80 shrink-0 text-left md:text-right">
            <span className="text-[10px] uppercase tracking-wider text-stone-400 block">
              Current Status
            </span>
            <span className="text-xs sm:text-sm font-bold text-amber-300">
              {passport.overallStatus}
            </span>
          </div>
        </div>

        {/* 4-Stage Summary Flow */}
        <div className="mt-5 pt-4 border-t border-stone-800">
          <div className="text-[11px] text-stone-400 mb-2 font-medium">
            Sequential Verification Pipeline:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {passport.stages.map((stage, idx) => {
              const isDone = stage.status === "completed";
              const isCurrent = stage.status === "current";
              return (
                <div
                  key={stage.stage}
                  className={cn(
                    "p-2.5 rounded border text-left transition-colors",
                    isDone
                      ? "bg-emerald-950/40 border-emerald-800/80 text-emerald-200"
                      : isCurrent
                      ? "bg-amber-950/50 border-amber-700/80 text-amber-200"
                      : "bg-stone-900/50 border-stone-800 text-stone-400"
                  )}
                >
                  <div className="flex items-center justify-between text-[11px] font-semibold uppercase">
                    <span>
                      {idx + 1}. {stage.stage}
                    </span>
                    {isDone ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    ) : isCurrent ? (
                      <Clock className="w-3 h-3 text-amber-400" />
                    ) : (
                      <Circle className="w-2.5 h-2.5 text-stone-500" />
                    )}
                  </div>
                  <div className="text-[10px] text-stone-400 mt-0.5 truncate">
                    {stage.date || "Pending"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Vertical Stage Steps */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:top-4 before:bottom-4 before:left-3 sm:before:left-4 before:w-0.5 before:bg-stone-200">
        {passport.stages.map((stage, index) => {
          const isDone = stage.status === "completed";
          const isCurrent = stage.status === "current";

          return (
            <motion.div
              key={stage.stage}
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{
                duration: 0.45,
                delay: shouldReduceMotion ? 0 : index * 0.1,
                ease: "easeOut",
              }}
              className="relative group"
            >
              {/* Step indicator circle */}
              <div
                className={cn(
                  "absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border transition-colors",
                  isDone
                    ? "bg-[#14532d] text-white border-[#14532d]"
                    : isCurrent
                    ? "bg-amber-600 text-white border-amber-600"
                    : "bg-stone-100 text-stone-500 border-stone-300"
                )}
              >
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              {/* Stage Card */}
              <div className="bg-white rounded-md border border-stone-200/90 p-4 sm:p-5 shadow-2xs space-y-3 hover:border-stone-400 hover:shadow-xs transition-all duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded bg-emerald-50 text-[#14532d]">
                      {getStageIcon(stage.stage)}
                    </div>
                    <div>
                      <h4 className="text-sm font-serif font-bold text-stone-900">
                        Stage {index + 1}: {stage.stage}
                      </h4>
                      <span className="text-[11px] text-stone-500">
                        {stage.date ? `Recorded on ${stage.date}` : "Awaiting execution"}
                      </span>
                    </div>
                  </div>
                  <div>{getStatusBadge(stage.status)}</div>
                </div>

                <p className="text-xs text-stone-700 leading-relaxed">
                  {stage.description}
                </p>

                {/* Real Verified Ledger Details */}
                {stage.details && stage.details.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-stone-100">
                    {stage.details.map((detail, dIdx) => (
                      <div
                        key={dIdx}
                        className="flex justify-between items-center bg-stone-50/80 px-2.5 py-1.5 rounded border border-stone-200/60"
                      >
                        <span className="text-stone-500 font-medium text-[11px]">{detail.label}:</span>
                        <span className="font-semibold text-stone-800 text-[11px] font-mono truncate ml-2">
                          {detail.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Document Reference / Auditor Information */}
                {(stage.evidenceDocNumber || stage.verifiedBy) && (
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                    {stage.evidenceDocNumber && (
                      <div className="inline-flex items-center gap-1 font-mono text-stone-600 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                        <FileText className="w-3 h-3 text-[#14532d]" />
                        <span>Ref: {stage.evidenceDocNumber}</span>
                      </div>
                    )}
                    {stage.verifiedBy && (
                      <span className="text-stone-600 text-[11px]">
                        Auditor: <strong className="text-stone-800">{stage.verifiedBy}</strong>
                      </span>
                    )}
                  </div>
                )}

                {/* Proof dockets */}
                {stage.proofDocuments && stage.proofDocuments.length > 0 && (
                  <div className="pt-2 border-t border-stone-100">
                    <span className="text-[11px] font-semibold text-stone-500 block mb-1.5">
                      Supporting Ledger Documents:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {stage.proofDocuments.map((doc, docIdx) => (
                        <button
                          key={docIdx}
                          type="button"
                          onClick={() => setSelectedDoc({ stage, type: doc })}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-700 bg-stone-50 hover:bg-stone-100 hover:text-stone-900 px-2.5 py-1 rounded border border-stone-200 transition-colors cursor-pointer"
                        >
                          <FileText className="w-3 h-3 text-[#14532d]" />
                          <span>{doc}</span>
                          <Eye className="w-3 h-3 text-stone-400 ml-0.5" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Proof Document Inspection Modal */}
      {selectedDoc && (
        <Modal
          isOpen={!!selectedDoc}
          onClose={() => setSelectedDoc(null)}
          title={`Audit Document: ${selectedDoc.type}`}
          description={`Passport #${passport.passportNumber} • Stage: ${selectedDoc.stage.stage}`}
          size="md"
        >
          <div className="space-y-4 text-xs font-mono">
            <div className="p-3 bg-stone-100 rounded border border-stone-200 text-stone-700 text-xs font-sans">
              <strong>Sample Verification Artifact:</strong> Illustrates the record format used by Trust officers to attach supplier receipts, weighment slips, and completion certificates to campaign milestones.
            </div>

            <div className="bg-stone-50 rounded border border-stone-300 p-4 space-y-2 text-stone-800">
              <div className="flex justify-between border-b border-stone-200 pb-1.5">
                <span className="text-stone-500">Document Type:</span>
                <span className="font-bold">{selectedDoc.type}</span>
              </div>
              <div className="flex justify-between border-b border-stone-200 pb-1.5">
                <span className="text-stone-500">Related Cause:</span>
                <span className="font-sans text-xs">{passport.causeTitle}</span>
              </div>
              <div className="flex justify-between border-b border-stone-200 pb-1.5">
                <span className="text-stone-500">Execution Date:</span>
                <span>{selectedDoc.stage.date}</span>
              </div>
              <div className="flex justify-between border-b border-stone-200 pb-1.5">
                <span className="text-stone-500">Audited Amount:</span>
                <span className="font-bold text-[#14532d]">
                  {formatCurrency(passport.amount)}
                </span>
              </div>
              <div className="pt-2 text-[11px] font-sans text-stone-600 leading-relaxed">
                {selectedDoc.stage.description}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button size="sm" variant="outline" onClick={() => setSelectedDoc(null)}>
                Close Record
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );

  if (!showCardWrapper) {
    return <div className={className}>{content}</div>;
  }

  return (
    <div
      className={cn(
        "bg-white rounded-md border border-stone-200 p-5 sm:p-7 shadow-2xs",
        className
      )}
    >
      {content}
    </div>
  );
};
