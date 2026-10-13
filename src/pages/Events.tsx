import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  ArrowRight,
  Search,
  Loader2,
  AlertCircle,
  RefreshCw,
  Flame,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { EventItem } from "@/src/types";
import { eventService } from "@/src/services/eventService";
import { authService } from "@/src/services/authService";
import { Button } from "@/src/components/common/Button";
import { Modal } from "@/src/components/common/Modal";
import { PageHeader } from "@/src/components/common/PageHeader";
import { useLanguage } from "@/src/context/LanguageContext";
import { useKumbhMode } from "@/src/context/KumbhModeContext";
import { getLocalizedEvent } from "@/src/lib/localization";

export const Events: React.FC = () => {
  const { t, language } = useLanguage();
  const { isKumbhMode } = useKumbhMode();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showKumbhOnly, setShowKumbhOnly] = useState(false);

  // Registration Modal State
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [attendeeName, setAttendeeName] = useState("");
  const [attendeeEmail, setAttendeeEmail] = useState("");
  const [attendeePhone, setAttendeePhone] = useState("");
  const [ticketCount, setTicketCount] = useState(1);
  const [notes, setNotes] = useState("");
  const [registered, setRegistered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await authService.getMe();
        if (user) {
          setIsAuthenticated(true);
          setAttendeeName(user.name || "");
          setAttendeeEmail(user.email || "");
          setAttendeePhone(user.phone || "");
        }
      } catch {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (selectedCategory !== "All") params.category = selectedCategory;
      if (showKumbhOnly) params.isKumbhRelated = true;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const response = await eventService.getEvents(params);
      const rawEvents = response.events || [];
      const filtered = isKumbhMode
        ? rawEvents
        : rawEvents.filter((ev) => !ev.isKumbhRelated);
      setEvents(filtered);
    } catch (err: any) {
      console.error("Failed to load events:", err);
      setError(err?.message || "Failed to load events from the database.");
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, showKumbhOnly, searchQuery, isKumbhMode]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleRegisterClick = (event: EventItem) => {
    setSelectedEvent(event);
    setRegistered(false);
    setRegError(null);
    setTicketCount(1);
    setNotes("");
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    if (!isAuthenticated) {
      navigate(`/login?redirect=/events`);
      return;
    }

    setIsSubmitting(true);
    setRegError(null);

    try {
      const result = await eventService.registerForEvent(selectedEvent.id, {
        attendeeCount: ticketCount,
        userName: attendeeName,
        userEmail: attendeeEmail,
        userPhone: attendeePhone,
        notes,
      });

      setRegistered(true);
      setEvents((prev) =>
        prev.map((ev) => (ev.id === selectedEvent.id ? result.event : ev))
      );
      setSelectedEvent(result.event);
    } catch (err: any) {
      console.error("Registration error:", err);
      setRegError(err?.message || "Registration failed. Please check details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    "All",
    "Community Outreach",
    "Health Camp",
    "Environment",
    "Education",
    "Kumbh Seva",
  ];

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setShowKumbhOnly(false);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4efe6] text-stone-800">
      {/* Warm editorial background — visual only */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-28 h-80 w-80 rounded-full bg-amber-400/[0.09] blur-3xl" />
        <div className="absolute right-[-8rem] top-[28%] h-96 w-96 rounded-full bg-emerald-800/[0.07] blur-3xl" />
        <div className="absolute left-[42%] top-[70%] h-72 w-72 rounded-full bg-orange-700/[0.05] blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.6),transparent_72%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        {/* Page header */}
        <motion.section
          initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.12 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <PageHeader
            badge="Community Outreach & Assemblies"
            title="Trust Events & Field Drives"
            description="Participate in ground-level community events and field activities across Nashik."
          />
        </motion.section>

        {/* Visual intro strip */}
        <motion.section
          initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.12 }}
          transition={{ duration: 0.75, ease: "easeOut" }}
          className="relative overflow-hidden rounded-[2rem] border border-[#d9cfbf] bg-[#fffdf8] shadow-[0_18px_50px_rgba(70,57,38,0.08)]"
        >
          <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
            <div className="relative min-h-[245px] overflow-hidden bg-[#1b4935] sm:min-h-[310px]">
              <img
                src="/activities/Community Aid Distribution Under the Trees.png"
                alt="Community activity"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] hover:scale-[1.035]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#102b1f]/65 via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a1e15]/75 via-transparent to-transparent" />
              <div className="absolute left-5 top-5 sm:left-7 sm:top-7">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-md">
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                  Moments from the field
                </span>
              </div>
              <div className="absolute bottom-5 left-5 right-5 sm:bottom-7 sm:left-7 sm:right-7">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-300">
                  Nashik • Community
                </p>
                <h2 className="mt-2 max-w-xl font-serif text-2xl font-bold leading-tight text-white sm:text-4xl">
                  Real people. Shared moments. Community participation.
                </h2>
              </div>
            </div>

            <div className="flex items-center p-6 sm:p-8 lg:p-10">
              <div>
                <div className="flex items-center gap-2 text-emerald-800">
                  <span className="h-px w-8 bg-amber-500" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.22em]">
                    Join a programme
                  </span>
                </div>
                <p className="mt-5 font-serif text-2xl font-bold leading-tight text-[#173b2a] sm:text-3xl">
                  Discover what is happening, where it is happening, and how to participate.
                </p>
                <p className="mt-4 max-w-xl text-sm leading-6 text-stone-600">
                  Browse published events, open the details, and register when attendance is available.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {[
                    { icon: Calendar, label: "Dates" },
                    { icon: MapPin, label: "Nashik" },
                    { icon: Users, label: "Participation" },
                  ].map(({ icon: Icon, label }) => (
                    <span
                      key={label}
                      className="inline-flex items-center gap-2 rounded-full border border-[#e0d7c9] bg-[#f8f4ec] px-3 py-2 text-[11px] font-semibold text-stone-700"
                    >
                      <Icon className="h-3.5 w-3.5 text-emerald-800" />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Filter and search */}
        <motion.section
          initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="sticky top-3 z-20 rounded-[1.7rem] border border-[#ddd3c3] bg-[#fffdf8]/95 p-4 shadow-[0_14px_38px_rgba(60,52,40,0.08)] backdrop-blur-xl sm:p-5"
        >
          <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#7d766b]">
            <SlidersHorizontal className="h-3.5 w-3.5 text-amber-700" />
            Find an event
          </div>

          <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, keyword or location..."
                className="w-full rounded-xl border border-[#ded6c9] bg-[#f8f5ef] py-3 pl-11 pr-4 text-sm text-stone-800 outline-none transition-all placeholder:text-stone-400 focus:border-emerald-700/60 focus:bg-white focus:ring-4 focus:ring-emerald-900/[0.05]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Filter events by category"
                className="rounded-xl border border-[#ded6c9] bg-[#f8f5ef] px-3.5 py-3 text-xs font-semibold text-stone-700 outline-none transition-all focus:border-emerald-700/60 focus:bg-white"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === "All" ? "All Categories" : cat}
                  </option>
                ))}
              </select>

              {isKumbhMode && (
                <button
                  type="button"
                  onClick={() => setShowKumbhOnly((prev) => !prev)}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-3 text-xs font-semibold transition-all ${
                    showKumbhOnly
                      ? "border-amber-300 bg-amber-50 text-amber-900 shadow-sm"
                      : "border-[#ded6c9] bg-[#f8f5ef] text-stone-600 hover:bg-white"
                  }`}
                >
                  <Flame className={`h-3.5 w-3.5 ${showKumbhOnly ? "fill-amber-700 text-amber-700" : "text-stone-400"}`} />
                  Kumbh Seva
                </button>
              )}

              {(searchQuery || selectedCategory !== "All" || showKumbhOnly) && (
                <Button size="sm" variant="ghost" onClick={resetFilters} className="text-xs text-stone-500">
                  Reset
                </Button>
              )}
            </div>
          </div>
        </motion.section>

        {/* Events section */}
        <section className="space-y-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#9a6348]">
                Published programmes
              </p>
              <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-[#173b2a] sm:text-4xl">
                Upcoming & Recent Events {events.length > 0 && `(${events.length})`}
              </h2>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={loadEvents}
              leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />}
              className="hidden text-xs text-stone-600 sm:inline-flex"
            >
              Refresh
            </Button>
          </div>

          {isLoading ? (
            <div className="rounded-[1.8rem] border border-[#ddd3c3] bg-[#fffdf8] py-24 text-center shadow-[0_12px_40px_rgba(60,52,40,0.05)]">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#14532d]" />
              <p className="mt-4 text-sm font-medium text-stone-500">
                Retrieving published events...
              </p>
            </div>
          ) : error ? (
            <div className="rounded-[1.8rem] border border-rose-200 bg-rose-50/80 px-6 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-rose-200 bg-white text-rose-600">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-stone-900">Unable to Load Events</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-600">{error}</p>
              <Button size="sm" variant="primary" onClick={loadEvents} className="mt-5">
                Try Again
              </Button>
            </div>
          ) : events.length === 0 ? (
            <div className="rounded-[1.8rem] border border-dashed border-[#cfc4b3] bg-[#fffdf8] px-6 py-20 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#ddd2c1] bg-[#f7f2e9] text-[#8e8678]">
                <Calendar className="h-7 w-7" />
              </div>
              <h3 className="mt-5 font-serif text-xl font-bold text-stone-800">No events available.</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-600">
                {searchQuery || selectedCategory !== "All" || showKumbhOnly
                  ? "No events matched your search criteria. Try resetting filters."
                  : "There are no published field events or community drives scheduled at this time. Please check back soon."}
              </p>
              {(searchQuery || selectedCategory !== "All" || showKumbhOnly) && (
                <Button size="sm" variant="outline" onClick={resetFilters} className="mt-5">
                  Clear Search & Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {events.map((rawEvent, index) => {
                const event = getLocalizedEvent(rawEvent, language);
                const capacity = event.capacity || event.registrationLimit || 0;
                const registeredCount = event.registeredCount || event.registrationCount || 0;
                const fillPercent =
                  capacity > 0 ? Math.min(100, Math.round((registeredCount / capacity) * 100)) : 0;
                const isCompleted = event.status === "COMPLETED" || event.status === "Completed";
                const isCancelled = event.status === "CANCELLED";
                const isOngoing = event.status === "ONGOING";
                const isFull = capacity > 0 && registeredCount >= capacity;

                return (
                  <motion.article
                    key={event.id}
                    initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.08 }}
                    transition={{ duration: 0.55, delay: Math.min(index * 0.05, 0.2), ease: "easeOut" }}
                    whileHover={shouldReduceMotion ? undefined : { y: -7 }}
                    className="group overflow-hidden rounded-[1.7rem] border border-[#ddd4c7] bg-[#fffdf8] shadow-[0_9px_30px_rgba(64,53,38,0.06)] transition-shadow duration-300 hover:border-emerald-800/25 hover:shadow-[0_20px_45px_rgba(64,53,38,0.12)]"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-stone-200">
                      <Link to={`/events/${event.slug || event.id}`} className="block h-full">
                        {event.imageUrl ? (
                          <img
                            src={event.imageUrl}
                            alt={event.title}
                            className="h-full w-full object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-[1.06]"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#1c4b35] via-[#275e43] to-[#a56b4a]">
                            <Calendar className="h-14 w-14 text-white/80" />
                          </div>
                        )}
                      </Link>

                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/15" />

                      <div className="absolute left-3 top-3 right-3 flex flex-wrap gap-1.5">
                        <span className="rounded-full border border-white/15 bg-black/65 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-md">
                          {event.category}
                        </span>
                        {event.isKumbhRelated && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/30 bg-amber-600 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
                            <Flame className="h-3 w-3 fill-white" />
                            Kumbh
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
                        <div>
                          <span className="block text-[9px] font-bold uppercase tracking-[0.2em] text-amber-200">
                            {isCompleted ? "Concluded" : isCancelled ? "Cancelled" : isOngoing ? "Ongoing" : "Upcoming"}
                          </span>
                          <span className="mt-1 block font-serif text-lg font-bold text-white">
                            {event.date}
                          </span>
                        </div>
                        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-transform duration-300 group-hover:translate-x-1">
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>

                    <div className="p-5 sm:p-6">
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-800">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{event.time}</span>
                      </div>

                      <Link to={`/events/${event.slug || event.id}`} className="block">
                        <h3 className="mt-2.5 line-clamp-2 font-serif text-xl font-bold leading-tight text-[#173b2a] transition-colors group-hover:text-emerald-800">
                          {event.title}
                        </h3>
                      </Link>

                      <p className="mt-2.5 line-clamp-2 text-sm leading-6 text-stone-600">
                        {event.shortDescription || event.description}
                      </p>

                      <div className="mt-4 flex items-start gap-2 border-t border-[#ece5da] pt-4 text-xs text-stone-600">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#9a6348]" />
                        <span className="line-clamp-2">{event.location}</span>
                      </div>

                      {capacity > 0 ? (
                        <div className="mt-4 rounded-xl border border-[#ebe3d7] bg-[#faf7f1] p-3">
                          <div className="flex items-center justify-between gap-3 text-[10px] font-semibold text-stone-500">
                            <span className="inline-flex items-center gap-1.5">
                              <Users className="h-3 w-3" />
                              Attendance Quota
                            </span>
                            <span className={isFull ? "font-bold text-rose-700" : "text-stone-600"}>
                              {registeredCount} / {capacity}
                            </span>
                          </div>
                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#e7dfd3]">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isCompleted ? "bg-stone-400" : isFull ? "bg-rose-500" : "bg-[#236443]"
                              }`}
                              style={{ width: `${fillPercent}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4 inline-flex rounded-full border border-emerald-100 bg-emerald-50/70 px-3 py-1.5 text-[10px] font-semibold text-emerald-800">
                          Open community attendance
                        </div>
                      )}

                      <div className="mt-5 flex items-center gap-2">
                        <Link to={`/events/${event.slug || event.id}`} className="flex-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full text-xs font-semibold"
                            rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                          >
                            Details
                          </Button>
                        </Link>

                        {isCompleted ? (
                          <Button size="sm" variant="outline" disabled className="flex-1 text-xs font-semibold">
                            Concluded
                          </Button>
                        ) : isCancelled ? (
                          <Button size="sm" variant="outline" disabled className="flex-1 text-xs font-semibold text-rose-600">
                            Cancelled
                          </Button>
                        ) : isFull ? (
                          <Button size="sm" variant="outline" disabled className="flex-1 text-xs font-semibold">
                            Full
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="primary"
                            className="flex-1 text-xs font-semibold"
                            onClick={() => handleRegisterClick(event)}
                          >
                            Register
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Registration Modal */}
      {selectedEvent && (
        <Modal
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          title={`Register: ${selectedEvent.title}`}
          description={`${selectedEvent.date} • ${selectedEvent.location}`}
          size="md"
        >
          {registered ? (
            <div className="space-y-4 py-5 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h4 className="font-serif text-xl font-bold text-stone-900">Pass Confirmed</h4>
              <p className="mx-auto max-w-sm text-sm leading-6 text-stone-600">
                Thank you, <strong>{attendeeName || "Attendee"}</strong>. Your entry pass for {ticketCount} person(s) has been recorded.
              </p>
              <div className="space-y-1.5 rounded-xl border border-stone-200 bg-stone-50 p-4 text-left text-xs text-stone-700">
                <div><strong>Event:</strong> {selectedEvent.title}</div>
                <div><strong>Date & Time:</strong> {selectedEvent.date} ({selectedEvent.time})</div>
                <div><strong>Location:</strong> {selectedEvent.location}</div>
                <div><strong>Attendee:</strong> {attendeeName} ({attendeeEmail})</div>
              </div>
              <Button size="sm" variant="primary" onClick={() => setSelectedEvent(null)}>
                Close Window
              </Button>
            </div>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs sm:text-sm">
              {!isAuthenticated && (
                <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                  <div>
                    <strong>Sign In Required:</strong> Please sign in to register.
                    <div className="mt-1">
                      <Link to="/login?redirect=/events" className="font-bold underline">
                        Click here to Sign In →
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {regError && (
                <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                  <span>{regError}</span>
                </div>
              )}

              <div>
                <label className="mb-1.5 block font-semibold text-stone-700">Attendee Name *</label>
                <input
                  type="text"
                  required
                  value={attendeeName}
                  onChange={(e) => setAttendeeName(e.target.value)}
                  placeholder="e.g. Rahul Patil"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-[#14532d] focus:bg-white focus:ring-4 focus:ring-emerald-900/[0.05]"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block font-semibold text-stone-700">Email for Pass *</label>
                  <input
                    type="email"
                    required
                    value={attendeeEmail}
                    onChange={(e) => setAttendeeEmail(e.target.value)}
                    placeholder="rahul@example.com"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-[#14532d] focus:bg-white focus:ring-4 focus:ring-emerald-900/[0.05]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block font-semibold text-stone-700">Phone Number</label>
                  <input
                    type="tel"
                    value={attendeePhone}
                    onChange={(e) => setAttendeePhone(e.target.value)}
                    placeholder="+91 98220 00000"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-[#14532d] focus:bg-white focus:ring-4 focus:ring-emerald-900/[0.05]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block font-semibold text-stone-700">Number of Attendees</label>
                <select
                  value={ticketCount}
                  onChange={(e) => setTicketCount(Number(e.target.value))}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-[#14532d] focus:bg-white focus:ring-4 focus:ring-emerald-900/[0.05]"
                >
                  <option value={1}>1 Person</option>
                  <option value={2}>2 People</option>
                  <option value={3}>3 People</option>
                  <option value={4}>4 People</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block font-semibold text-stone-700">Special Notes (Optional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Accessibility or seating needs"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-[#14532d] focus:bg-white focus:ring-4 focus:ring-emerald-900/[0.05]"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-stone-200 pt-4">
                <Button type="button" variant="outline" size="sm" onClick={() => setSelectedEvent(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" variant="primary" disabled={isSubmitting || !isAuthenticated}>
                  {isSubmitting ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Registering...
                    </span>
                  ) : (
                    "Confirm Registration"
                  )}
                </Button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </main>
  );
};

export default Events;
