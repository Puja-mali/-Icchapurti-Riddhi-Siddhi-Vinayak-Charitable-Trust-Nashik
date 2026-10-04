import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import {
  Heart,
  ShieldCheck,
  Search,
  ArrowRight,
  GraduationCap,
  Stethoscope,
  Utensils,
  AlertTriangle,
  TreePine,
  FileCheck2,
  Receipt,
  Users2,
  Scale,
  MapPin,
  Calendar,
  Sparkles,
  ExternalLink,
  Loader2,
  Newspaper,
  Clock,
  BookOpen,
  Camera,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/src/components/common/Button";
import { CauseCard } from "@/src/components/causes/CauseCard";
import { ImpactTimeline } from "@/src/components/impact/ImpactTimeline";
import { ImpactJourneyInteractive } from "@/src/components/impact/ImpactJourneyInteractive";
import { HumanImpactStory } from "@/src/components/impact/HumanImpactStory";
import { AnimatedCounter } from "@/src/components/common/AnimatedCounter";
import { HeroNamaste } from "@/src/components/home/HeroNamaste";
import { KumbhHomeBanner } from "@/src/components/kumbh/KumbhHomeBanner";
import { Cause, BlogPost, EventItem, TransparencyReport, ImpactPassportRecord } from "@/src/types";
import { publicService, PublicHomeData } from "@/src/services/publicService";
import { formatEventDate } from "@/src/services/eventService";
import { useTrust } from "@/src/context/TrustContext";
import { useLanguage } from "@/src/context/LanguageContext";
import { MOCK_CAUSES } from "@/src/data/mockData";

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { trustProfile } = useTrust();
  const shouldReduceMotion = useReducedMotion();

  // Unified public home data fetched from real MongoDB aggregation
  const [homeData, setHomeData] = useState<PublicHomeData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHomeData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await publicService.getHomeData();
      setHomeData(data);
    } catch (err: any) {
      console.error("Error fetching homepage records:", err);
      setError(
        err?.message ||
          (language === "mr"
            ? "माहिती मिळवण्यात अडचण आली. कृपया पुन्हा प्रयत्न करा."
            : "Unable to load live trust metrics. Please verify connection and retry.")
      );
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  useEffect(() => {
    fetchHomeData();
  }, [fetchHomeData]);

  const stats = homeData?.stats;
  const featuredCauses = (homeData?.featuredCauses && homeData.featuredCauses.length > 0)
    ? homeData.featuredCauses
    : MOCK_CAUSES.slice(0, 3);
  const upcomingEvents = homeData?.upcomingEvents || [];
  const latestNews = homeData?.latestNews || [];
  const recentAudits = homeData?.recentAudits || [];
  const galleryPreview = homeData?.galleryPreview || [];
  const samplePassport = homeData?.samplePassport || null;

  const workPrograms = [
    {
      id: "education",
      title: t.educationTitle,
      category: language === "mr" ? "शिक्षण" : "Education",
      desc: t.educationDesc,
      icon: GraduationCap,
      image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80",
      location: "Nashik Schools & Communities",
      link: "/causes?category=Education",
    },
    {
      id: "healthcare",
      title: t.medicalTitle,
      category: language === "mr" ? "आरोग्य" : "Medical Support",
      desc: t.medicalDesc,
      icon: Stethoscope,
      image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80",
      location: "Nashik Community Seva Centers",
      link: "/causes?category=Medical Support",
    },
    {
      id: "nutrition",
      title: t.foodTitle,
      category: language === "mr" ? "अन्नदान" : "Food & Nutrition",
      desc: t.foodDesc,
      icon: Utensils,
      image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80",
      location: "Nashik Community Centers",
      link: "/causes?category=Food & Nutrition",
    },
    {
      id: "environment",
      title: t.environmentTitle,
      category: language === "mr" ? "पर्यावरण" : "Environment",
      desc: t.environmentDesc,
      icon: TreePine,
      image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80",
      location: "Nashik Public Grounds & Schools",
      link: "/causes?category=Environment",
    },
  ];

  return (
    <div className="space-y-10 sm:space-y-16 md:space-y-24 pb-16 sm:pb-20 overflow-x-hidden w-full max-w-full">
      {/* 1. HERO SECTION & WELCOME SEVA HUB */}
      <HeroNamaste />

      {/* CONDITIONAL SIMHASTHA KUMBH 2027 BANNER */}
      <KumbhHomeBanner />

      {/* GLOBAL ERROR STATE BANNER (IF API CALL FAILED) */}
      {error && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-amber-50/90 border border-amber-200 rounded-md p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-700 shrink-0" />
              <span>{error}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchHomeData}
              className="text-xs shrink-0 border-amber-300 hover:bg-amber-100/60"
              leftIcon={<RefreshCw className="w-3.5 h-3.5 text-amber-700" />}
            >
              {language === "mr" ? "पुन्हा प्रयत्न करा" : "Retry Connection"}
            </Button>
          </div>
        </section>
      )}

      {/* 2. DEDICATED REAL MONGODB IMPACT METRICS SECTION */}
      <section id="trust-stats-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-md border border-stone-200 p-6 sm:p-8 shadow-2xs"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-stone-100">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#14532d]">
                {language === "mr" ? "पडताळणीयोग्य सेवा कार्य" : "Verifiable Operational Footprint"}
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 mt-1">
                {language === "mr"
                  ? `${trustProfile?.shortName || "सिद्धिविनायक ट्रस्ट"} - सामाजिक प्रभाव (थेट डेटाबेस आकडेवारी)`
                  : `${trustProfile?.shortName || "Siddhivinayak Trust"} - Cumulative Verified Footprint`}
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{language === "mr" ? "थेट डेटाबेस नोंदवही" : "Live MongoDB Ledger"}</span>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-5 rounded border border-stone-100 bg-stone-50/60 animate-pulse space-y-3">
                  <div className="h-3 w-24 bg-stone-200 rounded" />
                  <div className="h-8 w-16 bg-stone-300 rounded" />
                  <div className="h-2.5 w-36 bg-stone-200 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Stat 1: Active Appeals / Causes */}
                <div className="p-4 rounded border border-stone-200/80 bg-stone-50/50 hover:border-stone-300 transition-colors">
                  <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider flex items-center justify-between">
                    <span>{language === "mr" ? "सक्रिय मदत उपक्रम" : "Active Appeals"}</span>
                    <Heart className="w-3.5 h-3.5 text-rose-600" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-serif font-bold text-[#14532d] mt-1.5">
                    <AnimatedCounter value={stats?.activeCausesCount ?? 0} />
                  </div>
                  <div className="text-xs text-stone-600 mt-1">
                    {language === "mr"
                      ? "सध्या सुरू असलेले थेट मदत प्रकल्प"
                      : "Ongoing community relief campaigns"}
                  </div>
                </div>

                {/* Stat 2: Verified Contributions */}
                <div className="p-4 rounded border border-stone-200/80 bg-stone-50/50 hover:border-stone-300 transition-colors">
                  <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider flex items-center justify-between">
                    <span>{language === "mr" ? "नोंदणीकृत देणग्या" : "Verified Contributions"}</span>
                    <Receipt className="w-3.5 h-3.5 text-emerald-700" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-serif font-bold text-[#14532d] mt-1.5">
                    <AnimatedCounter value={stats?.successfulDonationsCount ?? 0} />
                  </div>
                  <div className="text-xs text-stone-600 mt-1">
                    {language === "mr"
                      ? "८०जी पावतीसह सत्यापित देणगी नोंदी"
                      : "Receipted & digitally audited donations"}
                  </div>
                </div>

                {/* Stat 3: Upcoming Seva Drives */}
                <div className="p-4 rounded border border-stone-200/80 bg-stone-50/50 hover:border-stone-300 transition-colors">
                  <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider flex items-center justify-between">
                    <span>{language === "mr" ? "आगामी सेवा कार्यक्रम" : "Upcoming Seva Drives"}</span>
                    <Calendar className="w-3.5 h-3.5 text-amber-700" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-serif font-bold text-[#14532d] mt-1.5">
                    <AnimatedCounter value={stats?.upcomingEventsCount ?? 0} />
                  </div>
                  <div className="text-xs text-stone-600 mt-1">
                    {language === "mr"
                      ? "आरोग्य शिबिरे व क्षेत्रीय उपक्रम"
                      : "Scheduled health camps & field drives"}
                  </div>
                </div>

                {/* Stat 4: Statutory Audit Reports */}
                <div className="p-4 rounded border border-stone-200/80 bg-stone-50/50 hover:border-stone-300 transition-colors">
                  <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider flex items-center justify-between">
                    <span>{language === "mr" ? "ऑडिट व ताळेबंद अहवाल" : "Audit Dockets Filed"}</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-800" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-serif font-bold text-emerald-800 mt-1.5">
                    <AnimatedCounter value={stats?.publishedAuditsCount ?? 0} />
                  </div>
                  <div className="text-xs text-stone-600 mt-1">
                    {language === "mr"
                      ? "सार्वजनिकरित्या उपलब्ध सीए ऑडिट अहवाल"
                      : "Publicly accessible statutory reports"}
                  </div>
                </div>
              </div>

              {/* Secondary Verified Metrics Ribbon */}
              <div className="mt-6 pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-4 text-xs text-stone-600">
                <div className="flex items-center gap-2">
                  <Users2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>
                    <strong className="text-stone-900 font-semibold">{stats?.approvedVolunteersCount ?? 0}</strong>{" "}
                    {language === "mr" ? "नोंदणीकृत स्वयंसेवक" : "Enrolled Seva Volunteers"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>
                    <strong className="text-stone-900 font-semibold">{stats?.galleryItemsCount ?? 0}</strong>{" "}
                    {language === "mr" ? "क्षेत्रीय छायाचित्रे व पुरावे" : "Field Verification Photos"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>
                    <strong className="text-stone-900 font-semibold">{stats?.publishedBlogCount ?? 0}</strong>{" "}
                    {language === "mr" ? "प्रकाशित सेवा वृत्त" : "Published Field Dispatches"}
                  </span>
                </div>
                <Link
                  to="/transparency"
                  className="text-[#14532d] font-semibold hover:underline flex items-center gap-1 ml-auto"
                >
                  <span>{language === "mr" ? "पारदर्शकता पोर्टल पहा" : "Audit & Transparency Portal"}</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </section>

      {/* 3. WHY PEOPLE TRUST US */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center max-w-2xl mx-auto mb-10"
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-[#14532d] bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-700/20">
            {language === "mr" ? "विश्वसनीयता व पारदर्शकता" : "Transparent Governance"}
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-2 tracking-tight">
            {t.whyTrustTitle}
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-2">
            {trustProfile?.description || t.whyTrustSubtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Transparent Donation Process */}
          <motion.div
            whileHover={!shouldReduceMotion ? { y: -4 } : undefined}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-md border border-stone-200 p-6 shadow-2xs hover:border-stone-400 hover:shadow-xs transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded bg-emerald-50 text-[#14532d] flex items-center justify-center border border-emerald-700/20">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-serif font-bold text-stone-900">
                {t.trustPoint1Title}
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                {t.trustPoint1Desc}
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
              <span className="flex items-center gap-1 font-mono text-[11px] text-[#14532d]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>{trustProfile?.registrationDetails?.registrationNumber || "Reg. No. E-9389 / Nashik"}</span>
              </span>
              <Link to="/impact-passport" className="text-[#14532d] font-semibold hover:underline flex items-center gap-1">
                <span>{language === "mr" ? "पासपोर्ट पहा" : "Passport"}</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </motion.div>

          {/* Card 2: Instant 80G Receipt */}
          <motion.div
            whileHover={!shouldReduceMotion ? { y: -4 } : undefined}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-md border border-stone-200 p-6 shadow-2xs hover:border-stone-400 hover:shadow-xs transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded bg-emerald-50 text-[#14532d] flex items-center justify-center border border-emerald-700/20">
                <Receipt className="w-5 h-5" />
              </div>
              <h3 className="text-base font-serif font-bold text-stone-900">
                {t.trustPoint2Title}
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                {t.trustPoint2Desc}
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
              <span className="flex items-center gap-1 font-mono text-[11px] text-[#14532d]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Statutory Public Trust</span>
              </span>
              <Link to="/donate" className="text-[#14532d] font-semibold hover:underline flex items-center gap-1">
                <span>{language === "mr" ? "देणगी द्या" : "Donate"}</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </motion.div>

          {/* Card 3: Democratic Seva & Community Led */}
          <motion.div
            whileHover={!shouldReduceMotion ? { y: -4 } : undefined}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-md border border-stone-200 p-6 shadow-2xs hover:border-stone-400 hover:shadow-xs transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded bg-emerald-50 text-[#14532d] flex items-center justify-center border border-emerald-700/20">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="text-base font-serif font-bold text-stone-900">
                {t.trustPoint3Title}
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                {t.trustPoint3Desc}
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
              <span className="flex items-center gap-1 text-[11px] text-stone-500">
                <span>{trustProfile?.registrationDetails?.establishedYear ? `Est. ${trustProfile.registrationDetails.establishedYear}` : "Registered NGO"}</span>
              </span>
              <Link to="/trust" className="text-[#14532d] font-semibold hover:underline flex items-center gap-1">
                <span>{language === "mr" ? "विश्वस्त माहिती" : "Trustees"}</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4. ACTIVE CAMPAIGNS FOR DIRECT DONATION (FEATURED CAUSES) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 border-b border-stone-200 pb-4">
          <div>
            <span className="text-xs font-semibold tracking-wider uppercase text-[#14532d] bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-700/20">
              {language === "mr" ? "सक्रिय मदत उपक्रम" : "Active Appeals"}
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-2 tracking-tight">
              {language === "mr" ? "तातडीच्या सामाजिक उपक्रमांना हातभार लावा" : "Support Urgent Ongoing Causes"}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              {language === "mr"
                ? "आपली देणगी योग्य ठिकाणी पोहोचण्यासाठी थेट उपक्रम निवडा."
                : "Select an active initiative to allocate your donation with full traceability."}
            </p>
          </div>
          <Link to="/causes">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              {language === "mr" ? "सर्व उपक्रम पहा" : "Browse All Causes"}
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-stone-500">
            <Loader2 className="w-6 h-6 animate-spin text-[#14532d]" />
            <span className="text-xs">Loading active campaigns from database...</span>
          </div>
        ) : featuredCauses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredCauses.map((cause) => (
              <CauseCard key={cause.id || cause.slug} cause={cause} />
            ))}
          </div>
        ) : (
          <div className="py-12 px-6 bg-stone-50 rounded-md border border-stone-200 text-center space-y-2">
            <Heart className="w-8 h-8 text-stone-400 mx-auto" />
            <h3 className="text-sm font-semibold text-stone-800">
              {language === "mr" ? "सध्या कोणतेही सक्रिय उपक्रम उपलब्ध नाहीत" : "No Active Campaigns Currently Listed"}
            </h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              {language === "mr"
                ? "नवीन समाजोपयोगी उपक्रमांची आखणी सुरू आहे. लवकरच नवीन उपक्रम नोंदवले जातील."
                : "All existing campaigns have reached completion. New field initiatives will appear once approved by the trust."}
            </p>
            <div className="pt-2">
              <Link to="/donate">
                <Button size="sm" variant="primary" className="text-xs">
                  {language === "mr" ? "सर्वसाधारण निधीला देणगी द्या" : "Donate to General Trust Corpus"}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* 5. IMPACT PASSPORT: ANIMATED JOURNEY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ImpactJourneyInteractive />

        {/* Live Timeline Sample */}
        <div className="mt-8 max-w-4xl mx-auto">
          <div className="text-xs font-semibold text-stone-600 mb-2 uppercase tracking-wide flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>{t.samplePassportLabel}</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-mono font-medium">
                {samplePassport ? "Live Verified Entry" : "Verification Framework"}
              </span>
            </div>
            <Link
              to="/impact-passport"
              className="text-[#14532d] text-xs hover:underline flex items-center gap-1 font-medium"
            >
              <span>{language === "mr" ? "संपूर्ण पासपोर्ट नोंदवही पहा" : "View Full Passport Ledger"}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {samplePassport ? (
            <ImpactTimeline passport={samplePassport} />
          ) : (
            <div className="bg-white rounded-md border border-stone-200 p-8 text-center space-y-3 shadow-2xs">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#14532d] flex items-center justify-center mx-auto border border-emerald-100">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="text-base font-serif font-bold text-stone-900">
                {language === "mr" ? "डिजिटल इम्पॅक्ट पासपोर्ट नोंदवही" : "Digital Impact Passport Ledger"}
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 max-w-lg mx-auto leading-relaxed">
                {language === "mr"
                  ? "प्रत्येक पडताळणी केलेल्या देणगीसाठी ४-टप्प्यांची पारदर्शक नोंद तयार केली जाते (पावती -> निधी वाटप -> क्षेत्रीय अंमलबजावणी -> सीए ऑडिट). आपली पहिली देणगी नोंदवून पासपोर्ट प्राप्त करा."
                  : "Every contribution receipted by the trust receives an immutable 4-stage tracking docket (Donation -> Allocation -> Verification -> Impact). Make a verified contribution to generate your personal passport."}
              </p>
              <div className="pt-2">
                <Link to="/causes">
                  <Button size="sm" variant="primary" className="text-xs" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    {language === "mr" ? "उपक्रमाला हातभार लावा" : "Support an Active Cause"}
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 6. DOCUMENTED HUMAN IMPACT STORY (STORY SECTION) */}
      <HumanImpactStory />

      {/* 7. OUR WORK PROGRAMS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 border-b border-stone-200 pb-4">
          <div>
            <span className="text-xs font-semibold tracking-wider uppercase text-[#14532d] bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-700/20">
              {language === "mr" ? "प्रमुख सेवा प्रकल्प" : "Key Programs"}
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-2 tracking-tight">
              {t.ourWorkTitle}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              {t.ourWorkSubtitle}
            </p>
          </div>
          <Link to="/causes">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              {language === "mr" ? "सर्व प्रकल्प पहा" : "View All Programs"}
            </Button>
          </Link>
        </div>

        {/* Meaningful Program Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {workPrograms.slice(0, 3).map((prog) => {
            const IconComp = prog.icon;
            return (
              <motion.div
                key={prog.id}
                whileHover={!shouldReduceMotion ? { y: -4 } : undefined}
                transition={{ duration: 0.25 }}
                className="group bg-white rounded-md border border-stone-200 overflow-hidden shadow-2xs hover:border-stone-400 hover:shadow-xs transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Photo area with zoom on hover */}
                  <div className="relative aspect-16/9 w-full bg-stone-100 overflow-hidden border-b border-stone-200">
                    <img
                      src={prog.image}
                      alt={prog.title}
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-stone-900/80 text-white text-[11px] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                      <IconComp className="w-3 h-3 text-amber-300" />
                      <span>{prog.category}</span>
                    </div>
                    <div className="absolute bottom-2 left-2.5 bg-white/90 text-stone-800 text-[10px] px-2 py-0.5 rounded flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#14532d]" />
                      <span>{prog.location}</span>
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <h3 className="font-serif font-bold text-base sm:text-lg text-stone-900 group-hover:text-[#14532d] transition-colors">
                      {prog.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed line-clamp-3">
                      {prog.desc}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-stone-100 flex items-center justify-between text-xs mt-2">
                  <span className="text-stone-500 font-medium">Field Operations</span>
                  <Link
                    to={prog.link}
                    className="text-[#14532d] font-semibold hover:underline flex items-center gap-1 group-hover:text-emerald-800"
                  >
                    <span>{language === "mr" ? "उपक्रम पहा" : "Explore Initiatives"}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 duration-200" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 8. FEATURED UPCOMING EVENTS (REAL MONGODB DATA) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#14532d] bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-700/20 mb-2">
              <Calendar className="w-3.5 h-3.5 text-emerald-700" />
              <span>{language === "mr" ? "आगामी कार्यक्रम" : "Field Mobilization"}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
              {language === "mr" ? "आगामी सेवा शिबिरे व कार्यक्रम" : "Upcoming Seva Drives & Field Camps"}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
              {language === "mr"
                ? "आमच्या वैद्यकीय तपासणी, रक्तदान व वृक्षारोपण शिबिरांमध्ये थेट सहभागी व्हा."
                : "Join our healthcare diagnostic camps, distribution drives, and community outreach on the ground."}
            </p>
          </div>
          <Link to="/events">
            <Button
              variant="outline"
              size="sm"
              className="text-xs text-emerald-800 border-emerald-800/30 hover:bg-emerald-50 inline-flex items-center gap-1 shrink-0"
            >
              <span>{language === "mr" ? "सर्व कार्यक्रम पहा" : "View All Events"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-2 text-stone-500">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-700" />
            <p className="text-xs">Loading scheduled events...</p>
          </div>
        ) : upcomingEvents.length === 0 ? (
          <div className="py-10 px-4 bg-stone-50/60 border border-stone-200 rounded-lg text-center space-y-2">
            <Calendar className="w-6 h-6 text-stone-400 mx-auto" />
            <p className="text-sm font-medium text-stone-700">
              {language === "mr" ? "सध्या कोणतेही आगामी कार्यक्रम नियोजित नाहीत" : "No Upcoming Events Currently Scheduled"}
            </p>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              {language === "mr"
                ? "नवीन सेवा शिबिरे लवकरच जाहीर केली जातील. स्वयंसेवक म्हणून सहभागी होण्यासाठी नोंदणी करा."
                : "New health diagnostic and distribution camps are scheduled bi-weekly. Register as a volunteer to receive immediate notifications."}
            </p>
            <div className="pt-2">
              <Link to="/volunteer">
                <Button size="sm" variant="outline" className="text-xs">
                  {language === "mr" ? "स्वयंसेवक म्हणून नोंदणी करा" : "Register as Seva Volunteer"}
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <div
                key={event.id || event.slug}
                className="bg-white rounded-lg border border-stone-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="aspect-16/10 overflow-hidden bg-stone-100 relative">
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80";
                      }}
                    />
                    <span className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                      {event.category || "Field Drive"}
                    </span>
                    <span className="absolute bottom-2.5 right-2.5 bg-emerald-900/90 text-white text-[10px] font-medium px-2 py-0.5 rounded">
                      {formatEventDate(event.startDate)}
                    </span>
                  </div>

                  <div className="p-4 space-y-2.5">
                    <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
                      <MapPin className="w-3 h-3 text-[#14532d] shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>

                    <h3 className="font-serif font-bold text-sm sm:text-base text-stone-900 group-hover:text-emerald-800 transition-colors line-clamp-2 leading-snug">
                      <Link to={`/events/${event.slug || event.id}`}>{event.title}</Link>
                    </h3>

                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                      {event.shortDescription}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-stone-100 flex items-center justify-between text-xs mt-2">
                  <span className="text-stone-500 text-[11px]">
                    {event.registrationCount > 0 ? `${event.registrationCount} Registered` : "Open Participation"}
                  </span>
                  <Link
                    to={`/events/${event.slug || event.id}`}
                    className="text-[#14532d] font-semibold hover:underline flex items-center gap-1 shrink-0"
                  >
                    <span>{language === "mr" ? "तपशील पहा" : "Event Details"}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 9. RECENT VERIFIED AUDIT UPDATES (REAL MONGODB DATA) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-stone-200 rounded-md p-6 sm:p-8 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-stone-200">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#14532d] bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-700/20">
                {language === "mr" ? "पारदर्शकता व ऑडिट" : "Statutory Transparency"}
              </span>
              <h3 className="text-xl font-serif font-bold text-stone-900 mt-1.5">
                {language === "mr" ? "अलीकडील सीए ऑडिट व ताळेबंद अहवाल" : "Recent Trust Field Verifications & Audits"}
              </h3>
            </div>
            <Link
              to="/transparency"
              className="text-xs text-[#14532d] font-semibold hover:underline flex items-center gap-1"
            >
              <span>{language === "mr" ? "सर्व अहवाल पहा" : "View Transparency Portal"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="py-8 flex justify-center text-stone-400">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-700" />
            </div>
          ) : recentAudits.length === 0 ? (
            <div className="py-6 px-4 bg-stone-50 rounded border border-stone-200 text-center text-xs text-stone-500 space-y-1">
              <p className="font-semibold text-stone-700">
                {language === "mr" ? "ऑडिट अहवाल अद्ययावत केले जात आहेत" : "No Published Audit Dockets Found"}
              </p>
              <p>
                {language === "mr"
                  ? "विश्वस्त मंडळाने मंजूर केलेले वार्षिक लेखाजोखा अहवाल पारदर्शकता दालनात उपलब्ध आहेत."
                  : "Annual financial statements, statutory balance sheets, and utilization records are published in the Transparency Portal."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentAudits.map((report) => (
                <div
                  key={report.id}
                  className="p-4 rounded border border-stone-200/80 bg-stone-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm hover:border-stone-300 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded bg-white text-[#14532d] flex items-center justify-center shrink-0 border border-stone-200 mt-0.5 shadow-2xs">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-stone-900">
                        {report.title}
                      </h4>
                      <p className="text-stone-600 text-xs mt-0.5">
                        {report.description}
                      </p>
                      {report.auditorFirm && (
                        <div className="text-[11px] text-stone-500 mt-1 flex items-center gap-1.5">
                          <span>Auditor: {report.auditorFirm}</span>
                          {report.auditRating && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-700 font-medium">{report.auditRating}</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-stone-500 text-xs shrink-0 sm:text-right">
                    <span className="font-mono text-[#14532d] font-semibold block">{report.reportType}</span>
                    <span>FY {report.financialYear}</span>
                    {report.publishedAt && <span className="block text-[11px] text-stone-400 mt-0.5">{report.publishedAt}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 10. REAL EVENT GALLERY MEDIA PREVIEW (IF AVAILABLE) */}
      {galleryPreview.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div>
              <div className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[#14532d]">
                <Camera className="w-3.5 h-3.5 text-emerald-700" />
                <span>{language === "mr" ? "क्षेत्रीय छायाचित्र दालन" : "Visual Proofs Ledger"}</span>
              </div>
              <h3 className="text-xl font-serif font-bold text-stone-900 mt-1">
                {language === "mr" ? "थेट सेवा छायाचित्रे" : "Field Action Photo Gallery"}
              </h3>
            </div>
            <Link
              to="/gallery"
              className="text-xs text-[#14532d] font-semibold hover:underline flex items-center gap-1"
            >
              <span>{language === "mr" ? "पूर्ण दालन पहा" : "Explore Gallery"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {galleryPreview.map((item, idx) => (
              <div
                key={idx}
                className="aspect-square bg-stone-100 rounded border border-stone-200 overflow-hidden relative group cursor-pointer"
                onClick={() => navigate(`/events/${item.eventSlug}`)}
              >
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end">
                  <p className="text-[10px] text-white font-medium line-clamp-2 leading-tight">
                    {item.title}
                  </p>
                  {item.location && (
                    <span className="text-[9px] text-stone-300 mt-0.5">{item.location}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 11. TRUST FIELD CHRONICLES & NEWS (REAL MONGODB DATA) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#14532d] bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-700/20 mb-2">
              <Newspaper className="w-3.5 h-3.5 text-emerald-700" />
              <span>{t.blog.recentPosts}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
              {t.blog.featuredNews}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
              {t.blog.subtitle}
            </p>
          </div>
          <Link to="/blog">
            <Button
              variant="outline"
              size="sm"
              className="text-xs text-emerald-800 border-emerald-800/30 hover:bg-emerald-50 inline-flex items-center gap-1 shrink-0"
            >
              <span>{language === "mr" ? "सर्व वृत्त पहा" : language === "hi" ? "सभी समाचार देखें" : "View All Stories"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-2 text-stone-500">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-700" />
            <p className="text-xs">{t.blog.loading}</p>
          </div>
        ) : latestNews.length === 0 ? (
          <div className="py-10 px-4 bg-stone-50/60 border border-stone-200 rounded-lg text-center space-y-2">
            <BookOpen className="w-6 h-6 text-stone-400 mx-auto" />
            <p className="text-sm font-medium text-stone-700">{t.blog.noPosts}</p>
            <p className="text-xs text-stone-500">
              New updates, medical camp releases, and field dispatches will appear here once published.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestNews.map((post) => (
              <article
                key={post.id || post.slug}
                className="bg-white rounded-lg border border-stone-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="aspect-16/10 overflow-hidden bg-stone-100 relative">
                    <img
                      src={post.coverImage || post.imageUrl}
                      alt={post.title}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?auto=format&fit=crop&w=800&q=80";
                      }}
                    />
                    <span className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                      {post.category}
                    </span>
                  </div>

                  <div className="p-4 space-y-2.5">
                    <div className="flex items-center gap-2 text-[11px] text-stone-500">
                      <span>{post.publishedDate || post.publishedAt || post.date}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-stone-400" />
                        <span>{post.readTime}</span>
                      </span>
                    </div>

                    <h3 className="font-serif font-bold text-sm sm:text-base text-stone-900 group-hover:text-emerald-800 transition-colors line-clamp-2 leading-snug">
                      <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                    </h3>

                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-stone-100 flex items-center justify-between text-xs mt-2">
                  <span className="text-stone-500 text-[11px] truncate max-w-[55%]">
                    By {post.author}
                  </span>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="text-[#14532d] font-semibold hover:underline flex items-center gap-1 shrink-0"
                  >
                    <span>{t.blog.readStory}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* 12. VOLUNTEER & COMMUNITY CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          whileHover={!shouldReduceMotion ? { scale: 1.005 } : undefined}
          transition={{ duration: 0.3 }}
          className="bg-[#14532d] rounded-md p-8 sm:p-12 text-white shadow-md relative overflow-hidden"
        >
          {/* Subtle background crest / texture */}
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-amber-500/10 to-transparent pointer-events-none" />

          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="text-xs font-semibold uppercase tracking-widest text-amber-200 bg-emerald-950/80 px-2.5 py-0.5 rounded border border-emerald-600/40">
              Community Participation
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-white">
              Participate as a Volunteer or Field Monitor
            </h2>
            <p className="text-emerald-100/90 text-xs sm:text-sm leading-relaxed font-sans">
              Whether you are a student, teacher, medical professional, or community worker,
              we welcome volunteers to assist during our health camps, distribution drives, and school visits.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link to="/volunteer">
                <Button
                  size="md"
                  variant="outline"
                  className="bg-white hover:bg-stone-100 text-[#14532d] font-semibold border-white"
                  leftIcon={<Users2 className="w-4 h-4" />}
                >
                  {t.navVolunteer}
                </Button>
              </Link>
              <Link to="/events">
                <Button
                  size="md"
                  variant="ghost"
                  className="text-white hover:bg-white/10 border border-white/30"
                  leftIcon={<Calendar className="w-4 h-4" />}
                >
                  {t.navEvents}
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};
