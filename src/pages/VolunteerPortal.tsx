import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Award,
  Clock,
  Calendar,
  CheckCircle2,
  FileCheck,
  Download,
  ShieldCheck,
  User,
  Heart,
  Flame,
  PlusCircle,
  ExternalLink,
  Loader2,
  AlertCircle,
  LogIn,
} from "lucide-react";
import { Button } from "@/src/components/common/Button";
import { Modal } from "@/src/components/common/Modal";
import { VolunteerCertificate, VolunteerShift } from "@/src/types";
import { volunteerService, VolunteerProfileData } from "@/src/services/volunteerService";
import { useAuth } from "@/src/context/AuthContext";

export const VolunteerPortal: React.FC = () => {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [profileData, setProfileData] = useState<VolunteerProfileData | null>(null);
  const [shifts, setShifts] = useState<VolunteerShift[]>([]);
  const [certificates, setCertificates] = useState<VolunteerCertificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCert, setSelectedCert] = useState<VolunteerCertificate | null>(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  // Form State for logging shifts
  const [shiftRole, setShiftRole] = useState("Community Kitchen Lead");
  const [shiftDate, setShiftDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [shiftHours, setShiftHours] = useState(4);
  const [shiftLocation, setShiftLocation] = useState("Nashik Seva Kendra");
  const [shiftNotes, setShiftNotes] = useState("");
  const [isLoggingShift, setIsLoggingShift] = useState(false);
  const [logError, setLogError] = useState<string | null>(null);

  const fetchVolunteerData = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await volunteerService.getMyVolunteerProfile();
      setProfileData(data);
      setShifts(data.shifts || []);
      setCertificates(data.certificates || []);
    } catch (err: any) {
      console.error("Failed to load volunteer profile:", err);
      setError(err?.message || "Failed to load volunteer records. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthLoading) {
      fetchVolunteerData();
    }
  }, [isAuthLoading, fetchVolunteerData]);

  const totalHours = shifts
    .filter((s) => s.status === "COMPLETED" || s.status === "Completed & Verified" || s.status === "Completed")
    .reduce((acc, s) => acc + (Number(s.hours) || 0), 0);

  const handleLogShift = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoggingShift(true);
      setLogError(null);
      await volunteerService.logVolunteerShift({
        roleTitle: shiftRole,
        date: shiftDate,
        hours: Number(shiftHours),
        location: shiftLocation,
        notes: shiftNotes,
      });
      setIsLogModalOpen(false);
      setShiftNotes("");
      await fetchVolunteerData();
    } catch (err: any) {
      setLogError(err?.message || "Failed to log shift. Please verify details.");
    } finally {
      setIsLoggingShift(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#14532d] mx-auto" />
        <p className="text-xs text-stone-500 font-medium">Verifying trust volunteer credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto border border-emerald-200">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
            Secure Volunteer Passport
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            Volunteer Authentication Required
          </h1>
          <p className="text-sm text-stone-600 max-w-lg mx-auto leading-relaxed">
            In compliance with Trust security and audit standards, volunteer attendance ledgers,
            logged seva hours, and digital citations are accessible exclusively to authenticated sevadars.
          </p>
        </div>

        <div className="p-5 bg-stone-50 rounded-xl border border-stone-200 max-w-md mx-auto space-y-4 text-xs text-stone-600 text-left">
          <div className="flex items-center gap-2 text-stone-800 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Real-time hour verification by Field Marshals</span>
          </div>
          <div className="flex items-center gap-2 text-stone-800 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Cryptographically sealed Seva citations</span>
          </div>
          <div className="flex items-center gap-2 text-stone-800 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Simhastha Kumbh 2027 accredited credentials</span>
          </div>
        </div>

        <div className="pt-2 flex justify-center gap-3">
          <Link to="/login">
            <Button size="md" variant="primary" leftIcon={<LogIn className="w-4 h-4" />}>
              Sign In to Volunteer Portal
            </Button>
          </Link>
          <Link to="/volunteer">
            <Button size="md" variant="outline">
              Apply to Volunteer
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const volunteerCode = profileData?.volunteer?.volunteerCode || "VOL-" + (user?.id ? user.id.slice(-6).toUpperCase() : "REG");
  const volunteerName = user?.name || profileData?.volunteer?.user?.name || "Verified Sevadar";
  const initials = volunteerName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const primaryFocus = profileData?.volunteer?.primaryFocus || "Community Nutrition & Logistics";
  const isKumbh = profileData?.volunteer?.isKumbhRegistered !== false;
  const volunteerTier = profileData?.stats?.tier || (totalHours >= 100 ? "Gold Sevadar" : totalHours >= 25 ? "Silver Sevadar" : "Active Sevadar");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Volunteer Profile Banner */}
      <div className="bg-gradient-to-r from-[#123927] to-[#0c281c] text-white p-6 sm:p-8 rounded-2xl border border-emerald-800 shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-700 border-2 border-amber-300 flex items-center justify-center text-xl font-serif font-bold text-white shadow-inner">
              {initials}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-serif font-bold text-white">{volunteerName}</h1>
                <span className="bg-emerald-950 text-emerald-300 text-[11px] px-2 py-0.5 rounded border border-emerald-700 font-medium">
                  Verified Sevadar
                </span>
              </div>
              <p className="text-xs text-emerald-200">
                Volunteer ID: <span className="font-mono text-amber-300 font-semibold">{volunteerCode}</span> • Member Since {user?.createdAt ? new Date(user.createdAt).getFullYear() : "2025"}
              </p>
              <div className="flex items-center gap-2 pt-1 text-xs">
                <span className="bg-white/10 px-2 py-0.5 rounded text-[11px]">Primary: {primaryFocus}</span>
                {isKumbh && (
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded text-[11px]">
                    Kumbh 2027 Registered Sevadar
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="md"
              className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs border border-amber-300/40"
              leftIcon={<PlusCircle className="w-4 h-4" />}
              onClick={() => setIsLogModalOpen(true)}
            >
              Log Volunteer Hours
            </Button>
            <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-950 px-2 py-1 rounded border border-emerald-700/60 uppercase tracking-wider">
              Real MongoDB Synced
            </span>
          </div>
        </div>

        {/* 4 Stats counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-emerald-800/60 text-xs">
          <div>
            <div className="text-emerald-300 uppercase tracking-wider text-[11px]">Total Seva Hours</div>
            <div className="text-2xl font-serif font-bold text-white mt-0.5">{totalHours} Hours</div>
            <div className="text-[11px] text-emerald-200/80">Certified & Audited</div>
          </div>
          <div>
            <div className="text-emerald-300 uppercase tracking-wider text-[11px]">Shifts Completed</div>
            <div className="text-2xl font-serif font-bold text-white mt-0.5">{shifts.length} Sessions</div>
            <div className="text-[11px] text-emerald-200/80">Attendance Records</div>
          </div>
          <div>
            <div className="text-emerald-300 uppercase tracking-wider text-[11px]">Digital Citations</div>
            <div className="text-2xl font-serif font-bold text-white mt-0.5">
              {certificates.length} Citations
            </div>
            <div className="text-[11px] text-emerald-200/80">Trust Sealed</div>
          </div>
          <div>
            <div className="text-emerald-300 uppercase tracking-wider text-[11px]">Seva Tier</div>
            <div className="text-2xl font-serif font-bold text-amber-300 mt-0.5">{volunteerTier}</div>
            <div className="text-[11px] text-emerald-200/80">{totalHours} Hours Logged</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center justify-between">
          <span>{error}</span>
          <Button size="sm" variant="outline" onClick={fetchVolunteerData}>
            Retry
          </Button>
        </div>
      )}

      {/* Main Grid: Shifts History & Digital Certificates */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 cols: Shift Activity Ledger */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <h2 className="text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-700" />
              <span>Verified Attendance & Shift Ledger</span>
            </h2>
            <span className="text-xs text-stone-500">{shifts.length} logged records</span>
          </div>

          {isLoading ? (
            <div className="py-12 text-center space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-700 mx-auto" />
              <p className="text-xs text-stone-500">Loading your shift ledger from MongoDB...</p>
            </div>
          ) : shifts.length === 0 ? (
            <div className="py-12 text-center bg-stone-50 rounded-xl border border-stone-200 p-6 space-y-3">
              <Clock className="w-8 h-8 text-stone-300 mx-auto" />
              <h3 className="font-semibold text-stone-800 text-sm">No Seva Shifts Logged Yet</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Ready to contribute? Log your first volunteer shift using the "Log Volunteer Hours" button above.
              </p>
              <Button size="sm" variant="outline" onClick={() => setIsLogModalOpen(true)}>
                Log My First Shift
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {shifts.map((s) => (
                <div
                  key={s.id || s._id}
                  className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs flex items-center justify-between hover:border-emerald-700/40 transition-colors text-xs"
                >
                  <div className="space-y-1">
                    <div className="font-semibold text-stone-900 text-sm">{s.roleTitle || s.role}</div>
                    <div className="text-stone-500 flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-stone-400" />
                        <span>{s.date}</span>
                      </span>
                      <span>•</span>
                      <span>{s.location}</span>
                    </div>
                    {s.supervisor && (
                      <div className="text-[11px] text-stone-400">
                        Verified by Supervisor: <strong>{s.supervisor}</strong>
                      </div>
                    )}
                    {s.notes && (
                      <p className="text-[11px] text-stone-600 italic">"{s.notes}"</p>
                    )}
                  </div>

                  <div className="text-right space-y-1 shrink-0">
                    <div className="font-serif font-bold text-base text-emerald-900">
                      +{s.hours} Hours
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded border ${
                        s.status === "COMPLETED" || s.status === "Completed & Verified" || s.status === "Completed"
                          ? "text-emerald-800 bg-emerald-50 border-emerald-200"
                          : s.status === "SCHEDULED" || s.status === "Scheduled"
                          ? "text-blue-800 bg-blue-50 border-blue-200"
                          : "text-amber-800 bg-amber-50 border-amber-200"
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{s.status}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 5 cols: Digital Certificates & Recognition */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <h2 className="text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-600" />
              <span>Digital Seva Citations</span>
            </h2>
            <span className="text-xs text-stone-500">Official Certificates</span>
          </div>

          {isLoading ? (
            <div className="py-12 text-center space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-amber-600 mx-auto" />
              <p className="text-xs text-stone-500">Fetching certificates...</p>
            </div>
          ) : certificates.length === 0 ? (
            <div className="py-12 text-center bg-stone-50 rounded-xl border border-stone-200 p-6 space-y-2">
              <Award className="w-8 h-8 text-stone-300 mx-auto" />
              <h3 className="font-semibold text-stone-800 text-sm">No Citations Issued Yet</h3>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                Complete and verify volunteer hours across trust causes to earn signed digital certificates.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {certificates.map((cert) => (
                <div
                  key={cert.id || cert._id}
                  className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs space-y-2 hover:border-amber-400/60 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-serif font-bold text-stone-900 text-sm">
                        {cert.serviceTitle || cert.title}
                      </h3>
                      <div className="text-[11px] text-stone-500">
                        Awarded: {cert.issuedDate || cert.issueDate} • #{cert.certificateNumber}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                      {cert.totalHours || cert.hoursRecorded} Hrs
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 line-clamp-2">
                    {cert.description || `Awarded for dedicated volunteer seva contributing ${cert.totalHours || cert.hoursRecorded} verified hours.`}
                  </p>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-[11px] text-stone-400">
                      Signed by {cert.signatoryName || "Chairman"}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs px-2.5 h-7"
                      leftIcon={<Download className="w-3 h-3 text-emerald-700" />}
                      onClick={() => setSelectedCert(cert)}
                    >
                      View Citation
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Certificate Modal */}
      {selectedCert && (
        <Modal
          isOpen={!!selectedCert}
          onClose={() => setSelectedCert(null)}
          title="Official Volunteer Citation"
        >
          <div className="space-y-5 text-center p-2">
            <div className="p-6 rounded-xl border-4 border-double border-amber-600/60 bg-[#fffdfa] space-y-4 shadow-inner text-stone-800">
              <div className="text-amber-800 font-serif font-bold text-xs uppercase tracking-widest">
                Shree Siddhivinayak Public Charitable Trust
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                Certificate of Selfless Seva
              </h2>
              <p className="text-xs text-stone-500">
                Presented with deepest gratitude and honor to:
              </p>
              <div className="text-xl font-serif font-bold text-emerald-950 border-b border-stone-300 pb-1 w-3/4 mx-auto">
                {selectedCert.volunteerName || volunteerName}
              </div>
              <p className="text-xs text-stone-600 leading-relaxed px-4">
                {selectedCert.description || `In high recognition of exemplary dedication and selflessness, completing ${selectedCert.totalHours || selectedCert.hoursRecorded || 0} verified volunteer hours in service of society.`}
              </p>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-stone-200 text-xs">
                <div>
                  <div className="text-stone-400 text-[10px]">Certificate No:</div>
                  <div className="font-mono font-semibold">{selectedCert.certificateNumber}</div>
                </div>
                <div>
                  <div className="text-stone-400 text-[10px]">Date of Issue:</div>
                  <div className="font-semibold">{selectedCert.issuedDate || selectedCert.issueDate}</div>
                </div>
              </div>

              {selectedCert.verificationHash && (
                <div className="text-[10px] text-stone-400 font-mono pt-1">
                  Hash: {selectedCert.verificationHash.slice(0, 24)}...
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setSelectedCert(null)}>
                Close
              </Button>
              <Button
                size="sm"
                className="bg-[#14532d] hover:bg-[#0f4023] text-white"
                onClick={() => {
                  window.print();
                }}
              >
                Print / Save PDF
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Log Shift Modal */}
      <Modal
        isOpen={isLogModalOpen}
        onClose={() => {
          setIsLogModalOpen(false);
          setLogError(null);
        }}
        title="Log Completed Seva Hours"
      >
        <form onSubmit={handleLogShift} className="space-y-4 text-xs sm:text-sm">
          {logError && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-xs text-red-700 rounded">
              {logError}
            </div>
          )}

          <div>
            <label className="block font-semibold text-stone-800 mb-1">Seva Department / Activity</label>
            <select
              value={shiftRole}
              onChange={(e) => setShiftRole(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-white"
            >
              <option value="Community Kitchen Lead">Daily Rasoi & Kitchen Preparation</option>
              <option value="Medical Camp Assistant">Rural Health Camp Triage</option>
              <option value="Education Mentor">After-School Tutoring</option>
              <option value="Kumbh Sanitation Drive">Nashik Simhastha Ghat Cleanliness</option>
              <option value="Field Audit Verification">Impact Passport Field Inspection</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-800 mb-1">Date</label>
              <input
                type="date"
                required
                value={shiftDate}
                onChange={(e) => setShiftDate(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-800 mb-1">Hours Logged</label>
              <input
                type="number"
                min={1}
                max={12}
                required
                value={shiftHours}
                onChange={(e) => setShiftHours(Number(e.target.value))}
                className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-800 mb-1">Location / Seva Kendra</label>
            <input
              type="text"
              required
              value={shiftLocation}
              onChange={(e) => setShiftLocation(e.target.value)}
              placeholder="e.g. Nashik Trimbak Road Seva Kendra"
              className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-700"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-800 mb-1">Summary of Field Duties Completed</label>
            <textarea
              rows={3}
              value={shiftNotes}
              onChange={(e) => setShiftNotes(e.target.value)}
              placeholder="e.g. Distributed 450 meals at Civil Hospital, handled grain loading..."
              className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-700"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsLogModalOpen(false);
                setLogError(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={isLoggingShift}
              className="bg-[#14532d] hover:bg-[#0f4023] text-white"
            >
              {isLoggingShift ? "Logging..." : "Save to Shift Ledger"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
