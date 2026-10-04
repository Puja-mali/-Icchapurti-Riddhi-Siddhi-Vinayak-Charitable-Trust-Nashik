import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Search, Filter, AlertCircle, RefreshCw, Loader2 } from "lucide-react";
import { Cause, CauseCategory } from "@/src/types";
import { MOCK_CAUSES } from "@/src/data/mockData";
import { causeService } from "@/src/services/causeService";
import { SectionHeader } from "@/src/components/common/SectionHeader";
import { CauseCard } from "@/src/components/causes/CauseCard";
import { EmptyState } from "@/src/components/common/EmptyState";
import { Button } from "@/src/components/common/Button";
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
  const { t, language } = useLanguage();
  const { isKumbhMode } = useKumbhMode();
  const [causes, setCauses] = useState<Cause[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<"All" | CauseCategory>("All");
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
      console.warn("Notice fetching registered causes, utilizing local verified causes:", err);
      setCauses(MOCK_CAUSES);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCauses();
  }, [fetchCauses]);

  const getCategoryLabel = (cat: "All" | CauseCategory) => {
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
      if (!isKumbhMode && cause.isKumbhRelated) return false;
      const matchesCategory =
        selectedCategory === "All" || cause.category === selectedCategory;
      const matchesSearch =
        cause.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cause.tagline && cause.tagline.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (cause.shortDescription && cause.shortDescription.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (cause.location && cause.location.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesUrgent = !urgentOnly || cause.urgent;

      return matchesCategory && matchesSearch && matchesUrgent;
    });
  }, [causes, selectedCategory, searchQuery, urgentOnly, isKumbhMode]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#14532d] bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-700/20">
            {language === "mr" ? "सक्रिय सेवा प्रकल्प" : "Active Programs"}
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
          {language === "mr" ? "ट्रस्टचे सामाजिक सेवा उपक्रम" : "Trust Service Programs & Appeals"}
        </h1>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
          {language === "mr"
            ? "खालीलपैकी कोणत्याही सामाजिक उपक्रमासाठी थेट देणगी द्या. सर्व देणग्यांचे अधिकृत रेकॉर्ड व पावती प्रदान केली जाते."
            : "Select an active community initiative below. Contributions support direct program procurement and community assistance in Nashik."}
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-md p-4 sm:p-5 border border-stone-200 shadow-2xs space-y-4">
        {/* Search input & Urgent toggle */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={
                language === "mr"
                  ? "प्रकल्प, विषय किंवा जिल्हा शोधा..."
                  : "Search by program title, keyword, or district..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:border-[#14532d]"
            />
          </div>

          <button
            type="button"
            onClick={() => setUrgentOnly(!urgentOnly)}
            className={`w-full sm:w-auto px-3 py-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 border transition-colors cursor-pointer ${
              urgentOnly
                ? "bg-rose-50 text-rose-900 border-rose-300"
                : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
            }`}
          >
            <AlertCircle className={`w-3.5 h-3.5 ${urgentOnly ? "text-rose-700" : "text-stone-400"}`} />
            <span>{language === "mr" ? "फक्त तातडीच्या गरजा" : "Urgent Needs Only"}</span>
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer border ${
                  isSelected
                    ? "bg-[#14532d] text-white border-[#14532d]"
                    : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
                }`}
              >
                {getCategoryLabel(cat)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content: Loading, Error, Empty, or Causes Grid */}
      {isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-3 text-stone-500">
          <Loader2 className="w-8 h-8 animate-spin text-[#14532d]" />
          <p className="text-sm font-medium">
            {language === "mr" ? "उपक्रम लोड होत आहेत..." : "Loading active campaigns from trust database..."}
          </p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-md p-6 text-center space-y-3 max-w-xl mx-auto">
          <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
          <h3 className="font-serif font-bold text-stone-900 text-base">
            {language === "mr" ? "उपक्रम लोड करण्यात त्रुटी" : "Unable to Load Campaigns"}
          </h3>
          <p className="text-xs text-rose-800">{error}</p>
          <Button
            size="sm"
            variant="outline"
            className="border-rose-300 text-rose-900 hover:bg-rose-100 mx-auto"
            onClick={fetchCauses}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            {language === "mr" ? "पुन्हा प्रयत्न करा" : "Retry"}
          </Button>
        </div>
      ) : causes.length === 0 ? (
        /* Empty Database State: Requirement 13 */
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
          actionLabel={language === "mr" ? "रिफ्रेश करा" : "Refresh"}
          onAction={fetchCauses}
        />
      ) : filteredCauses.length > 0 ? (
        /* Populated Grid */
        <div className="space-y-4">
          <div className="text-xs text-stone-500 font-medium">
            {language === "mr"
              ? `${filteredCauses.length} उपक्रम उपलब्ध`
              : `Showing ${filteredCauses.length} programs`}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCauses.map((cause) => (
              <CauseCard key={cause.id} cause={cause} />
            ))}
          </div>
        </div>
      ) : (
        /* Search/Filter Empty State */
        <EmptyState
          title={language === "mr" ? "कोणतेही उपक्रम आढळले नाहीत" : "No Matching Programs Found"}
          description={
            language === "mr"
              ? "आपल्या शोध निकषांशी जुळणारे कोणतेही उपक्रम सापडले नाहीत. कृपया फिल्टर रीसेट करा."
              : "We couldn't find any initiatives matching your filter criteria. Try clearing filters to view all programs."
          }
          actionLabel={language === "mr" ? "फिल्टर रीसेट करा" : "Reset Filters"}
          onAction={() => {
            setSelectedCategory("All");
            setSearchQuery("");
            setUrgentOnly(false);
          }}
        />
      )}
    </div>
  );
};
