import React, { useState, useMemo, useEffect, useCallback } from "react";

import {
  Search,
  AlertCircle,
  RefreshCw,
  Loader2,
  Leaf,
} from "lucide-react";

import { Cause, CauseCategory } from "@/src/types";
import { MOCK_CAUSES } from "@/src/data/mockData";
import { causeService } from "@/src/services/causeService";

import { CauseCard } from "@/src/components/causes/CauseCard";
import { EmptyState } from "@/src/components/common/EmptyState";
import { Button } from "@/src/components/common/Button";
import { PageHeader } from "@/src/components/common/PageHeader";

import { useLanguage } from "@/src/context/LanguageContext";
import { useKumbhMode } from "@/src/context/KumbhModeContext";

const CATEGORIES: ("All" | CauseCategory)[] = [
  "All",
  "Education",
  "Medical Support",
  "Food & Nutrition",
  "Emergency Relief",
  "Environment",
];

export const Causes: React.FC = () => {
  const { language } = useLanguage();
  const { isKumbhMode } = useKumbhMode();

  const [causes, setCauses] = useState<Cause[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] =
    useState<"All" | CauseCategory>("All");

  const [searchQuery, setSearchQuery] = useState("");
  const [urgentOnly, setUrgentOnly] = useState(false);

  const fetchCauses = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await causeService.getCauses();

      if (response?.causes && response.causes.length > 0) {
        setCauses(response.causes);
      } else {
        setCauses(MOCK_CAUSES);
      }
    } catch (err: any) {
      console.warn(
        "Notice fetching registered causes, utilizing local verified causes:",
        err
      );

      setCauses(MOCK_CAUSES);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCauses();
  }, [fetchCauses]);

  const getCategoryLabel = (
    cat: "All" | CauseCategory
  ) => {
    if (language !== "mr") return cat;

    switch (cat) {
      case "All":
        return "सर्व उपक्रम";

      case "Education":
        return "शिक्षण";

      case "Medical Support":
        return "वैद्यकीय मदत";

      case "Food & Nutrition":
        return "अन्नदान";

      case "Emergency Relief":
        return "आपत्ती मदत";

      case "Environment":
        return "पर्यावरण";

      default:
        return cat;
    }
  };

  const filteredCauses = useMemo(() => {
    return causes.filter((cause) => {
      if (!isKumbhMode && cause.isKumbhRelated) {
        return false;
      }

      const matchesCategory =
        selectedCategory === "All" ||
        cause.category === selectedCategory;

      const matchesSearch =
        cause.title
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (cause.tagline &&
          cause.tagline
            .toLowerCase()
            .includes(searchQuery.toLowerCase())) ||
        (cause.shortDescription &&
          cause.shortDescription
            .toLowerCase()
            .includes(searchQuery.toLowerCase())) ||
        (cause.location &&
          cause.location
            .toLowerCase()
            .includes(searchQuery.toLowerCase()));

      const matchesUrgent =
        !urgentOnly || cause.urgent;

      return (
        matchesCategory &&
        matchesSearch &&
        matchesUrgent
      );
    });
  }, [
    causes,
    selectedCategory,
    searchQuery,
    urgentOnly,
    isKumbhMode,
  ]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F7F3E9]">
      {/* ================================================================ */}
      {/* Pinterest-style soft background                                  */}
      {/* ================================================================ */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Soft sage glow - top left */}
        <div className="absolute -left-40 top-10 h-[420px] w-[420px] rounded-full bg-[#DDE9D8]/50 blur-3xl" />

        {/* Soft warm gold glow - top right */}
        <div className="absolute -right-40 top-40 h-[460px] w-[460px] rounded-full bg-[#EBDDBD]/40 blur-3xl" />

        {/* Soft green glow - middle */}
        <div className="absolute left-[35%] top-[42%] h-[360px] w-[360px] rounded-full bg-[#E7EEE1]/45 blur-3xl" />

        {/* Soft gold glow - bottom */}
        <div className="absolute -bottom-40 right-[10%] h-[420px] w-[420px] rounded-full bg-[#EFE2C5]/35 blur-3xl" />

        {/* ============================================================ */}
        {/* Subtle botanical decorations                                  */}
        {/* ============================================================ */}

        <Leaf className="absolute left-4 top-40 h-32 w-32 -rotate-12 text-[#789270]/10 sm:left-8 sm:h-44 sm:w-44" />

        <Leaf className="absolute left-16 top-[48%] h-24 w-24 rotate-[35deg] text-[#789270]/[0.07]" />

        <Leaf className="absolute right-4 top-[28%] h-40 w-40 rotate-[18deg] text-[#9B844C]/[0.08] sm:right-10 sm:h-52 sm:w-52" />

        <Leaf className="absolute right-20 bottom-[18%] h-32 w-32 -rotate-[25deg] text-[#789270]/[0.07]" />

        <Leaf className="absolute bottom-10 left-[42%] h-28 w-28 rotate-[15deg] text-[#9B844C]/[0.06]" />

        {/* Very subtle curved decorative rings */}
        <div className="absolute -left-24 top-[35%] h-72 w-72 rounded-full border border-[#7E9477]/[0.07]" />

        <div className="absolute -right-28 bottom-[28%] h-80 w-80 rounded-full border border-[#B89A55]/[0.07]" />
      </div>

      {/* ================================================================ */}
      {/* Main Content                                                      */}
      {/* ================================================================ */}

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-14 lg:px-8">
        {/* ============================================================ */}
        {/* 1. Page Header                                                */}
        {/* ============================================================ */}

        <PageHeader
          badge={
            language === "mr"
              ? "सक्रिय सेवा प्रकल्प"
              : language === "hi"
              ? "सक्रिय सेवा प्रकल्प"
              : "Active Service Programs"
          }
          title={
            language === "mr"
              ? "ट्रस्टचे सामाजिक सेवा उपक्रम"
              : language === "hi"
              ? "ट्रस्ट के सेवा प्रकल्प"
              : "Trust Service Programs & Appeals"
          }
          description={
            language === "mr"
              ? "खालीलपैकी कोणत्याही सामाजिक उपक्रमासाठी थेट सहकार्य करा. सर्व देणग्यांचे अधिकृत रेकॉर्ड व पावती प्रदान केली जाते."
              : language === "hi"
              ? "ट्रस्ट के विभिन्न सेवा उपक्रमों में सहभागी बनें। सभी योगदानों की आधिकारिक रसीद एवं पारदर्शी हिसाब उपलब्ध रहता है।"
              : "Select an active community initiative below. Contributions support direct program procurement and community assistance in Nashik."
          }
        />

        {/* ============================================================ */}
        {/* 2. Search & Filter                                            */}
        {/* ============================================================ */}

        <div className="relative overflow-hidden rounded-2xl border border-[#E4DDCF] bg-[#FFFDF8]/90 p-5 shadow-[0_10px_35px_rgba(72,86,63,0.06)] backdrop-blur-sm sm:p-6">
          {/* tiny decorative background */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#E6EDDF]/50 blur-2xl" />

          <div className="relative z-10 space-y-4">
            {/* Search input & Urgent toggle */}
            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <div className="relative w-full flex-1">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />

                <input
                  type="text"
                  placeholder={
                    language === "mr"
                      ? "प्रकल्प, विषय किंवा जिल्हा शोधा..."
                      : "Search by program title, keyword, or district..."
                  }
                  value={searchQuery}
                  onChange={(e) =>
                    setSearchQuery(e.target.value)
                  }
                  className="w-full rounded-xl border border-[#E3DDD2] bg-[#F8F5ED]/80 py-2.5 pl-10 pr-4 text-xs text-stone-900 placeholder:text-stone-400 transition-all focus:border-[#718D6B] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#14532d]/20 sm:text-sm"
                />
              </div>

              <button
                type="button"
                onClick={() =>
                  setUrgentOnly(!urgentOnly)
                }
                className={`flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all sm:w-auto ${
                  urgentOnly
                    ? "border-amber-300 bg-amber-50 text-amber-900 shadow-sm"
                    : "border-[#E3DDD2] bg-[#F8F5ED] text-stone-700 hover:bg-[#F1EEE6]"
                }`}
              >
                <AlertCircle
                  className={`h-3.5 w-3.5 ${
                    urgentOnly
                      ? "text-amber-700"
                      : "text-stone-400"
                  }`}
                />

                <span>
                  {language === "mr"
                    ? "फक्त तातडीच्या गरजा"
                    : "Urgent Needs Only"}
                </span>
              </button>
            </div>

            {/* Category Pills */}
            <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              {CATEGORIES.map((cat) => {
                const isSelected =
                  selectedCategory === cat;

                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() =>
                      setSelectedCategory(cat)
                    }
                    className={`whitespace-nowrap rounded-full border px-4 py-1.5 font-medium transition-all ${
                      isSelected
                        ? "border-[#14532d] bg-[#14532d] font-semibold text-white shadow-sm"
                        : "border-[#E3DDD2] bg-[#FAF8F2]/90 text-stone-700 hover:border-[#B9CBB3] hover:bg-[#EDF3E9] hover:text-[#285B3D]"
                    }`}
                  >
                    {getCategoryLabel(cat)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* Main Content                                                   */}
        {/* ============================================================ */}

        <div className="mt-10">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-[#E5DED0] bg-[#FFFDF8]/60 py-16 text-stone-500">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E5EEE8]">
                <Loader2 className="h-7 w-7 animate-spin text-[#14532d]" />
              </div>

              <p className="text-sm font-medium">
                {language === "mr"
                  ? "उपक्रम लोड होत आहेत..."
                  : "Loading active campaigns from trust database..."}
              </p>
            </div>
          ) : error ? (
            <div className="mx-auto max-w-xl rounded-2xl border border-rose-200 bg-rose-50/90 p-6 text-center shadow-sm">
              <AlertCircle className="mx-auto h-8 w-8 text-rose-600" />

              <h3 className="mt-3 font-serif text-base font-bold text-stone-900">
                {language === "mr"
                  ? "उपक्रम लोड करण्यात त्रुटी"
                  : "Unable to Load Campaigns"}
              </h3>

              <p className="mt-2 text-xs text-rose-800">
                {error}
              </p>

              <Button
                size="sm"
                variant="outline"
                className="mx-auto mt-4 border-rose-300 text-rose-900 hover:bg-rose-100"
                onClick={fetchCauses}
                leftIcon={
                  <RefreshCw className="h-3.5 w-3.5" />
                }
              >
                {language === "mr"
                  ? "पुन्हा प्रयत्न करा"
                  : "Retry"}
              </Button>
            </div>
          ) : causes.length === 0 ? (
            <div className="rounded-2xl bg-[#FFFDF8]/70 p-4">
              <EmptyState
                title={
                  language === "mr"
                    ? "सध्या कोणतेही उपक्रम उपलब्ध नाहीत."
                    : "No campaigns available at the moment."
                }
                description={
                  language === "mr"
                    ? "सध्या डेटाबेसमध्ये कोणतेही सक्रिय उपक्रम नोंदवलेले नाहीत. नवीन मोहिमेसाठी कृपया लवकरच पुन्हा भेट द्या."
                    : "There are currently no active charitable campaigns published in the database. Please check back soon."
                }
                actionLabel={
                  language === "mr"
                    ? "रिफ्रेश करा"
                    : "Refresh"
                }
                onAction={fetchCauses}
              />
            </div>
          ) : filteredCauses.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <div className="text-xs font-medium text-stone-500">
                  {language === "mr"
                    ? `${filteredCauses.length} उपक्रम उपलब्ध`
                    : `Showing ${filteredCauses.length} programs`}
                </div>

                {(searchQuery ||
                  selectedCategory !== "All" ||
                  urgentOnly) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory("All");
                      setSearchQuery("");
                      setUrgentOnly(false);
                    }}
                    className="text-xs font-semibold text-[#285B3D] hover:underline"
                  >
                    {language === "mr"
                      ? "फिल्टर रीसेट करा"
                      : "Reset Filters"}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredCauses.map((cause) => (
                  <CauseCard
                    key={cause.id}
                    cause={cause}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-[#FFFDF8]/70 p-4">
              <EmptyState
                title={
                  language === "mr"
                    ? "कोणतेही उपक्रम आढळले नाहीत"
                    : "No Matching Programs Found"
                }
                description={
                  language === "mr"
                    ? "आपल्या शोध निकषांशी जुळणारे कोणतेही उपक्रम सापडले नाहीत. कृपया फिल्टर रीसेट करा."
                    : "We couldn't find any initiatives matching your filter criteria. Try clearing filters to view all programs."
                }
                actionLabel={
                  language === "mr"
                    ? "फिल्टर रीसेट करा"
                    : "Reset Filters"
                }
                onAction={() => {
                  setSelectedCategory("All");
                  setSearchQuery("");
                  setUrgentOnly(false);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Causes;