import React, { useState, useMemo, useEffect, useCallback } from "react";

import {
  Search,
  AlertCircle,
  RefreshCw,
  Loader2,
  Leaf,
} from "lucide-react";

import { Cause, CauseCategory } from "@/src/types";
import { causeService } from "@/src/services/causeService";

import { CauseCard } from "@/src/components/causes/CauseCard";
import { EmptyState } from "@/src/components/common/EmptyState";
import { Button } from "@/src/components/common/Button";
import { PageHeader } from "@/src/components/common/PageHeader";

import { getLocalizedCategory } from "@/src/lib/localization";
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
        setCauses([]);
      }
    } catch (err: any) {
      console.warn("Notice fetching registered causes:", err);
      setCauses([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCauses();
  }, [fetchCauses]);

  const getCategoryLabel = (cat: "All" | CauseCategory) => {
    return getLocalizedCategory(cat, language);
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
    <div className="relative min-h-screen overflow-hidden bg-[#faf8f5]">
      {/* Subtle warm stone architectural texture overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#d6c9b3_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />

      {/* Main Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* 1. Cinematic Page Header with authentic Nashik field photo */}
        <PageHeader
          variant="cinematic"
          backgroundImage="/activities/Community Aid Distribution Under the Trees.png"
          kicker={
            language === "mr"
              ? "नाशिक सेवा प्रकल्प · नोंदणी क्र. E-9389"
              : language === "hi"
              ? "नासिक सेवा प्रकल्प · पंजीकरण सं. E-9389"
              : "Nashik Community Seva · Reg. E-9389 / Nashik"
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
              : "Direct, transparent grassroots programs across Nashik district. Every contribution is allocated to verified procurement, field execution, and auditable donor receipts."
          }
        />

        {/* 2. Editorial Search & Segmented Filter Bar */}
        <div className="relative overflow-hidden rounded-2xl border border-stone-200/90 bg-white/95 p-4 sm:p-5 shadow-xs backdrop-blur-sm">
          <div className="relative z-10 space-y-3.5">
            {/* Search input & Urgent toggle */}
            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <div className="relative w-full flex-1">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />

                <input
                  type="text"
                  placeholder={
                    language === "mr"
                      ? "प्रकल्प, विषय किंवा जिल्हा शोधा..."
                      : language === "hi"
                      ? "प्रकल्प, विषय या जिला खोजें..."
                      : "Search by program title, keyword, or district..."
                  }
                  value={searchQuery}
                  onChange={(e) =>
                    setSearchQuery(e.target.value)
                  }
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/70 py-2.5 pl-10 pr-4 text-xs text-stone-900 placeholder:text-stone-400 transition-all focus:border-stone-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500/30 sm:text-sm"
                />
              </div>

              <button
                type="button"
                onClick={() =>
                  setUrgentOnly(!urgentOnly)
                }
                className={`flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all sm:w-auto ${
                  urgentOnly
                    ? "border-amber-400 bg-amber-50 text-amber-950 shadow-xs"
                    : "border-stone-200 bg-stone-50/80 text-stone-700 hover:bg-stone-100"
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
                    : language === "hi"
                    ? "केवल आवश्यक सेवाएं"
                    : "Urgent Needs Only"}
                </span>
              </button>
            </div>

            {/* Category Segmented Tabs */}
            <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
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
                    className={`whitespace-nowrap rounded-xl px-3.5 py-1.5 font-medium transition-all cursor-pointer ${
                      isSelected
                        ? "bg-stone-900 font-semibold text-white shadow-xs"
                        : "bg-stone-100/80 text-stone-700 hover:bg-stone-200/80 hover:text-stone-900"
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
                    : language === "hi"
                    ? "वर्तमान में कोई सेवा प्रकल्प उपलब्ध नहीं है।"
                    : "No campaigns available at the moment."
                }
                description={
                  language === "mr"
                    ? "सध्या डेटाबेसमध्ये कोणतेही सक्रिय उपक्रम नोंदवलेले नाहीत. नवीन मोहिमेसाठी कृपया लवकरच पुन्हा भेट द्या."
                    : language === "hi"
                    ? "वर्तमान में डेटाबेस में कोई सक्रिय सेवा प्रकल्प पंजीकृत नहीं है। कृपया जल्द पुनः देखें।"
                    : "There are currently no active charitable campaigns published in the database. Please check back soon."
                }
                actionLabel={
                  language === "mr"
                    ? "रिफ्रेश करा"
                    : language === "hi"
                    ? "ताज़ा करें"
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
                    : language === "hi"
                    ? `${filteredCauses.length} सेवा प्रकल्प उपलब्ध`
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
                      : language === "hi"
                      ? "फ़िल्टर हटाएं"
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
                    : language === "hi"
                    ? "कोई सेवा प्रकल्प नहीं मिला"
                    : "No Matching Programs Found"
                }
                description={
                  language === "mr"
                    ? "आपल्या शोध निकषांशी जुळणारे कोणतेही उपक्रम सापडले नाहीत. कृपया फिल्टर रीसेट करा."
                    : language === "hi"
                    ? "चयनित श्रेणी या खोज के अनुसार कोई प्रकल्प नहीं मिला। कृपया फ़िल्टर हटाएं।"
                    : "We couldn't find any initiatives matching your filter criteria. Try clearing filters to view all programs."
                }
                actionLabel={
                  language === "mr"
                    ? "फिल्टर रीसेट करा"
                    : language === "hi"
                    ? "फ़िल्टर हटाएं"
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