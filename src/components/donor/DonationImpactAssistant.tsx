import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Loader2,
  TrendingUp,
  HeartHandshake,
  CheckCircle2,
  Layers,
  ArrowRight,
  Info,
  RefreshCw,
} from 'lucide-react';
import { AiService, DonationAllocationResponse } from '@/src/services/aiService';
import { causeService } from '@/src/services/causeService';
import { Cause } from '@/src/types';
import { Button } from '@/src/components/common/Button';
import { formatCurrency } from '@/src/lib/utils';

const PRESET_AMOUNTS = [1000, 2500, 5000, 10000, 25000];

const PRESET_PREFERENCES = [
  'Urgent Medical & Healthcare',
  'Education & Child Welfare',
  'Annadan & Food Relief',
  'Elder & Destitute Care',
];

export const DonationImpactAssistant: React.FC = () => {
  const [amount, setAmount] = useState<number>(5000);
  const [customAmount, setCustomAmount] = useState<string>('5000');
  const [preferredCauseId, setPreferredCauseId] = useState<string>('');
  const [impactPreference, setImpactPreference] = useState<string>('');
  const [includePassportHistory, setIncludePassportHistory] = useState<boolean>(true);

  const [activeCauses, setActiveCauses] = useState<Cause[]>([]);
  const [isLoadingCauses, setIsLoadingCauses] = useState<boolean>(false);

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [result, setResult] = useState<DonationAllocationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCauses = async () => {
      try {
        setIsLoadingCauses(true);
        const res = await causeService.getCauses({ status: 'ACTIVE', limit: 50 });
        if (res && res.causes) {
          setActiveCauses(res.causes);
        }
      } catch (err) {
        console.warn('Failed to pre-fetch active causes for allocation assistant dropdown:', err);
      } finally {
        setIsLoadingCauses(false);
      }
    };
    loadCauses();
  }, []);

  const handleAmountSelect = (val: number) => {
    setAmount(val);
    setCustomAmount(String(val));
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valStr = e.target.value.replace(/[^0-9]/g, '');
    setCustomAmount(valStr);
    const parsed = parseInt(valStr, 10);
    if (!isNaN(parsed)) {
      setAmount(parsed);
    } else {
      setAmount(0);
    }
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!amount || amount < 1) {
      setError('Please provide a valid donation amount of at least ₹1.');
      return;
    }

    if (amount > 5000000) {
      setError('Amount exceeds the single transaction limit of ₹50,00,000.');
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);

      const response = await AiService.getDonationAllocation({
        amount,
        preferredCauseId: preferredCauseId.trim() ? preferredCauseId : undefined,
        impactPreference: impactPreference.trim() ? impactPreference : undefined,
        includePassportHistory,
      });

      setResult(response);
    } catch (err: any) {
      console.error('Failed to generate donation allocation:', err);
      setError(
        err?.message || 'Unable to generate allocation recommendation at this time. Please check connection.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#14532d] to-[#0f3d21] text-white p-5 sm:p-6 border-b border-emerald-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-amber-300 bg-black/30 px-2.5 py-0.5 rounded border border-amber-300/30">
                <Sparkles className="w-3 h-3" />
                AI Giving Advisor
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-200 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-600/40">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Verified Ledger Grounded
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-serif font-bold text-white tracking-tight">
              AI-Powered Donation Allocation & Impact Assistant
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
              Explore how your planned contribution can be strategically allocated across verified active trust causes,
              grounded strictly in real-time MongoDB campaign targets and your personal Impact Passport record.
            </p>
          </div>
        </div>
      </div>

      {/* Input Form Body */}
      <div className="p-5 sm:p-6 border-b border-stone-100 bg-stone-50/50">
        <form onSubmit={handleGenerate} className="space-y-5">
          {/* Donation Amount */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
              Planned Donation Amount (₹) <span className="text-rose-600">*</span>
            </label>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {PRESET_AMOUNTS.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleAmountSelect(val)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                    amount === val
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-100'
                  }`}
                >
                  ₹{val.toLocaleString('en-IN')}
                </button>
              ))}
            </div>
            <div className="relative max-w-xs">
              <span className="absolute left-3 top-2.5 text-stone-500 font-semibold text-sm">₹</span>
              <input
                type="text"
                value={customAmount}
                onChange={handleCustomAmountChange}
                placeholder="Enter custom amount"
                className="w-full pl-8 pr-3 py-2 text-sm font-semibold rounded-md border border-stone-300 bg-white text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-700 focus:border-transparent"
              />
            </div>
          </div>

          {/* Preferred Cause & Impact Preference */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                Preferred Primary Initiative (Optional)
              </label>
              <select
                value={preferredCauseId}
                onChange={(e) => setPreferredCauseId(e.target.value)}
                disabled={isLoadingCauses}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-md border border-stone-300 bg-white text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
              >
                <option value="">Balanced allocation across urgent drives</option>
                {activeCauses.map((cause) => (
                  <option key={cause.id || cause._id} value={cause.id || cause._id}>
                    {cause.title} ({cause.category}{cause.urgent ? ' - URGENT' : ''})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-stone-500">
                The assistant will allocate a priority share to this cause and distribute the remainder across urgent trust drives.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                Impact Preference or Focus (Optional)
              </label>
              <input
                type="text"
                value={impactPreference}
                onChange={(e) => setImpactPreference(e.target.value)}
                placeholder="e.g., Patient medicines, child schooling, hot meals"
                maxLength={200}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-md border border-stone-300 bg-white text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {PRESET_PREFERENCES.map((pref) => (
                  <button
                    key={pref}
                    type="button"
                    onClick={() => setImpactPreference(pref)}
                    className="text-[10px] font-medium bg-stone-200/80 hover:bg-stone-300 text-stone-700 px-2 py-0.5 rounded transition-colors cursor-pointer"
                  >
                    {pref}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Impact Passport Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="includePassportHistory"
              checked={includePassportHistory}
              onChange={(e) => setIncludePassportHistory(e.target.checked)}
              className="w-4 h-4 text-emerald-700 rounded border-stone-300 focus:ring-emerald-600 cursor-pointer"
            />
            <label htmlFor="includePassportHistory" className="text-xs text-stone-700 font-medium cursor-pointer">
              Ground plan with my verified contribution history & Impact Passport milestones
            </label>
          </div>

          {/* Action Button & Disclaimer note */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
            <Button
              type="submit"
              disabled={isGenerating || amount < 1}
              size="md"
              className="bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs border border-emerald-950 px-5"
              leftIcon={
                isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Sparkles className="w-4 h-4 text-amber-300" />
                )
              }
            >
              {isGenerating ? 'Analyzing Verified Trust Drives...' : 'Generate Allocation Plan'}
            </Button>
            <span className="text-[11px] text-stone-500 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              Calculations adhere strictly to verified MongoDB targets. Zero fictitious metrics.
            </span>
          </div>
        </form>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 m-5 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => handleGenerate()}
            className="text-xs font-bold text-rose-700 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {isGenerating && (
        <div className="py-14 px-6 flex flex-col items-center justify-center gap-3 text-stone-500 bg-white">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-800" />
          <div className="text-center space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
              Generating Grounded Allocation Plan
            </h4>
            <p className="text-xs text-stone-500 max-w-sm">
              Cross-referencing active campaign goals, urgent deficit metrics, and your verified donor record...
            </p>
          </div>
        </div>
      )}

      {/* Empty / Unverified State */}
      {!isGenerating && result && !result.verifiedDataAvailable && (
        <div className="py-10 px-6 text-center space-y-3 bg-stone-50/50">
          <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200">
            <AlertCircle className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-stone-800">Verified Trust Data Unavailable</h3>
          <p className="text-xs text-stone-600 max-w-md mx-auto">{result.summaryRationale}</p>
          <div className="text-[11px] text-stone-400">{result.disclaimer}</div>
        </div>
      )}

      {/* Results Display */}
      {!isGenerating && result && result.verifiedDataAvailable && (
        <div className="p-5 sm:p-6 space-y-6 bg-white">
          {/* Foundation & Verification Metadata Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-emerald-50/70 rounded-lg border border-emerald-200/80 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span className="font-semibold text-emerald-950">
                Grounded in {result.verifiedFoundationSummary.activeCausesCount} Verified Active Trust Drives
              </span>
              <span className="text-[10px] text-emerald-800 font-mono bg-emerald-100/70 px-1.5 py-0.5 rounded">
                Model: {result.provider === 'gemini-3.8-flash' ? 'Gemini 3.8 Flash' : 'Statutory Verified Algorithmic'}
              </span>
            </div>

            {result.donorHistoryContext && (
              <div className="text-stone-600 text-[11px] font-medium flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>
                  Your Verified Record: {result.donorHistoryContext.verifiedDonationsCount} contributions (
                  {formatCurrency(result.donorHistoryContext.verifiedTotalContributed)})
                </span>
              </div>
            )}
          </div>

          {/* Rationale & Executive Summary */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Recommended Allocation Strategy
            </div>
            <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-medium bg-stone-50 p-4 rounded-md border border-stone-200">
              {result.summaryRationale}
            </p>
          </div>

          {/* Allocation Breakdown Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-800" />
                Distribution Across Verified Causes (Total: {formatCurrency(result.proposedAmount)})
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {result.allocations.map((item) => (
                <div
                  key={item.causeId}
                  className="rounded-lg border border-stone-200 bg-white p-4 space-y-3 shadow-2xs hover:border-emerald-700/50 transition-colors flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-semibold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                          {item.category}
                        </span>
                        {item.urgent && (
                          <span className="ml-1 text-[10px] font-bold text-rose-700 uppercase tracking-wider bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                            Urgent
                          </span>
                        )}
                        <h4 className="font-serif font-bold text-stone-900 text-sm pt-1 leading-snug">
                          {item.causeTitle}
                        </h4>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-bold text-emerald-900">{formatCurrency(item.allocatedAmount)}</div>
                        <div className="text-[11px] font-semibold text-stone-500">{item.percentage}% Share</div>
                      </div>
                    </div>

                    {/* Percentage Progress Bar */}
                    <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-700 h-full rounded-full transition-all duration-500"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-stone-600 leading-normal">{item.rationale}</p>
                  </div>

                  {/* Verified Allocation Breakdown Pills */}
                  {item.verifiedAllocationBreakdown && item.verifiedAllocationBreakdown.length > 0 && (
                    <div className="pt-2 border-t border-stone-100">
                      <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
                        Official Trust Allocation Formula
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {item.verifiedAllocationBreakdown.map((b, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded font-mono"
                          >
                            {b.category} {b.percentage}%
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Impact Projections & Milestones */}
          <div className="bg-emerald-950 text-white rounded-lg p-4 sm:p-5 space-y-2 border border-emerald-800 shadow-xs">
            <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5" />
              Verified Field Impact Projection
            </div>
            <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed font-normal">
              {result.impactExplanation}
            </p>
          </div>

          {/* Action CTA & AI Disclaimer */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 border-t border-stone-200">
            <div className="space-y-1 max-w-xl">
              <div className="flex items-center gap-1 text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                <Info className="w-3 h-3 text-amber-600" />
                AI Advisory Notice
              </div>
              <p className="text-[11px] text-stone-500 leading-relaxed">{result.disclaimer}</p>
            </div>

            <div className="shrink-0">
              <Link
                to={`/donate?amount=${result.proposedAmount}${
                  result.allocations[0] ? `&causeId=${result.allocations[0].causeId}` : ''
                }`}
              >
                <Button
                  size="md"
                  className="bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs border border-emerald-950 px-4"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Contribute with this Plan
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
