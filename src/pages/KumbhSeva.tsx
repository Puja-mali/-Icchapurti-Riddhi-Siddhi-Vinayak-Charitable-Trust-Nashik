import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  Flame,
  Droplets,
  Utensils,
  Heart,
  ShieldCheck,
  Calendar,
  MapPin,
  Users,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Info,
  Clock,
  Phone,
  Loader2,
  AlertCircle,
  RefreshCw,
  Camera,
  Newspaper,
  BookOpen,
} from "lucide-react";
import { Button } from "@/src/components/common/Button";
import { Modal } from "@/src/components/common/Modal";
import { CauseCard } from "@/src/components/causes/CauseCard";
import { useKumbhMode } from "@/src/context/KumbhModeContext";
import { useLanguage } from "@/src/context/LanguageContext";
import { Cause, EventItem, VolunteerRole, BlogPost, GalleryItem } from "@/src/types";
import { publicService, PublicKumbhData } from "@/src/services/publicService";
import { volunteerService } from "@/src/services/volunteerService";

export const KumbhSeva: React.FC = () => {
  const { t, language } = useLanguage();
  const { isKumbhMode } = useKumbhMode();

  // Unified public Kumbh data from GET /api/public/kumbh
  const [kumbhData, setKumbhData] = useState<PublicKumbhData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Volunteer Modal State
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [volunteerName, setVolunteerName] = useState("");
  const [volunteerPhone, setVolunteerPhone] = useState("");
  const [volunteerEmail, setVolunteerEmail] = useState("");
  const [volunteerCity, setVolunteerCity] = useState("Nashik");
  const [preferredSevaArea, setPreferredSevaArea] = useState("Ghat Hygiene & Cleanliness");
  const [availability, setAvailability] = useState("Peak Shahi Snan Dates");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>(["Crowd & Queue Management"]);
  const [submittedRefNumber, setSubmittedRefNumber] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState(false);
  const [isSubmittingVolunteer, setIsSubmittingVolunteer] = useState(false);
  const [volunteerError, setVolunteerError] = useState<string | null>(null);

  const fetchKumbhData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await publicService.getKumbhData();
      setKumbhData(data);
    } catch (err: any) {
      console.error("Failed to load Kumbh public records:", err);
      setLoadError(
        err?.message ||
          (language === "mr"
            ? "कुंभ सेवेची माहिती मिळवण्यात अडचण आली. कृपया इंटरनेट कनेक्शन तपासा आणि पुन्हा प्रयत्न करा."
            : "Failed to retrieve public Simhastha Kumbh records from server.")
      );
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  useEffect(() => {
    fetchKumbhData();
  }, [fetchKumbhData]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleVolunteerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmittingVolunteer(true);
      setVolunteerError(null);
      const app = await volunteerService.applyForVolunteerRole({
        roleTitle: selectedRole || "Kumbh Sevadar",
        fullName: volunteerName,
        phone: volunteerPhone,
        email: volunteerEmail.trim() || `volunteer_${volunteerPhone.replace(/\D/g, "") || "kumbh"}@volunteer.local`,
        city: volunteerCity,
        preferredSevaArea,
        availability,
        emergencyContact,
        skills: selectedSkills,
        motivation: "Simhastha Kumbh Seva 2027 Registration",
        isKumbhRelated: true,
      });

      const refNo = app?.referenceNumber || `KMB-2027-${Math.floor(100000 + Math.random() * 900000)}`;
      setSubmittedRefNumber(refNo);
      setRegSuccess(true);
    } catch (err: any) {
      setVolunteerError(err?.message || "Failed to submit registration. Please try again.");
    } finally {
      setIsSubmittingVolunteer(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedRole(null);
    setRegSuccess(false);
    setSubmittedRefNumber(null);
    setVolunteerName("");
    setVolunteerPhone("");
    setVolunteerEmail("");
    setEmergencyContact("");
    setVolunteerError(null);
  };

  // Top-level Loading State
  if (isLoading) {
    return (
      <div className="min-h-[55vh] flex flex-col items-center justify-center gap-3 text-stone-600 px-4 py-24">
        <Loader2 className="w-8 h-8 animate-spin text-[#14532d]" />
        <p className="text-sm font-medium text-stone-700">{t.kumbh.loadingText}</p>
      </div>
    );
  }

  // Top-level Error State with Retry Button
  if (loadError) {
    return (
      <div className="max-w-lg mx-auto my-20 p-8 bg-white border border-rose-200 rounded-2xl shadow-xs text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center mx-auto border border-rose-200">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-serif font-bold text-stone-900">
            {t.kumbh.loadErrorTitle}
          </h2>
          <p className="text-xs text-stone-600 leading-relaxed max-w-sm mx-auto">
            {loadError}
          </p>
        </div>
        <div className="pt-2">
          <Button
            onClick={fetchKumbhData}
            size="sm"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            className="bg-[#14532d] hover:bg-[#0f4023] text-white"
          >
            {t.kumbh.retryBtn}
          </Button>
        </div>
      </div>
    );
  }

  // Check feature flag: respected from database API response (or active context)
  const isFeatureActive = kumbhData?.featureEnabled ?? isKumbhMode;

  if (!isFeatureActive) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto border border-stone-200">
          <Flame className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-800">
          {t.kumbh.disabledTitle}
        </h1>
        <p className="text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
          {t.kumbh.disabledDesc}
        </p>
        <div className="pt-2">
          <Link to="/">
            <Button variant="outline" size="md">
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const campaigns: Cause[] = kumbhData?.campaigns || [];
  const events: EventItem[] = kumbhData?.events || [];
  const roles: VolunteerRole[] = kumbhData?.volunteerOpportunities || [];
  const announcements: BlogPost[] = kumbhData?.announcements || [];
  const gallery: GalleryItem[] = kumbhData?.gallery || [];

  return (
    <div className="space-y-16 pb-20">
      {/* 1. Planning Notice & Hero Banner */}
      <section className="relative bg-[#14532d] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 relative z-10 space-y-8">
          {/* Preparatory Phase Notice */}
          <div className="bg-[#0f4023]/80 backdrop-blur-xs border border-emerald-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-amber-200 uppercase tracking-wide">
                    {t.kumbh.preparatoryNoticeTitle}
                  </span>
                </div>
                <p className="text-xs text-emerald-100/90 leading-relaxed mt-0.5 max-w-3xl">
                  {t.kumbh.preparatoryNoticeDesc}
                </p>
              </div>
            </div>
            <a
              href="#volunteer-section"
              className="shrink-0 text-xs font-semibold text-white bg-amber-600/90 hover:bg-amber-600 px-3.5 py-1.5 rounded-md transition-colors"
            >
              {t.kumbh.volunteerCall}
            </a>
          </div>

          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 border border-emerald-600/50 text-xs text-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{t.kumbh.heroSubtitle}</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight leading-tight">
              {t.kumbh.title}
            </h1>
            <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed">
              {t.kumbh.subtitle}
            </p>
          </div>

          {/* Planning Phase Infrastructure Targets */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            <div className="bg-emerald-900/40 border border-emerald-700/40 rounded-xl p-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold font-serif text-amber-200">25,000+</span>
              </div>
              <div className="text-xs font-semibold text-white">{t.kumbh.metricsMeals}</div>
              <div className="text-[11px] text-emerald-300/80">{t.kumbh.metricsMealsSub}</div>
            </div>

            <div className="bg-emerald-900/40 border border-emerald-700/40 rounded-xl p-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold font-serif text-amber-200">50+</span>
              </div>
              <div className="text-xs font-semibold text-white">{t.kumbh.metricsWater}</div>
              <div className="text-[11px] text-emerald-300/80">{t.kumbh.metricsWaterSub}</div>
            </div>

            <div className="bg-emerald-900/40 border border-emerald-700/40 rounded-xl p-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold font-serif text-amber-200">1,200+</span>
              </div>
              <div className="text-xs font-semibold text-white">{t.kumbh.metricsVolunteers}</div>
              <div className="text-[11px] text-emerald-300/80">{t.kumbh.metricsVolunteersSub}</div>
            </div>

            <div className="bg-emerald-900/40 border border-emerald-700/40 rounded-xl p-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold font-serif text-amber-200">24/7</span>
              </div>
              <div className="text-xs font-semibold text-white">{t.kumbh.metricsMedical}</div>
              <div className="text-[11px] text-emerald-300/80">{t.kumbh.metricsMedicalSub}</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Core Seva Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            {t.kumbh.pillarsTitle}
          </h2>
          <p className="text-xs sm:text-sm text-stone-600">
            {t.kumbh.pillarsSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-stone-200/90 shadow-xs hover:border-emerald-700/40 hover:shadow-md transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center border border-cyan-200">
              <Droplets className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-base text-stone-900">
              {t.kumbh.pillarGhatTitle}
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              {t.kumbh.pillarGhatDesc}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200/90 shadow-xs hover:border-amber-700/40 hover:shadow-md transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
              <Utensils className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-base text-stone-900">
              {t.kumbh.pillarAnnachhatraTitle}
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              {t.kumbh.pillarAnnachhatraDesc}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200/90 shadow-xs hover:border-rose-700/40 hover:shadow-md transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-200">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-base text-stone-900">
              {t.kumbh.pillarMedicalTitle}
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              {t.kumbh.pillarMedicalDesc}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200/90 shadow-xs hover:border-emerald-700/40 hover:shadow-md transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-base text-stone-900">
              {t.kumbh.pillarLostFoundTitle}
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              {t.kumbh.pillarLostFoundDesc}
            </p>
          </div>
        </div>
      </section>

      {/* 3. Active Kumbh Campaigns */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
              {t.kumbh.campaignsTag}
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-1">
              {t.kumbh.campaignsTitle}
            </h2>
          </div>
          <Link to="/causes">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              {t.kumbh.viewAllCauses}
            </Button>
          </Link>
        </div>

        {campaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {campaigns.map((cause) => (
              <CauseCard key={cause.id || cause._id} cause={cause} />
            ))}
          </div>
        ) : (
          <div className="py-12 px-4 bg-stone-50 rounded-xl border border-stone-200 text-center space-y-2">
            <Info className="w-6 h-6 text-stone-400 mx-auto" />
            <p className="text-xs text-stone-600 max-w-sm mx-auto">
              {t.kumbh.emptyCampaigns}
            </p>
          </div>
        )}
      </section>

      {/* 4. Volunteer Roles in Kumbh Seva */}
      <section id="volunteer-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="bg-[#fcfaf7] p-6 sm:p-10 rounded-2xl border border-stone-200 space-y-8">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-semibold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded border border-amber-300/40">
              {t.kumbh.volunteerBadge}
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
              {t.kumbh.volunteerTitle}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              {t.kumbh.volunteerSubtitle}
            </p>
          </div>

          {roles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {roles.map((role) => (
                <div
                  key={role.id || role._id}
                  className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {role.department}
                      </span>
                      <span className="text-xs text-stone-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-stone-400" />
                        {role.commitment}
                      </span>
                    </div>

                    <h3 className="text-base font-serif font-bold text-stone-900">
                      {role.title}
                    </h3>

                    <p className="text-xs text-stone-600 leading-relaxed">
                      {role.description}
                    </p>

                    {Array.isArray(role.requirements) && role.requirements.length > 0 && (
                      <div className="text-[11px] text-stone-500 pt-1 space-y-1">
                        <div className="font-semibold text-stone-700">{t.kumbh.requirementsLabel}</div>
                        <ul className="list-disc list-inside space-y-0.5">
                          {role.requirements.map((req, i) => (
                            <li key={i}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-xs text-emerald-800 font-semibold">
                      {role.spotsAvailable} {t.kumbh.openSlots}
                    </span>
                    <Button
                      size="sm"
                      className="bg-[#14532d] hover:bg-[#0f4023] text-white text-xs px-4"
                      onClick={() => setSelectedRole(role.title)}
                    >
                      {t.kumbh.applyForRole}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 px-4 bg-white rounded-xl border border-stone-200 text-center space-y-2">
              <Users className="w-6 h-6 text-stone-400 mx-auto" />
              <p className="text-xs text-stone-600 max-w-sm mx-auto">
                {t.kumbh.emptyRoles}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 5. Preparatory Events Schedule */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="border-b border-stone-200 pb-4">
          <h2 className="text-2xl font-serif font-bold text-stone-900">
            {t.kumbh.eventsTitle}
          </h2>
          <p className="text-xs sm:text-sm text-stone-600">
            {t.kumbh.eventsSubtitle}
          </p>
        </div>

        {events.length === 0 ? (
          <div className="py-12 text-center bg-white rounded-xl border border-stone-200 p-8 space-y-2 max-w-lg mx-auto">
            <Calendar className="w-8 h-8 text-stone-300 mx-auto" />
            <h3 className="font-serif font-bold text-stone-800 text-base">
              {t.kumbh.emptyEvents}
            </h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((event) => (
              <div
                key={event.id || event._id}
                className="bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-xs hover:shadow-md hover:border-emerald-700/40 transition-all flex flex-col sm:flex-row"
              >
                {event.imageUrl && (
                  <div className="sm:w-2/5 aspect-16/10 sm:aspect-auto">
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
                <div className="p-5 sm:w-3/5 space-y-2 flex flex-col justify-between flex-1">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-amber-800 font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-amber-600" />
                      <span>{event.date || event.startDate} {event.time ? `• ${event.time}` : ""}</span>
                    </div>
                    <Link to={`/events/${event.slug || event.id || event._id}`} className="block group">
                      <h3 className="font-serif font-bold text-base text-stone-900 leading-snug group-hover:text-[#14532d] transition-colors">
                        {event.title}
                      </h3>
                    </Link>
                    <div className="text-xs text-stone-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                      <span>{event.location}</span>
                    </div>
                    <p className="text-xs text-stone-600 line-clamp-2">
                      {event.shortDescription || event.description}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs">
                    <span className="text-stone-500">
                      {event.registeredCount || event.registrationCount || 0} / {event.capacity || event.registrationLimit || "Open"} {t.kumbh.registeredCount}
                    </span>
                    <Link to={`/events/${event.slug || event.id || event._id}`}>
                      <Button size="sm" variant="outline" className="text-xs px-3 h-8 rounded-xl">
                        {t.kumbh.eventDetails}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 6. Kumbh Announcements / Field Dispatches */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
              {t.kumbh.announcementsBadge}
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-1">
              {t.kumbh.announcementsTitle}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              {t.kumbh.announcementsSubtitle}
            </p>
          </div>
          <Link to="/blog">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              {t.kumbh.viewAllNews}
            </Button>
          </Link>
        </div>

        {announcements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {announcements.map((post) => (
              <article
                key={post.id || post._id}
                className="bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-xs hover:shadow-md hover:border-emerald-700/40 transition-all flex flex-col justify-between"
              >
                <div>
                  {post.coverImage && (
                    <div className="aspect-16/9 overflow-hidden bg-stone-100">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                  <div className="p-5 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-stone-500">
                      <span className="font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        {post.category || "Kumbh Seva"}
                      </span>
                      <span>•</span>
                      <span>{post.publishedAt || post.date}</span>
                    </div>

                    <Link to={`/blog/${post.slug || post.id || post._id}`} className="block group">
                      <h3 className="font-serif font-bold text-base text-stone-900 group-hover:text-[#14532d] transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                    </Link>

                    <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-stone-100 mt-3 flex items-center justify-between">
                  <span className="text-xs text-stone-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-stone-400" />
                    {post.readTime}
                  </span>
                  <Link to={`/blog/${post.slug || post.id || post._id}`}>
                    <span className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1">
                      {t.kumbh.readMore} <ArrowRight className="w-3 h-3" />
                    </span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="py-12 px-4 bg-stone-50 rounded-2xl border border-stone-200 text-center space-y-2">
            <Newspaper className="w-6 h-6 text-stone-400 mx-auto" />
            <p className="text-xs text-stone-600 max-w-sm mx-auto">
              {t.kumbh.emptyAnnouncements}
            </p>
          </div>
        )}
      </section>

      {/* 7. Ground Archives & Survey Gallery */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
              {t.kumbh.galleryBadge}
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-1">
              {t.kumbh.galleryTitle}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              {t.kumbh.gallerySubtitle}
            </p>
          </div>
          <Link to="/gallery">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              {t.kumbh.viewFullGallery}
            </Button>
          </Link>
        </div>

        {gallery.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {gallery.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-xs hover:shadow-md hover:border-emerald-700/40 transition-all group"
              >
                <div className="aspect-16/10 overflow-hidden bg-stone-100">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-4 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-stone-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-stone-400" />
                      {item.location || "Nashik"}
                    </span>
                    {item.date && <span>{item.date}</span>}
                  </div>
                  <h3 className="font-serif font-bold text-sm text-stone-900 line-clamp-1">
                    {item.title}
                  </h3>
                  {item.caption && (
                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                      {item.caption}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 px-4 bg-stone-50 rounded-xl border border-stone-200 text-center space-y-2">
            <Camera className="w-6 h-6 text-stone-400 mx-auto" />
            <p className="text-xs text-stone-600 max-w-sm mx-auto">
              {t.kumbh.emptyGallery}
            </p>
          </div>
        )}
      </section>

      {/* 8. Volunteer Application Modal */}
      <Modal
        isOpen={!!selectedRole}
        onClose={handleCloseModal}
        title={regSuccess ? t.kumbh.modalSuccessTitle : `${t.kumbh.modalApplyTitle} ${selectedRole || ""}`}
      >
        {regSuccess ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-300">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                {t.kumbh.regSuccessBadge}
              </span>
              <h3 className="font-serif font-bold text-xl text-stone-900">
                {t.kumbh.modalSuccessTitle}
              </h3>
            </div>

            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-left space-y-2.5 max-w-sm mx-auto text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-stone-200">
                <span className="text-stone-500">{t.kumbh.regRefLabel}</span>
                <span className="font-mono font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded border border-emerald-300">
                  {submittedRefNumber}
                </span>
              </div>
              <div className="flex justify-between text-stone-700">
                <span className="text-stone-500">{t.kumbh.regApplicantLabel}</span>
                <span className="font-semibold">{volunteerName}</span>
              </div>
              <div className="flex justify-between text-stone-700">
                <span className="text-stone-500">{t.kumbh.regRoleLabel}</span>
                <span className="font-semibold">{selectedRole}</span>
              </div>
              <div className="flex justify-between text-stone-700">
                <span className="text-stone-500">{t.kumbh.regSevaAreaLabel}</span>
                <span>{preferredSevaArea}</span>
              </div>
              <div className="flex justify-between text-stone-700">
                <span className="text-stone-500">{t.kumbh.regAvailabilityLabel}</span>
                <span>{availability}</span>
              </div>
            </div>

            <p className="text-xs text-stone-600 max-w-sm mx-auto leading-relaxed">
              {t.kumbh.regSuccessNote}
            </p>

            <div className="pt-2">
              <Button
                type="button"
                onClick={handleCloseModal}
                className="bg-[#14532d] hover:bg-[#0f4023] text-white text-xs px-6"
              >
                {t.kumbh.closeReturnBtn}
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleVolunteerSubmit} className="space-y-4 text-xs sm:text-sm">
            {volunteerError && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-xs text-red-700 rounded">
                {volunteerError}
              </div>
            )}
            <div className="p-3 bg-amber-50 rounded border border-amber-200 text-xs text-amber-900">
              {t.kumbh.regRoleLabel} <strong>{selectedRole}</strong>. {t.kumbh.modalBriefingNote}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">{t.kumbh.fullNameLabel}</label>
                <input
                  type="text"
                  required
                  value={volunteerName}
                  onChange={(e) => setVolunteerName(e.target.value)}
                  placeholder={t.kumbh.fullNamePlaceholder}
                  className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">{t.kumbh.phoneLabel}</label>
                <input
                  type="tel"
                  required
                  value={volunteerPhone}
                  onChange={(e) => setVolunteerPhone(e.target.value)}
                  placeholder={t.kumbh.phonePlaceholder}
                  className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">{t.kumbh.emailLabel}</label>
                <input
                  type="email"
                  value={volunteerEmail}
                  onChange={(e) => setVolunteerEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">{t.kumbh.cityLabel}</label>
                <input
                  type="text"
                  required
                  value={volunteerCity}
                  onChange={(e) => setVolunteerCity(e.target.value)}
                  placeholder={t.kumbh.cityPlaceholder}
                  className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">{t.kumbh.sevaAreaLabel}</label>
                <select
                  value={preferredSevaArea}
                  onChange={(e) => setPreferredSevaArea(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-xs sm:text-sm"
                >
                  <option value="Ghat Hygiene & Cleanliness">{t.kumbh.areaGhatHygiene}</option>
                  <option value="Annadan & Satvik Kitchen">{t.kumbh.areaAnnadan}</option>
                  <option value="Water Booths & RO Stations">{t.kumbh.areaWater}</option>
                  <option value="Crowd Guidance & Senior Citizen Help">{t.kumbh.areaCrowdGuidance}</option>
                  <option value="First Aid & Medical Station">{t.kumbh.areaFirstAid}</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">{t.kumbh.availabilityLabel}</label>
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-xs sm:text-sm"
                >
                  <option value="Peak Shahi Snan Dates">{t.kumbh.availPeakDates}</option>
                  <option value="Full Festival Duration (Aug - Sep 2027)">{t.kumbh.availFullDuration}</option>
                  <option value="Weekends Only">{t.kumbh.availWeekends}</option>
                  <option value="Preparatory Seva (2026-2027)">{t.kumbh.availPreparatory}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">{t.kumbh.emergencyContactLabel}</label>
              <input
                type="text"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                placeholder={t.kumbh.emergencyContactPlaceholder}
                className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1.5">{t.kumbh.skillsLabel}</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { key: "Crowd & Queue Management", label: t.kumbh.skillCrowd },
                  { key: "First Aid / Medical", label: t.kumbh.skillMedical },
                  { key: "Local Languages (Marathi/Hindi)", label: t.kumbh.skillLanguages },
                  { key: "Cooking & Kitchen Service", label: t.kumbh.skillKitchen },
                  { key: "River Sanitation & Cleanup", label: t.kumbh.skillRiver },
                ].map((skill) => (
                  <label
                    key={skill.key}
                    className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                      selectedSkills.includes(skill.key)
                        ? "bg-emerald-50 border-emerald-600 text-emerald-950 font-medium"
                        : "bg-white border-stone-200 text-stone-700 hover:bg-stone-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedSkills.includes(skill.key)}
                      onChange={() => toggleSkill(skill.key)}
                      className="rounded text-emerald-700 focus:ring-emerald-600 h-3.5 w-3.5"
                    />
                    <span>{skill.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
              <Button type="button" variant="ghost" size="sm" onClick={handleCloseModal}>
                {t.kumbh.cancelBtn}
              </Button>
              <Button
                type="submit"
                size="sm"
                isLoading={isSubmittingVolunteer}
                className="bg-[#14532d] hover:bg-[#0f4023] text-white"
              >
                {isSubmittingVolunteer ? t.kumbh.submittingBtn : t.kumbh.submitRegistrationBtn}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
