import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Share2,
  Tag,
  ShieldCheck,
  Flame,
} from "lucide-react";
import { EventItem } from "@/src/types";
import { eventService } from "@/src/services/eventService";
import { authService } from "@/src/services/authService";
import { Button } from "@/src/components/common/Button";
import { Modal } from "@/src/components/common/Modal";
import { EmptyState } from "@/src/components/common/EmptyState";
import { useLanguage } from "@/src/context/LanguageContext";

export const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [event, setEvent] = useState<EventItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Registration Modal state
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [attendeeName, setAttendeeName] = useState("");
  const [attendeeEmail, setAttendeeEmail] = useState("");
  const [attendeePhone, setAttendeePhone] = useState("");
  const [ticketCount, setTicketCount] = useState(1);
  const [notes, setNotes] = useState("");
  const [isSubmittingReg, setIsSubmittingReg] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in
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

  const loadEvent = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await eventService.getEvent(id);
      setEvent(data);
    } catch (err: any) {
      console.error("Failed to load event:", err);
      setError(err?.message || "Event not found.");
      setEvent(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvent();
  }, [id]);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    if (!isAuthenticated) {
      navigate(`/login?redirect=/events/${encodeURIComponent(id || event.id)}`);
      return;
    }

    setIsSubmittingReg(true);
    setRegError(null);

    try {
      const result = await eventService.registerForEvent(event.id, {
        attendeeCount: ticketCount,
        userName: attendeeName,
        userEmail: attendeeEmail,
        userPhone: attendeePhone,
        notes,
      });

      setRegSuccess(true);
      setEvent(result.event);
    } catch (err: any) {
      console.error("Registration failed:", err);
      setRegError(err?.message || "Registration failed. Please check details.");
    } finally {
      setIsSubmittingReg(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center gap-3 text-stone-500">
        <Loader2 className="w-8 h-8 animate-spin text-[#14532d]" />
        <p className="text-sm font-medium">Loading event details...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState
          title="Event Not Found"
          description={error || "The event you requested could not be located in our records."}
          actionLabel="Return to All Events"
          onAction={() => navigate("/events")}
        />
      </div>
    );
  }

  const isCompleted = event.status === "COMPLETED" || event.status === "Completed";
  const isCancelled = event.status === "CANCELLED";
  const isOngoing = event.status === "ONGOING";
  const capacity = event.capacity || event.registrationLimit || 0;
  const registeredCount = event.registeredCount || event.registrationCount || 0;
  const isFull = capacity > 0 && registeredCount >= capacity;
  const fillPercent = capacity > 0 ? Math.min(100, Math.round((registeredCount / capacity) * 100)) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      {/* Back Button & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/events"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-stone-600 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Events</span>
        </Link>
        <div className="flex items-center gap-2">
          {event.isKumbhRelated && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
              <Flame className="w-3.5 h-3.5 text-amber-700" />
              Simhastha Kumbh Seva
            </span>
          )}
          <span
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
              isCompleted
                ? "bg-stone-200 text-stone-700"
                : isCancelled
                ? "bg-rose-100 text-rose-800"
                : isOngoing
                ? "bg-emerald-100 text-emerald-800"
                : "bg-emerald-50 text-[#14532d] border border-emerald-700/20"
            }`}
          >
            {isCompleted ? "Concluded" : isCancelled ? "Cancelled" : isOngoing ? "Ongoing" : "Upcoming"}
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative aspect-16/9 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shadow-sm">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 bg-stone-900/85 backdrop-blur-xs text-white text-xs font-semibold rounded-md shadow-xs">
                {event.category}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-stone-900 tracking-tight leading-tight">
              {event.title}
            </h1>

            {event.shortDescription && (
              <p className="text-base sm:text-lg text-stone-600 leading-relaxed font-medium">
                {event.shortDescription}
              </p>
            )}

            {/* Event Meta Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-3 border-y border-stone-200">
              <div className="flex items-center gap-3 text-xs sm:text-sm text-stone-700">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#14532d] flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-stone-900">Date & Schedule</div>
                  <div className="text-stone-500">{event.date}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs sm:text-sm text-stone-700">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#14532d] flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-stone-900">Timing</div>
                  <div className="text-stone-500">{event.time}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs sm:text-sm text-stone-700 sm:col-span-2">
                <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-stone-900">Event Venue</div>
                  <div className="text-stone-500">{event.location}</div>
                </div>
              </div>
            </div>

            {/* Full Description */}
            <div className="space-y-3 pt-2">
              <h2 className="text-lg font-serif font-bold text-stone-900">About This Event</h2>
              <div className="prose prose-stone max-w-none text-xs sm:text-sm text-stone-700 leading-relaxed whitespace-pre-line">
                {event.description}
              </div>
            </div>

            {/* Gallery Images if available */}
            {event.galleryUrls && event.galleryUrls.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-stone-200">
                <h3 className="text-base font-serif font-bold text-stone-900">Field Gallery</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {event.galleryUrls.map((url, idx) => (
                    <div
                      key={idx}
                      className="aspect-4/3 rounded-lg overflow-hidden bg-stone-100 border border-stone-200 shadow-2xs"
                    >
                      <img src={url} alt={`Gallery item ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Registration Card) */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm space-y-6 sticky top-24">
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Free Community Attendance
              </span>
              <h3 className="text-xl font-serif font-bold text-stone-900">
                Reserve Your Attendance
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                All trust field drives and assemblies are completely free. Registering helps our marshals prepare logistics and refreshments.
              </p>
            </div>

            {/* Quota Progress */}
            {capacity > 0 ? (
              <div className="space-y-2 p-3.5 bg-stone-50 rounded-lg border border-stone-200">
                <div className="flex justify-between text-xs font-semibold text-stone-700">
                  <span>Attendance Capacity</span>
                  <span className={isFull ? "text-rose-700" : "text-emerald-800"}>
                    {registeredCount} / {capacity} Registered
                  </span>
                </div>
                <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isFull ? "bg-rose-600" : "bg-[#14532d]"
                    }`}
                    style={{ width: `${fillPercent}%` }}
                  />
                </div>
                <div className="text-[11px] text-stone-500 flex items-center justify-between">
                  <span>{Math.max(0, capacity - registeredCount)} spot(s) remaining</span>
                  <span>{fillPercent}% filled</span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-lg text-xs">
                Open attendance — no fixed attendee cap.
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {isCompleted ? (
                <Button size="md" variant="outline" disabled className="w-full text-xs font-semibold">
                  Event Has Concluded
                </Button>
              ) : isCancelled ? (
                <Button size="md" variant="outline" disabled className="w-full text-xs font-semibold text-rose-700">
                  Event Cancelled
                </Button>
              ) : isFull ? (
                <Button size="md" variant="outline" disabled className="w-full text-xs font-semibold">
                  Registration Full
                </Button>
              ) : (
                <Button
                  size="md"
                  variant="primary"
                  className="w-full text-xs font-semibold"
                  onClick={() => {
                    setRegSuccess(false);
                    setRegError(null);
                    setIsRegisterOpen(true);
                  }}
                >
                  Register Free Pass
                </Button>
              )}

              <Link to="/contact">
                <Button size="sm" variant="ghost" className="w-full text-xs text-stone-600">
                  Need Help or Accessibility Assistance?
                </Button>
              </Link>
            </div>

            {/* Trust Guarantee */}
            <div className="pt-4 border-t border-stone-100 flex items-start gap-2.5 text-xs text-stone-500">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span>
                Organized under the governance of <strong>Shree Siddhivinayak Seva Trust</strong>, registered under Bombay Public Trust Act 1950.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      {isRegisterOpen && (
        <Modal
          isOpen={isRegisterOpen}
          onClose={() => setIsRegisterOpen(false)}
          title={`Register Pass: ${event.title}`}
          description={`${event.date} • ${event.location}`}
          size="md"
        >
          {regSuccess ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center border border-emerald-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif font-bold text-stone-900 text-lg">
                  Registration Confirmed!
                </h4>
                <p className="text-xs text-stone-600 max-w-sm mx-auto">
                  Thank you, <strong>{attendeeName}</strong>. Your pass for {ticketCount} attendee(s) has been officially recorded in our trust database.
                </p>
              </div>
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs text-stone-700 space-y-1 text-left">
                <div><strong>Event:</strong> {event.title}</div>
                <div><strong>When:</strong> {event.date} ({event.time})</div>
                <div><strong>Where:</strong> {event.location}</div>
                <div><strong>Registered Email:</strong> {attendeeEmail}</div>
              </div>
              <Button size="sm" variant="primary" onClick={() => setIsRegisterOpen(false)}>
                Done
              </Button>
            </div>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs sm:text-sm">
              {!isAuthenticated && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-900 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <strong>Sign In Recommended:</strong> You must sign in to secure your attendance pass and prevent duplicate registrations.
                    <div className="mt-1">
                      <Link
                        to={`/login?redirect=/events/${encodeURIComponent(event.id)}`}
                        className="font-bold underline text-amber-900 hover:text-amber-950"
                      >
                        Click here to Sign In or Register an Account →
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
                  <label className="font-semibold text-stone-700 block mb-1">Mobile / WhatsApp</label>
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
                <label className="font-semibold text-stone-700 block mb-1">Notes / Accessibility Requirements (Optional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Senior citizen seating, wheelchair assistance"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-[#14532d]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsRegisterOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  variant="primary"
                  disabled={isSubmittingReg || !isAuthenticated}
                >
                  {isSubmittingReg ? (
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
