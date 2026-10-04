import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import {
  Receipt,
  Building2,
  ShieldCheck,
  Heart,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  ExternalLink,
} from "lucide-react";
import { Button } from "../common/Button";
import { useLanguage } from "@/src/context/LanguageContext";
import { cn } from "@/src/lib/utils";

interface StageDetail {
  id: number;
  stage: string;
  nameKey: string;
  descKey: string;
  actionDoc: string;
  deliverable: string;
  timeframe: string;
  icon: typeof Receipt;
  status: "completed" | "verified" | "impact";
  sampleRef: string;
}

export const ImpactJourneyInteractive: React.FC = () => {
  const { t } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const [activeStage, setActiveStage] = useState<number>(3); // Default highlight on verification stage

  const stages: StageDetail[] = [
    {
      id: 1,
      stage: "Stage 1",
      nameKey: t.stageDonation,
      descKey: t.stageDonationDesc,
      actionDoc: "Official Numbered Receipt & Ledger Docket",
      deliverable: "Digital Ledger Entry",
      timeframe: "Real-time (0 mins)",
      icon: Receipt,
      status: "completed",
      sampleRef: "REC-2025-0891",
    },
    {
      id: 2,
      stage: "Stage 2",
      nameKey: t.stageAllocation,
      descKey: t.stageAllocationDesc,
      actionDoc: "Procurement Docket & Purchase Order",
      deliverable: "Material PO Issued",
      timeframe: "Within 48 hours",
      icon: Building2,
      status: "completed",
      sampleRef: "PO-MED-9942",
    },
    {
      id: 3,
      stage: "Stage 3",
      nameKey: t.stageVerification,
      descKey: t.stageVerificationDesc,
      actionDoc: "Chartered Auditor Physical Inspection",
      deliverable: "Stamped Sign-off",
      timeframe: "Field completion",
      icon: ShieldCheck,
      status: "verified",
      sampleRef: "AUDIT-CERT-773",
    },
    {
      id: 4,
      stage: "Stage 4",
      nameKey: t.stageImpact,
      descKey: t.stageImpactDesc,
      actionDoc: "Beneficiary Milestone & Medical Discharge",
      deliverable: "Human Outcome Log",
      timeframe: "Continuous monitoring",
      icon: Heart,
      status: "impact",
      sampleRef: "OUTCOME-REP-114",
    },
  ];

  return (
    <div className="bg-[#fcfaf7] border border-stone-300/80 rounded-md p-6 sm:p-10 shadow-2xs">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#14532d] bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-700/20">
              Core Innovation
            </span>
            <span className="text-xs text-stone-500 font-mono">
              Audit Pipeline Architecture
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight leading-tight">
            {t.passportJourneyTitle}
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
            {t.passportJourneySubtitle}
          </p>
        </div>

        <Link to="/impact-passport">
          <Button
            variant="outline"
            size="sm"
            className="text-xs shrink-0"
            rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
          >
            Explore Public Ledger
          </Button>
        </Link>
      </div>

      {/* SVG Connecting Track (Desktop) */}
      <div className="relative mb-6 hidden md:block">
        <div className="h-1 w-full bg-stone-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#14532d] rounded-full origin-left"
            initial={shouldReduceMotion ? { width: "100%" } : { width: "0%" }}
            whileInView={{ width: "100%" }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1.0] }}
          />
        </div>
      </div>

      {/* 4 Sequential Interactive Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
        {stages.map((st, index) => {
          const Icon = st.icon;
          const isSelected = activeStage === st.id;

          return (
            <motion.div
              key={st.id}
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{
                duration: 0.5,
                delay: shouldReduceMotion ? 0 : index * 0.15,
                ease: "easeOut",
              }}
              whileHover={!shouldReduceMotion ? { y: -4 } : undefined}
              onClick={() => setActiveStage(st.id)}
              className={cn(
                "cursor-pointer rounded-md p-5 border transition-all duration-200 flex flex-col justify-between relative",
                isSelected
                  ? "bg-white border-[#14532d] shadow-sm ring-2 ring-emerald-700/15"
                  : "bg-white/80 border-stone-200 hover:border-stone-300 hover:bg-white shadow-2xs"
              )}
            >
              {/* Active Step Indicator Pill */}
              {isSelected && (
                <div className="absolute -top-2.5 right-3 bg-[#14532d] text-white text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded shadow-xs">
                  Inspecting Stage
                </div>
              )}

              <div>
                {/* Step number badge & icon */}
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "w-7 h-7 rounded text-xs font-bold flex items-center justify-center border transition-colors",
                        isSelected
                          ? "bg-[#14532d] text-white border-[#14532d]"
                          : "bg-stone-100 text-stone-700 border-stone-300"
                      )}
                    >
                      {st.id}
                    </span>
                    <span className="text-[11px] font-mono text-stone-400 font-semibold">
                      {st.stage}
                    </span>
                  </div>

                  <motion.div
                    whileHover={!shouldReduceMotion ? { scale: 1.15, rotate: 5 } : undefined}
                    className={cn(
                      "p-1.5 rounded transition-colors",
                      isSelected ? "bg-emerald-50 text-[#14532d]" : "text-stone-400"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.div>
                </div>

                <h3 className="text-base font-serif font-bold text-stone-900 leading-snug">
                  {st.nameKey}
                </h3>
                <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                  {st.descKey}
                </p>
              </div>

              {/* Bottom verification badge */}
              <div className="mt-4 pt-3 border-t border-stone-100 space-y-1 text-[11px]">
                <div className="flex items-center justify-between text-stone-500">
                  <span>Audit Artifact:</span>
                  <span className="font-mono text-[10px] text-[#14532d] font-semibold">
                    {st.sampleRef}
                  </span>
                </div>
                <div className="text-stone-700 font-medium truncate">
                  {st.actionDoc}
                </div>
                <div className="text-[10px] text-stone-400">
                  Speed: {st.timeframe}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Selected Stage Detail Drawer */}
      <motion.div
        key={activeStage}
        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-6 p-4 sm:p-5 rounded-md bg-[#0d2818] text-white border border-emerald-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
              Selected Lifecycle Phase: {stages[activeStage - 1].nameKey}
            </span>
            <span className="text-stone-400">•</span>
            <span className="text-xs text-stone-300">
              Verified under Trust Accounting Standards
            </span>
          </div>
          <p className="text-xs text-stone-300 max-w-2xl leading-relaxed">
            Every contribution logged in the system generates a linked voucher trail (
            <code className="text-amber-300 font-mono">
              {stages[activeStage - 1].sampleRef}
            </code>
            ) ensuring allocated program funds directly reach the vetted humanitarian destination.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          <Link to={`/impact-passport?stage=${stages[activeStage - 1].stage.toLowerCase()}`}>
            <Button
              size="sm"
              variant="outline"
              className="bg-stone-900 border-stone-700 text-white hover:bg-stone-800 text-xs"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Verify Live Records
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
