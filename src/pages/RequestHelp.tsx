import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  HeartHandshake,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  Loader2,
  Copy,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Info,
} from "lucide-react";
import { Button } from "@/src/components/common/Button";
import { useAuth } from "@/src/context/AuthContext";
import { useLanguage } from "@/src/context/LanguageContext";
import {
  helpRequestService,
  CreateHelpRequestData,
} from "@/src/services/helpRequestService";
import {
  HelpRequest,
  HelpRequestType,
  HelpUrgency,
  HelpRequestStatus,
} from "@/src/types";
import { formatDate } from "@/src/lib/utils";
import { SEO } from "@/src/components/common/SEO";

export const RequestHelp: React.FC = () => {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState<"apply" | "track" | "my-requests">("apply");

  // Apply Form State
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [email, setEmail] = useState(user?.email || "");
  const [requestType, setRequestType] = useState<HelpRequestType>("Medical");
  const [urgency, setUrgency] = useState<HelpUrgency>("MEDIUM");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdRequest, setCreatedRequest] = useState<HelpRequest | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Track State
  const [searchId, setSearchId] = useState("");
  const [trackedRequest, setTrackedRequest] = useState<HelpRequest | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [trackError, setTrackError] = useState<string | null>(null);

  // My Requests State
  const [myRequests, setMyRequests] = useState<HelpRequest[]>([]);
  const [isLoadingMyRequests, setIsLoadingMyRequests] = useState(false);
  const [myRequestsError, setMyRequestsError] = useState<string | null>(null);

  // Update prefill when user state loads
  useEffect(() => {
    if (user) {
      if (!name) setName(user.name || "");
      if (!email) setEmail(user.email || "");
      if (!phone && user.phone) setPhone(user.phone);
    }
  }, [user]);

  // Load user's requests when opening "my-requests" tab or if logged in
  const fetchUserRequests = async () => {
    if (!isAuthenticated) return;
    try {
      setIsLoadingMyRequests(true);
      setMyRequestsError(null);
      const data = await helpRequestService.getMyHelpRequests();
      setMyRequests(data);
    } catch (err: any) {
      console.error("Failed to load user help requests:", err);
      setMyRequestsError(err.message || "Failed to load your assistance records.");
    } finally {
      setIsLoadingMyRequests(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserRequests();
    }
  }, [isAuthenticated, activeTab]);

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setSubmitError("Please sign in or register before submitting an application.");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const payload: CreateHelpRequestData = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        requestType,
        urgency,
        location: location.trim(),
        description: description.trim(),
      };

      const result = await helpRequestService.createHelpRequest(payload);
      setCreatedRequest(result);
      // Refresh my requests list in background
      fetchUserRequests();
    } catch (err: any) {
      console.error("Failed to submit help request:", err);
      setSubmitError(err.message || "Unable to submit your application. Please check all fields.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTrackSubmit = async (e?: React.FormEvent, directId?: string) => {
    if (e) e.preventDefault();
    const targetId = (directId || searchId).trim();
    if (!targetId) return;

    try {
      setIsTracking(true);
      setTrackError(null);
      setTrackedRequest(null);
      const req = await helpRequestService.getHelpRequestById(targetId);
      setTrackedRequest(req);
    } catch (err: any) {
      console.error("Failed to track help request:", err);
      if (err.status === 403 || err.message?.includes("Forbidden")) {
        setTrackError("Access Restricted: Under beneficiary privacy policy, only the applicant or Trust administrators can access this docket.");
      } else if (err.status === 404 || err.message?.includes("not found")) {
        setTrackError("Request Docket not found. Please verify the 24-character ID.");
      } else if (err.status === 401) {
        setTrackError("Please log in to your account to view this tracking record.");
      } else {
        setTrackError(err.message || "Unable to retrieve tracking record at this time.");
      }
    } finally {
      setIsTracking(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const getUrgencyBadge = (u: HelpUrgency) => {
    switch (u) {
      case "CRITICAL":
        return "bg-rose-100 text-rose-800 border-rose-200 font-semibold";
      case "HIGH":
        return "bg-orange-100 text-orange-800 border-orange-200 font-semibold";
      case "MEDIUM":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "LOW":
      default:
        return "bg-stone-100 text-stone-700 border-stone-200";
    }
  };

  const getStatusBadge = (s: HelpRequestStatus) => {
    switch (s) {
      case "APPROVED":
        return "bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold";
      case "RESOLVED":
      case "CLOSED":
        return "bg-teal-100 text-teal-800 border-teal-300 font-semibold";
      case "IN_PROGRESS":
        return "bg-sky-100 text-sky-800 border-sky-300 font-semibold";
      case "UNDER_REVIEW":
        return "bg-amber-100 text-amber-900 border-amber-300 font-semibold";
      case "REJECTED":
        return "bg-rose-100 text-rose-800 border-rose-300 font-semibold";
      case "PENDING":
      default:
        return "bg-stone-100 text-stone-700 border-stone-300";
    }
  };

  // Status Lifecycle Progression Steps
  const getLifecycleSteps = (status: HelpRequestStatus) => {
    const isRejected = status === "REJECTED";
    return [
      {
        id: "step-1",
        label: "Registered",
        sub: "Application Filed",
        active: true,
        done: true,
      },
      {
        id: "step-2",
        label: "Field Review",
        sub: "Secretariat Assessment",
        active: ["UNDER_REVIEW", "APPROVED", "REJECTED", "IN_PROGRESS", "RESOLVED", "CLOSED"].includes(status),
        done: ["APPROVED", "REJECTED", "IN_PROGRESS", "RESOLVED", "CLOSED"].includes(status),
      },
      {
        id: "step-3",
        label: isRejected ? "Declined" : "Sanctioned",
        sub: isRejected ? "Criteria Not Met" : "Trust Board Sanction",
        active: ["APPROVED", "REJECTED", "IN_PROGRESS", "RESOLVED", "CLOSED"].includes(status),
        done: ["IN_PROGRESS", "RESOLVED", "CLOSED"].includes(status) || isRejected,
        isError: isRejected,
      },
      {
        id: "step-4",
        label: "Disbursal",
        sub: "Aid Provided & Closed",
        active: ["IN_PROGRESS", "RESOLVED", "CLOSED"].includes(status),
        done: ["RESOLVED", "CLOSED"].includes(status),
      },
    ];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3.5 py-1 rounded-full text-xs font-semibold border border-emerald-200 shadow-2xs">
          <HeartHandshake className="w-3.5 h-3.5 text-emerald-700" />
          <span>Direct Beneficiary Assistance Program</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-serif font-bold text-stone-900 tracking-tight leading-[1.15]">
          {t.helpRequest?.title || "Community Aid & Hardship Assistance Portal"}
        </h1>

        {/* Warm Subtle Decorative Divider */}
        <div className="flex items-center justify-center gap-2 mt-3.5 mb-2">
          <span className="w-8 h-px bg-amber-400/60" />
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span className="w-8 h-px bg-amber-400/60" />
        </div>

        <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-2xl mx-auto">
          {t.helpRequest?.subtitle ||
            "Families facing medical emergencies, educational fees, or urgent nutrition needs can submit applications for verified trust assistance."}
        </p>
      </div>

      {/* Tabs Switcher */}
      <div className="flex justify-center">
        <div className="inline-flex p-1 bg-stone-100 rounded-full border border-stone-200 text-xs sm:text-sm">
          <button
            type="button"
            onClick={() => {
              setActiveTab("apply");
              setCreatedRequest(null);
            }}
            className={`px-5 py-2 rounded-full font-semibold transition-all cursor-pointer ${
              activeTab === "apply"
                ? "bg-white text-emerald-900 shadow-xs border border-stone-200/80"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            {t.helpRequest?.applyTab || "Submit Aid Application"}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("track")}
            className={`px-5 py-2 rounded-full font-semibold transition-all cursor-pointer ${
              activeTab === "track"
                ? "bg-white text-emerald-900 shadow-xs border border-stone-200/80"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            {t.helpRequest?.trackTab || "Track Application Status"}
          </button>
          {isAuthenticated && (
            <button
              type="button"
              onClick={() => setActiveTab("my-requests")}
              className={`px-5 py-2 rounded-full font-semibold transition-all cursor-pointer ${
                activeTab === "my-requests"
                  ? "bg-white text-emerald-900 shadow-xs border border-stone-200/80"
                : "text-stone-600 hover:text-stone-900"
              }`}
            >
              {t.helpRequest?.myRequestsTab || "My Submitted Requests"}
              {myRequests.length > 0 && (
                <span className="ml-1.5 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  {myRequests.length}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: APPLY FORM */}
      {activeTab === "apply" && (
        <div className="max-w-3xl mx-auto">
          {!isAuthenticated ? (
            <div className="bg-white p-8 sm:p-12 rounded-xl border border-stone-200 shadow-2xs text-center space-y-6">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto border border-emerald-200">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div className="space-y-2 max-w-md mx-auto">
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                  {t.helpRequest?.loginRequiredTitle || "Authentication Required to Apply for Aid"}
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {t.helpRequest?.loginRequiredDesc ||
                    "To protect beneficiary identity, prevent duplicate requests, and provide real-time tracking, please log in or create an account."}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link to="/login?redirect=/request-help">
                  <Button size="md" className="bg-[#14532d] hover:bg-[#0f4023] text-white px-6 font-medium">
                    {t.helpRequest?.loginBtn || "Log In to Continue"}
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="md" variant="outline" className="px-6 border-stone-300">
                    {t.helpRequest?.registerBtn || "Create New Account"}
                  </Button>
                </Link>
              </div>
            </div>
          ) : createdRequest ? (
            <div className="bg-white p-8 sm:p-12 rounded-xl border border-stone-200 shadow-2xs text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div className="space-y-2 max-w-md mx-auto">
                <h2 className="text-2xl font-serif font-bold text-stone-900">
                  {t.helpRequest?.submittedSuccess || "Help Request Submitted Successfully"}
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {t.helpRequest?.submittedSuccessDesc ||
                    "Your application has been received into our system. Your unique Tracking ID is displayed below."}
                </p>
              </div>

              {/* Docket ID Box */}
              <div className="max-w-md mx-auto bg-stone-50 border border-stone-300 rounded-lg p-4 space-y-2">
                <span className="text-[11px] font-mono text-stone-500 uppercase tracking-wider block">
                  Docket Tracking Identifier
                </span>
                <div className="flex items-center justify-center gap-2">
                  <span className="font-mono text-base sm:text-lg font-bold text-emerald-900 break-all select-all">
                    {createdRequest.id}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(createdRequest.id)}
                    className="p-1.5 text-stone-500 hover:text-emerald-800 transition-colors cursor-pointer rounded hover:bg-stone-200"
                    title="Copy Request ID"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                {copiedId && (
                  <span className="text-[11px] text-emerald-700 font-semibold block">
                    Copied to clipboard!
                  </span>
                )}
              </div>

              <div className="text-xs text-stone-500 max-w-sm mx-auto">
                Our social welfare desk will verify the details within 48 to 72 working hours.
              </div>

              <div className="pt-2 flex flex-wrap justify-center gap-3">
                <Button
                  size="md"
                  className="bg-[#14532d] hover:bg-[#0f4023] text-white font-medium"
                  onClick={() => {
                    setSearchId(createdRequest.id);
                    setActiveTab("track");
                    handleTrackSubmit(undefined, createdRequest.id);
                  }}
                >
                  Track Status Now
                </Button>
                <Button
                  size="md"
                  variant="outline"
                  onClick={() => {
                    setCreatedRequest(null);
                    setActiveTab("my-requests");
                  }}
                >
                  View My Applications
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 sm:p-10 rounded-xl border border-stone-200 shadow-2xs space-y-6">
              {submitError && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{submitError}</span>
                </div>
              )}

              <form onSubmit={handleApplySubmit} className="space-y-5 text-xs sm:text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-stone-800 mb-1">
                      {t.helpRequest?.fullName || "Full Name (Applicant / Beneficiary)"} *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ramesh S. Patil"
                      className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-800 mb-1">
                      {t.helpRequest?.phone || "Contact Phone Number"} *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98200 00000"
                      className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-stone-800 mb-1">
                      {t.helpRequest?.email || "Email Address"} *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ramesh@example.com"
                      className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-800 mb-1">
                      {t.helpRequest?.requestType || "Category of Assistance"} *
                    </label>
                    <select
                      value={requestType}
                      onChange={(e) => setRequestType(e.target.value as HelpRequestType)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-white"
                    >
                      <option value="Medical">{t.helpRequest?.typeMedical || "Medical Hardship"}</option>
                      <option value="Education">{t.helpRequest?.typeEducation || "Education Support"}</option>
                      <option value="Food">{t.helpRequest?.typeFood || "Food Relief"}</option>
                      <option value="Shelter">{t.helpRequest?.typeShelter || "Shelter & Housing"}</option>
                      <option value="Emergency">{t.helpRequest?.typeEmergency || "Emergency Disaster"}</option>
                      <option value="Other">{t.helpRequest?.typeOther || "Other Hardship"}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-800 mb-1">
                      {t.helpRequest?.urgency || "Urgency Level"} *
                    </label>
                    <select
                      value={urgency}
                      onChange={(e) => setUrgency(e.target.value as HelpUrgency)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-white"
                    >
                      <option value="LOW">{t.helpRequest?.urgencyLow || "Low Priority"}</option>
                      <option value="MEDIUM">{t.helpRequest?.urgencyMedium || "Standard"}</option>
                      <option value="HIGH">{t.helpRequest?.urgencyHigh || "Urgent"}</option>
                      <option value="CRITICAL">{t.helpRequest?.urgencyCritical || "Critical Emergency"}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-stone-800 mb-1">
                    {t.helpRequest?.location || "Location / Address (City, Taluka, District)"} *
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Panchavati, Nashik District, Maharashtra"
                    className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-800 mb-1">
                    {t.helpRequest?.description || "Detailed Description of Hardship & Assistance Needed"} *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Please explain the situation, medical condition, hospital name, or school/college details, and exact nature of assistance required..."
                    className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                  <span className="text-[11px] text-stone-500 block mt-1">
                    Minimum 10 characters. Please be accurate so our verification team can assist promptly.
                  </span>
                </div>

                <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-stone-200">
                  <div className="flex items-center gap-2 text-[11px] text-stone-500">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Protected under beneficiary data privacy. Records remain confidential.</span>
                  </div>
                  <Button
                    type="submit"
                    size="md"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto bg-[#14532d] hover:bg-[#0f4023] text-white font-semibold"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        {t.helpRequest?.submitting || "Submitting..."}
                      </>
                    ) : (
                      t.helpRequest?.submitApplication || "Submit Application"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TRACK STATUS */}
      {activeTab === "track" && (
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Quick tracker search form */}
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-stone-200 shadow-2xs space-y-4">
            <div className="space-y-1">
              <h2 className="text-base sm:text-lg font-serif font-bold text-stone-900">
                {t.helpRequest?.trackTitle || "Track Application Status"}
              </h2>
              <p className="text-xs text-stone-600">
                {t.helpRequest?.trackSubtitle ||
                  "Enter your 24-character Request ID to check field verification and board sanction stage."}
              </p>
            </div>

            <form
              onSubmit={(e) => handleTrackSubmit(e)}
              className="flex flex-col sm:flex-row gap-2 items-center"
            >
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  placeholder={t.helpRequest?.enterRequestId || "Enter 24-character Help Request ID..."}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm text-stone-800 placeholder-stone-400 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>
              <Button
                type="submit"
                size="md"
                disabled={isTracking || !searchId.trim()}
                className="w-full sm:w-auto bg-[#14532d] hover:bg-[#0f4023] text-white font-medium px-6 shrink-0"
              >
                {isTracking ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {t.helpRequest?.tracking || "Checking..."}
                  </>
                ) : (
                  t.helpRequest?.trackButton || "Track Docket"
                )}
              </Button>
            </form>

            {/* Quick picker if user has existing requests */}
            {isAuthenticated && myRequests.length > 0 && (
              <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center gap-2 text-xs text-stone-600">
                <span className="font-semibold text-stone-700">Your recent requests:</span>
                {myRequests.slice(0, 3).map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      setSearchId(r.id);
                      handleTrackSubmit(undefined, r.id);
                    }}
                    className="font-mono text-[11px] bg-stone-100 hover:bg-emerald-50 hover:text-emerald-900 border border-stone-200 px-2 py-1 rounded transition-colors cursor-pointer"
                  >
                    {r.id.substring(0, 8)}... ({r.requestType})
                  </button>
                ))}
              </div>
            )}
          </div>

          {trackError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{trackError}</span>
            </div>
          )}

          {trackedRequest && (
            <div className="bg-white p-6 sm:p-8 rounded-xl border border-stone-200 shadow-2xs space-y-6">
              {/* Token Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
                <div>
                  <span className="text-[11px] font-mono text-stone-500 uppercase tracking-wider block">
                    Aid Application Docket ID
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg sm:text-xl font-mono font-bold text-emerald-900 break-all">
                      {trackedRequest.id}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(trackedRequest.id)}
                      className="p-1 text-stone-400 hover:text-stone-700 rounded"
                      title="Copy ID"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs px-2.5 py-1 rounded border font-medium bg-stone-50 text-stone-700 border-stone-200">
                    {trackedRequest.requestType}
                  </span>
                  <span className={`text-xs px-2.5 py-1 rounded border ${getUrgencyBadge(trackedRequest.urgency)}`}>
                    {trackedRequest.urgency}
                  </span>
                  <span className={`text-xs px-2.5 py-1 rounded border ${getStatusBadge(trackedRequest.status)}`}>
                    {trackedRequest.status}
                  </span>
                </div>
              </div>

              {/* Progress Step Indicator */}
              <div className="py-2 space-y-3">
                <div className="text-xs font-semibold text-stone-700">
                  Application Lifecycle Progress
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {getLifecycleSteps(trackedRequest.status).map((step, idx) => (
                    <div
                      key={step.id}
                      className={`p-3 rounded-lg border text-left space-y-1 transition-all ${
                        step.isError
                          ? "bg-rose-50 border-rose-200 text-rose-900"
                          : step.done
                          ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                          : step.active
                          ? "bg-amber-50 border-amber-200 text-amber-950"
                          : "bg-stone-50 border-stone-200 text-stone-400"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span>{step.label}</span>
                        {step.done && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />}
                      </div>
                      <div className="text-[11px] opacity-80">{step.sub}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Applicant & Request Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-stone-50/70 p-4 rounded-lg border border-stone-200 text-xs">
                <div className="space-y-1.5">
                  <span className="text-stone-500 font-medium">Applicant Details</span>
                  <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-stone-500" />
                    <span>{trackedRequest.name}</span>
                  </div>
                  <div className="text-stone-600 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-stone-500" />
                    <span>{trackedRequest.phone}</span>
                  </div>
                  <div className="text-stone-600 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-stone-500" />
                    <span>{trackedRequest.location}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-stone-500 font-medium">Filing & Audit Information</span>
                  <div className="text-stone-700 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-stone-500" />
                    <span>Submitted: {formatDate(trackedRequest.createdAt)}</span>
                  </div>
                  {trackedRequest.reviewedAt && (
                    <div className="text-stone-700 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-stone-500" />
                      <span>Reviewed: {formatDate(trackedRequest.reviewedAt)}</span>
                    </div>
                  )}
                  {trackedRequest.resolvedAt && (
                    <div className="text-emerald-800 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Resolved: {formatDate(trackedRequest.resolvedAt)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Hardship Description */}
              <div className="space-y-1 text-xs">
                <span className="text-stone-500 font-medium block">Hardship Description</span>
                <p className="text-stone-800 leading-relaxed bg-stone-50 p-3.5 rounded border border-stone-200">
                  {trackedRequest.description}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MY SUBMITTED REQUESTS */}
      {activeTab === "my-requests" && isAuthenticated && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif font-bold text-stone-900">
              {t.helpRequest?.myRequestsTab || "My Submitted Requests"}
            </h2>
            <Button
              size="sm"
              variant="outline"
              onClick={fetchUserRequests}
              disabled={isLoadingMyRequests}
            >
              {isLoadingMyRequests ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                "Refresh"
              )}
            </Button>
          </div>

          {isLoadingMyRequests ? (
            <div className="py-16 text-center text-stone-500 text-xs flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-700" />
              <span>Loading your aid applications...</span>
            </div>
          ) : myRequestsError ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{myRequestsError}</span>
              </div>
              <Button size="sm" variant="outline" onClick={fetchUserRequests} className="shrink-0">
                Retry
              </Button>
            </div>
          ) : myRequests.length === 0 ? (
            <div className="bg-white p-10 rounded-xl border border-stone-200 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="text-base font-semibold text-stone-900">
                  {t.helpRequest?.noPersonalRequests || "No Aid Applications Found"}
                </h3>
                <p className="text-xs text-stone-500">
                  {t.helpRequest?.noPersonalRequestsDesc ||
                    "You haven't submitted any hardship or community assistance applications yet."}
                </p>
              </div>
              <Button
                size="sm"
                className="bg-[#14532d] hover:bg-[#0f4023] text-white"
                onClick={() => setActiveTab("apply")}
              >
                Submit an Application
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {myRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs hover:border-stone-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-900">
                        {req.id}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded font-medium bg-stone-100 text-stone-700">
                        {req.requestType}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded border ${getUrgencyBadge(req.urgency)}`}>
                        {req.urgency}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded border ${getStatusBadge(req.status)}`}>
                        {req.status}
                      </span>
                    </div>

                    <p className="text-xs text-stone-600 line-clamp-2">
                      {req.description}
                    </p>

                    <div className="flex items-center gap-4 text-[11px] text-stone-500">
                      <span>Location: {req.location}</span>
                      <span>•</span>
                      <span>Filed on {formatDate(req.createdAt)}</span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0 border-stone-300 hover:bg-stone-50 text-xs"
                    onClick={() => {
                      setSearchId(req.id);
                      setActiveTab("track");
                      handleTrackSubmit(undefined, req.id);
                    }}
                  >
                    Track Docket
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
