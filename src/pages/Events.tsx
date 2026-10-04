import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  Tag,
  ArrowRight,
  ExternalLink,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  RefreshCw,
  Flame,
} from "lucide-react";
import { EventItem } from "@/src/types";
import { eventService } from "@/src/services/eventService";
import { authService } from "@/src/services/authService";
import { Button } from "@/src/components/common/Button";
import { Modal } from "@/src/components/common/Modal";
import { EmptyState } from "@/src/components/common/EmptyState";
import { useLanguage } from "@/src/context/LanguageContext";
import { useKumbhMode } from "@/src/context/KumbhModeContext";

export const Events: React.FC = () => {
  const { t } = useLanguage();
  const { isKumbhMode } = useKumbhMode();
  const navigate = useNavigate();

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

  // Check auth on mount
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
      const filtered = isKumbhMode ? rawEvents : rawEvents.filter((ev) => !ev.isKumbhRelated);
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
      // Update event in local state
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

  // Extract unique categories from events or standard defaults
  const categories = ["All", "Community Outreach", "Health Camp", "Environment", "Education", "Kumbh Seva"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#14532d] bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-700/20">
            Community Outreach
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
          Trust Events & Field Drives
        </h1>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
          Participate in ground-level field events: free diagnostic health camps, indigenous plantation drives,
          and educational distribution assemblies.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events by title, keyword, location..."
            className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-[#14532d]"
          />
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            aria-label="Filter events by category"
            className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-medium text-stone-700 focus:bg-white focus:outline-none focus:border-[#14532d]"
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
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                showKumbhOnly
                  ? "bg-amber-100 text-amber-900 border border-amber-300"
                  : "bg-stone-50 text-stone-600 border border-stone-200 hover:bg-stone-100"
              }`}
            >
              <Flame className={`w-3.5 h-3.5 ${showKumbhOnly ? "text-amber-700 fill-amber-700" : "text-stone-400"}`} />
              <span>Kumbh Seva</span>
            </button>
          )}

          {(searchQuery || selectedCategory !== "All" || showKumbhOnly) && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
                setShowKumbhOnly(false);
              }}
              className="text-xs text-stone-500"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Events Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-serif font-bold text-stone-900">
            Programs & Assemblies {events.length > 0 && `(${events.length})`}
          </h2>
          <Button
            size="sm"
            variant="ghost"
            onClick={loadEvents}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />}
            className="text-xs text-stone-600"
          >
            Refresh
          </Button>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-stone-500">
            <Loader2 className="w-8 h-8 animate-spin text-[#14532d]" />
            <p className="text-sm font-medium">Retrieving events from trust database...</p>
          </div>
        ) : error ? (
          /* Error State */
          <div className="py-14 text-center space-y-4 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-stone-900">Unable to Load Events</h3>
              <p className="text-xs text-stone-600">{error}</p>
            </div>
            <Button size="sm" variant="primary" onClick={loadEvents}>
              Try Again
            </Button>
          </div>
        ) : events.length === 0 ? (
          /* Empty State */
          <div className="py-16 text-center space-y-4 bg-white rounded-xl border border-stone-200 p-8 shadow-2xs max-w-xl mx-auto">
            <div className="w-14 h-14 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto border border-stone-200">
              <Calendar className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-serif font-bold text-stone-800">
                No events available.
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 max-w-sm mx-auto leading-relaxed">
                {searchQuery || selectedCategory !== "All" || showKumbhOnly
                  ? "No events matched your search criteria. Try resetting filters."
                  : "There are no field events or community drives scheduled in the database at this time. Please check back soon."}
              </p>
            </div>
            {(searchQuery || selectedCategory !== "All" || showKumbhOnly) && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                  setShowKumbhOnly(false);
                }}
              >
                Clear Search & Filters
              </Button>
            )}
          </div>
        ) : (
          /* Events Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              const capacity = event.capacity || event.registrationLimit || 0;
              const registeredCount = event.registeredCount || event.registrationCount || 0;
              const fillPercent =
                capacity > 0 ? Math.min(100, Math.round((registeredCount / capacity) * 100)) : 0;
              const isCompleted = event.status === "COMPLETED" || event.status === "Completed";
              const isCancelled = event.status === "CANCELLED";
              const isOngoing = event.status === "ONGOING";
              const isFull = capacity > 0 && registeredCount >= capacity;

              return (
                <div
                  key={event.id}
                  className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div>
                    <Link to={`/events/${event.slug || event.id}`} className="block relative aspect-16/10 w-full overflow-hidden bg-stone-100 group">
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                      />
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-stone-900/85 text-white shadow-xs">
                          {event.category}
                        </span>
                        {event.isKumbhRelated && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500 text-white shadow-xs flex items-center gap-1">
                            <Flame className="w-3 h-3 fill-white" />
                            Kumbh
                          </span>
                        )}
                        {isCompleted ? (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-stone-600 text-white shadow-xs">
                            Concluded
                          </span>
                        ) : isCancelled ? (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-600 text-white shadow-xs">
                            Cancelled
                          </span>
                        ) : isOngoing ? (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-700 text-white shadow-xs">
                            Ongoing
                          </span>
                        ) : (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#14532d] text-white shadow-xs">
                            Upcoming
                          </span>
                        )}
                      </div>
                    </Link>

                    <div className="p-5 space-y-2.5">
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#14532d]">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{event.date}</span>
                        <span>•</span>
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        <span className="text-stone-500 font-normal">{event.time}</span>
                      </div>

                      <Link to={`/events/${event.slug || event.id}`} className="block group">
                        <h3 className="text-base font-serif font-bold text-stone-900 leading-snug group-hover:text-[#14532d] transition-colors">
                          {event.title}
                        </h3>
                      </Link>

                      <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                        {event.shortDescription || event.description}
                      </p>

                      <div className="flex items-start gap-1.5 text-xs text-stone-600 pt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-[#14532d] shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>

                      {/* Capacity status */}
                      {capacity > 0 ? (
                        <div className="pt-2 space-y-1">
                          <div className="flex justify-between text-[11px] text-stone-500 font-medium">
                            <span>Attendance Quota</span>
                            <span className={isFull ? "text-rose-700 font-semibold" : ""}>
                              {registeredCount} / {capacity} Registered
                            </span>
                          </div>
                          <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                isCompleted ? "bg-stone-400" : isFull ? "bg-rose-500" : "bg-[#14532d]"
                              }`}
                              style={{ width: `${fillPercent}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="pt-2 text-[11px] text-emerald-800 font-medium">
                          Open community attendance
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-5 pt-0 flex items-center gap-2">
                    <Link to={`/events/${event.slug || event.id}`} className="flex-1">
                      <Button size="sm" variant="outline" className="w-full text-xs font-semibold">
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
              );
            })}
          </div>
        )}
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
            <div className="py-5 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center border border-emerald-200">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-serif font-bold text-stone-900 text-base">Pass Confirmed</h4>
              <p className="text-xs text-stone-600 max-w-xs mx-auto leading-relaxed">
                Thank you, <strong>{attendeeName || "Attendee"}</strong>. Your entry pass
                for {ticketCount} person(s) has been officially recorded in the trust database.
              </p>
              <div className="p-3 bg-stone-50 rounded-lg text-xs text-stone-700 border border-stone-200 text-left space-y-1">
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
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs sm:text-sm">
              {!isAuthenticated && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-900 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <strong>Sign In Required:</strong> Please sign in to register and prevent duplicate passes.
                    <div className="mt-1">
                      <Link
                        to="/login?redirect=/events"
                        className="font-bold underline text-amber-900 hover:text-amber-950"
                      >
                        Click here to Sign In →
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {regError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{regError}</span>
                </div>
              )}

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Attendee Name *</label>
                <input
                  type="text"
                  required
                  value={attendeeName}
                  onChange={(e) => setAttendeeName(e.target.value)}
                  placeholder="e.g. Rahul Patil"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-[#14532d]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Email for Pass *</label>
                  <input
                    type="email"
                    required
                    value={attendeeEmail}
                    onChange={(e) => setAttendeeEmail(e.target.value)}
                    placeholder="rahul@example.com"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-[#14532d]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={attendeePhone}
                    onChange={(e) => setAttendeePhone(e.target.value)}
                    placeholder="+91 98220 00000"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-[#14532d]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Number of Attendees</label>
                <select
                  value={ticketCount}
                  onChange={(e) => setTicketCount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-[#14532d]"
                >
                  <option value={1}>1 Person</option>
                  <option value={2}>2 People</option>
                  <option value={3}>3 People</option>
                  <option value={4}>4 People</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Special Notes (Optional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Accessibility or seating needs"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-[#14532d]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedEvent(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  variant="primary"
                  disabled={isSubmitting || !isAuthenticated}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
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
    </div>
  );
};
