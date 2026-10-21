import React, { useState, useEffect } from "react";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import { EventItem, EventStatus } from "@/src/types";
import { eventService } from "@/src/services/eventService";
import { Modal } from "@/src/components/common/Modal";
import { Button } from "@/src/components/common/Button";
import { FileUploadField } from "@/src/components/common/FileUploadField";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventToEdit: EventItem | null;
  onSuccess: (savedEventTitle: string) => void;
}

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  eventToEdit,
  onSuccess,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("Community Outreach");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState("Nashik, Maharashtra");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [registrationRequired, setRegistrationRequired] = useState(false);
  const [registrationLimit, setRegistrationLimit] = useState("100");
  const [status, setStatus] = useState<EventStatus>("UPCOMING");
  const [imageUrl, setImageUrl] = useState("");
  const [isKumbhRelated, setIsKumbhRelated] = useState(false);

  const toLocalISO = (dStr?: string) => {
    if (!dStr) return "";
    try {
      const d = new Date(dStr);
      if (isNaN(d.getTime())) return "";
      return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    } catch {
      return "";
    }
  };

  useEffect(() => {
    if (isOpen) {
      setFormError(null);
      if (eventToEdit) {
        setTitle(eventToEdit.title || "");
        setSlug(eventToEdit.slug || "");
        setCategory(eventToEdit.category || "Community Outreach");
        setStartDate(toLocalISO(eventToEdit.startDate));
        setEndDate(toLocalISO(eventToEdit.endDate));
        setLocation(eventToEdit.location || "Nashik, Maharashtra");
        setShortDescription(eventToEdit.shortDescription || "");
        setDescription(eventToEdit.description || "");
        setRegistrationRequired(!!eventToEdit.registrationRequired);
        setRegistrationLimit(String(eventToEdit.registrationLimit ?? eventToEdit.capacity ?? 100));
        setStatus((eventToEdit.status as EventStatus) || "UPCOMING");
        setImageUrl(eventToEdit.imageUrl || "");
        setIsKumbhRelated(!!eventToEdit.isKumbhRelated);
      } else {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0);

        const endTomorrow = new Date(tomorrow);
        endTomorrow.setHours(17, 0, 0, 0);

        const fmtDate = (d: Date) => d.toISOString().slice(0, 16);

        setTitle("");
        setSlug("");
        setCategory("Community Outreach");
        setStartDate(fmtDate(tomorrow));
        setEndDate(fmtDate(endTomorrow));
        setLocation("Nashik, Maharashtra");
        setShortDescription("");
        setDescription("");
        setRegistrationRequired(false);
        setRegistrationLimit("100");
        setStatus("UPCOMING");
        setImageUrl("");
        setIsKumbhRelated(false);
      }
    }
  }, [isOpen, eventToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanTitle = title.trim();
    const cleanShortDesc = shortDescription.trim();
    const cleanDesc = description.trim();
    const cleanLocation = location.trim();

    if (!cleanTitle) {
      setFormError("Event title is required.");
      return;
    }
    if (!cleanShortDesc) {
      setFormError("Short description is required.");
      return;
    }
    if (!cleanDesc) {
      setFormError("Full description is required.");
      return;
    }
    if (!cleanLocation) {
      setFormError("Location is required.");
      return;
    }
    if (!startDate) {
      setFormError("Start date and time are required.");
      return;
    }
    if (endDate && new Date(endDate) < new Date(startDate)) {
      setFormError("End date cannot be earlier than start date.");
      return;
    }
    if (!imageUrl.trim()) {
      setFormError("Cover image URL or upload is required.");
      return;
    }

    const limitNum = Number(registrationLimit) || 0;

    setIsSaving(true);
    try {
      const payload: Partial<EventItem> = {
        title: cleanTitle,
        slug: slug.trim() || undefined,
        category,
        startDate: new Date(startDate).toISOString(),
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
        location: cleanLocation,
        shortDescription: cleanShortDesc,
        description: cleanDesc,
        registrationRequired,
        registrationLimit: limitNum,
        status,
        imageUrl: imageUrl.trim(),
        isKumbhRelated,
      };

      if (eventToEdit) {
        await eventService.updateEvent(eventToEdit.id, payload);
      } else {
        await eventService.createEvent(payload);
      }

      onSuccess(cleanTitle);
      onClose();
    } catch (err: any) {
      console.error("Error saving event:", err);
      setFormError(err?.message || "Failed to save event. Please verify inputs.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={eventToEdit ? `Edit Event: ${eventToEdit.title}` : "Schedule New Trust Event or Drive"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
        {formError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-md flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{formError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Title */}
          <div className="sm:col-span-2 space-y-1">
            <label htmlFor="event-title-input" className="font-semibold text-stone-800 block text-xs">
              Event Title <span className="text-rose-600">*</span>
            </label>
            <input
              id="event-title-input"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Godavari Riverfront Cleanliness & Tree Planting Seva"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:bg-white focus:outline-none focus:border-[#14532d]"
            />
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label htmlFor="event-category-select" className="font-semibold text-stone-800 block text-xs">Category</label>
            <select
              id="event-category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:bg-white focus:outline-none focus:border-[#14532d]"
            >
              <option value="Community Outreach">Community Outreach</option>
              <option value="Health & Medical">Health & Medical</option>
              <option value="Education">Education</option>
              <option value="Environmental">Environmental</option>
              <option value="Kumbh Mela Seva">Kumbh Mela Seva</option>
              <option value="Annadanam / Food Drive">Annadanam / Food Drive</option>
              <option value="Festival & Cultural">Festival & Cultural</option>
              <option value="Emergency Relief">Emergency Relief</option>
            </select>
          </div>

          {/* Status */}
          <div className="space-y-1">
            <label htmlFor="event-status-select" className="font-semibold text-stone-800 block text-xs">Status</label>
            <select
              id="event-status-select"
              value={status}
              onChange={(e) => setStatus(e.target.value as EventStatus)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:bg-white focus:outline-none focus:border-[#14532d]"
            >
              <option value="UPCOMING">UPCOMING (Open)</option>
              <option value="ONGOING">ONGOING (Active Now)</option>
              <option value="COMPLETED">COMPLETED (Concluded)</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          {/* Start Date */}
          <div className="space-y-1">
            <label htmlFor="event-start-date-input" className="font-semibold text-stone-800 block text-xs">
              Start Date & Time <span className="text-rose-600">*</span>
            </label>
            <input
              id="event-start-date-input"
              type="datetime-local"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:bg-white focus:outline-none focus:border-[#14532d]"
            />
          </div>

          {/* End Date */}
          <div className="space-y-1">
            <label htmlFor="event-end-date-input" className="font-semibold text-stone-800 block text-xs">End Date & Time</label>
            <input
              id="event-end-date-input"
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:bg-white focus:outline-none focus:border-[#14532d]"
            />
          </div>

          {/* Location */}
          <div className="sm:col-span-2 space-y-1">
            <label htmlFor="event-location-input" className="font-semibold text-stone-800 block text-xs">
              Location / Venue <span className="text-rose-600">*</span>
            </label>
            <input
              id="event-location-input"
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Ramkund Ghat, Panchavati, Nashik, Maharashtra 422003"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:bg-white focus:outline-none focus:border-[#14532d]"
            />
          </div>

          {/* Image Upload & URL */}
          <div className="sm:col-span-2 space-y-2">
            <FileUploadField
              label="Event Photo / Banner"
              category="IMAGE"
              value={imageUrl}
              onChange={(url) => setImageUrl(url)}
              helperText="Upload an image (max 5 MB) or specify an image URL below."
            />
            <input
              type="url"
              required
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/... or uploaded URL"
              className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-md text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-[#14532d]"
            />
          </div>

          {/* Registration Limit */}
          <div className="space-y-1">
            <label htmlFor="event-registration-limit-input" className="font-semibold text-stone-800 block text-xs">
              Attendee / Volunteer Capacity Limit
            </label>
            <input
              id="event-registration-limit-input"
              type="number"
              min="0"
              value={registrationLimit}
              onChange={(e) => setRegistrationLimit(e.target.value)}
              placeholder="0 for unlimited"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:bg-white focus:outline-none focus:border-[#14532d]"
            />
          </div>

          {/* Slug */}
          <div className="space-y-1">
            <label htmlFor="event-slug-input" className="font-semibold text-stone-800 block text-xs">URL Slug (Optional)</label>
            <input
              id="event-slug-input"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="leave blank to auto-generate"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:bg-white focus:outline-none focus:border-[#14532d]"
            />
          </div>

          {/* Short Description */}
          <div className="sm:col-span-2 space-y-1">
            <label htmlFor="event-short-desc-input" className="font-semibold text-stone-800 block text-xs">
              Short Summary / Teaser <span className="text-rose-600">*</span>
            </label>
            <input
              id="event-short-desc-input"
              type="text"
              required
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="One-sentence description shown on calendar cards"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:bg-white focus:outline-none focus:border-[#14532d]"
            />
          </div>

          {/* Full Description */}
          <div className="sm:col-span-2 space-y-1">
            <label htmlFor="event-desc-input" className="font-semibold text-stone-800 block text-xs">
              Full Event Brief & Schedule <span className="text-rose-600">*</span>
            </label>
            <textarea
              id="event-desc-input"
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed schedule, reporting instructions, seva requirements, coordinator contacts..."
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:bg-white focus:outline-none focus:border-[#14532d] leading-relaxed"
            />
          </div>

          {/* Toggles */}
          <div className="sm:col-span-2 flex items-center gap-6 pt-1">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={registrationRequired}
                onChange={(e) => setRegistrationRequired(e.target.checked)}
                className="rounded text-[#14532d] focus:ring-[#14532d]"
              />
              <span className="font-medium text-stone-800 text-xs">Require Advance RSVP</span>
            </label>

            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isKumbhRelated}
                onChange={(e) => setIsKumbhRelated(e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500"
              />
              <span className="font-medium text-stone-800 text-xs">Simhastha Kumbh 2027 Program</span>
            </label>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-200">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isSaving}
            className="bg-[#14532d] hover:bg-[#0f3d21] text-white"
            leftIcon={isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          >
            {isSaving ? "Saving..." : eventToEdit ? "Save Event Changes" : "Schedule Event"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
