import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  Search,
  ShieldCheck,
  CheckCircle2,
  FileCheck,
  ArrowRight,
  Info,
  Layers,
  HeartHandshake,
  RefreshCw,
  AlertCircle,
  LogIn,
  Lock,
  ExternalLink,
} from "lucide-react";
import { ImpactPassportRecord } from "@/src/types";
import { PassportService } from "@/src/services/passportService";
import { useAuth } from "@/src/context/AuthContext";
import { ImpactTimeline } from "@/src/components/impact/ImpactTimeline";
import { ImpactJourneyInteractive } from "@/src/components/impact/ImpactJourneyInteractive";
import { Button } from "@/src/components/common/Button";
import { useLanguage } from "@/src/context/LanguageContext";

export const ImpactPassport: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedId = searchParams.get("id");
  const { t } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [passports, setPassports] = useState<ImpactPassportRecord[]>([]);
  const [activePassport, setActivePassport] = useState<ImpactPassportRecord | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>(requestedId || "");
  const [isSearchingId, setIsSearchingId] = useState<boolean>(false);

  // Fetch verified passports for the authenticated user from real MongoDB
  const fetchPassports = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      setPassports([]);
      setActivePassport(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Fetch user's personal verified passports
      const userPassports = await PassportService.getMyPassports();
      setPassports(userPassports);

      // 2. If a specific ID is requested in the URL query param
      if (requestedId) {
        // First check in user's loaded passports
        const localMatch = userPassports.find(
          (p) =>
            p.passportNumber.toLowerCase() === requestedId.toLowerCase() ||
            p.id.toLowerCase() === requestedId.toLowerCase()
        );

        if (localMatch) {
          setActivePassport(localMatch);
          setSearchQuery(localMatch.passportNumber);
        } else {
          // If not in personal list, attempt dedicated fetch (works for admin or specific passport ID)
          try {
            const specificRecord = await PassportService.getPassportById(requestedId);
            if (specificRecord) {
              setActivePassport(specificRecord);
              setSearchQuery(specificRecord.passportNumber);
            }
          } catch (err: any) {
            // If forbidden or not found, fallback to first personal passport if available
            if (userPassports.length > 0) {
              setActivePassport(userPassports[0]);
              setSearchQuery(userPassports[0].passportNumber);
            }
            setError(
              err.message ||
                "Requested Impact Passport could not be loaded or you lack authorization."
            );
          }
        }
      } else if (userPassports.length > 0) {
        setActivePassport(userPassports[0]);
        setSearchQuery(userPassports[0].passportNumber);
      } else {
        setActivePassport(null);
      }
    } catch (err: any) {
      console.error("Failed to load Impact Passports from MongoDB:", err);
      setError(
        err.message ||
          "Unable to load verified Impact Passports from the database. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, requestedId]);

  useEffect(() => {
    if (!isAuthLoading) {
      fetchPassports();
    }
  }, [isAuthLoading, fetchPassports]);

  // Handle Search Form Submission
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setError(null);

    // 1. Search within locally fetched user passports first
    const localMatch = passports.find(
      (p) =>
        p.passportNumber.toLowerCase().includes(query.toLowerCase()) ||
        p.donorName.toLowerCase().includes(query.toLowerCase()) ||
        p.causeTitle.toLowerCase().includes(query.toLowerCase()) ||
        p.id.toLowerCase() === query.toLowerCase()
    );

    if (localMatch) {
      setActivePassport(localMatch);
      setSearchParams({ id: localMatch.passportNumber });
      return;
    }

    // 2. If not found in user's personal list, try fetching by ID (useful for Admins or direct docket lookup)
    if (isAuthenticated) {
      setIsSearchingId(true);
      try {
        const foundPassport = await PassportService.getPassportById(query);
        if (foundPassport) {
          setActivePassport(foundPassport);
          setSearchParams({ id: foundPassport.passportNumber });
        }
      } catch (err: any) {
        setError(
          err.message ||
            `No verified Impact Passport found matching "${query}".`
        );
      } finally {
        setIsSearchingId(false);
      }
    }
  };

  const handleSelectPassport = (passport: ImpactPassportRecord) => {
    setActivePassport(passport);
    setSearchQuery(passport.passportNumber);
    setSearchParams({ id: passport.passportNumber });
    setError(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      {/* Page Header */}
      <motion.div
        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-3xl mx-auto space-y-3"
      >
        <div className="inline-flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#14532d] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 shadow-2xs">
            Cryptographic Transparency Ledger
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-300 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            MongoDB Audited
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-serif font-bold text-stone-900 tracking-tight leading-[1.15]">
          Impact Passport Explorer
        </h1>

        {/* Warm Subtle Decorative Divider */}
        <div className="flex items-center justify-center gap-2 mt-3.5 mb-2">
          <span className="w-8 h-px bg-amber-400/60" />
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span className="w-8 h-px bg-amber-400/60" />
        </div>

        <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-2xl mx-auto">
          {t.passportJourneySubtitle}
        </p>
      </motion.div>

      {/* Trust Transparency Statement */}
      <div className="p-4 sm:p-5 rounded-2xl bg-stone-50/80 border border-stone-200/90 text-xs text-stone-700 flex items-start gap-3 shadow-2xs">
        <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <div className="space-y-1 leading-relaxed">
          <p>
            <strong>Live Statutory Audit Ledger:</strong> Each record below represents an immutable,
            verified financial contribution recorded in the Siddhivinayak Charitable Trust database.
            Fund allocations, auditor certifications, and milestone tracking reflect real data records.
          </p>
        </div>
      </div>

      {/* Interactive 4-Stage Journey Visualization */}
      <ImpactJourneyInteractive />

      {/* Unauthenticated Guest Notification */}
      {!isAuthLoading && !isAuthenticated && (
        <div className="bg-white rounded-2xl border border-stone-200/90 p-8 sm:p-10 text-center max-w-2xl mx-auto shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#14532d] flex items-center justify-center mx-auto border border-emerald-200">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-serif font-bold text-stone-900">
              Sign In to View Your Verified Impact Passport
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
              To protect donor privacy and prevent unauthorized access (IDOR security), individual Impact
              Passports are tied to authenticated donor accounts. Please sign in to inspect your
              verified contribution records and audit trails.
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <Link to="/login?redirect=/impact-passport">
              <Button size="md" variant="primary" className="inline-flex items-center gap-2 bg-[#14532d] hover:bg-[#0f4023] text-white">
                <LogIn className="w-4 h-4" />
                <span>Sign In to Donor Portal</span>
              </Button>
            </Link>
            <Link to="/causes">
              <Button size="md" variant="outline">
                Explore Trust Causes
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Authenticated User Workspace */}
      {isAuthenticated && (
        <div className="space-y-8">
          {/* Search & Quick Selector */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200/90 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-sm font-serif font-bold text-stone-900">
                  {user?.role === "ADMIN"
                    ? "Trust-Wide Impact Passport Search (Admin)"
                    : "Your Verified Impact Passports"}
                </h3>
                <p className="text-xs text-stone-500">
                  {user?.role === "ADMIN"
                    ? "Query verified passports across all donors, receipt dockets, and programs."
                    : "Select from your verified contributions to inspect the real-time allocation ledger."}
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={fetchPassports}
                disabled={isLoading}
                className="shrink-0 text-xs inline-flex items-center gap-1.5 self-start sm:self-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                <span>Refresh Records</span>
              </Button>
            </div>

            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by Passport ID, Receipt No., or Cause Title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:border-[#14532d] focus:ring-1 focus:ring-[#14532d]/20 transition-all"
                />
              </div>
              <Button
                type="submit"
                size="md"
                variant="primary"
                disabled={isSearchingId}
                className="shrink-0 text-xs sm:text-sm inline-flex items-center gap-2 bg-[#14532d] hover:bg-[#0f4023] text-white"
              >
                {isSearchingId ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                <span>Lookup Passport</span>
              </Button>
            </form>

            {/* Error Message with Retry */}
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Notice: </span>
                    <span>{error}</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={fetchPassports}
                  className="shrink-0 text-[11px] py-1 px-2 border-rose-300 text-rose-800 hover:bg-rose-100"
                >
                  Retry
                </Button>
              </div>
            )}

            {/* Selector Pills for User's Verified Passports */}
            {passports.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <div className="text-xs font-semibold text-stone-600">
                  Select a verified contribution from your history:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {passports.map((p) => {
                    const isSelected = activePassport?.id === p.id;
                    return (
                      <motion.button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectPassport(p)}
                        whileHover={!shouldReduceMotion ? { y: -2 } : undefined}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "bg-emerald-50/80 border-[#14532d] text-stone-900 shadow-xs ring-1 ring-[#14532d]/25"
                            : "bg-stone-50/70 hover:bg-stone-100 border-stone-200 text-stone-700 hover:border-stone-300"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-mono font-semibold text-[#14532d]">
                            #{p.passportNumber}
                          </span>
                          <span className="font-medium text-stone-500">{p.category}</span>
                        </div>
                        <div className="text-xs font-serif font-bold line-clamp-1 text-stone-900">
                          {p.causeTitle}
                        </div>
                        <div className="text-[11px] text-stone-500 mt-1 flex items-center justify-between">
                          <span>₹{p.amount.toLocaleString("en-IN")}</span>
                          <span className="font-semibold text-[#14532d]">
                            {p.overallStatus}
                          </span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center shadow-xs space-y-3">
              <div className="w-10 h-10 border-3 border-stone-200 border-t-[#14532d] rounded-full animate-spin mx-auto" />
              <div className="text-sm font-serif font-bold text-stone-900">
                Retrieving Verified Impact Records from MongoDB...
              </div>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Validating cryptographic receipt numbers and statutory audit clearance.
              </p>
            </div>
          )}

          {/* Empty State: Authenticated donor has 0 verified donations */}
          {!isLoading && passports.length === 0 && !activePassport && !error && (
            <div className="bg-white rounded-2xl border border-stone-200 p-10 text-center shadow-xs max-w-2xl mx-auto space-y-4">
              <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center mx-auto">
                <HeartHandshake className="w-6 h-6 text-[#14532d]" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-serif font-bold text-stone-900">
                  No Verified Donation Records Found
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                  You have not made any verified contributions to Siddhivinayak Charitable Trust yet.
                  Once you contribute to any approved cause and the payment is verified, your unique
                  Impact Passport and immutable audit ledger will appear here automatically.
                </p>
              </div>
              <div className="pt-2">
                <Link to="/causes">
                  <Button size="md" variant="primary" className="inline-flex items-center gap-2">
                    <span>Explore Verified Causes to Support</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Active Passport Timeline */}
          {!isLoading && activePassport && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-serif font-bold text-stone-900">
                  Verified Passport Record
                </h2>
                <span className="text-xs text-stone-500 font-mono">
                  Record ID: {activePassport.id}
                </span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activePassport.id}
                  initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                >
                  <ImpactTimeline passport={activePassport} />
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
