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
  TreePine,
  FileCheck2,
  Receipt,
  Users2,
  MapPin,
  Calendar,
  Loader2,
  Newspaper,
  Clock,
  BookOpen,
  Camera,
  RefreshCw,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/src/components/common/Button";
import { CauseCard } from "@/src/components/causes/CauseCard";
import { HumanImpactStory } from "@/src/components/impact/HumanImpactStory";
import { AnimatedCounter } from "@/src/components/common/AnimatedCounter";
import { KumbhHomeBanner } from "@/src/components/kumbh/KumbhHomeBanner";
import { Cause, BlogPost, EventItem, TransparencyReport, ImpactPassportRecord } from "@/src/types";
import { publicService, PublicHomeData } from "@/src/services/publicService";
import { formatEventDate } from "@/src/services/eventService";
import { useTrust } from "@/src/context/TrustContext";
import { useLanguage } from "@/src/context/LanguageContext";
import { SEO } from "@/src/components/common/SEO";

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { trustProfile } = useTrust();
  const shouldReduceMotion = useReducedMotion();

  // Helper for trilingual copy (Marathi, Hindi, English)
  const tr = (mr: string, hi: string, en: string) => {
    if (language === "mr") return mr;
    if (language === "hi") return hi;
    return en;
  };

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
          tr(
            "माहिती मिळवण्यात अडचण आली. कृपया पुन्हा प्रयत्न करा.",
            "डेटा प्राप्त करने में समस्या आई। कृपया पुनः प्रयास करें।",
            "Unable to load live trust metrics. Please verify connection and retry."
          )
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
    : [];
  const upcomingEvents = homeData?.upcomingEvents || [];
  const latestNews = homeData?.latestNews || [];
  const recentAudits = homeData?.recentAudits || [];
  const galleryPreview = homeData?.galleryPreview || [];
  const samplePassport = homeData?.samplePassport || null;

  const workPrograms = [
    {
      id: "education",
      title: t.educationTitle,
      category: tr("शिक्षण", "शिक्षा", "Education"),
      desc: t.educationDesc,
      icon: GraduationCap,
      image: "/activities/Charity Camp Book Distribution.png",
      location: tr("नाशिक शाळा व ग्रामीण परिसर", "नासिक विद्यालय एवं ग्रामीण क्षेत्र", "Nashik Schools & Communities"),
      link: "/causes?category=Education",
    },
    {
      id: "healthcare",
      title: t.medicalTitle,
      category: tr("आरोग्य", "स्वास्थ्य", "Medical Support"),
      desc: t.medicalDesc,
      icon: Stethoscope,
      image: "/activities/Community Aid Distribution Under the Trees.png",
      location: tr("नाशिक आरोग्य सेवा केंद्र", "नासिक स्वास्थ्य सेवा केंद्र", "Nashik Community Seva Centers"),
      link: "/causes?category=Medical Support",
    },
    {
      id: "nutrition",
      title: t.foodTitle,
      category: tr("अन्नदान", "पोषण", "Food & Nutrition"),
      desc: t.foodDesc,
      icon: Utensils,
      image: "/activities/image.png",
      location: tr("नाशिक अन्नछत्र केंद्र", "नासिक अन्नक्षेत्र केंद्र", "Nashik Community Centers"),
      link: "/causes?category=Food & Nutrition",
    },
    {
      id: "environment",
      title: t.environmentTitle,
      category: tr("पर्यावरण", "पर्यावरण", "Environment"),
      desc: t.environmentDesc,
      icon: TreePine,
      image: "/trust-emblem.jpg",
      location: tr("नाशिक सार्वजनिक उद्याने व परिसर", "नासिक सार्वजनिक उद्यान एवं परिसर", "Nashik Public Grounds & Schools"),
      link: "/causes?category=Environment",
    },
  ];

  return (
    <>
      <SEO
        title="Official Portal | Icchapurti Riddhi Siddhi Vinayak Charitable Trust, Nashik"
        description="Official website of Icchapurti Riddhi Siddhi Vinayak Charitable Trust, Nashik (Reg. No. E/1341). Transparent social welfare, education kits, medical relief, and elder care."
        canonicalPath="/"
      />
      <div className="w-full max-w-full overflow-x-hidden pb-16 sm:pb-20">
      {/* 1. HERO SECTION & WELCOME SEVA HUB - Full-Bleed 100vh Hero Background Video */}
     <section className="relative w-full h-screen min-h-[100dvh] min-h-[640px] flex items-center justify-center overflow-hidden bg-stone-950">
  <video
    className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
    autoPlay
    muted
    loop
    playsInline
    preload="metadata"
  >
    <source
      src="/assets/aistudio/gemini_generated_video_8fc7097b.mp4"
      type="video/mp4"
    />
  </video>
        {/* Multi-tier Ambient Darkening & Contrast Overlay Layers */}
        <div className="absolute inset-0 bg-stone-950/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/90 via-stone-950/55 to-stone-950/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-stone-950/40" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pt-28 sm:pt-32 pb-16 flex items-center">
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl text-white"
          >
            <div className="inline-flex items-center gap-2 mb-4 sm:mb-5 px-3.5 py-1.5 rounded-full bg-black/40 border border-white/20 backdrop-blur-md text-xs sm:text-sm">
              <MapPin className="w-3.5 h-3.5 text-amber-300" />
              <span className="font-medium text-stone-200">Nashik, Maharashtra</span>
              <span className="text-stone-500">•</span>
              <span className="text-amber-400 font-semibold">{t.academicNotice}</span>
            </div>

           <h1 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-serif font-bold leading-tight tracking-tight text-amber-400">
  {language === "mr" ? (
    <>
      सेवा, विश्वास आणि
      <span className="block text-amber-400">
        समाजासाठी योगदान
      </span>
    </>
  ) : language === "hi" ? (
    <>
      सेवा, विश्वास और
      <span className="block text-amber-400">
        समाज के लिए समर्पण
      </span>
    </>
  ) : (
    <>
      Service, Trust and
      <span className="block text-amber-400">
        Community Upliftment
      </span>
    </>
  )}
</h1>

            <p className="mt-4 sm:mt-5 max-w-xl text-sm sm:text-base lg:text-lg text-stone-100/90 leading-relaxed font-sans">
              <span className="font-semibold block text-white/95">{t.trustName}</span>
              <span className="text-stone-200/85 block mt-1">{t.hero.welcomeSubtitle}</span>
            </p>

            <div className="mt-5 sm:mt-8 flex flex-wrap gap-2.5 sm:gap-3.5">
              <Link to="/donate">
                <Button
                  size="md"
                  className="bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold border-0 shadow-md px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm h-9 sm:h-10 cursor-pointer"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                >
                  {t.ctaDonate}
                </Button>
              </Link>

              <Link to="/causes">
                <Button
                  size="md"
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm px-3.5 sm:px-5 py-2 sm:py-2.5 font-medium text-xs sm:text-sm h-9 sm:h-10 cursor-pointer"
                >
                  {tr("उपक्रम पहा", "अभियान देखें", "Explore Trust Causes")}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Bottom Scroll Cue */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 hidden sm:flex flex-col items-center gap-1 text-stone-400 text-[11px] tracking-wider uppercase font-medium pointer-events-none">
          <span>{tr("खाली स्क्रोल करा", "नीचे स्क्रॉल करें", "Scroll to explore")}</span>
          <ChevronDown className="w-4 h-4 animate-bounce text-amber-300" />
        </div>
      </section>

      {/* Main Page Content Body with Proportional Vertical Spacing */}
      <div className="space-y-12 sm:space-y-16 md:space-y-20 mt-8 sm:mt-12">
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
                {tr("पुन्हा प्रयत्न करा", "पुनः प्रयास करें", "Retry Connection")}
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
                  {tr("पडताळणीयोग्य सेवा कार्य", "सत्यापित सेवा कार्य", "Verifiable Operational Footprint")}
                </span>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 mt-1">
                  {`${trustProfile?.shortName || "Siddhivinayak Trust"} - ${tr(
                    "सामाजिक प्रभाव (थेट डेटाबेस आकडेवारी)",
                    "सामाजिक प्रभाव (सीधे डेटाबेस आंकड़े)",
                    "Cumulative Verified Footprint"
                  )}`}
                </h2>
              </div>
              <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{tr("थेट डेटाबेस नोंदवही", "लाइव डेटाबेस लेजर", "Live MongoDB Ledger")}</span>
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
                      <span>{tr("सक्रिय मदत उपक्रम", "सक्रिय सेवा अभियान", "Active Appeals")}</span>
                      <Heart className="w-3.5 h-3.5 text-rose-600" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-serif font-bold text-[#14532d] mt-1.5">
                      <AnimatedCounter value={stats?.activeCausesCount ?? 0} />
                    </div>
                    <div className="text-xs text-stone-600 mt-1">
                      {tr(
                        "सध्या सुरू असलेले थेट मदत प्रकल्प",
                        "वर्तमान में संचालित सेवा अभियान",
                        "Ongoing community relief campaigns"
                      )}
                    </div>
                  </div>

                  {/* Stat 2: Verified Contributions */}
                  <div className="p-4 rounded border border-stone-200/80 bg-stone-50/50 hover:border-stone-300 transition-colors">
                    <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider flex items-center justify-between">
                      <span>{tr("नोंदणीकृत देणग्या", "पंजीकृत दान", "Verified Contributions")}</span>
                      <Receipt className="w-3.5 h-3.5 text-emerald-700" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-serif font-bold text-[#14532d] mt-1.5">
                      <AnimatedCounter value={stats?.successfulDonationsCount ?? 0} />
                    </div>
                    <div className="text-xs text-stone-600 mt-1">
                      {tr(
                        "अधिकृत पावतीसह सत्यापित देणगी नोंदी",
                        "अधिकृत रसीद सहित सत्यापित दान रिकॉर्ड",
                        "Receipted & digitally audited donations"
                      )}
                    </div>
                  </div>

                  {/* Stat 3: Upcoming Seva Drives */}
                  <div className="p-4 rounded border border-stone-200/80 bg-stone-50/50 hover:border-stone-300 transition-colors">
                    <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider flex items-center justify-between">
                      <span>{tr("आगामी सेवा कार्यक्रम", "आगामी सेवा कार्यक्रम", "Upcoming Seva Drives")}</span>
                      <Calendar className="w-3.5 h-3.5 text-amber-700" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-serif font-bold text-[#14532d] mt-1.5">
                      <AnimatedCounter value={stats?.upcomingEventsCount ?? 0} />
                    </div>
                    <div className="text-xs text-stone-600 mt-1">
                      {tr(
                        "आरोग्य शिबिरे व क्षेत्रीय उपक्रम",
                        "स्वास्थ्य शिविर एवं क्षेत्रीय अभियान",
                        "Scheduled health camps & field drives"
                      )}
                    </div>
                  </div>

                  {/* Stat 4: Statutory Audit Reports */}
                  <div className="p-4 rounded border border-stone-200/80 bg-stone-50/50 hover:border-stone-300 transition-colors">
                    <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider flex items-center justify-between">
                      <span>{tr("ऑडिट व ताळेबंद अहवाल", "ऑडिट एवं वित्तीय विवरण", "Audit Dockets Filed")}</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-800" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-serif font-bold text-emerald-800 mt-1.5">
                      <AnimatedCounter value={stats?.publishedAuditsCount ?? 0} />
                    </div>
                    <div className="text-xs text-stone-600 mt-1">
                      {tr(
                        "सार्वजनिकरित्या उपलब्ध सीए ऑडिट अहवाल",
                        "सार्वजनिक रूप से उपलब्ध सीए ऑडिट रिपोर्ट",
                        "Publicly accessible statutory reports"
                      )}
                    </div>
                  </div>
                </div>

                {/* Secondary Verified Metrics Ribbon */}
                <div className="mt-6 pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-4 text-xs text-stone-600">
                  <div className="flex items-center gap-2">
                    <Users2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>
                      <strong className="text-stone-900 font-semibold">{stats?.approvedVolunteersCount ?? 0}</strong>{" "}
                      {tr("नोंदणीकृत स्वयंसेवक", "पंजीकृत स्वयंसेवक", "Enrolled Seva Volunteers")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>
                      <strong className="text-stone-900 font-semibold">{stats?.galleryItemsCount ?? 0}</strong>{" "}
                      {tr("क्षेत्रीय छायाचित्रे व पुरावे", "जमीनी तस्वीरें एवं प्रमाण", "Field Verification Photos")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>
                      <strong className="text-stone-900 font-semibold">{stats?.publishedBlogCount ?? 0}</strong>{" "}
                      {tr("प्रकाशित सेवा वृत्त", "प्रकाशित सेवा समाचार", "Published Field Dispatches")}
                    </span>
                  </div>
                  <Link
                    to="/transparency"
                    className="text-[#14532d] font-semibold hover:underline flex items-center gap-1 ml-auto"
                  >
                    <span>{tr("पारदर्शकता पोर्टल पहा", "पारदर्शिता पोर्टल देखें", "Audit & Transparency Portal")}</span>
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
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-xs font-semibold tracking-wider uppercase text-[#14532d] bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-700/20">
              {t.academicNotice}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-stone-900 mt-2 tracking-tight">
              {t.whyTrustTitle}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-2 max-w-xl mx-auto leading-relaxed">
              {t.whyTrustSubtitle}
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
                  <span>{trustProfile?.registrationDetails?.registrationNumber || "Reg. No. E/1341"}</span>
                </span>
                <Link to="/impact-passport" className="text-[#14532d] font-semibold hover:underline flex items-center gap-1">
                  <span>{t.openPassport}</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </motion.div>

            {/* Card 2: Field Verified Vouchers */}
            <motion.div
              whileHover={!shouldReduceMotion ? { y: -4 } : undefined}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-md border border-stone-200 p-6 shadow-2xs hover:border-stone-400 hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-700/20">
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
                <span className="text-[11px] text-stone-500">Independent Chartered Audits</span>
                <Link to="/transparency" className="text-[#14532d] font-semibold hover:underline flex items-center gap-1">
                  <span>Transparency</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </motion.div>

            {/* Card 3: Community Led Seva */}
            <motion.div
              whileHover={!shouldReduceMotion ? { y: -4 } : undefined}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-md border border-stone-200 p-6 shadow-2xs hover:border-stone-400 hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded bg-stone-100 text-stone-800 flex items-center justify-center border border-stone-300">
                  <Users2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-serif font-bold text-stone-900">
                  {t.trustPoint3Title}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {t.trustPoint3Desc}
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                <span className="text-[11px] text-stone-500">Nashik Civic Governance</span>
                <Link to="/volunteer" className="text-[#14532d] font-semibold hover:underline flex items-center gap-1">
                  <span>Volunteer</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 4. ACTIVE SOCIAL CAMPAIGNS & APPEALS */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 border-b border-stone-200 pb-4">
            <div>
              <span className="text-xs font-semibold tracking-wider uppercase text-[#14532d] bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-700/20">
                {t.causes.title}
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-2 tracking-tight">
                {t.causes.title}
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-xl">
                {t.causes.subtitle}
              </p>
            </div>
            <Link to="/causes">
              <Button
                variant="outline"
                size="sm"
                className="text-xs text-emerald-800 border-emerald-800/30 hover:bg-emerald-50 inline-flex items-center gap-1 shrink-0 h-8 sm:h-9 px-3"
              >
                <span>{tr("सर्व उपक्रम पहा", "सभी अभियान देखें", "Explore Trust Causes")}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-2 text-stone-500">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-700" />
              <p className="text-xs">Loading registered causes...</p>
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
                {tr("सध्या कोणतेही सक्रिय उपक्रम उपलब्ध नाहीत", "वर्तमान में कोई सक्रिय अभियान सूचीबद्ध नहीं है", "No Active Campaigns Currently Listed")}
              </h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                {tr(
                  "नवीन समाजोपयोगी उपक्रमांची आखणी सुरू आहे. लवकरच नवीन उपक्रम नोंदवले जातील.",
                  "नए सेवा अभियानों की योजना जारी है। शीघ्र ही नए अभियान प्रकाशित किए जाएंगे।",
                  "All existing campaigns have reached completion. New field initiatives will appear once approved by the trust."
                )}
              </p>
              <div className="pt-2">
                <Link to="/donate">
                  <Button size="sm" variant="primary" className="text-xs">
                    {tr("सर्वसाधारण निधीला देणगी द्या", "सामान्य कोष में दान करें", "Donate to General Trust Corpus")}
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* 5. IMPACT PASSPORT SPOTLIGHT */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-[#112a1d] to-[#0a1e14] text-white rounded-2xl p-6 sm:p-10 border border-emerald-900 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-300 bg-amber-950/80 px-2.5 py-0.5 rounded border border-amber-800">
                  {tr("पारदर्शक व्यवस्था", "पारदर्शी व्यवस्था", "Transparent Accountability")}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-300 font-medium bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  {tr("४-टप्प्यांची नोंदवही", "४-चरणीय लेजर", "4-Stage Ledger Pipeline")}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
                {tr("डिजिटल इम्पॅक्ट पासपोर्ट", "डिजिटल इम्पैक्ट पासपोर्ट", "Digital Impact Passport")}
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                {tr(
                  "प्रत्येक अधिकृत देणगी थेट मंजूर सेवा उपक्रमाशी जोडली जाते: १. देणगी पावती २. मोहीम वाटप ३. कागदपत्रे व तपासणी ४. प्रत्यक्ष समाजोपयोगी काम.",
                  "प्रत्येक सत्यापित दान सीधे स्वीकृत सेवा अभियान से जुड़ता है: १. दान रसीद २. अभियान आवंटन ३. दस्तावेज व सत्यापन ४. प्रत्यक्ष प्रभाव।",
                  "Every contribution receives an official Trust receipt and auditable lifecycle tracking across four verified stages: 1. Donation received, 2. Campaign allocation, 3. Verification and supporting evidence, 4. Field impact and completed milestones."
                )}
              </p>
            </div>
            <div className="shrink-0">
              <Link to="/impact-passport">
                <Button
                  size="md"
                  variant="primary"
                  className="bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs sm:text-sm shadow-md"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  {tr("पासपोर्ट नोंदवही पहा", "पासपोर्ट लेजर देखें", "View Impact Passport Ledger")}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* 6. DOCUMENTED HUMAN IMPACT STORY (STORY SECTION) */}
        <HumanImpactStory />

        {/* 7. OUR WORK PROGRAMS */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 border-b border-stone-200 pb-4">
            <div>
              <span className="text-xs font-semibold tracking-wider uppercase text-[#14532d] bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-700/20">
                {tr("प्रमुख सेवा प्रकल्प", "प्रमुख सेवा प्रकल्प", "Key Programs")}
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
                className="text-xs text-emerald-800 border-emerald-800/30 hover:bg-emerald-50 inline-flex items-center gap-1 shrink-0"
              >
                <span>{tr("सर्व प्रकल्प पहा", "सभी प्रकल्प देखें", "View All Programs")}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {workPrograms.map((prog) => {
              const IconComp = prog.icon;
              return (
                <div
                  key={prog.id}
                  className="bg-white rounded-lg border border-stone-200 overflow-hidden shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="aspect-16/10 overflow-hidden bg-stone-100 relative">
                      <img
                        src={prog.image}
                        alt={prog.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-300"
                      />
                      <span className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                        {prog.category}
                      </span>
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="w-8 h-8 rounded bg-emerald-50 text-[#14532d] flex items-center justify-center border border-emerald-100">
                        <IconComp className="w-4 h-4" />
                      </div>
                      <h3 className="font-serif font-bold text-stone-900 text-sm leading-snug">
                        {prog.title}
                      </h3>
                      <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">
                        {prog.desc}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <Link
                      to={prog.link}
                      className="text-xs font-semibold text-[#14532d] hover:underline flex items-center gap-1 pt-3 border-t border-stone-100"
                    >
                      <span>{tr("उपक्रम पहा", "अभियान देखें", "Explore Initiatives")}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
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
                <span>{tr("आगामी कार्यक्रम", "आगामी कार्यक्रम", "Field Mobilization")}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
                {tr("आगामी सेवा शिबिरे व कार्यक्रम", "आगामी सेवा शिविर एवं कार्यक्रम", "Upcoming Seva Drives & Field Camps")}
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
                {tr(
                  "आमच्या वैद्यकीय तपासणी, रक्तदान व वृक्षारोपण शिबिरांमध्ये थेट सहभागी व्हा.",
                  "हमारे स्वास्थ्य परीक्षण, रक्तदान एवं पौधारोपण शिविरों में भाग लें।",
                  "Join our healthcare diagnostic camps, distribution drives, and community outreach on the ground."
                )}
              </p>
            </div>
            <Link to="/events">
              <Button
                variant="outline"
                size="sm"
                className="text-xs text-emerald-800 border-emerald-800/30 hover:bg-emerald-50 inline-flex items-center gap-1 shrink-0"
              >
                <span>{tr("सर्व कार्यक्रम पहा", "सभी कार्यक्रम देखें", "View All Events")}</span>
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
                {tr("सध्या कोणतेही आगामी कार्यक्रम नियोजित नाहीत", "वर्तमान में कोई आगामी कार्यक्रम निर्धारित नहीं है", "No Upcoming Events Currently Scheduled")}
              </p>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                {tr(
                  "नवीन सेवा शिबिरे लवकरच जाहीर केली जातील. स्वयंसेवक म्हणून सहभागी होण्यासाठी नोंदणी करा.",
                  "नए स्वास्थ्य एवं वितरण शिविर शीघ्र घोषित किए जाएंगे। स्वयंसेवक के रूप में पंजीकरण करें।",
                  "New health diagnostic and distribution camps are scheduled bi-weekly. Register as a volunteer to receive immediate notifications."
                )}
              </p>
              <div className="pt-2">
                <Link to="/volunteer">
                  <Button size="sm" variant="outline" className="text-xs">
                    {tr("स्वयंसेवक म्हणून नोंदणी करा", "स्वयंसेवक के रूप में पंजीकरण करें", "Register as Seva Volunteer")}
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
                            "/activities/image.png";
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
                      <span>{tr("तपशील पहा", "विवरण देखें", "Event Details")}</span>
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
                  {tr("पारदर्शकता व ऑडिट", "पारदर्शिता एवं ऑडिट", "Statutory Transparency")}
                </span>
                <h3 className="text-xl font-serif font-bold text-stone-900 mt-1.5">
                  {tr("अलीकडील सीए ऑडिट व ताळेबंद अहवाल", "हालिया सीए ऑडिट एवं वित्तीय विवरण", "Recent Trust Field Verifications & Audits")}
                </h3>
              </div>
              <Link
                to="/transparency"
                className="text-xs text-[#14532d] font-semibold hover:underline flex items-center gap-1"
              >
                <span>{tr("सर्व अहवाल पहा", "सभी रिपोर्ट देखें", "View Transparency Portal")}</span>
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
                  {tr("ऑडिट अहवाल अद्ययावत केले जात आहेत", "ऑडिट रिपोर्ट अद्यतन की जा रही हैं", "No Published Audit Dockets Found")}
                </p>
                <p>
                  {tr(
                    "विश्वस्त मंडळाने मंजूर केलेले वार्षिक लेखाजोखा अहवाल पारदर्शकता दालनात उपलब्ध आहेत.",
                    "ट्रस्टी बोर्ड द्वारा स्वीकृत वार्षिक वित्तीय रिपोर्ट पारदर्शिता पोर्टल में उपलब्ध हैं।",
                    "Annual financial statements, statutory balance sheets, and utilization records are published in the Transparency Portal."
                  )}
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
                  <span>{tr("क्षेत्रीय छायाचित्र दालन", "जमीनी फोटो गैलरी", "Visual Proofs Ledger")}</span>
                </div>
                <h3 className="text-xl font-serif font-bold text-stone-900 mt-1">
                  {tr("थेट सेवा छायाचित्रे", "प्रत्यक्ष सेवा तस्वीरें", "Field Action Photo Gallery")}
                </h3>
              </div>
              <Link
                to="/gallery"
                className="text-xs text-[#14532d] font-semibold hover:underline flex items-center gap-1"
              >
                <span>{tr("पूर्ण दालन पहा", "पूरी गैलरी देखें", "Explore Gallery")}</span>
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
                    src={item.imageUrl || item.url}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end text-white">
                    <p className="text-[11px] font-medium leading-tight line-clamp-2">
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
                <span>{tr("सर्व वृत्त पहा", "सभी समाचार देखें", "View All Stories")}</span>
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
                            "/activities/image.png";
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
    </div>
  </>
);
};
