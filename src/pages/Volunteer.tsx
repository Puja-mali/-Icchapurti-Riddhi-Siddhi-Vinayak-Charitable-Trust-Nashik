import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  CheckCircle2,
  Clock,
  MapPin,
  Send,
  GraduationCap,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { VolunteerRole } from "@/src/types";
import { volunteerService } from "@/src/services/volunteerService";
import { Button } from "@/src/components/common/Button";
import { Modal } from "@/src/components/common/Modal";
import { useLanguage } from "@/src/context/LanguageContext";
import { useKumbhMode } from "@/src/context/KumbhModeContext";

export const Volunteer: React.FC = () => {
  const { t } = useLanguage();
  const { isKumbhMode } = useKumbhMode();
  const [roles, setRoles] = useState<VolunteerRole[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [selectedRole, setSelectedRole] = useState<VolunteerRole | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [isCollegeStudent, setIsCollegeStudent] = useState(false);
  const [collegeName, setCollegeName] = useState("");
  const [motivation, setMotivation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const loadRoles = useCallback(async () => {
    try {
      setIsLoadingRoles(true);
      setFetchError(null);
      const data = await volunteerService.getVolunteerRoles();
      const filtered = isKumbhMode ? data : data.filter((r) => !r.isKumbhRelated);
      setRoles(filtered);
    } catch (err: any) {
      setFetchError(err?.message || "Failed to load volunteer roles. Please try again.");
    } finally {
      setIsLoadingRoles(false);
    }
  }, [isKumbhMode]);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  const handleApplyClick = (role: VolunteerRole) => {
    setSelectedRole(role);
    setSubmitted(false);
    setSubmitError(null);
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      await volunteerService.applyForVolunteerRole({
        roleId: selectedRole._id || selectedRole.id,
        roleTitle: selectedRole.title,
        fullName,
        email,
        phone,
        city,
        isCollegeStudent,
        collegeName,
        motivation,
      });
      setSubmitted(true);
    } catch (err: any) {
      setSubmitError(err?.message || "Failed to submit your application. Please check your inputs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#7b1824] bg-[#fbf0f1] px-2.5 py-0.5 rounded border border-[#7b1824]/20">
            Community Service
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
            Live Verified Registry
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
          Join the Volunteer & Audit Network
        </h1>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
          Be the eyes and hands of transparent philanthropy. Assist in verified field audits,
          mentor students in rural labs, or coordinate hospital patient nutrition drives.
        </p>
      </div>

      {/* College Project Badge Note */}
      <div className="p-4 rounded-md bg-amber-50/90 border border-amber-300 text-xs text-amber-900 flex items-center justify-between flex-wrap gap-2 shadow-2xs">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-amber-800 shrink-0" />
          <span>
            <strong>Academic Volunteer Drive:</strong> College students can earn certified
            social immersion hours upon task completion. Verified citations issued via Trust registry.
          </span>
        </div>
      </div>

      {/* Roles Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-serif font-bold text-stone-900">Open Volunteer Opportunities</h2>
          <span className="text-xs text-stone-500 font-medium">
            {isLoadingRoles ? "Loading positions..." : `${roles.length} active positions`}
          </span>
        </div>

        {isLoadingRoles ? (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#7b1824] mx-auto" />
            <p className="text-xs text-stone-500 font-medium">Fetching active opportunities from trust registry...</p>
          </div>
        ) : fetchError ? (
          <div className="p-6 rounded-lg bg-red-50 border border-red-200 text-center space-y-3">
            <AlertCircle className="w-6 h-6 text-red-600 mx-auto" />
            <p className="text-xs text-red-700">{fetchError}</p>
            <Button size="sm" variant="outline" onClick={loadRoles}>
              Retry Loading
            </Button>
          </div>
        ) : roles.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-stone-50 border border-stone-200 rounded-lg">
            <Users className="w-10 h-10 text-stone-400 mx-auto" />
            <h3 className="text-base font-semibold text-stone-800">No Open Volunteer Openings At This Time</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              All current seva positions are fully staffed. Please check back soon or register with the trust for upcoming community events.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {roles.map((role) => (
              <div
                key={role.id || role._id}
                className="bg-white rounded-md p-5 sm:p-6 border border-stone-200 shadow-2xs flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#7b1824] bg-[#fbf0f1] px-2 py-0.5 rounded border border-[#7b1824]/20">
                        {role.department}
                      </span>
                      <h3 className="text-base font-serif font-bold text-stone-900 mt-1.5">{role.title}</h3>
                    </div>
                    {role.isKumbhRelated && (
                      <span className="text-[10px] uppercase font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded">
                        Kumbh 2027
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed">
                    {role.description}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-stone-500 pt-0.5 flex-wrap">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-[#7b1824]" />
                      {role.commitment}
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-[#7b1824]" />
                      {role.location}
                    </span>
                    <span className="text-[#7b1824] font-semibold">
                      {role.spotsAvailable} open slots
                    </span>
                  </div>

                  {/* Requirements */}
                  {role.requirements && role.requirements.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-stone-100">
                      <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-500">
                        Candidate Profile
                      </span>
                      <ul className="text-xs text-stone-600 space-y-0.5">
                        {role.requirements.map((req, idx) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="pt-4">
                  <Button
                    size="sm"
                    variant="primary"
                    className="w-full text-xs font-semibold"
                    onClick={() => handleApplyClick(role)}
                  >
                    Apply for this Role
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Application Form Modal */}
      {selectedRole && (
        <Modal
          isOpen={!!selectedRole}
          onClose={() => setSelectedRole(null)}
          title={`Volunteer Application: ${selectedRole.title}`}
          description={`Applying for ${selectedRole.department} (${selectedRole.commitment})`}
          size="lg"
        >
          {submitted ? (
            <div className="py-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#faf0f1] text-[#7b1824] mx-auto flex items-center justify-center border border-[#7b1824]/20">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-serif font-bold text-stone-900">Application Pledged!</h3>
              <p className="text-xs text-stone-600 max-w-md mx-auto">
                Thank you, <strong>{fullName || "Volunteer"}</strong>! Your application for{" "}
                <strong>{selectedRole.title}</strong> has been logged into the trust volunteer registry.
              </p>
              <div className="p-3 bg-emerald-50 rounded text-xs text-emerald-900 max-w-sm mx-auto border border-emerald-300">
                Application logged in real MongoDB database. Our volunteer coordinator will review and contact you at {email}.
              </div>
              <div className="pt-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedRole(null)}>
                  Close Window
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitApplication} className="space-y-3.5 text-xs sm:text-sm">
              {submitError && (
                <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700 rounded-md">
                  {submitError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Pooja Shinde"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-xs sm:text-sm text-stone-900 focus:bg-white focus:outline-none focus:border-[#7b1824]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="pooja@example.com"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-xs sm:text-sm text-stone-900 focus:bg-white focus:outline-none focus:border-[#7b1824]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-xs sm:text-sm text-stone-900 focus:bg-white focus:outline-none focus:border-[#7b1824]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">City / Region</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Nashik / Nashik Rural"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-xs sm:text-sm text-stone-900 focus:bg-white focus:outline-none focus:border-[#14532d]"
                  />
                </div>
              </div>

              <div className="pt-1">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="collegeStudent"
                    checked={isCollegeStudent}
                    onChange={(e) => setIsCollegeStudent(e.target.checked)}
                    className="w-4 h-4 rounded text-[#14532d] focus:ring-[#14532d] border-stone-300"
                  />
                  <label htmlFor="collegeStudent" className="text-xs font-medium text-stone-700 cursor-pointer">
                    I am a college/university student seeking NSS / community service credits
                  </label>
                </div>
                {isCollegeStudent && (
                  <div className="mt-2">
                    <input
                      type="text"
                      placeholder="College / Institute Name..."
                      value={collegeName}
                      onChange={(e) => setCollegeName(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-xs text-stone-900"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Why do you wish to volunteer with Icchapurti Riddhi Siddhi Vinayak Charitable Trust?
                </label>
                <textarea
                  rows={3}
                  required
                  value={motivation}
                  onChange={(e) => setMotivation(e.target.value)}
                  placeholder="Share any past experience or why transparency in philanthropy matters to you..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-[#14532d]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedRole(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  variant="primary"
                  isLoading={isSubmitting}
                  leftIcon={<Send className="w-3.5 h-3.5" />}
                >
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </Button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
};
