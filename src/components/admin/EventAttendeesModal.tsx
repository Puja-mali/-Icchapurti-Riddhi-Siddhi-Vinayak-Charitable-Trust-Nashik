import React from "react";
import { Users, Loader2 } from "lucide-react";
import { EventItem, EventRegistrationItem } from "@/src/types";
import { Modal } from "@/src/components/common/Modal";
import { Button } from "@/src/components/common/Button";

interface EventAttendeesModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventItem | null;
  registrations: EventRegistrationItem[];
  isLoading: boolean;
}

export const EventAttendeesModal: React.FC<EventAttendeesModalProps> = ({
  isOpen,
  onClose,
  event,
  registrations,
  isLoading,
}) => {
  if (!isOpen || !event) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Registered Attendees: ${event.title}`}
      size="lg"
    >
      <div className="space-y-4 text-xs">
        <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="font-semibold text-stone-900 block">{event.title}</span>
            <span className="text-stone-500 block text-[11px]">
              {event.date} • {event.location}
            </span>
          </div>
          <div className="text-right">
            <span className="text-base font-bold font-serif text-emerald-800 block">
              {registrations.length}
              {event.registrationLimit ? ` / ${event.registrationLimit}` : ""}
            </span>
            <span className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">
              Confirmed Registrations
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-stone-500">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-700" />
            <span>Loading attendee roster...</span>
          </div>
        ) : registrations.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <Users className="w-8 h-8 text-stone-300 mx-auto" />
            <p className="font-semibold text-stone-700">No registrations recorded yet.</p>
            <p className="text-stone-500 text-[11px]">
              Attendees will appear here once registered via the public event portal.
            </p>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto border border-stone-200 rounded-lg divide-y divide-stone-100">
            {registrations.map((reg, idx) => (
              <div key={reg.id || idx} className="p-3 hover:bg-stone-50 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="font-semibold text-stone-900 flex items-center gap-2">
                    <span>{reg.fullName}</span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-1.5 py-0.2 rounded border border-emerald-200">
                      {reg.status}
                    </span>
                  </div>
                  <div className="text-stone-500 text-[11px] flex items-center gap-3 flex-wrap">
                    <span>{reg.email}</span>
                    <span>•</span>
                    <span>{reg.phone}</span>
                    {reg.city && (
                      <>
                        <span>•</span>
                        <span>{reg.city}</span>
                      </>
                    )}
                  </div>
                  {reg.emergencyContact && (
                    <div className="text-[10px] text-stone-400">
                      Emergency: {reg.emergencyContact}
                    </div>
                  )}
                </div>
                <div className="text-right text-[10px] text-stone-400 shrink-0">
                  {reg.registeredAt ? new Date(reg.registeredAt).toLocaleDateString() : ""}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-3 border-t border-stone-200">
          <Button size="sm" variant="outline" onClick={onClose}>
            Close Roster
          </Button>
        </div>
      </div>
    </Modal>
  );
};
