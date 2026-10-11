import React, { useState, useEffect, useCallback } from "react";

import { useSearchParams, Link } from "react-router-dom";

import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from "motion/react";

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
import { Button } from "@/src/components/common/Button";
import { useLanguage } from "@/src/context/LanguageContext";

export const ImpactPassport: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const requestedId = searchParams.get("id");

  const { t } = useLanguage();

  const shouldReduceMotion = useReducedMotion() ?? false;

  const {
    user,
    isAuthenticated,
    isLoading: isAuthLoading,
  } = useAuth();

  const [passports, setPassports] = useState<
    ImpactPassportRecord[]
  >([]);

  const [activePassport, setActivePassport] =
    useState<ImpactPassportRecord | null>(null);

  const [isLoading, setIsLoading] =
    useState<boolean>(true);

  const [error, setError] =
    useState<string | null>(null);

  const [searchQuery, setSearchQuery] =
    useState<string>(requestedId || "");

  const [isSearchingId, setIsSearchingId] =
    useState<boolean>(false);

  // ============================================================
  // Fetch verified passports
  // ============================================================

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
      const userPassports =
        await PassportService.getMyPassports();

      setPassports(userPassports);

      if (requestedId) {
        const localMatch = userPassports.find(
          (p) =>
            p.passportNumber
              .toLowerCase() ===
              requestedId.toLowerCase() ||
            p.id
              .toLowerCase() ===
              requestedId.toLowerCase()
        );

        if (localMatch) {
          setActivePassport(localMatch);
          setSearchQuery(localMatch.passportNumber);
        } else {
          try {
            const specificRecord =
              await PassportService.getPassportById(
                requestedId
              );

            if (specificRecord) {
              setActivePassport(specificRecord);
              setSearchQuery(
                specificRecord.passportNumber
              );
            }
          } catch (err: any) {
            if (userPassports.length > 0) {
              setActivePassport(userPassports[0]);
              setSearchQuery(
                userPassports[0].passportNumber
              );
            }

            setError(
              err.message ||
                "Requested Impact Passport could not be loaded or you lack authorization."
            );
          }
        }
      } else if (userPassports.length > 0) {
        setActivePassport(userPassports[0]);
        setSearchQuery(
          userPassports[0].passportNumber
        );
      } else {
        setActivePassport(null);
      }
    } catch (err: any) {
      console.error(
        "Failed to load Impact Passports from MongoDB:",
        err
      );

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
  }, [
    isAuthLoading,
    fetchPassports,
  ]);

  // ============================================================
  // Search
  // ============================================================

  const handleSearch = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const query = searchQuery.trim();

    if (!query) return;

    setError(null);

    const localMatch = passports.find(
      (p) =>
        p.passportNumber
          .toLowerCase()
          .includes(query.toLowerCase()) ||
        p.donorName
          .toLowerCase()
          .includes(query.toLowerCase()) ||
        p.causeTitle
          .toLowerCase()
          .includes(query.toLowerCase()) ||
        p.id.toLowerCase() === query.toLowerCase()
    );

    if (localMatch) {
      setActivePassport(localMatch);

      setSearchParams({
        id: localMatch.passportNumber,
      });

      return;
    }

    if (isAuthenticated) {
      setIsSearchingId(true);

      try {
        const foundPassport =
          await PassportService.getPassportById(
            query
          );

        if (foundPassport) {
          setActivePassport(foundPassport);

          setSearchParams({
            id: foundPassport.passportNumber,
          });
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

  const handleSelectPassport = (
    passport: ImpactPassportRecord
  ) => {
    setActivePassport(passport);

    setSearchQuery(
      passport.passportNumber
    );

    setSearchParams({
      id: passport.passportNumber,
    });

    setError(null);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f6f1e7]">

      {/* ============================================================
          TRADITIONAL BACKGROUND
          ============================================================ */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        {/* Very faint Nashik / heritage visual */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.025]"
          style={{
            backgroundImage:
              "url('/activities/image.png')",
          }}
        />

        <div className="absolute inset-0 bg-[#f6f1e7]/90" />

        {/* Soft green glow */}
        <div className="absolute -left-40 top-20 h-[420px] w-[420px] rounded-full bg-[#dfe9dc]/50 blur-3xl" />

        {/* Soft golden glow */}
        <div className="absolute -right-40 top-40 h-[420px] w-[420px] rounded-full bg-[#eadfca]/50 blur-3xl" />

        {/* Bottom glow */}
        <div className="absolute bottom-0 left-[35%] h-[300px] w-[400px] rounded-full bg-[#e6eee2]/40 blur-3xl" />
      </div>

      {/* ============================================================
          CONTENT
          ============================================================ */}

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">

        {/* ============================================================
            HEADER
            ============================================================ */}

        <motion.div
          initial={
            shouldReduceMotion
              ? { opacity: 1 }
              : { opacity: 0, y: 16 }
          }
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
          }}
          className="mx-auto max-w-3xl space-y-3 text-center"
        >
          <div className="inline-flex flex-wrap items-center justify-center gap-2">
            <span className="rounded-full border border-[#d8c89f] bg-[#fffaf0] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#28563b] shadow-xs">
              Impact Tracking Ledger
            </span>

            <span className="inline-flex items-center gap-1 rounded-full border border-[#b9cdb6] bg-[#edf4eb] px-2.5 py-1 text-xs font-semibold text-[#28563b] shadow-xs">
              <ShieldCheck className="h-3.5 w-3.5 text-[#356846]" />
              Accountable Giving
            </span>
          </div>

          <h1 className="font-serif text-3xl font-bold leading-[1.15] tracking-tight text-[#233328] sm:text-4xl lg:text-[42px]">
            Impact Passport Explorer
          </h1>

          {/* Traditional divider */}
          <div className="flex items-center justify-center gap-2 py-1">
            <span className="h-px w-12 bg-[#c6a75d]/60" />
            <span className="text-sm text-[#b28d43]">✦</span>
            <span className="h-px w-12 bg-[#c6a75d]/60" />
          </div>

          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-[#62675f] sm:text-base">
            {t.passportJourneySubtitle}
          </p>
        </motion.div>

        {/* ============================================================
            TRANSPARENCY STATEMENT
            ============================================================ */}

        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-[#ddd5c5] bg-[#fffdf8]/90 p-4 text-xs text-[#5f625b] shadow-xs backdrop-blur-sm sm:p-5">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#356846]" />

          <div className="space-y-1 leading-relaxed">
            <p>
              <strong className="text-[#293c30]">
                Pooled Contribution Model & Accountability:
              </strong>{" "}
              Multiple donors contribute collectively to fund larger welfare initiatives. Every successful donation receives an official receipt and private Impact Passport. Campaign-level milestones, expenses, and verification dockets reflect verified records maintained by Trust officers.
            </p>
          </div>
        </div>

        {/* ============================================================
            FOUR-STAGE ACCOUNTABILITY LIFECYCLE (GUEST EDUCATION ONLY)
            ============================================================ */}

        {!isAuthenticated && (
          <motion.div
            initial={
              shouldReduceMotion
                ? { opacity: 1 }
                : { opacity: 0, y: 18 }
            }
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              amount: 0.2,
            }}
            transition={{
              duration: 0.55,
            }}
            className="relative mt-8 overflow-hidden rounded-2xl border border-[#d9d0bd] bg-gradient-to-br from-[#fffdf8] via-[#faf7ee] to-[#edf3e9] p-5 shadow-xs sm:p-7"
          >
            <div className="relative z-10">
              {/* Heading */}
              <div className="mb-6 text-center">
                <div className="mb-2 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7c6840]">
                  <span className="h-px w-6 bg-[#c5a45b]/60" />
                  Donation Lifecycle
                  <span className="h-px w-6 bg-[#c5a45b]/60" />
                </div>

                <h2 className="font-serif text-xl font-bold text-[#25372b] sm:text-2xl">
                  From Your Support to Real-World Impact
                </h2>

                <p className="mx-auto mt-1.5 max-w-2xl text-xs leading-relaxed text-[#73766e] sm:text-sm">
                  Each donor's contribution is pooled with others into an approved Trust cause, progressing through four verified stages.
                </p>
              </div>

              {/* 4 Stages Responsive Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* STAGE 1 */}
                <div className="rounded-xl border border-[#ded7c8] bg-white/90 p-4 text-center shadow-2xs">
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-[#d7c38f] bg-[#faf3dd] text-[#8c6e2f]">
                    <HeartHandshake className="h-5 w-5" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#8b856f]">
                    Stage 01
                  </p>
                  <h3 className="mt-1 font-serif text-sm font-bold text-[#29392e]">
                    1. Donation Received
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-[#777a72]">
                    Payment confirmed. Official Trust donation receipt and private tracking record created.
                  </p>
                </div>

                {/* STAGE 2 */}
                <div className="rounded-xl border border-[#d7e1d4] bg-white/90 p-4 text-center shadow-2xs">
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-[#c6d8c1] bg-[#edf4eb] text-[#356846]">
                    <Layers className="h-5 w-5" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#8b856f]">
                    Stage 02
                  </p>
                  <h3 className="mt-1 font-serif text-sm font-bold text-[#29392e]">
                    2. Campaign Allocation
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-[#777a72]">
                    Pooled donor contributions allocated to approved community cause budget lines.
                  </p>
                </div>

                {/* STAGE 3 */}
                <div className="rounded-xl border border-[#ded7c8] bg-white/90 p-4 text-center shadow-2xs">
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-[#d7c38f] bg-[#faf3dd] text-[#8c6e2f]">
                    <FileCheck className="h-5 w-5" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#8b856f]">
                    Stage 03
                  </p>
                  <h3 className="mt-1 font-serif text-sm font-bold text-[#29392e]">
                    3. Verification and Supporting Evidence
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-[#777a72]">
                    Trust officers inspect vendor receipts, weighment slips, and execution records.
                  </p>
                </div>

                {/* STAGE 4 */}
                <div className="rounded-xl border border-[#9fbd9d] bg-[#eaf3e7]/80 p-4 text-center shadow-2xs">
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-[#a9c4a5] bg-white text-[#28563b]">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#668064]">
                    Stage 04
                  </p>
                  <h3 className="mt-1 font-serif text-sm font-bold text-[#24412f]">
                    4. Field Impact and Completed Milestones
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-[#61705f]">
                    Completed program milestones, beneficiary support delivered, and verified metrics published.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ============================================================
            GUEST NOTIFICATION
            ============================================================ */}

        {!isAuthLoading && !isAuthenticated && (
          <div className="mx-auto mt-8 max-w-2xl space-y-4 rounded-[2rem] border border-[#ded6c6] bg-[#fffdf8]/95 p-6 sm:p-10 text-center shadow-[0_12px_40px_rgba(55,70,54,0.06)]">

            <div className="mx-auto flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-[#c6d8c1] bg-[#edf4eb] text-[#28563b]">
              <Lock className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>

            <div className="space-y-1.5">

              <h3 className="font-serif text-base sm:text-lg font-bold text-[#29372d]">
                Sign In to View Your Verified Impact Passport
              </h3>

              <p className="mx-auto max-w-md text-xs leading-relaxed text-[#6d7169] sm:text-sm">
                To protect donor privacy and prevent unauthorized
                access (IDOR security), individual Impact
                Passports are tied to authenticated donor accounts.
                Please sign in to inspect your verified contribution
                records and audit trails.
              </p>

            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 max-w-xs sm:max-w-none mx-auto pt-2">
              <Link to="/login?redirect=/impact-passport" className="w-full sm:w-auto">
                <Button
                  size="sm"
                  variant="primary"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-[#28563b] text-white hover:bg-[#1d452e] text-xs font-semibold px-3.5 py-1.5 h-9"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span>Sign In to Donor Portal</span>
                </Button>
              </Link>

              <Link to="/causes" className="w-full sm:w-auto">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full sm:w-auto text-xs px-3 sm:px-3.5 py-1.5 h-8 sm:h-9 justify-center border-stone-300 text-stone-700 hover:bg-stone-50 font-medium"
                >
                  Explore Trust Causes
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* ============================================================
            AUTHENTICATED USER WORKSPACE
            ============================================================ */}

        {isAuthenticated && (
          <div className="mt-8 space-y-8">

            {/* ========================================================
                SEARCH & SELECTOR
                ======================================================== */}

            <div className="relative overflow-hidden rounded-[2rem] border border-[#ded6c6] bg-[#fffdf8]/95 p-5 shadow-[0_12px_40px_rgba(55,70,54,0.06)] sm:p-6">

              <div className="space-y-4">

                {/* Header */}
                <div className="flex flex-col justify-between gap-3 border-b border-[#ebe5d9] pb-4 sm:flex-row sm:items-center">

                  <div>

                    <div className="mb-1 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#b4944e]" />

                      <h3 className="font-serif text-sm font-bold text-[#29372d]">
                        {user?.role === "ADMIN"
                          ? "Trust-Wide Impact Passport Search (Admin)"
                          : "Your Verified Impact Passports"}
                      </h3>
                    </div>

                    <p className="text-xs text-[#777a72]">
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
                    className="inline-flex shrink-0 items-center gap-1.5 self-start text-xs sm:self-auto"
                  >
                    <RefreshCw
                      className={`h-3.5 w-3.5 ${
                        isLoading
                          ? "animate-spin"
                          : ""
                      }`}
                    />

                    <span>
                      Refresh Records
                    </span>
                  </Button>

                </div>

                {/* Search */}
                <form
                  onSubmit={handleSearch}
                  className="flex flex-col gap-2.5 sm:flex-row"
                >

                  <div className="relative flex-1">

                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#99968e]" />

                    <input
                      type="text"
                      placeholder="Search by Passport ID, Receipt No., or Cause Title..."
                      value={searchQuery}
                      onChange={(e) =>
                        setSearchQuery(
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-[#ddd7ca] bg-[#f8f5ed] py-2.5 pl-9 pr-3 text-xs text-[#29372d] placeholder:text-[#99968e] transition-all focus:border-[#668361] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#668361]/10 sm:text-sm"
                    />

                  </div>

                  <Button
                    type="submit"
                    size="md"
                    variant="primary"
                    disabled={isSearchingId}
                    className="inline-flex shrink-0 items-center gap-2 bg-[#28563b] text-xs text-white hover:bg-[#1d452e] sm:text-sm"
                  >
                    {isSearchingId ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}

                    <span>
                      Lookup Passport
                    </span>
                  </Button>

                </form>

                {/* Error */}
                {error && (
                  <div className="flex items-start justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800">

                    <div className="flex items-start gap-2">

                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />

                      <div>
                        <span className="font-semibold">
                          Notice:{" "}
                        </span>

                        <span>
                          {error}
                        </span>
                      </div>

                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={fetchPassports}
                      className="shrink-0 border-rose-300 px-2 py-1 text-[11px] text-rose-800 hover:bg-rose-100"
                    >
                      Retry
                    </Button>

                  </div>
                )}

                {/* Passport selector */}
                {passports.length > 0 && (
                  <div className="space-y-2 border-t border-[#ebe5d9] pt-3">

                    <div className="text-xs font-semibold text-[#63675f]">
                      Select a verified contribution from your history:
                    </div>

                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3">

                      {passports.map((p) => {

                        const isSelected =
                          activePassport?.id === p.id;

                        return (
                          <motion.button
                            key={p.id}
                            type="button"
                            onClick={() =>
                              handleSelectPassport(p)
                            }
                            whileHover={
                              !shouldReduceMotion
                                ? { y: -2 }
                                : undefined
                            }
                            className={`cursor-pointer rounded-xl border p-3.5 text-left transition-all ${
                              isSelected
                                ? "border-[#28563b] bg-[#edf4eb] text-stone-900 shadow-sm ring-1 ring-[#28563b]/20"
                                : "border-[#ded8cc] bg-[#faf8f2] text-stone-700 hover:border-[#c6d2c1] hover:bg-[#f2f6ef]"
                            }`}
                          >

                            <div className="mb-1 flex items-center justify-between text-[11px]">

                              <span className="font-mono font-semibold text-[#28563b]">
                                #{p.passportNumber}
                              </span>

                              <span className="font-medium text-stone-500">
                                {p.category}
                              </span>

                            </div>

                            <div className="line-clamp-1 font-serif text-xs font-bold text-stone-900">
                              {p.causeTitle}
                            </div>

                            <div className="mt-1 flex items-center justify-between text-[11px] text-stone-500">

                              <span>
                                ₹
                                {p.amount.toLocaleString(
                                  "en-IN"
                                )}
                              </span>

                              <span className="font-semibold text-[#28563b]">
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
            </div>

            {/* ========================================================
                LOADING
                ======================================================== */}

            {isLoading && (
              <div className="space-y-3 rounded-[2rem] border border-[#ded6c6] bg-[#fffdf8]/90 p-12 text-center shadow-sm">

                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-[3px] border-[#ddd7ca] border-t-[#28563b]" />

                <div className="font-serif text-sm font-bold text-[#29372d]">
                  Loading Verified Impact Passport Records...
                </div>

                <p className="mx-auto max-w-sm text-xs text-[#777a72]">
                  Retrieving donation history, allocated initiatives, and verified project milestones.
                </p>

              </div>
            )}

            {/* ========================================================
                EMPTY
                ======================================================== */}

            {!isLoading &&
              passports.length === 0 &&
              !activePassport &&
              !error && (
                <div className="mx-auto max-w-2xl space-y-4 rounded-[2rem] border border-[#ded6c6] bg-[#fffdf8]/95 p-10 text-center shadow-[0_12px_40px_rgba(55,70,54,0.06)]">

                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#d7c38f] bg-[#faf3dd] text-[#8c6e2f]">
                    <HeartHandshake className="h-6 w-6" />
                  </div>

                  <div className="space-y-1.5">

                    <h3 className="font-serif text-lg font-bold text-[#29372d]">
                      No Verified Donation Records Found
                    </h3>

                    <p className="mx-auto max-w-md text-xs leading-relaxed text-[#6d7169] sm:text-sm">
                      You have not made any verified contributions
                      to Siddhivinayak Charitable Trust yet. Once
                      you contribute to any approved cause and the
                      payment is verified, your unique Impact Passport
                      and immutable audit ledger will appear here
                      automatically.
                    </p>

                  </div>

                  <div className="pt-2">

                    <Link to="/causes">
                      <Button
                        size="sm"
                        variant="primary"
                        className="inline-flex items-center gap-1.5 bg-[#28563b] text-white hover:bg-[#1d452e] text-xs font-semibold px-3 sm:px-3.5 py-1.5 h-8 sm:h-9"
                      >
                        <span>Explore Trust Causes</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>

                  </div>
                </div>
              )}

            {/* ========================================================
                ACTIVE PASSPORT
                ======================================================== */}

            {!isLoading &&
              activePassport && (
                <div className="space-y-4">

                  {/* Heading */}
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex items-center gap-2">

                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e6efe3] text-[#28563b]">
                        <ShieldCheck className="h-4 w-4" />
                      </div>

                      <h2 className="font-serif text-xl font-bold text-[#29372d]">
                        Verified Passport Record
                      </h2>

                    </div>

                    <span className="font-mono text-xs text-[#7a7b74]">
                      Record ID: {activePassport.id}
                    </span>

                  </div>

                  {/* Passport card */}
                  <div className="relative overflow-hidden rounded-[2rem] border border-[#d8d0bd] bg-[#fffdf8] shadow-[0_15px_50px_rgba(55,70,54,0.08)]">

                    {/* Traditional top border */}
                    <div className="h-1.5 bg-gradient-to-r from-[#28563b] via-[#c5a45b] to-[#28563b]" />

                    {/* Passport label */}
                    <div className="flex items-center justify-between border-b border-[#ebe5d9] px-5 py-4 sm:px-7">

                      <div className="flex items-center gap-2">

                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#faf3dd] text-[#8c6e2f]">
                          <FileCheck className="h-4 w-4" />
                        </div>

                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8c8068]">
                            Verified Impact Passport
                          </p>

                          <p className="font-mono text-xs font-bold text-[#28563b]">
                            #{activePassport.passportNumber}
                          </p>
                        </div>

                      </div>

                      <div className="hidden items-center gap-1 rounded-full border border-[#bfd2bb] bg-[#edf4eb] px-3 py-1 text-[10px] font-bold text-[#28563b] sm:flex">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        VERIFIED
                      </div>

                    </div>

                    {/* Timeline */}
                    <div className="p-4 sm:p-7">

                      <AnimatePresence mode="wait">

                        <motion.div
                          key={activePassport.id}
                          initial={
                            shouldReduceMotion
                              ? { opacity: 1 }
                              : {
                                  opacity: 0,
                                  y: 10,
                                }
                          }
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          exit={
                            shouldReduceMotion
                              ? { opacity: 1 }
                              : {
                                  opacity: 0,
                                  y: -10,
                                }
                          }
                          transition={{
                            duration: 0.25,
                          }}
                        >
                          <ImpactTimeline
                            passport={activePassport}
                          />
                        </motion.div>

                      </AnimatePresence>

                    </div>

                    {/* Bottom traditional divider */}
                    <div className="flex items-center justify-center gap-2 border-t border-[#ebe5d9] py-3">

                      <span className="h-px w-8 bg-[#c5a45b]/50" />

                      <span className="text-xs text-[#b28d43]">
                        ✦
                      </span>

                      <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#7c806f]">
                        Transparent • Verified • Traceable
                      </span>

                      <span className="text-xs text-[#b28d43]">
                        ✦
                      </span>

                      <span className="h-px w-8 bg-[#c5a45b]/50" />

                    </div>

                  </div>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImpactPassport;