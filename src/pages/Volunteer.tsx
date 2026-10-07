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
          <span className="text-xs font-semibold uppercase tracking-wider text-[#14532d] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 shadow-2xs">
            Community Service & Seva
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-900 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 shadow-2xs">
            Live Verified Registry
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-serif font-bold text-stone-900 tracking-tight leading-[1.15]">
          Join the Volunteer & Audit Network
        </h1>

        {/* Warm Subtle Decorative Divider */}
        <div className="flex items-center justify-center gap-2 mt-3.5 mb-2">
          <span className="w-8 h-px bg-amber-400/60" />
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span className="w-8 h-px bg-amber-400/60" />
        </div>

        <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-2xl mx-auto">
          Be the eyes and hands of transparent philanthropy. Assist in verified field audits,
          mentor students in rural classrooms, or coordinate hospital patient nutrition drives across Nashik.
        </p>
      </div>

      {/* College Project Badge Note */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/90 border border-amber-200 text-xs text-amber-900 flex items-center justify-between flex-wrap gap-2 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-200/60 flex items-center justify-center shrink-0">
            <GraduationCap className="w-4 h-4 text-amber-800" />
          </div>
          <span>
            <strong>Academic Volunteer Drive:</strong> College students can earn certified
            social immersion hours upon task completion. Verified citations issued via Trust registry.
          </span>
        </div>
      </div>

      {/* Roles Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
            Open Volunteer Opportunities
          </h2>
          <span className="text-xs text-stone-500 font-medium">
            {isLoadingRoles ? "Loading positions..." : `${roles.length} active positions`}
          </span>
        </div>

        {isLoadingRoles ? (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#14532d] mx-auto" />
            <p className="text-xs text-stone-500 font-medium">Fetching active opportunities from trust registry...</p>
          </div>
        ) : fetchError ? (
          <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-center space-y-3">
            <AlertCircle className="w-6 h-6 text-red-600 mx-auto" />
            <p className="text-xs text-red-700">{fetchError}</p>
            <Button size="sm" variant="outline" onClick={loadRoles}>
              Retry Loading
            </Button>
          </div>
        ) : roles.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-stone-50 border border-stone-200 rounded-2xl">
            <Users className="w-10 h-10 text-stone-400 mx-auto" />
            <h3 className="text-base font-semibold text-stone-800">No Open Volunteer Openings At This Time</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              All current seva positions are fully staffed. Please check back soon or register with the trust for upcoming community events.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {roles.map((role) => (
              <div
                key={role.id || role._id}
                className="bg-white rounded-2xl p-6 sm:p-7 border border-stone-200/90 shadow-xs hover:border-emerald-700/40 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#14532d] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/80">
                        {role.department}
                      </span>
                      <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900 mt-2 leading-snug">
                        {role.title}
                      </h3>
                    </div>
                    {role.isKumbhRelated && (
                      <span className="text-[10px] uppercase font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full shadow-2xs">
                        Kumbh 2027
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                    {role.description}
                  </p>

                  <div className="flex items-center gap-3.5 text-xs text-stone-500 pt-1 flex-wrap">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-amber-700" />
                      {role.commitment}
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-[#14532d]" />
                      {role.location}
                    </span>
                    <span className="text-[#14532d] font-semibold bg-emerald-50/80 px-2 py-0.5 rounded-full border border-emerald-200/60">
                      {role.spotsAvailable} open slots
                    </span>
                  </div>

                  {/* Requirements */}
                  {role.requirements && role.requirements.length > 0 && (
                    <div className="space-y-1.5 pt-2.5 border-t border-stone-100">
                      <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-500">
                        Candidate Profile
                      </span>
                      <ul className="text-xs text-stone-600 space-y-1">
                        {role.requirements.map((req, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="pt-5">
                  <Button
                    size="sm"
                    variant="primary"
                    className="w-full text-xs font-semibold bg-[#14532d] hover:bg-[#0f4023] text-white py-2.5"
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
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#14532d] mx-auto flex items-center justify-center border border-emerald-200">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-serif font-bold text-stone-900">Application Pledged!</h3>
              <p className="text-xs text-stone-600 max-w-md mx-auto">
                Thank you, <strong>{fullName || "Volunteer"}</strong>! Your application for{" "}
                <strong>{selectedRole.title}</strong> has been logged into the trust volunteer registry.
              </p>
              <div className="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-900 max-w-sm mx-auto border border-emerald-300">
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
                <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700 rounded-xl">
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
                    className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:bg-white focus:outline-none focus:border-[#14532d] focus:ring-1 focus:ring-[#14532d]/20 transition-all"
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
                    className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:bg-white focus:outline-none focus:border-[#14532d] focus:ring-1 focus:ring-[#14532d]/20 transition-all"
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
                    className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:bg-white focus:outline-none focus:border-[#14532d] focus:ring-1 focus:ring-[#14532d]/20 transition-all"
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
                    className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:bg-white focus:outline-none focus:border-[#14532d] focus:ring-1 focus:ring-[#14532d]/20 transition-all"
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
                      className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-[#14532d]"
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
                  className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-[#14532d] focus:ring-1 focus:ring-[#14532d]/20 transition-all"
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
                  className="bg-[#14532d] hover:bg-[#0f4023] text-white"
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
