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
  HeartHandshake,
  Sparkles,
  ArrowRight,
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

  const [selectedRole, setSelectedRole] =
    useState<VolunteerRole | null>(null);

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

      const filtered = isKumbhMode
        ? data
        : data.filter((r) => !r.isKumbhRelated);

      setRoles(filtered);
    } catch (err: any) {
      setFetchError(
        err?.message || "Failed to load volunteer roles. Please try again."
      );
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
      setSubmitError(
        err?.message ||
          "Failed to submit your application. Please check your inputs."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f7f1e5]">
      {/* =========================================================
          TRADITIONAL BACKGROUND DECORATION
      ========================================================= */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-24 h-72 w-72 rounded-full bg-[#d9ead7]/45 blur-3xl" />

        <div className="absolute -right-32 top-10 h-80 w-80 rounded-full bg-[#ead8ad]/35 blur-3xl" />

        <div className="absolute left-1/2 top-[520px] h-96 w-96 -translate-x-1/2 rounded-full bg-[#e5efdf]/30 blur-3xl" />

        {/* subtle mandala-style rings */}
        <div className="absolute left-8 top-28 hidden h-36 w-36 rounded-full border border-[#c49a4a]/15 lg:block">
          <div className="absolute inset-4 rounded-full border border-[#c49a4a]/15" />
          <div className="absolute inset-8 rounded-full border border-[#c49a4a]/15" />
        </div>

        <div className="absolute right-8 top-[620px] hidden h-40 w-40 rounded-full border border-[#2f6345]/10 lg:block">
          <div className="absolute inset-4 rounded-full border border-[#2f6345]/10" />
          <div className="absolute inset-8 rounded-full border border-[#2f6345]/10" />
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl space-y-12 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">

        {/* =========================================================
            HERO
        ========================================================= */}

        <div className="mx-auto max-w-4xl text-center">
          {/* Spiritual eyebrow */}
          <div className="mb-5 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-[#c49a4a]/60" />

            <div className="flex items-center gap-2 rounded-full border border-[#d7c08b]/60 bg-[#fffaf0]/80 px-4 py-1.5 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-[#b38732]" />

              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#765a27] sm:text-xs">
                Seva • Sanskar • Samarpan
              </span>
            </div>

            <span className="h-px w-10 bg-[#c49a4a]/60" />
          </div>

          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#b9d2bd] bg-[#eef6ed] px-3.5 py-1.5 text-xs font-semibold text-[#28583b] shadow-sm">
            <HeartHandshake className="h-3.5 w-3.5" />
            Community Service & Seva
          </div>

          <h1 className="font-serif text-3xl font-bold leading-[1.15] tracking-tight text-[#263c2d] sm:text-4xl lg:text-[46px]">
            Join the Volunteer
            <span className="block text-[#2f6847]">
              & Seva Network
            </span>
          </h1>

          {/* Traditional divider */}
          <div className="my-5 flex items-center justify-center gap-2">
            <span className="h-px w-12 bg-[#c49a4a]/50" />

            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#c49a4a]/40 bg-[#fffaf0]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#b38732]" />
            </span>

            <span className="h-px w-12 bg-[#c49a4a]/50" />
          </div>

          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-[#667267] sm:text-base">
            Be the eyes and hands of transparent philanthropy. Assist in
            verified field audits, mentor students in rural classrooms, or
            coordinate community service initiatives across Nashik.
          </p>

          {/* Nashik traditional location */}
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#ded4bf] bg-[#fffdf8]/80 px-4 py-2 text-xs font-medium text-[#756b5b] shadow-sm">
            <MapPin className="h-3.5 w-3.5 text-[#a77a2e]" />
            Nashik • Maharashtra
          </div>
        </div>

        {/* =========================================================
            ACADEMIC / SEVA NOTE
        ========================================================= */}

        <div className="relative overflow-hidden rounded-3xl border border-[#e0c98f]/70 bg-gradient-to-r from-[#fff8e8] via-[#fffdf5] to-[#f3f7ee] p-5 shadow-[0_12px_35px_rgba(82,67,35,0.07)] sm:p-6">
          <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-[#d9c078]/15" />

          <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#dec788] bg-[#f6e9c5] text-[#886522]">
                <GraduationCap className="h-5 w-5" />
              </div>

              <div className="text-xs leading-relaxed text-[#695c43] sm:text-sm">
                <strong className="text-[#57451f]">
                  Academic Volunteer Drive:
                </strong>{" "}
                College students can earn certified social immersion hours
                upon task completion. Verified citations are issued through
                the Trust registry.
              </div>
            </div>

            <div className="shrink-0 rounded-full border border-[#cdddcf] bg-white/70 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#356246]">
              Seva Opportunity
            </div>
          </div>
        </div>

        {/* =========================================================
            ROLES
        ========================================================= */}

        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="h-px w-7 bg-[#c49a4a]" />

                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#97722e]">
                  Serve With Purpose
                </span>
              </div>

              <h2 className="font-serif text-2xl font-bold text-[#293d30] sm:text-3xl">
                Open Volunteer Opportunities
              </h2>

              <p className="mt-1 text-xs text-[#777b72]">
                Choose a role where your time and skills can create meaningful
                community impact.
              </p>
            </div>

            <span className="rounded-full border border-[#d7dfd4] bg-[#fffdf8] px-3 py-1.5 text-xs font-medium text-[#697369] shadow-sm">
              {isLoadingRoles
                ? "Loading positions..."
                : `${roles.length} active positions`}
            </span>
          </div>

          {/* Loading */}
          {isLoadingRoles ? (
            <div className="rounded-3xl border border-[#e0ddd4] bg-[#fffdf8]/80 py-16 text-center shadow-sm">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#36704d]" />

              <p className="mt-3 text-xs font-medium text-[#777d74]">
                Fetching active opportunities from trust registry...
              </p>
            </div>
          ) : fetchError ? (
            <div className="rounded-3xl border border-red-200 bg-red-50/80 p-6 text-center">
              <AlertCircle className="mx-auto h-6 w-6 text-red-600" />

              <p className="mt-2 text-xs text-red-700">{fetchError}</p>

              <Button
                size="sm"
                variant="outline"
                onClick={loadRoles}
                className="mt-3"
              >
                Retry Loading
              </Button>
            </div>
          ) : roles.length === 0 ? (
            <div className="rounded-3xl border border-[#dedbd1] bg-[#fffdf8] py-16 text-center shadow-sm">
              <Users className="mx-auto h-10 w-10 text-[#a9aaa2]" />

              <h3 className="mt-3 font-serif text-base font-bold text-[#38443b]">
                No Open Volunteer Openings At This Time
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-[#777b74]">
                All current seva positions are fully staffed. Please check
                back soon or register with the trust for upcoming community
                events.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {roles.map((role) => (
                <div
                  key={role.id || role._id}
                  className="group relative overflow-hidden rounded-[1.7rem] border border-[#dfe3da] bg-[#fffdf8] p-6 shadow-[0_10px_30px_rgba(58,70,55,0.07)] transition-all duration-300 hover:-translate-y-1 hover:border-[#9dbba4] hover:shadow-[0_18px_42px_rgba(58,70,55,0.12)] sm:p-7"
                >
                  {/* top decorative line */}
                  <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-[#2f6847] via-[#c49a4a] to-[#2f6847] opacity-70" />

                  {/* subtle background circle */}
                  <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#edf4ea] opacity-70 transition-transform duration-500 group-hover:scale-125" />

                  <div className="relative space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="inline-flex rounded-full border border-[#c8dccb] bg-[#edf5ee] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#356246]">
                          {role.department}
                        </span>

                        <h3 className="mt-2 font-serif text-lg font-bold leading-snug text-[#293b30]">
                          {role.title}
                        </h3>
                      </div>

                      {role.isKumbhRelated && (
                        <span className="shrink-0 rounded-full border border-[#e1c36e] bg-[#fff2ca] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-[#76591f]">
                          Kumbh 2027
                        </span>
                      )}
                    </div>

                    <p className="text-xs leading-relaxed text-[#69736b] sm:text-sm">
                      {role.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#eee9dd] pt-3 text-xs text-[#777d75]">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Clock className="h-3.5 w-3.5 text-[#b18434]" />
                        {role.commitment}
                      </span>

                      <span className="flex items-center gap-1.5 font-medium">
                        <MapPin className="h-3.5 w-3.5 text-[#397052]" />
                        {role.location}
                      </span>

                      <span className="rounded-full border border-[#cce0ce] bg-[#eef6ee] px-2 py-0.5 font-semibold text-[#356246]">
                        {role.spotsAvailable} open slots
                      </span>
                    </div>

                    {/* Requirements */}
                    {role.requirements &&
                      role.requirements.length > 0 && (
                        <div className="space-y-2 border-t border-[#eee9dd] pt-3">
                          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8a887f]">
                            Candidate Profile
                          </span>

                          <ul className="space-y-1.5 text-xs text-[#687169]">
                            {role.requirements.map((req, idx) => (
                              <li
                                key={idx}
                                className="flex items-center gap-2"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#4b805c]" />
                                <span>{req}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </div>

                  <div className="relative pt-5">
                    <Button
                      size="sm"
                      variant="primary"
                      className="group/btn w-full rounded-xl bg-[#2f6847] py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#24583b] hover:shadow-md"
                      onClick={() => handleApplyClick(role)}
                    >
                      <span>Apply for this Seva Role</span>

                      <ArrowRight className="ml-2 h-3.5 w-3.5 transition-transform duration-200 group-hover/btn:translate-x-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* =========================================================
            BOTTOM SPIRITUAL SEVA STRIP
        ========================================================= */}

        <div className="relative overflow-hidden rounded-[2rem] border border-[#d7dfd4] bg-gradient-to-br from-[#edf5ed] via-[#fffdf7] to-[#f5ead2] px-6 py-8 text-center shadow-[0_15px_40px_rgba(60,75,58,0.08)] sm:px-10">
          <div className="absolute left-1/2 top-0 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d9e8d9]/50 blur-2xl" />

          <div className="relative">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-[#d7c58e] bg-[#fff7df] text-[#a47a2e] shadow-sm">
              <HeartHandshake className="h-5 w-5" />
            </div>

            <p className="mt-4 font-serif text-lg font-bold text-[#2d4835]">
              सेवा हीच साधना
            </p>

            <p className="mx-auto mt-1 max-w-xl text-xs leading-relaxed text-[#72786f] sm:text-sm">
              Every helping hand becomes part of a larger journey of
              compassion, dignity and community transformation.
            </p>

            <div className="mt-4 flex items-center justify-center gap-2">
              <span className="h-px w-8 bg-[#c49a4a]/50" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#b38732]" />
              <span className="h-px w-8 bg-[#c49a4a]/50" />
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          APPLICATION MODAL
      ========================================================= */}

      {selectedRole && (
        <Modal
          isOpen={!!selectedRole}
          onClose={() => setSelectedRole(null)}
          title={`Volunteer Application: ${selectedRole.title}`}
          description={`Applying for ${selectedRole.department} (${selectedRole.commitment})`}
          size="lg"
        >
          {submitted ? (
            <div className="space-y-4 py-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#b9d5bf] bg-[#edf6ee] text-[#2f6847]">
                <CheckCircle2 className="h-7 w-7" />
              </div>

              <h3 className="font-serif text-xl font-bold text-[#2d4034]">
                Application Pledged!
              </h3>

              <p className="mx-auto max-w-md text-xs leading-relaxed text-[#6d756e]">
                Thank you,{" "}
                <strong className="text-[#304d39]">
                  {fullName || "Volunteer"}
                </strong>
                ! Your application for{" "}
                <strong className="text-[#304d39]">
                  {selectedRole.title}
                </strong>{" "}
                has been logged into the trust volunteer registry.
              </p>

              <div className="mx-auto max-w-sm rounded-xl border border-[#c6ddc9] bg-[#eff7ef] p-3 text-xs leading-relaxed text-[#42614b]">
                Application logged in real MongoDB database. Our volunteer
                coordinator will review and contact you at {email}.
              </div>

              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedRole(null)}
                >
                  Close Window
                </Button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmitApplication}
              className="space-y-4 text-xs sm:text-sm"
            >
              {submitError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                  {submitError}
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-semibold text-[#59625b]">
                    Full Name
                  </label>

                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Pooja Shinde"
                    className="w-full rounded-xl border border-[#dddcd3] bg-[#faf9f4] px-3.5 py-2.5 text-xs text-[#303a33] transition-all placeholder:text-[#aaa99f] focus:border-[#4b805c] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4b805c]/10 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-semibold text-[#59625b]">
                    Email Address
                  </label>

                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="pooja@example.com"
                    className="w-full rounded-xl border border-[#dddcd3] bg-[#faf9f4] px-3.5 py-2.5 text-xs text-[#303a33] transition-all placeholder:text-[#aaa99f] focus:border-[#4b805c] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4b805c]/10 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-semibold text-[#59625b]">
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-xl border border-[#dddcd3] bg-[#faf9f4] px-3.5 py-2.5 text-xs text-[#303a33] transition-all placeholder:text-[#aaa99f] focus:border-[#4b805c] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4b805c]/10 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-semibold text-[#59625b]">
                    City / Region
                  </label>

                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Nashik / Nashik Rural"
                    className="w-full rounded-xl border border-[#dddcd3] bg-[#faf9f4] px-3.5 py-2.5 text-xs text-[#303a33] transition-all placeholder:text-[#aaa99f] focus:border-[#4b805c] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4b805c]/10 sm:text-sm"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-[#e5dfcf] bg-[#fffaf0] p-3.5">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="collegeStudent"
                    checked={isCollegeStudent}
                    onChange={(e) =>
                      setIsCollegeStudent(e.target.checked)
                    }
                    className="h-4 w-4 rounded border-[#c9c6bc] text-[#2f6847] focus:ring-[#2f6847]"
                  />

                  <label
                    htmlFor="collegeStudent"
                    className="cursor-pointer text-xs font-medium text-[#5d645d]"
                  >
                    I am a college/university student seeking NSS /
                    community service credits
                  </label>
                </div>

                {isCollegeStudent && (
                  <div className="mt-2.5">
                    <input
                      type="text"
                      placeholder="College / Institute Name..."
                      value={collegeName}
                      onChange={(e) => setCollegeName(e.target.value)}
                      className="w-full rounded-xl border border-[#dddcd3] bg-white px-3.5 py-2 text-xs text-[#303a33] focus:border-[#4b805c] focus:outline-none focus:ring-2 focus:ring-[#4b805c]/10"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="mb-1 block font-semibold text-[#59625b]">
                  Why do you wish to volunteer with Icchapurti Riddhi Siddhi
                  Vinayak Charitable Trust?
                </label>

                <textarea
                  rows={4}
                  required
                  value={motivation}
                  onChange={(e) => setMotivation(e.target.value)}
                  placeholder="Share any past experience or why community service matters to you..."
                  className="w-full resize-none rounded-xl border border-[#dddcd3] bg-[#faf9f4] px-3.5 py-2.5 text-xs text-[#303a33] transition-all placeholder:text-[#aaa99f] focus:border-[#4b805c] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4b805c]/10"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-[#ece9df] pt-4">
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
                  leftIcon={<Send className="h-3.5 w-3.5" />}
                  className="bg-[#2f6847] text-white hover:bg-[#24583b]"
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