import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  MapPin,
  Users,
  Heart,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Circle,
  ShieldCheck,
  FileCheck,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Cause } from "@/src/types";
import { MOCK_CAUSES } from "@/src/data/mockData";
import { causeService } from "@/src/services/causeService";
import { Button } from "@/src/components/common/Button";
import { EmptyState } from "@/src/components/common/EmptyState";
import { formatCurrency } from "@/src/lib/utils";

export const CauseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [cause, setCause] = useState<Cause | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (!id) {
      setIsLoading(false);
      setError("No campaign identifier provided.");
      return;
    }

    const loadCause = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await causeService.getCause(id);
        if (isMounted) {
          setCause(data);
        }
      } catch (err: any) {
        if (isMounted) {
          const fallback = MOCK_CAUSES.find((c) => c.id === id || (c as any).slug === id);
          if (fallback) {
            setCause(fallback);
          } else {
            console.error("Failed to load campaign details:", err);
            setError(err?.message || "Campaign could not be found.");
            setCause(null);
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadCause();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center gap-3 text-stone-500">
        <Loader2 className="w-8 h-8 animate-spin text-[#14532d]" />
        <p className="text-sm font-medium">Loading campaign details from database...</p>
      </div>
    );
  }

  if (error || !cause) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState
          title="Campaign Not Found"
          description={error || "The charitable project you requested could not be located in our catalog."}
          actionLabel="Back to All Programs"
          onAction={() => (window.location.href = "/causes")}
        />
      </div>
    );
  }

  const hasTarget = Boolean(cause.targetAmount && cause.targetAmount > 0);
  const raisedAmount = cause.raisedAmount || 0;
  const percentage = hasTarget
    ? Math.min(100, Math.round((raisedAmount / (cause.targetAmount || 1)) * 100))
    : 0;

  const allocationBreakdown = cause.allocationBreakdown || [];
  const impactMilestones = cause.impactMilestones || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      {/* Back Navigation */}
      <div>
        <Link
          to="/causes"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-[#14532d] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Programs</span>
        </Link>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 8 Cols: Cause Imagery, Story, Milestones, Allocation */}
        <div className="lg:col-span-8 space-y-8">
          {/* Header & Meta */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-stone-100 text-stone-800 border border-stone-200">
                {cause.category}
              </span>
              {cause.urgent && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200">
                  Urgent Requirement
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight leading-tight">
              {cause.title}
            </h1>

            <div className="flex items-center gap-3 text-xs text-stone-600 flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#14532d]" />
                {cause.location}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-stone-500" />
                {cause.donorCount > 0 ? `${cause.donorCount} community supporters` : "Open for community support"}
              </span>
            </div>
          </div>

          {/* Hero Banner Image */}
          <div className="relative aspect-16/9 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shadow-xs">
            <img
              src={cause.imageUrl}
              alt={cause.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Project Narrative */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/90 shadow-xs space-y-4">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">About This Program</h2>
            <p className="text-sm sm:text-base text-stone-700 leading-relaxed font-normal">
              {cause.description}
            </p>
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/60 rounded-xl text-xs text-stone-700 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#14532d] shrink-0" />
              <span>All contributions to this program receive an official receipt with trust registration references and audit verification documentation.</span>
            </div>
          </div>

          {/* Allocation Breakdown (Transparency Plan) */}
          {allocationBreakdown.length > 0 && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/90 shadow-xs space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-lg font-serif font-bold text-stone-900">
                    Itemized Fund Allocation Plan
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Budget split established for this program.
                  </p>
                </div>
              </div>

              {/* Split Progress Bars */}
              <div className="space-y-2.5">
                {allocationBreakdown.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-stone-800">
                      <span>{item.category}</span>
                      <span className="text-[#14532d] font-mono font-semibold">{item.percentage}%</span>
                    </div>
                    <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#14532d] h-full rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-xs text-stone-500 flex items-center gap-2 pt-2 border-t border-stone-100">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  Itemized allocations are verified against trust expenditure records.
                </span>
              </div>
            </div>
          )}

          {/* Impact Milestones */}
          {impactMilestones.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-serif font-bold text-stone-900">Program Milestones</h3>
              <div className="space-y-3">
                {impactMilestones.map((milestone, idx) => {
                  const isCompleted = milestone.status === "completed";
                  const isInProgress = milestone.status === "in_progress";

                  return (
                    <div
                      key={idx}
                      className="flex items-start gap-3.5 p-4 rounded-md border border-stone-200 bg-white shadow-2xs"
                    >
                      <div className="mt-0.5 shrink-0">
                        {isCompleted ? (
                          <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                        ) : isInProgress ? (
                          <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
                            <Clock className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center">
                            <Circle className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 space-y-0.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <h4 className="font-serif font-bold text-stone-900 text-xs sm:text-sm">{milestone.title}</h4>
                          <span className="text-[11px] text-stone-500 font-mono">
                            Target: {milestone.targetDate}
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 leading-relaxed">
                          {milestone.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Program Verification & Field Milestone Tracking */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                  <span>Program Verification & Milestones</span>
                </h3>
                <p className="text-xs text-stone-500">
                  Verified field activities, distribution records, and donor impact milestones.
                </p>
              </div>
            </div>

            {impactMilestones.length > 0 ? (
              <div className="bg-stone-50 rounded-md border border-stone-200 p-5 space-y-3">
                {impactMilestones.map((milestone, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-white p-3 rounded border border-stone-200">
                    <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${milestone.status === "completed" ? "text-emerald-600" : "text-stone-400"}`} />
                    <div className="space-y-0.5 text-xs">
                      <div className="font-semibold text-stone-900">{milestone.title}</div>
                      <div className="text-stone-600">{milestone.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-stone-50 rounded-md border border-stone-200 p-5 text-xs text-stone-600 leading-relaxed">
                Verified impact updates will be published by the Trust as records become available.
              </div>
            )}
          </div>
        </div>

        {/* Right 4 Cols: Sticky Donation Action Card */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 bg-white rounded-2xl border border-stone-200/90 shadow-xs p-6 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#14532d] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-700/20 shadow-2xs">
                Contribution Desk
              </span>
            </div>

            {/* Fund Gauge or Neutral Target Notice */}
            {hasTarget ? (
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-2xl font-serif font-bold text-stone-900">
                    {formatCurrency(cause.raisedAmount || 0)}
                  </span>
                  <span className="text-xs text-stone-500">
                    of {formatCurrency(cause.targetAmount)}
                  </span>
                </div>

                <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#14532d] h-full rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-xs text-stone-500 pt-0.5">
                  <span className="font-bold text-[#14532d]">{percentage}% Funded</span>
                  <span>{formatCurrency(Math.max(0, (cause.targetAmount || 0) - (cause.raisedAmount || 0)))} remaining</span>
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-stone-50 rounded-md border border-stone-200 space-y-1">
                <div className="text-xs font-semibold text-stone-700">Program Funding Status</div>
                <div className="text-xs text-stone-500 italic">
                  Funding target will be published by the Trust.
                </div>
                {cause.raisedAmount > 0 && (
                  <div className="text-xs text-[#14532d] font-semibold pt-1">
                    Current Received Contributions: {formatCurrency(cause.raisedAmount)}
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-1">
              <Link to={`/donate?cause=${cause.id}`}>
                <Button
                  size="md"
                  variant="primary"
                  className="w-full text-xs sm:text-sm font-semibold"
                  leftIcon={<Heart className="w-3.5 h-3.5 fill-current" />}
                >
                  Donate to this Program
                </Button>
              </Link>

              <Link to="/impact-passport">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs"
                  leftIcon={<FileCheck className="w-3.5 h-3.5 text-[#14532d]" />}
                >
                  Lookup Existing Passport
                </Button>
              </Link>
            </div>

            {/* Tax & Trust Guarantees */}
            <div className="space-y-2 pt-3 border-t border-stone-100 text-xs text-stone-600">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>Secure Razorpay 256-Bit Encrypted Payment Gateway</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>Cryptographically Verified Electronic Receipt</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>Direct Trust Program Fund Allocation</span>
              </div>
            </div>

            {/* Contribution info */}
            <div className="p-3 bg-emerald-50/60 rounded text-[11px] text-emerald-900 border border-emerald-200/60">
              All contributions are recorded in the trust database and tracked for transparent program impact.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
