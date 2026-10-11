import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  FileCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building,
  Users,
  Search,
  Check,
  ExternalLink,
  Flame,
  Settings,
  HeartHandshake,
  Receipt,
  Eye,
  Sliders,
  ToggleLeft,
  ToggleRight,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Archive,
  RefreshCw,
  Loader2,
  Layers,
  Calendar,
  MapPin,
  UserCheck,
  Newspaper,
  EyeOff,
  Star,
  BookOpen,
  FileText,
  BarChart3,
  TrendingUp,
  Coins,
  Activity,
  Bell,
} from "lucide-react";
import { NotificationFeed } from "@/src/components/common/NotificationFeed";
import {
  TRUST_INFO,
} from "@/src/data/mockData";
import { Cause, CauseCategory, HelpRequest, HelpRequestType, HelpUrgency, HelpRequestStatus, EventItem, EventRegistrationItem, EventStatus, DonationRecord, BlogPost, TransparencyReport, VolunteerShift } from "@/src/types";
import { causeService } from "@/src/services/causeService";
import { eventService } from "@/src/services/eventService";
import { volunteerService } from "@/src/services/volunteerService";
import { DonationService } from "@/src/services/donationService";
import { blogService } from "@/src/services/blogService";
import { transparencyService, CreateTransparencyInput } from "@/src/services/transparencyService";
import { helpRequestService, AdminHelpRequestMetrics } from "@/src/services/helpRequestService";
import { adminService, AdminDashboardSummary, AdminActivityItem } from "@/src/services/adminService";
import { Button } from "@/src/components/common/Button";
import { Modal } from "@/src/components/common/Modal";
import { TrustManagementTab } from "@/src/components/admin/TrustManagementTab";
import { UsersManagementTab } from "@/src/components/admin/UsersManagementTab";
import { PushNotificationToggle } from "@/src/components/common/PushNotificationToggle";
import { FileUploadField } from "@/src/components/common/FileUploadField";
import { useLanguage } from "@/src/context/LanguageContext";
import { useKumbhMode } from "@/src/context/KumbhModeContext";
import { useTheme } from "@/src/context/ThemeContext";
import { useAuth } from "@/src/context/AuthContext";
import { formatCurrency, formatDate } from "@/src/lib/utils";

interface AuditQueueItem {
  id: string;
  passportId: string;
  causeTitle: string;
  stageToVerify: string;
  amount: string;
  vendorDoc: string;
  submittedBy: string;
  date: string;
  status: "Pending Audit" | "Verified & Stamped";
}

const INITIAL_QUEUE: AuditQueueItem[] = [];

export const AdminDashboard: React.FC = () => {
  const { t } = useLanguage();
  const { isKumbhMode, toggleKumbhMode, kumbhConfig } = useKumbhMode();
  const { highContrast, toggleHighContrast } = useTheme();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<"overview" | "audits" | "causes" | "events" | "blog" | "transparency" | "help" | "volunteers" | "donations" | "notifications" | "trust" | "users" | "settings">("overview");
  const [queue, setQueue] = useState<AuditQueueItem[]>(INITIAL_QUEUE);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Real MongoDB Summary Metrics State
  const [summaryData, setSummaryData] = useState<AdminDashboardSummary | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState<boolean>(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [isUpdatingKumbh, setIsUpdatingKumbh] = useState<boolean>(false);
  const [kumbhSyncMsg, setKumbhSyncMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchDashboardSummary = useCallback(async () => {
    setIsSummaryLoading(true);
    setSummaryError(null);
    try {
      const data = await adminService.getDashboardSummary();
      setSummaryData(data);
    } catch (err: any) {
      console.error("Failed to load admin dashboard summary:", err);
      setSummaryError(err.message || "Failed to load real-time database metrics.");
    } finally {
      setIsSummaryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardSummary();
  }, [fetchDashboardSummary]);

  // Enforce STAFF role boundaries: restrict access strictly away from Admin-only tabs
  useEffect(() => {
    if (user?.role === "STAFF" && (activeTab === "trust" || activeTab === "users")) {
      setActiveTab("overview");
    }
  }, [user?.role, activeTab]);

  // Real MongoDB Help Requests State
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([]);
  const [isHelpLoading, setIsHelpLoading] = useState<boolean>(false);
  const [helpError, setHelpError] = useState<string | null>(null);
  const [helpSearch, setHelpSearch] = useState<string>("");
  const [helpStatusFilter, setHelpStatusFilter] = useState<HelpRequestStatus | "ALL">("ALL");
  const [helpTypeFilter, setHelpTypeFilter] = useState<HelpRequestType | "ALL">("ALL");
  const [helpMetrics, setHelpMetrics] = useState<AdminHelpRequestMetrics | null>(null);
  const [inspectHelpModal, setInspectHelpModal] = useState<HelpRequest | null>(null);
  const [modalStatusChoice, setModalStatusChoice] = useState<HelpRequestStatus>("PENDING");
  const [modalAdminNotes, setModalAdminNotes] = useState<string>("");
  const [isSavingHelpUpdate, setIsSavingHelpUpdate] = useState<boolean>(false);
  const [isDeletingHelpRequest, setIsDeletingHelpRequest] = useState<boolean>(false);

  // Transparency / Annual Reports Management State
  const [transparencyReports, setTransparencyReports] = useState<TransparencyReport[]>([]);
  const [isTransparencyLoading, setIsTransparencyLoading] = useState<boolean>(false);
  const [transparencyError, setTransparencyError] = useState<string | null>(null);
  const [transparencySearch, setTransparencySearch] = useState<string>("");
  const [transparencyTypeFilter, setTransparencyTypeFilter] = useState<string>("All");
  const [transparencyPublishedFilter, setTransparencyPublishedFilter] = useState<string>("ALL");
  const [isTransparencyModalOpen, setIsTransparencyModalOpen] = useState<boolean>(false);
  const [editingTransparencyReport, setEditingTransparencyReport] = useState<TransparencyReport | null>(null);
  const [isSavingTransparency, setIsSavingTransparency] = useState<boolean>(false);
  const [transparencyFormError, setTransparencyFormError] = useState<string | null>(null);

  const [transparencyFormData, setTransparencyFormData] = useState({
    title: "",
    description: "",
    reportType: "Annual Report",
    financialYear: "",
    fileUrl: "",
    coverImage: "",
    fileSize: "",
    auditRating: "",
    auditorFirm: "",
    statutoryType: "",
    totalDisbursal: "",
    isPublished: true,
    isFeatured: false,
    isKumbhRelated: false,
  });

  // Blog / News Management State
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isBlogLoading, setIsBlogLoading] = useState<boolean>(false);
  const [blogError, setBlogError] = useState<string | null>(null);
  const [blogSearch, setBlogSearch] = useState<string>("");
  const [blogCategoryFilter, setBlogCategoryFilter] = useState<string>("All");
  const [blogPublishedFilter, setBlogPublishedFilter] = useState<string>("ALL");
  const [isBlogModalOpen, setIsBlogModalOpen] = useState<boolean>(false);
  const [editingBlogPost, setEditingBlogPost] = useState<BlogPost | null>(null);
  const [isSavingBlog, setIsSavingBlog] = useState<boolean>(false);
  const [blogFormError, setBlogFormError] = useState<string | null>(null);

  const [blogFormData, setBlogFormData] = useState({
    title: "",
    slug: "",
    category: "Field Updates",
    author: "Siddhivinayak Trust",
    coverImage: "",
    excerpt: "",
    content: "",
    tags: "",
    isPublished: true,
    isFeatured: false,
    isKumbhRelated: false,
  });

  // Events Management State
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isEventsLoading, setIsEventsLoading] = useState<boolean>(false);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [eventSearch, setEventSearch] = useState<string>("");
  const [eventStatusFilter, setEventStatusFilter] = useState<string>("ALL");
  const [isEventModalOpen, setIsEventModalOpen] = useState<boolean>(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [isSavingEvent, setIsSavingEvent] = useState<boolean>(false);
  const [eventFormError, setEventFormError] = useState<string | null>(null);

  const [eventFormData, setEventFormData] = useState({
    title: "",
    slug: "",
    category: "Community Outreach",
    startDate: "",
    endDate: "",
    location: "Nashik, Maharashtra",
    shortDescription: "",
    description: "",
    registrationRequired: false,
    registrationLimit: "100",
    status: "UPCOMING" as EventStatus,
    imageUrl: "",
    isKumbhRelated: false,
  });

  // Event Registrations Inspection Modal State
  const [inspectEvent, setInspectEvent] = useState<EventItem | null>(null);
  const [inspectRegistrations, setInspectRegistrations] = useState<EventRegistrationItem[]>([]);
  const [isLoadingRegistrations, setIsLoadingRegistrations] = useState<boolean>(false);

  // Real Donations Management State
  const [adminDonations, setAdminDonations] = useState<DonationRecord[]>([]);
  const [donationMetrics, setDonationMetrics] = useState<{
    totalCollected: number;
    totalVerifiedDonations: number;
    pendingDonations: number;
    failedDonations: number;
  } | null>(null);
  const [isDonationsLoading, setIsDonationsLoading] = useState<boolean>(false);
  const [donationsError, setDonationsError] = useState<string | null>(null);
  const [donationsFilterStatus, setDonationsFilterStatus] = useState<string>("");
  const [donationsSearch, setDonationsSearch] = useState<string>("");
  const [selectedDonationDetails, setSelectedDonationDetails] = useState<DonationRecord | null>(null);

  const fetchAdminDonations = useCallback(async () => {
    setIsDonationsLoading(true);
    setDonationsError(null);
    try {
      const res = await DonationService.listAllDonations({
        status: donationsFilterStatus || undefined,
        search: donationsSearch || undefined,
      });
      setAdminDonations(res.donations || []);
      setDonationMetrics(res.metrics || null);
    } catch (err: any) {
      console.error("Failed to load admin donations:", err);
      setDonationsError(err.message || "Failed to load donations ledger.");
    } finally {
      setIsDonationsLoading(false);
    }
  }, [donationsFilterStatus, donationsSearch]);

  useEffect(() => {
    if (activeTab === "donations") {
      fetchAdminDonations();
    }
  }, [activeTab, fetchAdminDonations]);

  // Real Volunteer Management State (backed by real MongoDB)
  const [adminShifts, setAdminShifts] = useState<VolunteerShift[]>([]);
  const [isAdminShiftsLoading, setIsAdminShiftsLoading] = useState<boolean>(false);
  const [adminShiftsError, setAdminShiftsError] = useState<string | null>(null);
  const [adminApplications, setAdminApplications] = useState<any[]>([]);
  const [verifyingShiftId, setVerifyingShiftId] = useState<string | null>(null);
  const [reviewingAppId, setReviewingAppId] = useState<string | null>(null);

  const fetchAdminVolunteerData = useCallback(async () => {
    setIsAdminShiftsLoading(true);
    setAdminShiftsError(null);
    try {
      const [shiftsData, appsData] = await Promise.all([
        volunteerService.adminListShifts(),
        volunteerService.adminListApplications(),
      ]);
      setAdminShifts(shiftsData || []);
      setAdminApplications(appsData?.applications || []);
    } catch (err: any) {
      console.error("Failed to load admin volunteer data:", err);
      setAdminShiftsError(err?.message || "Failed to load volunteer records.");
    } finally {
      setIsAdminShiftsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "volunteers") {
      fetchAdminVolunteerData();
    }
  }, [activeTab, fetchAdminVolunteerData]);

  const handleVerifyShift = async (shiftId: string) => {
    try {
      setVerifyingShiftId(shiftId);
      await volunteerService.adminVerifyShift(shiftId);
      await fetchAdminVolunteerData();
      setSuccessToast("Shift verified and stamped in trust registry!");
      setTimeout(() => setSuccessToast(null), 3000);
    } catch (err: any) {
      alert(err?.message || "Failed to verify shift.");
    } finally {
      setVerifyingShiftId(null);
    }
  };

  const handleReviewApplication = async (appId: string, status: "APPROVED" | "REJECTED") => {
    try {
      setReviewingAppId(appId);
      await volunteerService.adminReviewApplication(appId, status);
      await fetchAdminVolunteerData();
      setSuccessToast(`Application ${status.toLowerCase()} successfully!`);
      setTimeout(() => setSuccessToast(null), 3000);
    } catch (err: any) {
      alert(err?.message || "Failed to update application.");
    } finally {
      setReviewingAppId(null);
    }
  };

  // Causes / Campaigns Management State
  const [causes, setCauses] = useState<Cause[]>([]);
  const [isCausesLoading, setIsCausesLoading] = useState<boolean>(false);
  const [causesError, setCausesError] = useState<string | null>(null);
  const [causeSearch, setCauseSearch] = useState<string>("");

  const [isCauseModalOpen, setIsCauseModalOpen] = useState<boolean>(false);
  const [editingCause, setEditingCause] = useState<Cause | null>(null);
  const [isSavingCause, setIsSavingCause] = useState<boolean>(false);
  const [causeFormError, setCauseFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    category: "Education" as CauseCategory,
    shortDescription: "",
    description: "",
    targetAmount: "",
    imageUrl: "",
    location: "Maharashtra, India",
    status: "ACTIVE" as "DRAFT" | "ACTIVE" | "COMPLETED" | "ARCHIVED",
    isKumbhRelated: false,
    urgent: false,
  });

  const fetchAdminCauses = useCallback(async () => {
    setIsCausesLoading(true);
    setCausesError(null);
    try {
      const response = await causeService.getCauses({ status: "ALL" });
      setCauses(response.causes || []);
    } catch (err: any) {
      console.error("Failed to fetch causes for admin:", err);
      setCausesError(err?.message || "Failed to load campaigns from database.");
    } finally {
      setIsCausesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "causes") {
      fetchAdminCauses();
    }
  }, [activeTab, fetchAdminCauses]);

  const openCreateModal = () => {
    setEditingCause(null);
    setCauseFormError(null);
    setFormData({
      title: "",
      category: "Education",
      shortDescription: "",
      description: "",
      targetAmount: "",
      imageUrl: "",
      location: "Nashik, Maharashtra",
      status: "ACTIVE",
      isKumbhRelated: false,
      urgent: false,
    });
    setIsCauseModalOpen(true);
  };

  const openEditModal = (cause: Cause) => {
    setEditingCause(cause);
    setCauseFormError(null);
    setFormData({
      title: cause.title,
      category: cause.category,
      shortDescription: cause.shortDescription || cause.tagline || "",
      description: cause.description,
      targetAmount: String(cause.targetAmount),
      imageUrl: cause.imageUrl,
      location: cause.location || "Maharashtra, India",
      status: cause.status || "ACTIVE",
      isKumbhRelated: !!cause.isKumbhRelated,
      urgent: !!cause.urgent,
    });
    setIsCauseModalOpen(true);
  };

  const handleSaveCause = async (e: React.FormEvent) => {
    e.preventDefault();
    setCauseFormError(null);

    const parsedTarget = Number(formData.targetAmount);
    if (!formData.title.trim()) {
      setCauseFormError("Campaign title is required.");
      return;
    }
    if (!formData.shortDescription.trim()) {
      setCauseFormError("Short description / tagline is required.");
      return;
    }
    if (!formData.description.trim()) {
      setCauseFormError("Full description is required.");
      return;
    }
    if (isNaN(parsedTarget) || parsedTarget < 1) {
      setCauseFormError("Target amount must be a positive number (min ₹1).");
      return;
    }
    if (!formData.imageUrl.trim()) {
      setCauseFormError("Image URL is required.");
      return;
    }

    setIsSavingCause(true);
    try {
      const payload: Partial<Cause> = {
        title: formData.title.trim(),
        category: formData.category,
        shortDescription: formData.shortDescription.trim(),
        tagline: formData.shortDescription.trim(),
        description: formData.description.trim(),
        targetAmount: parsedTarget,
        imageUrl: formData.imageUrl.trim(),
        location: formData.location.trim(),
        status: formData.status,
        isKumbhRelated: formData.isKumbhRelated,
        urgent: formData.urgent,
      };

      if (editingCause) {
        await causeService.updateCause(editingCause.id, payload);
        setSuccessToast(`Campaign "${formData.title}" updated successfully!`);
      } else {
        await causeService.createCause(payload);
        setSuccessToast(`New campaign "${formData.title}" created successfully!`);
      }

      setIsCauseModalOpen(false);
      await fetchAdminCauses();
      setTimeout(() => setSuccessToast(null), 3500);
    } catch (err: any) {
      console.error("Error saving campaign:", err);
      setCauseFormError(err?.message || "Failed to save campaign. Please verify fields.");
    } finally {
      setIsSavingCause(false);
    }
  };

  const handleToggleStatus = async (cause: Cause) => {
    const nextStatus = cause.status === "ACTIVE" ? "ARCHIVED" : "ACTIVE";
    try {
      await causeService.updateCause(cause.id, { status: nextStatus });
      setCauses((prev) =>
        prev.map((c) => (c.id === cause.id ? { ...c, status: nextStatus } : c))
      );
      setSuccessToast(`Campaign "${cause.title}" set to ${nextStatus}!`);
      setTimeout(() => setSuccessToast(null), 3000);
    } catch (err: any) {
      console.error("Error toggling campaign status:", err);
      setSuccessToast(err?.message || "Failed to update campaign status.");
      setTimeout(() => setSuccessToast(null), 3500);
    }
  };

  const handleDeleteCause = async (cause: Cause) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${cause.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await causeService.deleteCause(cause.id);
      setCauses((prev) => prev.filter((c) => c.id !== cause.id));
      setSuccessToast(`Campaign "${cause.title}" deleted.`);
      setTimeout(() => setSuccessToast(null), 3000);
    } catch (err: any) {
      console.error("Error deleting campaign:", err);
      setSuccessToast(err?.message || "Failed to delete campaign.");
      setTimeout(() => setSuccessToast(null), 3500);
    }
  };

  // ================= EVENT MANAGEMENT HANDLERS =================
  const fetchAdminEvents = useCallback(async () => {
    setIsEventsLoading(true);
    setEventsError(null);
    try {
      const response = await eventService.getEvents({ status: "ALL" });
      setEvents(response.events || []);
    } catch (err: any) {
      console.error("Failed to fetch events for admin:", err);
      setEventsError(err?.message || "Failed to load events from database.");
    } finally {
      setIsEventsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "events") {
      fetchAdminEvents();
    }
  }, [activeTab, fetchAdminEvents]);

  const openCreateEventModal = () => {
    setEditingEvent(null);
    setEventFormError(null);

    // Default dates: tomorrow 9am to 5pm
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    const endTomorrow = new Date(tomorrow);
    endTomorrow.setHours(17, 0, 0, 0);

    const toLocalISO = (d: Date) => d.toISOString().slice(0, 16);

    setEventFormData({
      title: "",
      slug: "",
      category: "Community Outreach",
      startDate: toLocalISO(tomorrow),
      endDate: toLocalISO(endTomorrow),
      location: "Nashik, Maharashtra",
      shortDescription: "",
      description: "",
      registrationRequired: false,
      registrationLimit: "150",
      status: "UPCOMING",
      imageUrl: "",
      isKumbhRelated: false,
    });
    setIsEventModalOpen(true);
  };

  const openEditEventModal = (event: EventItem) => {
    setEditingEvent(event);
    setEventFormError(null);

    const toLocalISO = (dStr?: string) => {
      if (!dStr) return "";
      try {
        const d = new Date(dStr);
        return isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 16);
      } catch {
        return "";
      }
    };

    setEventFormData({
      title: event.title,
      slug: event.slug || "",
      category: event.category || "Community Outreach",
      startDate: toLocalISO(event.startDate),
      endDate: toLocalISO(event.endDate),
      location: event.location || "Nashik, Maharashtra",
      shortDescription: event.shortDescription || "",
      description: event.description || "",
      registrationRequired: !!event.registrationRequired,
      registrationLimit: String(event.registrationLimit ?? event.capacity ?? 0),
      status: (event.status as EventStatus) || "UPCOMING",
      imageUrl: event.imageUrl || "",
      isKumbhRelated: !!event.isKumbhRelated,
    });
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setEventFormError(null);

    if (!eventFormData.title.trim()) {
      setEventFormError("Event title is required.");
      return;
    }
    if (!eventFormData.shortDescription.trim()) {
      setEventFormError("Short description is required.");
      return;
    }
    if (!eventFormData.description.trim()) {
      setEventFormError("Full description is required.");
      return;
    }
    if (!eventFormData.location.trim()) {
      setEventFormError("Location is required.");
      return;
    }
    if (!eventFormData.startDate) {
      setEventFormError("Start date and time are required.");
      return;
    }
    if (eventFormData.endDate && new Date(eventFormData.endDate) < new Date(eventFormData.startDate)) {
      setEventFormError("End date cannot be earlier than start date.");
      return;
    }
    if (!eventFormData.imageUrl.trim()) {
      setEventFormError("Image URL is required.");
      return;
    }

    const limitNum = Number(eventFormData.registrationLimit) || 0;

    setIsSavingEvent(true);
    try {
      const payload: Partial<EventItem> = {
        title: eventFormData.title.trim(),
        slug: eventFormData.slug.trim() || undefined,
        category: eventFormData.category,
        startDate: new Date(eventFormData.startDate).toISOString(),
        endDate: eventFormData.endDate ? new Date(eventFormData.endDate).toISOString() : undefined,
        location: eventFormData.location.trim(),
        shortDescription: eventFormData.shortDescription.trim(),
        description: eventFormData.description.trim(),
        registrationRequired: eventFormData.registrationRequired,
        registrationLimit: limitNum,
        status: eventFormData.status,
        imageUrl: eventFormData.imageUrl.trim(),
        isKumbhRelated: eventFormData.isKumbhRelated,
      };

      if (editingEvent) {
        await eventService.updateEvent(editingEvent.id, payload);
        setSuccessToast(`Event "${eventFormData.title}" updated successfully!`);
      } else {
        await eventService.createEvent(payload);
        setSuccessToast(`New event "${eventFormData.title}" scheduled successfully!`);
      }

      setIsEventModalOpen(false);
      await fetchAdminEvents();
      setTimeout(() => setSuccessToast(null), 3500);
    } catch (err: any) {
      console.error("Error saving event:", err);
      setEventFormError(err?.message || "Failed to save event. Please verify inputs.");
    } finally {
      setIsSavingEvent(false);
    }
  };

  const handleUpdateEventStatus = async (event: EventItem, newStatus: EventStatus) => {
    try {
      await eventService.updateEvent(event.id, { status: newStatus });
      setEvents((prev) =>
        prev.map((e) => (e.id === event.id ? { ...e, status: newStatus } : e))
      );
      setSuccessToast(`Event "${event.title}" status changed to ${newStatus}.`);
      setTimeout(() => setSuccessToast(null), 3000);
    } catch (err: any) {
      console.error("Error updating event status:", err);
      setSuccessToast(err?.message || "Failed to update event status.");
      setTimeout(() => setSuccessToast(null), 3500);
    }
  };

  const handleDeleteEvent = async (event: EventItem) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete event "${event.title}"? All associated registrations will also be removed. This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await eventService.deleteEvent(event.id);
      setEvents((prev) => prev.filter((e) => e.id !== event.id));
      setSuccessToast(`Event "${event.title}" permanently deleted.`);
      setTimeout(() => setSuccessToast(null), 3000);
    } catch (err: any) {
      console.error("Error deleting event:", err);
      setSuccessToast(err?.message || "Failed to delete event.");
      setTimeout(() => setSuccessToast(null), 3500);
    }
  };

  // ================= BLOG MANAGEMENT HANDLERS =================
  const fetchAdminBlogPosts = useCallback(async () => {
    setIsBlogLoading(true);
    setBlogError(null);
    try {
      const response = await blogService.getAdminPosts({ limit: 100 });
      setBlogPosts(response.posts || []);
    } catch (err: any) {
      console.error("Failed to fetch blog posts for admin:", err);
      setBlogError(err?.message || "Failed to load blog posts from database.");
    } finally {
      setIsBlogLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "blog") {
      fetchAdminBlogPosts();
    }
  }, [activeTab, fetchAdminBlogPosts]);

  const openCreateBlogModal = () => {
    setEditingBlogPost(null);
    setBlogFormError(null);
    setBlogFormData({
      title: "",
      slug: "",
      category: "Field Updates",
      author: "Siddhivinayak Trust",
      coverImage: "",
      excerpt: "",
      content: "",
      tags: "",
      isPublished: true,
      isFeatured: false,
      isKumbhRelated: false,
    });
    setIsBlogModalOpen(true);
  };

  const openEditBlogModal = (post: BlogPost) => {
    setEditingBlogPost(post);
    setBlogFormError(null);
    setBlogFormData({
      title: post.title,
      slug: post.slug,
      category: post.category,
      author: post.author || "Siddhivinayak Trust",
      coverImage: post.coverImage || post.imageUrl,
      excerpt: post.excerpt,
      content: Array.isArray(post.content) ? post.content.join("\n\n") : (post.content || ""),
      tags: (post.tags || []).join(", "),
      isPublished: post.isPublished !== undefined ? post.isPublished : true,
      isFeatured: !!post.isFeatured,
      isKumbhRelated: !!post.isKumbhRelated,
    });
    setIsBlogModalOpen(true);
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    setBlogFormError(null);

    if (!blogFormData.title.trim()) {
      setBlogFormError("Story title is required.");
      return;
    }
    if (!blogFormData.excerpt.trim()) {
      setBlogFormError("Short excerpt is required.");
      return;
    }
    if (!blogFormData.content.trim()) {
      setBlogFormError("Story content is required.");
      return;
    }
    if (!blogFormData.coverImage.trim()) {
      setBlogFormError("Cover image URL is required.");
      return;
    }

    setIsSavingBlog(true);
    try {
      const parsedTags = blogFormData.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      if (editingBlogPost) {
        const updated = await blogService.updatePost(editingBlogPost.id, {
          title: blogFormData.title.trim(),
          slug: blogFormData.slug.trim() || undefined,
          category: blogFormData.category,
          author: blogFormData.author.trim() || "Siddhivinayak Trust",
          coverImage: blogFormData.coverImage.trim(),
          excerpt: blogFormData.excerpt.trim(),
          content: blogFormData.content.trim(),
          tags: parsedTags,
          isPublished: blogFormData.isPublished,
          isFeatured: blogFormData.isFeatured,
          isKumbhRelated: blogFormData.isKumbhRelated,
        });

        setBlogPosts((prev) =>
          prev.map((p) => (p.id === editingBlogPost.id ? updated : p))
        );
        setSuccessToast(`Story "${updated.title}" updated successfully.`);
      } else {
        const created = await blogService.createPost({
          title: blogFormData.title.trim(),
          slug: blogFormData.slug.trim() || undefined,
          category: blogFormData.category,
          author: blogFormData.author.trim() || "Siddhivinayak Trust",
          coverImage: blogFormData.coverImage.trim(),
          excerpt: blogFormData.excerpt.trim(),
          content: blogFormData.content.trim(),
          tags: parsedTags,
          isPublished: blogFormData.isPublished,
          isFeatured: blogFormData.isFeatured,
          isKumbhRelated: blogFormData.isKumbhRelated,
        });

        setBlogPosts((prev) => [created, ...prev]);
        setSuccessToast(`New story "${created.title}" published to live MongoDB.`);
      }

      setIsBlogModalOpen(false);
      setTimeout(() => setSuccessToast(null), 3500);
    } catch (err: any) {
      console.error("Error saving blog post:", err);
      setBlogFormError(err?.message || "Failed to save blog post. Please check database connection.");
    } finally {
      setIsSavingBlog(false);
    }
  };

  const handleTogglePublishBlog = async (post: BlogPost) => {
    const newPublished = !post.isPublished;
    try {
      const updated = await blogService.updatePost(post.id, {
        isPublished: newPublished,
      });
      setBlogPosts((prev) =>
        prev.map((p) => (p.id === post.id ? updated : p))
      );
      setSuccessToast(
        `Story "${post.title}" is now ${newPublished ? "PUBLISHED" : "UNPUBLISHED (Draft)"}.`
      );
      setTimeout(() => setSuccessToast(null), 3000);
    } catch (err: any) {
      console.error("Failed to toggle publish status:", err);
      setSuccessToast(err?.message || "Failed to update publish state.");
      setTimeout(() => setSuccessToast(null), 3500);
    }
  };

  const handleToggleFeaturedBlog = async (post: BlogPost) => {
    const newFeatured = !post.isFeatured;
    try {
      const updated = await blogService.updatePost(post.id, {
        isFeatured: newFeatured,
      });
      setBlogPosts((prev) =>
        prev.map((p) => (p.id === post.id ? updated : p))
      );
      setSuccessToast(
        `Story "${post.title}" ${newFeatured ? "marked as FEATURED" : "removed from featured"}.`
      );
      setTimeout(() => setSuccessToast(null), 3000);
    } catch (err: any) {
      console.error("Failed to toggle featured status:", err);
      setSuccessToast(err?.message || "Failed to update featured state.");
      setTimeout(() => setSuccessToast(null), 3500);
    }
  };

  const handleDeleteBlog = async (post: BlogPost) => {
    if (!window.confirm(`Are you sure you want to permanently delete story "${post.title}" from MongoDB?`)) {
      return;
    }
    try {
      await blogService.deletePost(post.id);
      setBlogPosts((prev) => prev.filter((p) => p.id !== post.id));
      setSuccessToast(`Story "${post.title}" deleted from archive.`);
      setTimeout(() => setSuccessToast(null), 3000);
    } catch (err: any) {
      console.error("Failed to delete blog post:", err);
      setSuccessToast(err?.message || "Failed to delete blog post.");
      setTimeout(() => setSuccessToast(null), 3500);
    }
  };

  // ================= TRANSPARENCY MANAGEMENT HANDLERS =================
  const fetchAdminTransparencyReports = useCallback(async () => {
    setIsTransparencyLoading(true);
    setTransparencyError(null);
    try {
      const response = await transparencyService.getAdminReports({ limit: 100 });
      setTransparencyReports(response.reports || []);
    } catch (err: any) {
      console.error("Failed to fetch transparency reports for admin:", err);
      setTransparencyError(err?.message || "Failed to load transparency reports from database.");
    } finally {
      setIsTransparencyLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "transparency") {
      fetchAdminTransparencyReports();
    }
  }, [activeTab, fetchAdminTransparencyReports]);

  const openCreateTransparencyModal = () => {
    setEditingTransparencyReport(null);
    setTransparencyFormError(null);
    setTransparencyFormData({
      title: "",
      description: "",
      reportType: "Annual Report",
      financialYear: "",
      fileUrl: "",
      coverImage: "",
      fileSize: "",
      auditRating: "",
      auditorFirm: "",
      statutoryType: "",
      totalDisbursal: "",
      isPublished: true,
      isFeatured: false,
      isKumbhRelated: false,
    });
    setIsTransparencyModalOpen(true);
  };

  const openEditTransparencyModal = (report: TransparencyReport) => {
    setEditingTransparencyReport(report);
    setTransparencyFormError(null);
    setTransparencyFormData({
      title: report.title,
      description: report.description || "",
      reportType: report.reportType || "Annual Report",
      financialYear: report.financialYear || "FY 2024-25",
      fileUrl: report.fileUrl || "",
      coverImage: report.coverImage || "",
      fileSize: report.fileSize || "",
      auditRating: report.auditRating || "",
      auditorFirm: report.auditorFirm || "",
      statutoryType: report.statutoryType || "",
      totalDisbursal: report.totalDisbursal || "",
      isPublished: report.isPublished !== undefined ? report.isPublished : true,
      isFeatured: !!report.isFeatured,
      isKumbhRelated: !!report.isKumbhRelated,
    });
    setIsTransparencyModalOpen(true);
  };

  const handleSaveTransparency = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransparencyFormError(null);

    if (!transparencyFormData.title.trim()) {
      setTransparencyFormError("Report title is required.");
      return;
    }
    if (!transparencyFormData.description.trim()) {
      setTransparencyFormError("Report description is required.");
      return;
    }
    if (!transparencyFormData.financialYear.trim()) {
      setTransparencyFormError("Financial year is required (e.g. FY 2024-25).");
      return;
    }

    setIsSavingTransparency(true);
    try {
      const payload: CreateTransparencyInput = {
        title: transparencyFormData.title.trim(),
        description: transparencyFormData.description.trim(),
        reportType: transparencyFormData.reportType,
        financialYear: transparencyFormData.financialYear.trim(),
        fileUrl: transparencyFormData.fileUrl.trim() || undefined,
        coverImage: transparencyFormData.coverImage.trim() || undefined,
        fileSize: transparencyFormData.fileSize.trim() || undefined,
        auditRating: transparencyFormData.auditRating.trim() || undefined,
        auditorFirm: transparencyFormData.auditorFirm.trim() || undefined,
        statutoryType: transparencyFormData.statutoryType.trim() || undefined,
        totalDisbursal: transparencyFormData.totalDisbursal.trim() || undefined,
        isPublished: transparencyFormData.isPublished,
        isFeatured: transparencyFormData.isFeatured,
        isKumbhRelated: transparencyFormData.isKumbhRelated,
      };

      if (editingTransparencyReport) {
        const updated = await transparencyService.updateReport(editingTransparencyReport.id, payload);
        setTransparencyReports((prev) =>
          prev.map((r) => (r.id === editingTransparencyReport.id ? updated : r))
        );
        setSuccessToast(`Report "${updated.title}" updated successfully.`);
      } else {
        const created = await transparencyService.createReport(payload);
        setTransparencyReports((prev) => [created, ...prev]);
        setSuccessToast(`Report "${created.title}" published to database.`);
      }

      setIsTransparencyModalOpen(false);
      setTimeout(() => setSuccessToast(null), 3000);
    } catch (err: any) {
      console.error("Failed to save transparency report:", err);
      setTransparencyFormError(err?.message || "Failed to save transparency report.");
    } finally {
      setIsSavingTransparency(false);
    }
  };

  const handleTogglePublishTransparency = async (report: TransparencyReport) => {
    const newPublished = !report.isPublished;
    try {
      const updated = await transparencyService.updateReport(report.id, {
        isPublished: newPublished,
      });
      setTransparencyReports((prev) =>
        prev.map((r) => (r.id === report.id ? updated : r))
      );
      setSuccessToast(
        `Report "${report.title}" is now ${newPublished ? "PUBLISHED" : "UNPUBLISHED (Draft)"}.`
      );
      setTimeout(() => setSuccessToast(null), 3000);
    } catch (err: any) {
      console.error("Failed to toggle publish status:", err);
      setSuccessToast(err?.message || "Failed to update publish state.");
      setTimeout(() => setSuccessToast(null), 3500);
    }
  };

  const handleToggleFeaturedTransparency = async (report: TransparencyReport) => {
    const newFeatured = !report.isFeatured;
    try {
      const updated = await transparencyService.updateReport(report.id, {
        isFeatured: newFeatured,
      });
      setTransparencyReports((prev) =>
        prev.map((r) => (r.id === report.id ? updated : r))
      );
      setSuccessToast(
        `Report "${report.title}" ${newFeatured ? "marked as FEATURED" : "removed from featured"}.`
      );
      setTimeout(() => setSuccessToast(null), 3000);
    } catch (err: any) {
      console.error("Failed to toggle featured status:", err);
      setSuccessToast(err?.message || "Failed to update featured state.");
      setTimeout(() => setSuccessToast(null), 3500);
    }
  };

  const handleDeleteTransparency = async (report: TransparencyReport) => {
    if (!window.confirm(`Are you sure you want to permanently delete report "${report.title}" from MongoDB?`)) {
      return;
    }
    try {
      await transparencyService.deleteReport(report.id);
      setTransparencyReports((prev) => prev.filter((r) => r.id !== report.id));
      setSuccessToast(`Report "${report.title}" deleted from archive.`);
      setTimeout(() => setSuccessToast(null), 3000);
    } catch (err: any) {
      console.error("Failed to delete transparency report:", err);
      setSuccessToast(err?.message || "Failed to delete transparency report.");
      setTimeout(() => setSuccessToast(null), 3500);
    }
  };

  const handleViewRegistrations = async (event: EventItem) => {
    setInspectEvent(event);
    setIsLoadingRegistrations(true);
    setInspectRegistrations([]);
    try {
      const regs = await eventService.getEventRegistrations(event.id);
      setInspectRegistrations(regs);
    } catch (err: any) {
      console.error("Failed to load attendees:", err);
    } finally {
      setIsLoadingRegistrations(false);
    }
  };

  const handleVerifyItem = (id: string) => {
    setQueue((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "Verified & Stamped" } : item
      )
    );
    setSuccessToast(`Record ${id} digitally signed and stamped into the Impact Passport!`);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // Real MongoDB Aid Applications / Help Requests Fetcher
  const fetchAdminHelpRequests = useCallback(async () => {
    setIsHelpLoading(true);
    setHelpError(null);
    try {
      const res = await helpRequestService.getAdminHelpRequests({
        status: helpStatusFilter,
        requestType: helpTypeFilter,
        search: helpSearch.trim() || undefined,
      });
      setHelpRequests(res.requests || []);
      setHelpMetrics(res.metrics || null);
    } catch (err: any) {
      console.error("Failed to load admin help requests:", err);
      setHelpError(err.message || "Failed to load aid applications.");
    } finally {
      setIsHelpLoading(false);
    }
  }, [helpStatusFilter, helpTypeFilter, helpSearch]);

  useEffect(() => {
    if (activeTab === "help") {
      fetchAdminHelpRequests();
    }
  }, [activeTab, fetchAdminHelpRequests]);

  const handleOpenHelpModal = (hr: HelpRequest) => {
    setInspectHelpModal(hr);
    setModalStatusChoice(hr.status);
    setModalAdminNotes(hr.adminNotes || "");
  };

  const handleSaveHelpReview = async () => {
    if (!inspectHelpModal) return;
    try {
      setIsSavingHelpUpdate(true);
      const updated = await helpRequestService.updateAdminHelpRequest(inspectHelpModal.id, {
        status: modalStatusChoice,
        adminNotes: modalAdminNotes,
      });
      setInspectHelpModal(updated);
      setSuccessToast(`Application ${updated.id.substring(0, 8)}... status updated to ${modalStatusChoice}`);
      setTimeout(() => setSuccessToast(null), 3500);
      fetchAdminHelpRequests();
    } catch (err: any) {
      console.error("Failed to update help request:", err);
      alert(err.message || "Failed to update application.");
    } finally {
      setIsSavingHelpUpdate(false);
    }
  };

  const handleDeleteHelpRequest = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this help request record? This action cannot be undone.")) {
      return;
    }
    try {
      setIsDeletingHelpRequest(true);
      await helpRequestService.deleteAdminHelpRequest(id);
      setInspectHelpModal(null);
      setSuccessToast("Help request successfully deleted from MongoDB.");
      setTimeout(() => setSuccessToast(null), 3500);
      fetchAdminHelpRequests();
    } catch (err: any) {
      console.error("Failed to delete help request:", err);
      alert(err.message || "Failed to delete request.");
    } finally {
      setIsDeletingHelpRequest(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#143d2c] to-[#0c271c] text-white rounded-xl p-6 sm:p-8 border border-emerald-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-300 bg-black/40 px-2.5 py-0.5 rounded border border-amber-300/30">
              {user?.role === "STAFF" ? "Staff Operations Console" : "Admin & Governance Console"}
            </span>
            <span className="text-xs text-emerald-200">
              Role: <strong className="font-semibold text-white uppercase">{user?.role || "UNVERIFIED"}</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
            {user?.role === "STAFF" ? "Staff Operations & Activity Desk" : "Trust Operations & Verification Desk"}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl leading-relaxed">
            Authorized portal for audit certifications, direct beneficiary relief applications,
            volunteer shift validation, and centralized feature toggles.
          </p>
        </div>

        <div className="text-xs text-emerald-200 bg-black/40 p-4 rounded-lg border border-emerald-700/60 space-y-1 shrink-0">
          <div className="text-white font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-300" />
            <span>Active Session Token</span>
          </div>
          <div>User: {user?.name || "Trust Administrator"}</div>
          <div className="text-amber-300 font-mono text-[11px]">ACCESS: VERIFIED-SESSION</div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-stone-200 overflow-x-auto gap-2 text-xs sm:text-sm">
        <button
          type="button"
          onClick={() => {
            setActiveTab("overview");
            fetchDashboardSummary();
          }}
          className={`pb-3 px-4 font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === "overview"
              ? "border-emerald-800 text-emerald-900"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Overview & Statistics</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("audits")}
          className={`pb-3 px-4 font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === "audits"
              ? "border-emerald-800 text-emerald-900"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          Impact Passport Audits ({queue.filter((q) => q.status === "Pending Audit").length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("causes")}
          className={`pb-3 px-4 font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === "causes"
              ? "border-emerald-800 text-emerald-900"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Causes & Campaigns ({causes.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("events")}
          className={`pb-3 px-4 font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === "events"
              ? "border-emerald-800 text-emerald-900"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Events & Field Drives ({events.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("blog")}
          className={`pb-3 px-4 font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === "blog"
              ? "border-emerald-800 text-emerald-900"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <Newspaper className="w-3.5 h-3.5" />
          <span>News & Field Articles ({blogPosts.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("transparency")}
          className={`pb-3 px-4 font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === "transparency"
              ? "border-emerald-800 text-emerald-900"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Annual & Audit Reports ({transparencyReports.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("help")}
          className={`pb-3 px-4 font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === "help"
              ? "border-emerald-800 text-emerald-900"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          Aid Applications ({helpMetrics?.total !== undefined ? helpMetrics.total : helpRequests.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("volunteers")}
          className={`pb-3 px-4 font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === "volunteers"
              ? "border-emerald-800 text-emerald-900"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          Volunteer Shifts
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("donations")}
          className={`pb-3 px-4 font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === "donations"
              ? "border-emerald-800 text-emerald-900"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          Donations Ledger
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("notifications")}
          className={`pb-3 px-4 font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === "notifications"
              ? "border-emerald-800 text-emerald-900"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Live Notifications</span>
        </button>
        {user?.role === 'ADMIN' && (
          <button
            type="button"
            onClick={() => setActiveTab("trust")}
            className={`pb-3 px-4 font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === "trust"
                ? "border-emerald-800 text-emerald-900"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Trust Profile & Trustees</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-bold border border-amber-300">
              Admin Only
            </span>
          </button>
        )}
        {user?.role === 'ADMIN' && (
          <button
            type="button"
            onClick={() => setActiveTab("users")}
            className={`pb-3 px-4 font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === "users"
                ? "border-emerald-800 text-emerald-900"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Users & Roles</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-bold border border-amber-300">
              Admin Only
            </span>
          </button>
        )}
        <button
          type="button"
          onClick={() => setActiveTab("settings")}
          className={`pb-3 px-4 font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === "settings"
              ? "border-emerald-800 text-emerald-900"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Feature Flags & Settings</span>
        </button>
      </div>

      {/* Success Toast */}
      {successToast && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded text-xs sm:text-sm text-emerald-950 flex items-center gap-2 font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* ================= TAB 0: OVERVIEW & REAL STATISTICS ================= */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Top Control Ribbon */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <div>
                <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <span>Live Operational Statistics</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Real MongoDB Data
                  </span>
                </h2>
                <p className="text-xs text-stone-500">
                  Aggregated in real-time across Donations, Causes, Events, Volunteers, Relief Dockets, Blogs, and Reports.
                </p>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={fetchDashboardSummary}
              disabled={isSummaryLoading}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isSummaryLoading ? "animate-spin text-emerald-600" : ""}`} />}
              className="text-xs shrink-0 self-start sm:self-auto cursor-pointer"
            >
              {isSummaryLoading ? "Refreshing..." : "Refresh Statistics"}
            </Button>
          </div>

          {/* Loading State */}
          {isSummaryLoading && !summaryData && (
            <div className="bg-white rounded-xl border border-stone-200 p-12 text-center flex flex-col items-center justify-center gap-3 shadow-2xs">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-700" />
              <div className="font-semibold text-stone-800 text-sm">Aggregating real-time MongoDB statistics...</div>
              <p className="text-xs text-stone-500 max-w-md">
                Connecting to backend database collections to compute verified donation balances, active campaign counts, volunteer registries, and aid applications.
              </p>
            </div>
          )}

          {/* Error & Retry State */}
          {summaryError && (
            <div className="p-4 sm:p-5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-rose-900 text-sm">Failed to retrieve MongoDB statistics</div>
                  <div className="mt-0.5 text-rose-700">{summaryError}</div>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={fetchDashboardSummary}
                className="shrink-0 text-xs border-rose-300 bg-white text-rose-900 hover:bg-rose-100 cursor-pointer"
              >
                Retry Request
              </Button>
            </div>
          )}

          {/* Real Metrics Content */}
          {summaryData && (
            <>
              {/* Empty DB Notice if applicable */}
              {summaryData.totalDonations === 0 &&
                summaryData.totalCampaigns === 0 &&
                summaryData.totalEvents === 0 &&
                summaryData.totalHelpRequests === 0 && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5 shadow-2xs">
                    <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Database Collections Initialized & Empty</span>
                      <span>
                        The database currently contains 0 records. All metrics below strictly display 0 from real MongoDB collections (never demo or simulated figures).
                      </span>
                    </div>
                  </div>
                )}

              {/* 9 Main KPI Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 1. Verified Donations */}
                <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                      Verified Contributions
                    </span>
                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <Coins className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
                      {formatCurrency(summaryData.totalDonationAmount)}
                    </div>
                    <p className="text-xs text-stone-500 mt-1">
                      {summaryData.totalVerifiedDonations} successful • {summaryData.totalDonations} total transactions
                    </p>
                  </div>
                  <div className="pt-2 border-t border-stone-100 text-[11px] text-emerald-800 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Only verified successful donations counted</span>
                  </div>
                </div>

                {/* 2. Current Month Verified Donations */}
                <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                      Current Month Verified
                    </span>
                    <div className="p-2 rounded-lg bg-teal-50 text-teal-800 border border-teal-200">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-serif font-bold text-teal-950 tracking-tight">
                      {formatCurrency(summaryData.currentMonthDonationAmount)}
                    </div>
                    <p className="text-xs text-stone-500 mt-1">
                      {summaryData.currentMonthDonationsCount} donations this calendar month
                    </p>
                  </div>
                  <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-500">
                    Month-to-date verified ledger balance
                  </div>
                </div>

                {/* 3. Causes & Campaigns */}
                <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                      Causes & Campaigns
                    </span>
                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <Layers className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
                      {summaryData.activeCampaigns}
                      <span className="text-sm font-sans font-normal text-stone-400 ml-1.5">
                        / {summaryData.totalCampaigns} total
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-1">
                      {summaryData.activeCampaigns} active campaigns currently accepting contributions
                    </p>
                  </div>
                  <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-500">
                    Targeted relief and humanitarian pillars
                  </div>
                </div>

                {/* 4. Events & Field Drives */}
                <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                      Events & Drives
                    </span>
                    <div className="p-2 rounded-lg bg-sky-50 text-sky-800 border border-sky-200">
                      <Calendar className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
                      {summaryData.upcomingEvents}
                      <span className="text-sm font-sans font-normal text-stone-400 ml-1.5">
                        / {summaryData.totalEvents} total
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-1">
                      {summaryData.upcomingEvents} upcoming community field operations scheduled
                    </p>
                  </div>
                  <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-500">
                    Medical camps, relief drives & tree plantations
                  </div>
                </div>

                {/* 5. Registered Volunteers */}
                <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                      Volunteers Registry
                    </span>
                    <div className="p-2 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
                      {summaryData.totalVolunteers}
                    </div>
                    <p className="text-xs text-stone-500 mt-1">
                      {summaryData.pendingVolunteerApplications} pending applications awaiting verification
                    </p>
                  </div>
                  <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-500">
                    Active volunteer champions on roster
                  </div>
                </div>

                {/* 6. Aid & Hardship Requests */}
                <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                      Aid Applications
                    </span>
                    <div className="p-2 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
                      <HeartHandshake className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
                      {summaryData.totalHelpRequests}
                    </div>
                    <p className="text-xs text-stone-500 mt-1">
                      {summaryData.pendingHelpRequests} pending triage & administrative review
                    </p>
                  </div>
                  <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-500">
                    Direct beneficiary assistance petitions
                  </div>
                </div>

                {/* 7. Field News & Articles */}
                <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                      Published News & Blog
                    </span>
                    <div className="p-2 rounded-lg bg-stone-100 text-stone-800 border border-stone-200">
                      <Newspaper className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
                      {summaryData.publishedNews}
                      <span className="text-sm font-sans font-normal text-stone-400 ml-1.5">
                        / {summaryData.totalBlogPosts} total
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-1">
                      Published field updates and impact transparency articles
                    </p>
                  </div>
                  <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-500">
                    Public interest reporting & ground stories
                  </div>
                </div>

                {/* 8. Transparency Reports */}
                <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                      Transparency & Audits
                    </span>
                    <div className="p-2 rounded-lg bg-purple-50 text-purple-800 border border-purple-200">
                      <FileText className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
                      {summaryData.transparencyReports}
                      <span className="text-sm font-sans font-normal text-stone-400 ml-1.5">
                        / {summaryData.totalTransparencyReports} total
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-1">
                      Published annual audit statements & statutory balance sheets
                    </p>
                  </div>
                  <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-500">
                    Statutory trust governance documents
                  </div>
                </div>

                {/* 9. Gallery & Media Assets */}
                <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                      Gallery & Media Assets
                    </span>
                    <div className="p-2 rounded-lg bg-rose-50 text-rose-800 border border-rose-200">
                      <BookOpen className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
                      {summaryData.galleryItems}
                    </div>
                    <p className="text-xs text-stone-500 mt-1">
                      Photographs catalogued across completed field operations
                    </p>
                  </div>
                  <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-500">
                    Media assets aggregated from event drives
                  </div>
                </div>
              </div>

              {/* Status Ribbon: Relief Applications by Status */}
              <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
                <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
                  <div className="flex items-center gap-2">
                    <HeartHandshake className="w-4 h-4 text-emerald-800" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800">
                      Beneficiary Aid Applications Status Breakdown
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-stone-700">
                    Total: {summaryData.totalHelpRequests}
                  </span>
                </div>
                <div className="p-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
                  <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200">
                    <span className="text-[11px] font-semibold text-amber-800 block">Pending</span>
                    <span className="text-lg font-bold text-amber-950">{summaryData.helpRequestsByStatus.pending}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200">
                    <span className="text-[11px] font-semibold text-blue-800 block">Under Review</span>
                    <span className="text-lg font-bold text-blue-950">{summaryData.helpRequestsByStatus.underReview}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                    <span className="text-[11px] font-semibold text-emerald-800 block">Approved</span>
                    <span className="text-lg font-bold text-emerald-950">{summaryData.helpRequestsByStatus.approved}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-sky-50 border border-sky-200">
                    <span className="text-[11px] font-semibold text-sky-800 block">In Progress</span>
                    <span className="text-lg font-bold text-sky-950">{summaryData.helpRequestsByStatus.inProgress}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-200">
                    <span className="text-[11px] font-semibold text-teal-800 block">Resolved</span>
                    <span className="text-lg font-bold text-teal-950">{summaryData.helpRequestsByStatus.resolved}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200">
                    <span className="text-[11px] font-semibold text-rose-800 block">Rejected</span>
                    <span className="text-lg font-bold text-rose-950">{summaryData.helpRequestsByStatus.rejected}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-stone-100 border border-stone-200">
                    <span className="text-[11px] font-semibold text-stone-700 block">Closed</span>
                    <span className="text-lg font-bold text-stone-900">{summaryData.helpRequestsByStatus.closed}</span>
                  </div>
                </div>
              </div>

              {/* Real Operational Activity Feed */}
              <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-800" />
                      <span>Recent Operational Activity</span>
                    </h3>
                    <p className="text-xs text-stone-500">
                      Live audit entries from MongoDB collections. Beneficiary personal data is protected and kept private.
                    </p>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                    {summaryData.recentActivity.length} Events
                  </span>
                </div>

                {summaryData.recentActivity.length === 0 ? (
                  <div className="p-8 text-center text-xs text-stone-500 space-y-1">
                    <p className="font-semibold text-stone-700">No operational activities recorded in MongoDB yet.</p>
                    <p>Activities will stream here automatically when donations are confirmed, assistance requests are submitted, or events are registered.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-stone-100">
                    {summaryData.recentActivity.map((act) => {
                      let badgeColor = "bg-stone-100 text-stone-700 border-stone-200";
                      let IconComponent = Activity;

                      if (act.type === "DONATION") {
                        badgeColor = "bg-emerald-50 text-emerald-800 border-emerald-200";
                        IconComponent = Coins;
                      } else if (act.type === "HELP_REQUEST") {
                        badgeColor = "bg-amber-50 text-amber-800 border-amber-200";
                        IconComponent = HeartHandshake;
                      } else if (act.type === "EVENT") {
                        badgeColor = "bg-sky-50 text-sky-800 border-sky-200";
                        IconComponent = Calendar;
                      } else if (act.type === "BLOG") {
                        badgeColor = "bg-purple-50 text-purple-800 border-purple-200";
                        IconComponent = Newspaper;
                      } else if (act.type === "VOLUNTEER") {
                        badgeColor = "bg-indigo-50 text-indigo-800 border-indigo-200";
                        IconComponent = Users;
                      }

                      return (
                        <div key={act.id} className="p-4 hover:bg-stone-50/50 transition-colors flex items-start justify-between gap-4 text-xs">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg border shrink-0 ${badgeColor}`}>
                              <IconComponent className="w-3.5 h-3.5" />
                            </div>
                            <div className="space-y-0.5">
                              <div className="font-semibold text-stone-900 text-xs sm:text-sm">{act.title}</div>
                              <div className="text-stone-500 text-[11px]">{act.description}</div>
                            </div>
                          </div>
                          <div className="text-stone-400 font-mono text-[10px] shrink-0 text-right whitespace-nowrap">
                            {formatDate(act.timestamp)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ================= TAB 1: AUDITS ================= */}
      {activeTab === "audits" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-serif font-bold text-stone-900">
                  Impact Passport Verification Queue
                </h2>
                <p className="text-xs text-stone-500">
                  Authorize evidence dockets to advance passports across verification stages.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-500 font-semibold border-b border-stone-100">
                  <tr>
                    <th className="px-5 py-3">Passport & Docket</th>
                    <th className="px-5 py-3">Cause Allocation</th>
                    <th className="px-5 py-3">Stage Under Audit</th>
                    <th className="px-5 py-3">Submitted By</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Audit Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                  {queue.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-stone-500">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto mb-2 border border-emerald-200">
                          <FileCheck className="w-5 h-5" />
                        </div>
                        <p className="font-serif font-bold text-sm text-stone-800">No Pending Audits in Queue</p>
                        <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
                          Audit queue items will appear here as donations are disbursed and verification documents are logged by Trust coordinators.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    queue.map((item) => {
                    const isPending = item.status === "Pending Audit";
                    return (
                      <tr key={item.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="px-5 py-3.5">
                          <span className="font-mono font-bold text-stone-900 block">
                            #{item.passportId}
                          </span>
                          <span className="text-[10px] text-stone-400 font-mono">
                            Doc: {item.vendorDoc} ({item.amount})
                          </span>
                        </td>
                        <td className="px-5 py-3.5 max-w-xs truncate">{item.causeTitle}</td>
                        <td className="px-5 py-3.5 font-semibold text-stone-800">
                          {item.stageToVerify}
                        </td>
                        <td className="px-5 py-3.5 text-stone-500">
                          <div>{item.submittedBy}</div>
                          <div className="text-[10px] text-stone-400">{item.date}</div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded ${
                              isPending
                                ? "bg-amber-50 text-amber-900 border border-amber-300"
                                : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            }`}
                          >
                            {isPending ? (
                              <Clock className="w-3 h-3 text-amber-700" />
                            ) : (
                              <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                            )}
                            {item.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          {isPending ? (
                            <Button
                              size="sm"
                              className="bg-[#14532d] hover:bg-[#0f4023] text-white text-xs px-3"
                              onClick={() => handleVerifyItem(item.id)}
                              leftIcon={<Check className="w-3 h-3" />}
                            >
                              Approve Audit
                            </Button>
                          ) : (
                            <Link to={`/impact-passport?id=${item.passportId}`}>
                              <span className="text-emerald-800 hover:underline inline-flex items-center gap-1">
                                <span>View Passport</span>
                                <ExternalLink className="w-3 h-3" />
                              </span>
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB: CAUSES & CAMPAIGNS (MONGODB BACKED) ================= */}
      {activeTab === "causes" && (
        <div className="space-y-6">
          {/* Top Controls & Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">Total Campaigns</span>
              <span className="text-2xl font-serif font-bold text-stone-900 mt-1 block">{causes.length}</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">Active Drives</span>
              <span className="text-2xl font-serif font-bold text-emerald-800 mt-1 block">
                {causes.filter((c) => c.status === "ACTIVE").length}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">Total Target</span>
              <span className="text-xl font-serif font-bold text-stone-900 mt-1 block">
                {formatCurrency(causes.reduce((sum, c) => sum + (c.targetAmount || 0), 0))}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">Total Raised</span>
              <span className="text-xl font-serif font-bold text-[#14532d] mt-1 block">
                {formatCurrency(causes.reduce((sum, c) => sum + (c.raisedAmount || 0), 0))}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-serif font-bold text-stone-900">
                    Charitable Causes & Campaigns Directory
                  </h2>
                  <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded border border-emerald-300">
                    Live MongoDB
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  Manage public fundraising drives, update targets, adjust status, and coordinate Kumbh initiatives.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={fetchAdminCauses}
                  leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                  className="text-xs"
                >
                  Sync
                </Button>
                {user?.role === "ADMIN" && (
                  <Button
                    size="sm"
                    onClick={openCreateModal}
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                    className="bg-[#14532d] hover:bg-[#0f4023] text-white text-xs font-semibold"
                  >
                    Create New Campaign
                  </Button>
                )}
              </div>
            </div>

            {/* Search Filter */}
            <div className="p-4 bg-stone-50/70 border-b border-stone-100 flex items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter campaigns by title, category, or location..."
                  value={causeSearch}
                  onChange={(e) => setCauseSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-stone-200 rounded-md text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-emerald-700"
                />
              </div>
            </div>

            {/* Main Table or Loading/Error State */}
            {isCausesLoading ? (
              <div className="py-16 flex flex-col items-center justify-center gap-2 text-stone-500">
                <Loader2 className="w-6 h-6 animate-spin text-[#14532d]" />
                <span className="text-xs">Fetching campaigns from database...</span>
              </div>
            ) : causesError ? (
              <div className="p-8 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
                <p className="text-xs text-rose-800 font-medium">{causesError}</p>
                <Button size="sm" variant="outline" onClick={fetchAdminCauses} className="mx-auto text-xs">
                  Retry
                </Button>
              </div>
            ) : causes.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Layers className="w-10 h-10 text-stone-300 mx-auto" />
                <h3 className="font-serif font-bold text-stone-800 text-sm">No Campaigns Found in Database</h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  There are currently no campaigns in the database. Use the button below to launch your first charitable initiative.
                </p>
                <Button size="sm" onClick={openCreateModal} leftIcon={<Plus className="w-3.5 h-3.5" />} className="bg-[#14532d] hover:bg-[#0f4023] text-white text-xs mx-auto">
                  Create First Campaign
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-stone-500 font-semibold border-b border-stone-100">
                    <tr>
                      <th className="px-5 py-3">Campaign</th>
                      <th className="px-5 py-3">Category</th>
                      <th className="px-5 py-3">Target & Progress</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                    {causes
                      .filter((c) => {
                        if (!causeSearch.trim()) return true;
                        const q = causeSearch.toLowerCase();
                        return (
                          c.title.toLowerCase().includes(q) ||
                          c.category.toLowerCase().includes(q) ||
                          (c.location && c.location.toLowerCase().includes(q))
                        );
                      })
                      .map((c) => {
                        const target = c.targetAmount || 1;
                        const raised = c.raisedAmount || 0;
                        const pct = Math.min(100, Math.round((raised / target) * 100));

                        return (
                          <tr key={c.id} className="hover:bg-stone-50/50">
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <img
                                  src={c.imageUrl}
                                  alt=""
                                  className="w-10 h-10 rounded-md object-cover border border-stone-200 shrink-0"
                                />
                                <div>
                                  <div className="font-semibold text-stone-900 flex items-center gap-1.5 flex-wrap">
                                    <span>{c.title}</span>
                                    {c.isKumbhRelated && (
                                      <span className="text-[10px] px-1.5 py-0.2 bg-amber-100 text-amber-900 rounded font-medium border border-amber-300">
                                        Kumbh
                                      </span>
                                    )}
                                    {c.urgent && (
                                      <span className="text-[10px] px-1.5 py-0.2 bg-rose-100 text-rose-900 rounded font-medium border border-rose-200">
                                        Urgent
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-stone-400 font-mono">
                                    Slug: {c.slug || c.id}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-3.5 text-stone-600">
                              <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-medium">
                                {c.category}
                              </span>
                            </td>

                            <td className="px-5 py-3.5">
                              <div className="space-y-1 max-w-48">
                                <div className="flex justify-between text-[11px]">
                                  <span className="font-bold text-stone-900">{formatCurrency(raised)}</span>
                                  <span className="text-stone-400">of {formatCurrency(c.targetAmount)}</span>
                                </div>
                                <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className="bg-[#14532d] h-full rounded-full"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <div className="text-[10px] text-stone-400 text-right">{pct}% funded</div>
                              </div>
                            </td>

                            <td className="px-5 py-3.5">
                              <span
                                className={`px-2 py-0.5 rounded text-[11px] font-semibold inline-flex items-center gap-1 ${
                                  c.status === "ACTIVE"
                                    ? "bg-emerald-50 text-emerald-900 border border-emerald-300"
                                    : c.status === "DRAFT"
                                    ? "bg-stone-100 text-stone-700 border border-stone-300"
                                    : c.status === "COMPLETED"
                                    ? "bg-sky-50 text-sky-900 border border-sky-300"
                                    : "bg-amber-50 text-amber-900 border border-amber-300"
                                }`}
                              >
                                {c.status || "ACTIVE"}
                              </span>
                            </td>

                            <td className="px-5 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Link
                                  to={`/causes/${c.id}`}
                                  target="_blank"
                                  className="p-1.5 rounded hover:bg-stone-100 text-stone-500 hover:text-stone-900 transition-colors"
                                  title="View on public site"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </Link>

                                {user?.role === "ADMIN" && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => openEditModal(c)}
                                      className="p-1.5 rounded hover:bg-stone-100 text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
                                      title="Edit Campaign"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleToggleStatus(c)}
                                      className="p-1.5 rounded hover:bg-stone-100 text-stone-600 hover:text-amber-800 transition-colors cursor-pointer"
                                      title={c.status === "ACTIVE" ? "Archive Campaign" : "Publish / Activate Campaign"}
                                    >
                                      <Archive className="w-3.5 h-3.5" />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleDeleteCause(c)}
                                      className="p-1.5 rounded hover:bg-rose-50 text-stone-400 hover:text-rose-700 transition-colors cursor-pointer"
                                      title="Delete Campaign"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB: EVENTS & FIELD DRIVES ================= */}
      {activeTab === "events" && (
        <div className="space-y-6">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">Total Scheduled</span>
              <span className="text-2xl font-serif font-bold text-stone-900 mt-1 block">{events.length}</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">Upcoming Events</span>
              <span className="text-2xl font-serif font-bold text-emerald-800 mt-1 block">
                {events.filter((e) => e.status === "UPCOMING").length}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">Total Registrations</span>
              <span className="text-2xl font-serif font-bold text-stone-900 mt-1 block">
                {events.reduce((sum, e) => sum + (e.registrationCount ?? e.registeredCount ?? 0), 0)}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block">Kumbh Drives</span>
              <span className="text-2xl font-serif font-bold text-amber-800 mt-1 block">
                {events.filter((e) => e.isKumbhRelated).length}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-serif font-bold text-stone-900">
                    Events, Drives & Orientation Sessions
                  </h2>
                  <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded border border-emerald-300">
                    Live MongoDB
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  Schedule preparatory volunteer camps, community hygiene drives, and Nashik Simhastha orientations with live attendee tracking.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={fetchAdminEvents}
                  leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                  className="text-xs"
                >
                  Sync
                </Button>
                <Button
                  size="sm"
                  onClick={openCreateEventModal}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  className="bg-[#14532d] hover:bg-[#0f4023] text-white text-xs font-semibold"
                >
                  Schedule New Event
                </Button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="p-4 bg-stone-50/70 border-b border-stone-100 flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full max-w-md">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter events by title, category, or location..."
                  value={eventSearch}
                  onChange={(e) => setEventSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-stone-200 rounded-md text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-emerald-700"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-3.5 h-3.5 text-stone-400" />
                <select
                  value={eventStatusFilter}
                  onChange={(e) => setEventStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-stone-200 rounded-md text-xs text-stone-800 focus:outline-none focus:border-emerald-700"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="UPCOMING">Upcoming</option>
                  <option value="ONGOING">Ongoing</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="DRAFT">Draft (Hidden)</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Main Table or Loading/Error State */}
            {isEventsLoading ? (
              <div className="py-16 flex flex-col items-center justify-center gap-2 text-stone-500">
                <Loader2 className="w-6 h-6 animate-spin text-[#14532d]" />
                <span className="text-xs">Fetching events from database...</span>
              </div>
            ) : eventsError ? (
              <div className="p-8 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
                <p className="text-xs text-rose-800 font-medium">{eventsError}</p>
                <Button size="sm" variant="outline" onClick={fetchAdminEvents} className="mx-auto text-xs">
                  Retry
                </Button>
              </div>
            ) : events.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Calendar className="w-10 h-10 text-stone-300 mx-auto" />
                <h3 className="font-serif font-bold text-stone-800 text-sm">No Events in Database</h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  There are currently no events registered. Click below to organize a new community seva or orientation drive.
                </p>
                <Button size="sm" onClick={openCreateEventModal} leftIcon={<Plus className="w-3.5 h-3.5" />} className="bg-[#14532d] hover:bg-[#0f4023] text-white text-xs mx-auto">
                  Schedule First Event
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-stone-500 font-semibold border-b border-stone-100">
                    <tr>
                      <th className="px-5 py-3">Event Details</th>
                      <th className="px-5 py-3">Date & Location</th>
                      <th className="px-5 py-3">Capacity & Registrations</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                    {events
                      .filter((e) => {
                        if (eventStatusFilter !== "ALL" && e.status !== eventStatusFilter) return false;
                        if (!eventSearch.trim()) return true;
                        const q = eventSearch.toLowerCase();
                        return (
                          e.title.toLowerCase().includes(q) ||
                          (e.category && e.category.toLowerCase().includes(q)) ||
                          (e.location && e.location.toLowerCase().includes(q))
                        );
                      })
                      .map((e) => {
                        const count = e.registrationCount ?? e.registeredCount ?? 0;
                        const limit = e.registrationLimit ?? e.capacity ?? 0;
                        const isFull = limit > 0 && count >= limit;

                        return (
                          <tr key={e.id} className="hover:bg-stone-50/50">
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <img
                                  src={e.imageUrl}
                                  alt=""
                                  className="w-10 h-10 rounded-md object-cover border border-stone-200 shrink-0"
                                />
                                <div>
                                  <div className="font-semibold text-stone-900 flex items-center gap-1.5 flex-wrap">
                                    <span>{e.title}</span>
                                    {e.isKumbhRelated && (
                                      <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded border border-amber-300">
                                        Kumbh Seva
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-stone-500 mt-0.5 line-clamp-1 max-w-xs">
                                    {e.shortDescription || e.description}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-3.5">
                              <div className="space-y-1">
                                <div className="text-stone-900 font-semibold flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                                  <span>{e.date || (e.startDate ? new Date(e.startDate).toLocaleDateString() : "")}</span>
                                  {e.time && <span className="text-stone-500 font-normal">({e.time})</span>}
                                </div>
                                <div className="text-stone-500 flex items-center gap-1 text-[11px]">
                                  <MapPin className="w-3 h-3 text-stone-400" />
                                  <span>{e.location}</span>
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-3.5">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-stone-900">
                                    {count} {limit > 0 ? `/ ${limit}` : ""}
                                  </span>
                                  {isFull ? (
                                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                                      Full
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-stone-500">registered</span>
                                  )}
                                </div>
                                {e.registrationRequired ? (
                                  <span className="text-[10px] text-emerald-800 font-semibold">
                                    Registration mandatory
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-stone-400">Open entry</span>
                                )}
                              </div>
                            </td>

                            <td className="px-5 py-3.5">
                              <select
                                value={e.status}
                                onChange={(evt) => handleUpdateEventStatus(e, evt.target.value as EventStatus)}
                                className={`text-[11px] font-semibold px-2 py-1 rounded border cursor-pointer focus:outline-none ${
                                  e.status === "UPCOMING"
                                    ? "bg-emerald-50 text-emerald-900 border-emerald-300"
                                    : e.status === "ONGOING"
                                    ? "bg-sky-50 text-sky-900 border-sky-300"
                                    : e.status === "COMPLETED"
                                    ? "bg-stone-100 text-stone-800 border-stone-300"
                                    : e.status === "DRAFT"
                                    ? "bg-stone-50 text-stone-600 border-stone-200"
                                    : "bg-rose-50 text-rose-800 border-rose-300"
                                }`}
                              >
                                <option value="UPCOMING">UPCOMING</option>
                                <option value="ONGOING">ONGOING</option>
                                <option value="COMPLETED">COMPLETED</option>
                                <option value="DRAFT">DRAFT</option>
                                <option value="CANCELLED">CANCELLED</option>
                              </select>
                            </td>

                            <td className="px-5 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleViewRegistrations(e)}
                                  className="p-1.5 rounded hover:bg-stone-100 text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
                                  title="View Registered Attendees"
                                >
                                  <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                                </button>

                                <Link
                                  to={`/events/${e.slug || e.id}`}
                                  target="_blank"
                                  className="p-1.5 rounded hover:bg-stone-100 text-stone-500 hover:text-stone-900 transition-colors"
                                  title="View public page"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </Link>

                                <button
                                  type="button"
                                  onClick={() => openEditEventModal(e)}
                                  className="p-1.5 rounded hover:bg-stone-100 text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
                                  title="Edit Event"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteEvent(e)}
                                  className="p-1.5 rounded hover:bg-rose-50 text-stone-400 hover:text-rose-700 transition-colors cursor-pointer"
                                  title="Delete Event"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB: BLOG / NEWS MANAGEMENT ================= */}
      {activeTab === "blog" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
            {/* Top Header */}
            <div className="p-5 sm:p-6 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-serif font-bold text-stone-900">
                    News, Field Chronicles & Editorial Desk
                  </h2>
                  <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                    Live MongoDB
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  Manage field reports, medical camp chronicles, transparency articles, and Simhastha Kumbh dispatches.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={fetchAdminBlogPosts}
                  disabled={isBlogLoading}
                  className="text-xs inline-flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isBlogLoading ? "animate-spin text-emerald-700" : ""}`} />
                  <span>Refresh</span>
                </Button>
                <Button
                  size="sm"
                  onClick={openCreateBlogModal}
                  className="bg-[#14532d] hover:bg-[#0f4023] text-white text-xs inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Publish New Story</span>
                </Button>
              </div>
            </div>

            {/* Filter / Search Bar */}
            <div className="p-4 bg-stone-50/70 border-b border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={blogSearch}
                  onChange={(e) => setBlogSearch(e.target.value)}
                  placeholder="Filter stories by title, author, or tag..."
                  className="w-full pl-8.5 pr-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="text-stone-500 font-medium">Category:</span>
                  <select
                    value={blogCategoryFilter}
                    onChange={(e) => setBlogCategoryFilter(e.target.value)}
                    className="bg-white border border-stone-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  >
                    <option value="All">All Categories</option>
                    <option value="Field Updates">Field Updates</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Transparency">Transparency</option>
                    <option value="Education">Education</option>
                    <option value="Governance & Impact">Governance & Impact</option>
                    <option value="Kumbh Seva">Kumbh Seva</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-stone-500 font-medium">Status:</span>
                  <select
                    value={blogPublishedFilter}
                    onChange={(e) => setBlogPublishedFilter(e.target.value)}
                    className="bg-white border border-stone-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="PUBLISHED">Published Only</option>
                    <option value="DRAFT">Drafts Only</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Content / Table */}
            {isBlogLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-2 text-stone-500">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-700" />
                <span className="text-xs">Loading stories from MongoDB...</span>
              </div>
            ) : blogError ? (
              <div className="p-8 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
                <p className="text-xs text-red-700 font-medium">{blogError}</p>
                <Button size="sm" onClick={fetchAdminBlogPosts} className="text-xs">
                  Retry
                </Button>
              </div>
            ) : blogPosts.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <BookOpen className="w-10 h-10 text-stone-300 mx-auto" />
                <h3 className="text-sm font-semibold text-stone-800">No blog posts found in database</h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Click the "Publish New Story" button to write your first field update or news article.
                </p>
                <Button size="sm" onClick={openCreateBlogModal} className="bg-emerald-800 text-white text-xs">
                  Publish First Story
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Story & Details</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Author</th>
                      <th className="py-3 px-4">Published</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {blogPosts
                      .filter((post) => {
                        if (blogCategoryFilter !== "All" && post.category !== blogCategoryFilter) {
                          return false;
                        }
                        if (blogPublishedFilter === "PUBLISHED" && !post.isPublished) {
                          return false;
                        }
                        if (blogPublishedFilter === "DRAFT" && post.isPublished) {
                          return false;
                        }
                        if (blogSearch.trim()) {
                          const q = blogSearch.toLowerCase();
                          const matchTitle = post.title?.toLowerCase().includes(q);
                          const matchExcerpt = post.excerpt?.toLowerCase().includes(q);
                          const matchAuthor = post.author?.toLowerCase().includes(q);
                          const matchTags = (post.tags || []).some((t) => t.toLowerCase().includes(q));
                          if (!matchTitle && !matchExcerpt && !matchAuthor && !matchTags) return false;
                        }
                        return true;
                      })
                      .map((post) => (
                        <tr key={post.id} className="hover:bg-stone-50/70 transition-colors">
                          <td className="py-3.5 px-4 max-w-sm">
                            <div className="flex items-start gap-3">
                              <div className="w-14 h-11 rounded bg-stone-100 overflow-hidden shrink-0 border border-stone-200">
                                <img
                                  src={post.coverImage || post.imageUrl}
                                  alt={post.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      "/activities/image.png";
                                  }}
                                />
                              </div>
                              <div className="space-y-0.5 overflow-hidden">
                                <div className="font-serif font-bold text-stone-900 text-xs truncate flex items-center gap-1.5">
                                  <span>{post.title}</span>
                                  {post.isFeatured && (
                                    <span title="Featured Story">
                                      <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-stone-500 font-mono truncate">
                                  /{post.slug}
                                </div>
                                <p className="text-[11px] text-stone-600 line-clamp-1">
                                  {post.excerpt}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex flex-col gap-1 items-start">
                              <span className="bg-stone-100 text-stone-700 font-semibold px-2 py-0.5 rounded text-[10px]">
                                {post.category}
                              </span>
                              {post.isKumbhRelated && (
                                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5">
                                  <Flame className="w-2.5 h-2.5 text-amber-600" />
                                  <span>Kumbh</span>
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap text-stone-700">
                            {post.author}
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap text-stone-500">
                            <div>{post.publishedDate || post.date}</div>
                            <div className="text-[10px] text-stone-400">{post.readTime}</div>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {post.isPublished ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                                <Check className="w-3 h-3" />
                                <span>Published</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full border border-stone-200">
                                <span>Draft</span>
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap text-right">
                            <div className="inline-flex items-center gap-1">
                              {/* Toggle Publish */}
                              <button
                                type="button"
                                onClick={() => handleTogglePublishBlog(post)}
                                title={post.isPublished ? "Unpublish (Save as Draft)" : "Publish to live website"}
                                className={`p-1.5 rounded transition-colors cursor-pointer ${
                                  post.isPublished
                                    ? "text-emerald-700 hover:bg-emerald-50"
                                    : "text-stone-400 hover:bg-stone-100 hover:text-stone-700"
                                }`}
                              >
                                {post.isPublished ? (
                                  <Eye className="w-3.5 h-3.5" />
                                ) : (
                                  <EyeOff className="w-3.5 h-3.5" />
                                )}
                              </button>

                              {/* Toggle Featured */}
                              <button
                                type="button"
                                onClick={() => handleToggleFeaturedBlog(post)}
                                title={post.isFeatured ? "Unset featured story" : "Set as featured story"}
                                className={`p-1.5 rounded transition-colors cursor-pointer ${
                                  post.isFeatured
                                    ? "text-amber-500 hover:bg-amber-50"
                                    : "text-stone-400 hover:bg-stone-100 hover:text-stone-700"
                                }`}
                              >
                                <Star
                                  className={`w-3.5 h-3.5 ${
                                    post.isFeatured ? "fill-amber-500" : ""
                                  }`}
                                />
                              </button>

                              {/* View live public story */}
                              <Link
                                to={`/blog/${post.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                title="Preview public article"
                                className="p-1.5 rounded text-stone-400 hover:bg-stone-100 hover:text-emerald-800 transition-colors"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>

                              {/* Edit Story */}
                              <button
                                type="button"
                                onClick={() => openEditBlogModal(post)}
                                title="Edit story"
                                className="p-1.5 rounded text-stone-500 hover:bg-stone-100 hover:text-stone-800 transition-colors cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Story */}
                              <button
                                type="button"
                                onClick={() => handleDeleteBlog(post)}
                                title="Delete story permanently"
                                className="p-1.5 rounded text-stone-400 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB: TRANSPARENCY / ANNUAL REPORTS MANAGEMENT ================= */}
      {activeTab === "transparency" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
            {/* Top Header */}
            <div className="p-5 sm:p-6 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-serif font-bold text-stone-900">
                    Annual & Audit Reports Ledger
                  </h2>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full">
                    MongoDB
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  Publish statutory audited accounts, institutional review statements, and official governance filings.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={fetchAdminTransparencyReports}
                  leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isTransparencyLoading ? "animate-spin" : ""}`} />}
                  className="text-xs text-stone-700"
                >
                  Refresh
                </Button>
                <Button
                  size="sm"
                  onClick={openCreateTransparencyModal}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  className="bg-[#14532d] hover:bg-[#0f4023] text-white text-xs"
                >
                  Add Report
                </Button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 bg-stone-50/70 border-b border-stone-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search by title, auditor, financial year..."
                  value={transparencySearch}
                  onChange={(e) => setTransparencySearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-stone-200 rounded-md text-xs text-stone-800 focus:outline-none focus:border-emerald-700"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* Type Filter */}
                <select
                  value={transparencyTypeFilter}
                  onChange={(e) => setTransparencyTypeFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-stone-200 rounded-md text-xs text-stone-700 focus:outline-none focus:border-emerald-700"
                >
                  <option value="All">All Types</option>
                  <option value="Annual Report">Annual Report</option>
                  <option value="Financial Report">Financial Report</option>
                  <option value="Audit Report">Audit Report</option>
                  <option value="Impact Report">Impact Report</option>
                  <option value="Donation Utilization Report">Donation Utilization</option>
                  <option value="Other">Other</option>
                </select>

                {/* Published / Draft filter */}
                <select
                  value={transparencyPublishedFilter}
                  onChange={(e) => setTransparencyPublishedFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-stone-200 rounded-md text-xs text-stone-700 focus:outline-none focus:border-emerald-700"
                >
                  <option value="ALL">All States</option>
                  <option value="true">Published Only</option>
                  <option value="false">Drafts Only</option>
                </select>
              </div>
            </div>

            {/* Table / Loading / Empty */}
            {isTransparencyLoading ? (
              <div className="py-16 flex flex-col items-center justify-center gap-2 text-stone-500">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-800" />
                <span className="text-xs">Fetching reports from MongoDB...</span>
              </div>
            ) : transparencyError ? (
              <div className="p-8 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
                <p className="text-xs text-rose-800 font-medium">{transparencyError}</p>
                <Button size="sm" variant="outline" onClick={fetchAdminTransparencyReports} className="mx-auto text-xs">
                  Retry Connection
                </Button>
              </div>
            ) : transparencyReports.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <FileText className="w-10 h-10 text-stone-300 mx-auto" />
                <h3 className="font-serif font-bold text-stone-800 text-sm">No Reports in Database</h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  There are currently no transparency reports stored in MongoDB. Click below to add an official audit docket or annual report.
                </p>
                <Button
                  size="sm"
                  onClick={openCreateTransparencyModal}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  className="bg-[#14532d] hover:bg-[#0f4023] text-white text-xs mx-auto"
                >
                  Upload First Report
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-stone-500 font-semibold border-b border-stone-100">
                    <tr>
                      <th className="py-3 px-4">Report Details</th>
                      <th className="py-3 px-4">Type & Year</th>
                      <th className="py-3 px-4">Statutory Disclosures</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                    {transparencyReports
                      .filter((report) => {
                        if (transparencyTypeFilter !== "All" && report.reportType !== transparencyTypeFilter) return false;
                        if (transparencyPublishedFilter !== "ALL") {
                          const mustBePub = transparencyPublishedFilter === "true";
                          if (Boolean(report.isPublished) !== mustBePub) return false;
                        }
                        if (!transparencySearch.trim()) return true;
                        const q = transparencySearch.toLowerCase();
                        return (
                          report.title.toLowerCase().includes(q) ||
                          (report.financialYear && report.financialYear.toLowerCase().includes(q)) ||
                          (report.auditorFirm && report.auditorFirm.toLowerCase().includes(q)) ||
                          (report.description && report.description.toLowerCase().includes(q))
                        );
                      })
                      .map((report) => (
                        <tr key={report.id} className="hover:bg-stone-50/70 transition-colors">
                          <td className="py-3.5 px-4 max-w-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-stone-900 line-clamp-1">{report.title}</span>
                              {report.isFeatured && (
                                <span className="text-[10px] text-amber-600 font-bold" title="Featured Report">
                                  ★
                                </span>
                              )}
                            </div>
                            {report.description && (
                              <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                                {report.description}
                              </p>
                            )}
                            {report.fileSize && (
                              <span className="text-[10px] text-stone-400 mt-0.5 block">
                                {report.fileSize}
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex flex-col gap-1 items-start">
                              <span className="font-semibold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                                {report.financialYear}
                              </span>
                              <span className="text-[10px] text-stone-500">
                                {report.reportType || "Annual Report"}
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 max-w-xs text-stone-600">
                            {report.auditorFirm && (
                              <div className="text-[11px] line-clamp-1">
                                <span className="font-semibold">Auditor:</span> {report.auditorFirm}
                              </div>
                            )}
                            {report.statutoryType && (
                              <div className="text-[11px] text-stone-500 line-clamp-1">
                                <span className="font-semibold">Type:</span> {report.statutoryType}
                              </div>
                            )}
                            {report.totalDisbursal && (
                              <div className="text-[10px] text-emerald-800 font-semibold">
                                Disbursal: {report.totalDisbursal}
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {report.isPublished ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                                <Check className="w-3 h-3" />
                                <span>Published</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full border border-stone-200">
                                <span>Draft</span>
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap text-right">
                            <div className="inline-flex items-center gap-1">
                              {/* Toggle Publish */}
                              <button
                                type="button"
                                onClick={() => handleTogglePublishTransparency(report)}
                                title={report.isPublished ? "Unpublish (Save as Draft)" : "Publish to live website"}
                                className={`p-1.5 rounded transition-colors cursor-pointer ${
                                  report.isPublished
                                    ? "text-emerald-700 hover:bg-emerald-50"
                                    : "text-stone-400 hover:bg-stone-100 hover:text-stone-700"
                                }`}
                              >
                                {report.isPublished ? (
                                  <Eye className="w-3.5 h-3.5" />
                                ) : (
                                  <EyeOff className="w-3.5 h-3.5" />
                                )}
                              </button>

                              {/* Toggle Featured */}
                              <button
                                type="button"
                                onClick={() => handleToggleFeaturedTransparency(report)}
                                title={report.isFeatured ? "Unset featured report" : "Set as featured report"}
                                className={`p-1.5 rounded transition-colors cursor-pointer ${
                                  report.isFeatured
                                    ? "text-amber-500 hover:bg-amber-50"
                                    : "text-stone-400 hover:bg-stone-100 hover:text-stone-700"
                                }`}
                              >
                                <Star
                                  className={`w-3.5 h-3.5 ${
                                    report.isFeatured ? "fill-amber-500" : ""
                                  }`}
                                />
                              </button>

                              {/* View Document link */}
                              {report.fileUrl && (
                                <a
                                  href={report.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="View document file"
                                  className="p-1.5 rounded text-stone-400 hover:bg-stone-100 hover:text-emerald-800 transition-colors"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}

                              {/* Edit Report */}
                              <button
                                type="button"
                                onClick={() => openEditTransparencyModal(report)}
                                title="Edit report details"
                                className="p-1.5 rounded text-stone-500 hover:bg-stone-100 hover:text-stone-800 transition-colors cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Report */}
                              <button
                                type="button"
                                onClick={() => handleDeleteTransparency(report)}
                                title="Delete report permanently"
                                className="p-1.5 rounded text-stone-400 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 2: AID APPLICATIONS ================= */}
      {activeTab === "help" && (
        <div className="space-y-6">
          {/* Status Metrics Ribbon */}
          {helpMetrics && (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
              <div className="bg-white p-3 rounded-lg border border-stone-200 text-center">
                <span className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold block">Total</span>
                <span className="text-lg font-bold text-stone-900">{helpMetrics.total}</span>
              </div>
              <div className="bg-amber-50/60 p-3 rounded-lg border border-amber-200 text-center">
                <span className="text-[10px] text-amber-800 uppercase tracking-wider font-semibold block">Pending</span>
                <span className="text-lg font-bold text-amber-900">{helpMetrics.pending}</span>
              </div>
              <div className="bg-blue-50/60 p-3 rounded-lg border border-blue-200 text-center">
                <span className="text-[10px] text-blue-800 uppercase tracking-wider font-semibold block">Under Review</span>
                <span className="text-lg font-bold text-blue-900">{helpMetrics.underReview}</span>
              </div>
              <div className="bg-emerald-50/60 p-3 rounded-lg border border-emerald-200 text-center">
                <span className="text-[10px] text-emerald-800 uppercase tracking-wider font-semibold block">Approved</span>
                <span className="text-lg font-bold text-emerald-900">{helpMetrics.approved}</span>
              </div>
              <div className="bg-sky-50/60 p-3 rounded-lg border border-sky-200 text-center">
                <span className="text-[10px] text-sky-800 uppercase tracking-wider font-semibold block">In Progress</span>
                <span className="text-lg font-bold text-sky-900">{helpMetrics.inProgress}</span>
              </div>
              <div className="bg-teal-50/60 p-3 rounded-lg border border-teal-200 text-center">
                <span className="text-[10px] text-teal-800 uppercase tracking-wider font-semibold block">Resolved</span>
                <span className="text-lg font-bold text-teal-900">{helpMetrics.resolved}</span>
              </div>
              <div className="bg-rose-50/60 p-3 rounded-lg border border-rose-200 text-center">
                <span className="text-[10px] text-rose-800 uppercase tracking-wider font-semibold block">Rejected</span>
                <span className="text-lg font-bold text-rose-900">{helpMetrics.rejected}</span>
              </div>
            </div>
          )}

          {/* Search, Filters, and Refresh Controls */}
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={helpSearch}
                  onChange={(e) => setHelpSearch(e.target.value)}
                  placeholder="Search by applicant name, phone, email, town, or keywords..."
                  className="w-full pl-9 pr-3 py-2 text-xs text-stone-800 placeholder-stone-400 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={helpStatusFilter}
                  onChange={(e) => setHelpStatusFilter(e.target.value as any)}
                  className="px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white text-stone-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="APPROVED">Approved</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="CLOSED">Closed</option>
                </select>

                <select
                  value={helpTypeFilter}
                  onChange={(e) => setHelpTypeFilter(e.target.value as any)}
                  className="px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white text-stone-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                >
                  <option value="ALL">All Categories</option>
                  <option value="Medical">Medical</option>
                  <option value="Education">Education</option>
                  <option value="Food">Food</option>
                  <option value="Shelter">Shelter</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Other">Other</option>
                </select>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={fetchAdminHelpRequests}
                  disabled={isHelpLoading}
                  className="px-3 text-xs"
                >
                  {isHelpLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-serif font-bold text-stone-900">
                  Beneficiary Aid & Hardship Requests (MongoDB)
                </h2>
                <p className="text-xs text-stone-500">
                  Real persistence with MongoDB indexation, reviewer audit tracking, and sensitive data access enforcement.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                {helpRequests.length} Applications Shown
              </span>
            </div>

            {isHelpLoading ? (
              <div className="py-16 text-center text-stone-500 text-xs flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-700" />
                <span>Loading applications from database...</span>
              </div>
            ) : helpError ? (
              <div className="p-6 text-center text-xs text-rose-800 bg-rose-50 flex flex-col items-center gap-2">
                <AlertCircle className="w-6 h-6 text-rose-600" />
                <span>{helpError}</span>
                <Button size="sm" variant="outline" onClick={fetchAdminHelpRequests} className="mt-2">
                  Retry Loading
                </Button>
              </div>
            ) : helpRequests.length === 0 ? (
              <div className="py-16 text-center text-stone-500 text-xs space-y-2">
                <HeartHandshake className="w-8 h-8 text-stone-300 mx-auto" />
                <div className="font-semibold text-stone-700 text-sm">No Aid Applications Found</div>
                <p className="text-stone-400 max-w-sm mx-auto">
                  There are no help requests matching the current filters. When community members apply, they will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-stone-500 font-semibold border-b border-stone-100">
                    <tr>
                      <th className="px-5 py-3">Docket ID</th>
                      <th className="px-5 py-3">Applicant Details</th>
                      <th className="px-5 py-3">Category & Urgency</th>
                      <th className="px-5 py-3">Location</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Filed On</th>
                      <th className="px-5 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                    {helpRequests.map((hr) => (
                      <tr key={hr.id} className="hover:bg-stone-50/50">
                        <td className="px-5 py-3.5 font-mono font-bold text-stone-900">
                          {hr.id.substring(0, 8)}...
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-stone-900">{hr.name}</div>
                          <div className="text-[11px] text-stone-500 flex items-center gap-2">
                            <span>{hr.phone}</span>
                            <span>•</span>
                            <span>{hr.email}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-stone-800">{hr.requestType}</div>
                          <span
                            className={`inline-block text-[10px] px-1.5 py-0.5 rounded font-bold border mt-0.5 ${
                              hr.urgency === "CRITICAL"
                                ? "bg-rose-100 text-rose-800 border-rose-200"
                                : hr.urgency === "HIGH"
                                ? "bg-orange-100 text-orange-800 border-orange-200"
                                : hr.urgency === "MEDIUM"
                                ? "bg-amber-100 text-amber-800 border-amber-200"
                                : "bg-stone-100 text-stone-600 border-stone-200"
                            }`}
                          >
                            {hr.urgency}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-stone-600 max-w-[150px] truncate" title={hr.location}>
                          {hr.location}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                              hr.status === "APPROVED"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                : hr.status === "RESOLVED" || hr.status === "CLOSED"
                                ? "bg-teal-50 text-teal-800 border-teal-300"
                                : hr.status === "IN_PROGRESS"
                                ? "bg-sky-50 text-sky-800 border-sky-300"
                                : hr.status === "UNDER_REVIEW"
                                ? "bg-amber-50 text-amber-800 border-amber-300"
                                : hr.status === "REJECTED"
                                ? "bg-rose-50 text-rose-800 border-rose-300"
                                : "bg-stone-100 text-stone-700 border-stone-300"
                            }`}
                          >
                            {hr.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-stone-500 text-[11px]">
                          {formatDate(hr.createdAt)}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs px-2.5 h-7"
                            onClick={() => handleOpenHelpModal(hr)}
                          >
                            Review Docket
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 3: VOLUNTEERS ================= */}
      {activeTab === "volunteers" && (
        <div className="space-y-6">
          {/* Section 1: Shifts & Attendance Records */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h2 className="text-base font-serif font-bold text-stone-900">
                  Volunteer Shifts & Attendance Records
                </h2>
                <p className="text-xs text-stone-500">
                  Real MongoDB sevadar attendance records. Verify hours to stamp digital certificates.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs gap-1.5"
                  onClick={fetchAdminVolunteerData}
                  disabled={isAdminShiftsLoading}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isAdminShiftsLoading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                  Real MongoDB
                </span>
              </div>
            </div>

            {isAdminShiftsLoading ? (
              <div className="py-12 text-center space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-stone-400 mx-auto" />
                <p className="text-xs text-stone-500">Loading volunteer shifts from database...</p>
              </div>
            ) : adminShiftsError ? (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center justify-between">
                <span>{adminShiftsError}</span>
                <Button size="sm" variant="outline" onClick={fetchAdminVolunteerData}>
                  Retry
                </Button>
              </div>
            ) : adminShifts.length === 0 ? (
              <div className="py-12 text-center bg-stone-50 rounded-lg border border-stone-200 p-6 space-y-2">
                <Clock className="w-8 h-8 text-stone-300 mx-auto" />
                <h3 className="font-semibold text-stone-700 text-sm">No Volunteer Shifts in Database</h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Empty database = 0. When volunteers log shifts through the portal, they will appear here for supervisor verification.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {adminShifts.map((vs) => {
                  const isVerified =
                    vs.status === "COMPLETED" ||
                    vs.status === "Completed & Verified" ||
                    vs.status === "Completed";
                  const shiftId = vs.id || vs._id || "";

                  return (
                    <div
                      key={shiftId}
                      className="p-3.5 rounded-lg border border-stone-200 bg-stone-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-stone-900 text-sm">
                            {vs.roleTitle || vs.role}
                          </span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-medium border ${
                              isVerified
                                ? "text-emerald-700 bg-emerald-100 border-emerald-300"
                                : "text-amber-700 bg-amber-100 border-amber-300"
                            }`}
                          >
                            {isVerified ? "Verified" : "Pending Verification"}
                          </span>
                        </div>
                        <div className="text-stone-500 text-[11px] flex items-center gap-2 flex-wrap">
                          <span>{vs.location}</span>
                          <span>•</span>
                          <span>{vs.date}</span>
                          {vs.supervisor && (
                            <>
                              <span>•</span>
                              <span>Supervisor: {vs.supervisor}</span>
                            </>
                          )}
                        </div>
                        {vs.notes && (
                          <div className="text-stone-600 text-[11px] italic">
                            "{vs.notes}"
                          </div>
                        )}
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                        <div className="font-serif font-bold text-emerald-800 text-sm">
                          +{vs.hours} Hours
                        </div>
                        {!isVerified && shiftId && (
                          <Button
                            size="sm"
                            variant="primary"
                            className="h-7 text-xs px-2.5"
                            isLoading={verifyingShiftId === shiftId}
                            onClick={() => handleVerifyShift(shiftId)}
                          >
                            Verify & Stamp
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Volunteer Applications Queue */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h2 className="text-base font-serif font-bold text-stone-900">
                  Volunteer Applications Queue
                </h2>
                <p className="text-xs text-stone-500">
                  Applications submitted by prospective sevadars seeking trust accreditation.
                </p>
              </div>
              <span className="text-xs text-stone-500 font-medium">
                {adminApplications.length} total applications
              </span>
            </div>

            {adminApplications.length === 0 ? (
              <div className="py-8 text-center bg-stone-50 rounded-lg border border-stone-200 p-4 space-y-1">
                <Users className="w-6 h-6 text-stone-300 mx-auto" />
                <p className="text-xs text-stone-500">No volunteer applications currently pending review.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {adminApplications.map((app) => (
                  <div
                    key={app._id}
                    className="p-3.5 rounded-lg border border-stone-200 bg-stone-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-stone-900 text-sm">{app.fullName}</span>
                        <span className="text-stone-400 text-xs">applied for</span>
                        <span className="font-medium text-[#14532d] bg-emerald-50 px-1.5 py-0.5 rounded text-[11px]">
                          {app.roleTitle}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-medium border ${
                            app.status === "APPROVED"
                              ? "text-emerald-700 bg-emerald-100 border-emerald-300"
                              : app.status === "REJECTED"
                              ? "text-red-700 bg-red-100 border-red-300"
                              : "text-amber-700 bg-amber-100 border-amber-300"
                          }`}
                        >
                          {app.status}
                        </span>
                      </div>
                      <div className="text-stone-500 text-[11px] flex items-center gap-2 flex-wrap">
                        <span>{app.email}</span>
                        <span>•</span>
                        <span>{app.phone}</span>
                        <span>•</span>
                        <span>{app.city}</span>
                        {app.isCollegeStudent && (
                          <>
                            <span>•</span>
                            <span className="text-amber-800 font-medium">
                              College Student ({app.collegeName || "NSS"})
                            </span>
                          </>
                        )}
                      </div>
                      {app.motivation && (
                        <p className="text-stone-600 text-[11px] italic">"{app.motivation}"</p>
                      )}
                    </div>

                    {app.status === "PENDING" && (
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs px-2.5 text-red-700 hover:bg-red-50 border-red-200"
                          isLoading={reviewingAppId === app._id}
                          onClick={() => handleReviewApplication(app._id, "REJECTED")}
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="primary"
                          className="h-7 text-xs px-2.5"
                          isLoading={reviewingAppId === app._id}
                          onClick={() => handleReviewApplication(app._id, "APPROVED")}
                        >
                          Approve Sevadar
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 4: DONATIONS ================= */}
      {activeTab === "donations" && (
        <div className="space-y-6">
          {/* Metrics Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs">
              <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                Total Verified Collections
              </div>
              <div className="text-xl sm:text-2xl font-serif font-bold text-emerald-800 mt-1">
                {formatCurrency(donationMetrics?.totalCollected || 0)}
              </div>
              <div className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified via HMAC-SHA256
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs">
              <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                Successful Donations
              </div>
              <div className="text-xl sm:text-2xl font-serif font-bold text-stone-900 mt-1">
                {donationMetrics?.totalVerifiedDonations || 0}
              </div>
              <div className="text-[11px] text-stone-500 mt-1">
                Issued Official Trust Receipts
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs">
              <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                Pending Gateway Orders
              </div>
              <div className="text-xl sm:text-2xl font-serif font-bold text-amber-700 mt-1">
                {donationMetrics?.pendingDonations || 0}
              </div>
              <div className="text-[11px] text-stone-500 mt-1">
                Awaiting Checkout Completion
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs">
              <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                Failed / Expired Orders
              </div>
              <div className="text-xl sm:text-2xl font-serif font-bold text-stone-700 mt-1">
                {donationMetrics?.failedDonations || 0}
              </div>
              <div className="text-[11px] text-stone-500 mt-1">
                Zero Fund Allocation
              </div>
            </div>
          </div>

          {/* Ledger Table Container */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-2xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
              <div>
                <h2 className="text-base font-serif font-bold text-stone-900">
                  Trust Financial Ledger & Gateway Audit
                </h2>
                <p className="text-xs text-stone-500">
                  Real-time MongoDB records synchronized with Razorpay payment events.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fetchAdminDonations()}
                  disabled={isDonationsLoading}
                  leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isDonationsLoading ? "animate-spin" : ""}`} />}
                  className="text-xs"
                >
                  Refresh
                </Button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by receipt no, donor name, email, or order ID..."
                  value={donationsSearch}
                  onChange={(e) => setDonationsSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-md text-xs focus:bg-white focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="sm:w-48">
                <select
                  value={donationsFilterStatus}
                  onChange={(e) => setDonationsFilterStatus(e.target.value)}
                  className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-md text-xs font-medium text-stone-700 focus:bg-white focus:outline-none focus:border-emerald-600"
                >
                  <option value="">All Statuses</option>
                  <option value="SUCCESS">Verified Success</option>
                  <option value="PENDING">Pending Checkout</option>
                  <option value="CREATED">Created (Initiated)</option>
                  <option value="FAILED">Failed</option>
                  <option value="REFUNDED">Refunded</option>
                </select>
              </div>
            </div>

            {/* Error Message */}
            {donationsError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{donationsError}</span>
              </div>
            )}

            {/* Table or Loader */}
            {isDonationsLoading ? (
              <div className="py-16 flex flex-col items-center justify-center gap-2 text-stone-500">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-700" />
                <span className="text-xs">Querying MongoDB financial records...</span>
              </div>
            ) : adminDonations.length === 0 ? (
              <div className="py-14 text-center space-y-2 border border-dashed border-stone-200 rounded-lg">
                <Receipt className="w-8 h-8 text-stone-400 mx-auto" />
                <h3 className="text-sm font-semibold text-stone-700">No Donations Found</h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  No records match the current filter or search criteria. When donors contribute via Razorpay, their verified transactions will appear here immediately.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-stone-500 font-semibold border-b border-stone-100">
                    <tr>
                      <th className="px-4 py-2.5">Receipt No</th>
                      <th className="px-4 py-2.5">Donor Particulars</th>
                      <th className="px-4 py-2.5">Cause / Purpose</th>
                      <th className="px-4 py-2.5">Amount</th>
                      <th className="px-4 py-2.5">Date & Time</th>
                      <th className="px-4 py-2.5">Gateway Status</th>
                      <th className="px-4 py-2.5 text-right">Audit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {adminDonations.map((d) => (
                      <tr key={d.id} className="hover:bg-stone-50/50">
                        <td className="px-4 py-3 font-mono font-bold text-stone-900">
                          {d.receiptNumber || <span className="text-stone-400 font-normal">Pending Verification</span>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-stone-900">{d.donorName}</div>
                          <div className="text-[11px] text-stone-500">{d.donorEmail}</div>
                        </td>
                        <td className="px-4 py-3 max-w-xs truncate text-stone-600">
                          {typeof d.causeId === "object" && d.causeId !== null
                            ? d.causeId.title
                            : d.purpose || "General Trust Corpus"}
                        </td>
                        <td className="px-4 py-3 font-serif font-bold text-stone-900">
                          {formatCurrency(d.amount)}
                        </td>
                        <td className="px-4 py-3 text-stone-500">
                          {new Date(d.createdAt).toLocaleString("en-IN", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </td>
                        <td className="px-4 py-3">
                          {d.status === "SUCCESS" ? (
                            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] px-2 py-0.5 rounded font-semibold inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              SUCCESS
                            </span>
                          ) : d.status === "PENDING" || d.status === "CREATED" ? (
                            <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] px-2 py-0.5 rounded font-semibold inline-flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-600" />
                              {d.status}
                            </span>
                          ) : (
                            <span className="bg-rose-50 text-rose-800 border border-rose-200 text-[10px] px-2 py-0.5 rounded font-semibold inline-flex items-center gap-1">
                              {d.status}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedDonationDetails(d)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Donation Audit Inspection Modal */}
      {selectedDonationDetails && (
        <Modal
          isOpen={!!selectedDonationDetails}
          onClose={() => setSelectedDonationDetails(null)}
          title={`Donation Audit Record #${selectedDonationDetails.id}`}
          description="Cryptographic payment and reconciliation details from MongoDB"
          size="lg"
        >
          <div className="space-y-4 font-mono text-xs">
            <div className="grid grid-cols-2 gap-3 p-4 bg-stone-50 border border-stone-200 rounded-md">
              <div>
                <span className="text-stone-400 block text-[10px]">RECORD ID</span>
                <span className="text-stone-900 break-all">{selectedDonationDetails.id}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px]">GATEWAY STATUS</span>
                <span
                  className={`font-bold ${
                    selectedDonationDetails.status === "SUCCESS"
                      ? "text-emerald-700"
                      : "text-amber-700"
                  }`}
                >
                  {selectedDonationDetails.status}
                </span>
              </div>

              <div>
                <span className="text-stone-400 block text-[10px]">RECEIPT NUMBER</span>
                <span className="text-stone-900 font-bold">
                  {selectedDonationDetails.receiptNumber || "None Issued (Not Captured)"}
                </span>
              </div>

              <div>
                <span className="text-stone-400 block text-[10px]">AMOUNT</span>
                <span className="font-bold text-emerald-800 text-sm">
                  {formatCurrency(selectedDonationDetails.amount)} {selectedDonationDetails.currency}
                </span>
              </div>

              <div>
                <span className="text-stone-400 block text-[10px]">DONOR NAME</span>
                <span className="text-stone-900">{selectedDonationDetails.donorName}</span>
              </div>

              <div>
                <span className="text-stone-400 block text-[10px]">DONOR EMAIL</span>
                <span className="text-stone-900">{selectedDonationDetails.donorEmail}</span>
              </div>

              {selectedDonationDetails.donorPhone && (
                <div>
                  <span className="text-stone-400 block text-[10px]">DONOR PHONE</span>
                  <span className="text-stone-900">{selectedDonationDetails.donorPhone}</span>
                </div>
              )}

              <div>
                <span className="text-stone-400 block text-[10px]">CAUSE ALLOCATION</span>
                <span className="text-stone-900 font-sans">
                  {typeof selectedDonationDetails.causeId === "object" && selectedDonationDetails.causeId !== null
                    ? selectedDonationDetails.causeId.title
                    : selectedDonationDetails.purpose || "General Trust Corpus"}
                </span>
              </div>

              <div>
                <span className="text-stone-400 block text-[10px]">RAZORPAY ORDER ID</span>
                <span className="text-stone-900 break-all">
                  {selectedDonationDetails.razorpayOrderId || "N/A"}
                </span>
              </div>

              <div>
                <span className="text-stone-400 block text-[10px]">RAZORPAY PAYMENT ID</span>
                <span className="text-stone-900 break-all">
                  {selectedDonationDetails.razorpayPaymentId || "N/A"}
                </span>
              </div>

              <div>
                <span className="text-stone-400 block text-[10px]">CREATED TIMESTAMP</span>
                <span className="text-stone-700">
                  {new Date(selectedDonationDetails.createdAt).toLocaleString("en-IN")}
                </span>
              </div>

              <div>
                <span className="text-stone-400 block text-[10px]">VERIFICATION TIMESTAMP</span>
                <span className="text-stone-700">
                  {selectedDonationDetails.paymentVerifiedAt
                    ? new Date(selectedDonationDetails.paymentVerifiedAt).toLocaleString("en-IN")
                    : "Not Verified"}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedDonationDetails(null)}
              >
                Close Audit Record
              </Button>
            </div>
          </div>
        </Modal>
      )}


      {/* ================= TAB: LIVE SYSTEM NOTIFICATIONS ================= */}
      {activeTab === "notifications" && (
        <div className="space-y-6">
          <NotificationFeed
            title="System & Administrative Notifications Feed"
            description="Real-time operational alerts for payments, verified receipts, volunteer rosters, and aid applicant reviews."
          />
        </div>
      )}

      {/* ================= TAB 5: SETTINGS & FEATURE FLAGS ================= */}
      {activeTab === "settings" && (
        <div className="space-y-6">
          {/* 1. Kumbh Mode Feature Flag Card */}
          <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-2xs space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-600 fill-amber-500" />
                  <h3 className="font-serif font-bold text-lg text-stone-900">
                    Feature Modules → Simhastha Kumbh 2027
                  </h3>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                      isKumbhMode
                        ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                        : "bg-stone-100 text-stone-600"
                    }`}
                  >
                    {isKumbhMode ? "ON (ACTIVE)" : "OFF (DISABLED)"}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-stone-600 max-w-2xl leading-relaxed">
                  Centralized architectural feature switch backed by MongoDB SiteSettings (<code className="font-mono text-emerald-900">kumbhMode</code>).
                  When ON, the public navigation, homepage banner, dedicated Kumbh Seva portal, campaigns, and volunteer registrations are enabled.
                  When OFF, all Kumbh-specific sections and routes are seamlessly dormant while normal Trust functionality continues untouched.
                </p>
              </div>

              <button
                type="button"
                disabled={isUpdatingKumbh || user?.role !== "ADMIN"}
                title={user?.role === "ADMIN" ? "Toggle Kumbh Mode" : "Administrator privileges required to modify module settings"}
                onClick={async () => {
                  if (user?.role !== "ADMIN") return;
                  try {
                    setIsUpdatingKumbh(true);
                    setKumbhSyncMsg(null);
                    const targetState = !isKumbhMode;
                    await toggleKumbhMode();
                    setKumbhSyncMsg({
                      type: 'success',
                      text: `Simhastha Kumbh 2027 module is now ${targetState ? 'ON' : 'OFF'}. Saved to MongoDB.`,
                    });
                    setTimeout(() => setKumbhSyncMsg(null), 4000);
                  } catch (err: any) {
                    setKumbhSyncMsg({
                      type: 'error',
                      text: `Failed to update Kumbh mode in database: ${err?.message || 'Server error'}`,
                    });
                  } finally {
                    setIsUpdatingKumbh(false);
                  }
                }}
                className="cursor-pointer focus:outline-none shrink-0 transition-opacity disabled:opacity-50"
                aria-label="Toggle Kumbh Mode"
              >
                {isKumbhMode ? (
                  <ToggleRight className="w-12 h-12 text-emerald-700" />
                ) : (
                  <ToggleLeft className="w-12 h-12 text-stone-400" />
                )}
              </button>
            </div>

            {kumbhSyncMsg && (
              <div
                className={`p-3 rounded-md text-xs font-medium border ${
                  kumbhSyncMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                    : 'bg-red-50 text-red-900 border-red-200'
                }`}
              >
                {kumbhSyncMsg.text}
              </div>
            )}

            <div className="p-3 bg-stone-50 rounded border border-stone-200 text-xs text-stone-600 flex items-center justify-between">
              <span>
                MongoDB SiteSettings: <code className="font-mono text-emerald-900 font-semibold">kumbhMode = {String(isKumbhMode)}</code>
              </span>
              <Button
                size="sm"
                variant="outline"
                className="text-xs px-3 h-7"
                isLoading={isUpdatingKumbh}
                onClick={async () => {
                  try {
                    setIsUpdatingKumbh(true);
                    setKumbhSyncMsg(null);
                    const targetState = !isKumbhMode;
                    await toggleKumbhMode();
                    setKumbhSyncMsg({
                      type: 'success',
                      text: `Kumbh Mode set to ${targetState ? 'ON' : 'OFF'} in MongoDB.`,
                    });
                    setTimeout(() => setKumbhSyncMsg(null), 4000);
                  } catch (err: any) {
                    setKumbhSyncMsg({
                      type: 'error',
                      text: `Failed to update database: ${err?.message || 'Server error'}`,
                    });
                  } finally {
                    setIsUpdatingKumbh(false);
                  }
                }}
              >
                {isKumbhMode ? "Switch OFF" : "Switch ON"}
              </Button>
            </div>
          </div>

          {/* 2. Accessibility & High Contrast */}
          <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-2xs space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-emerald-700" />
                  <h3 className="font-serif font-bold text-lg text-stone-900">
                    High Contrast Accessibility Mode
                  </h3>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                      highContrast
                        ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                        : "bg-stone-100 text-stone-600"
                    }`}
                  >
                    {highContrast ? "HIGH CONTRAST ON" : "STANDARD CONTRAST"}
                  </span>
                </div>
                <p className="text-xs text-stone-600 max-w-xl">
                  Increases border weights, maximizes text-to-background contrast ratios, and removes subtle gradients for visually impaired visitors.
                </p>
              </div>

              <button
                type="button"
                onClick={toggleHighContrast}
                className="cursor-pointer focus:outline-none shrink-0"
                aria-label="Toggle High Contrast"
              >
                {highContrast ? (
                  <ToggleRight className="w-12 h-12 text-emerald-700" />
                ) : (
                  <ToggleLeft className="w-12 h-12 text-stone-400" />
                )}
              </button>
            </div>
          </div>

          {/* 3. Operational Push Notifications */}
          <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-2xs space-y-3">
            <h3 className="font-serif font-bold text-lg text-stone-900">
              Admin & Staff Device Notifications
            </h3>
            <p className="text-xs text-stone-600">
              Enable real-time push alerts on your workstation or mobile device for incoming contributions, verified payments, volunteer applications, and emergency aid tickets.
            </p>
            <div className="pt-1">
              <PushNotificationToggle />
            </div>
          </div>

          {/* 4. Role Switcher for Testing */}
          <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-2xs space-y-3">
            <h3 className="font-serif font-bold text-lg text-stone-900">
              Active Session & Access Level
            </h3>
            <p className="text-xs text-stone-600">
              Your session is authenticated with the verified database role of <span className="font-mono font-bold text-[#14532d]">{user?.role || "UNVERIFIED"}</span>. Administrative privileges and access boundaries are strictly enforced server-side.
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs text-stone-700">
              <span className="font-medium">Authenticated Account:</span>
              <span className="font-mono bg-stone-100 px-2 py-0.5 rounded border border-stone-200">{user?.email}</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                Verified {user?.role || 'User'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 6: TRUST PROFILE & TRUSTEES ================= */}
      {activeTab === "trust" && user?.role === "ADMIN" && (
        <TrustManagementTab
          onNotify={(msg) => {
            setSuccessToast(msg);
            setTimeout(() => setSuccessToast(null), 3500);
          }}
        />
      )}

      {/* ================= TAB 7: USERS & ROLES MANAGEMENT ================= */}
      {activeTab === "users" && user?.role === "ADMIN" && (
        <UsersManagementTab />
      )}

      {/* Help Request Review Modal */}
      <Modal
        isOpen={!!inspectHelpModal}
        onClose={() => setInspectHelpModal(null)}
        title={`Review Aid Application Docket: ${inspectHelpModal?.id || ""}`}
        size="lg"
      >
        {inspectHelpModal && (
          <div className="space-y-4 text-xs sm:text-sm">
            {/* Applicant & Case Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-stone-50 rounded-lg border border-stone-200">
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-semibold">Applicant Name</span>
                <span className="font-semibold text-stone-900">{inspectHelpModal.name}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-semibold">Category of Need</span>
                <span className="font-semibold text-stone-900">{inspectHelpModal.requestType}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-semibold">Contact Details</span>
                <span className="text-stone-800 font-mono">{inspectHelpModal.phone} | {inspectHelpModal.email}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-semibold">Location / District</span>
                <span className="text-stone-800">{inspectHelpModal.location}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-semibold">Urgency Classification</span>
                <span className="font-semibold text-amber-800">{inspectHelpModal.urgency}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-semibold">Submission Date</span>
                <span className="text-stone-800">{formatDate(inspectHelpModal.createdAt)}</span>
              </div>
            </div>

            {/* Circumstances / Description */}
            <div className="space-y-1.5">
              <span className="font-semibold text-stone-800 block text-xs">Hardship Case Narrative:</span>
              <p className="text-xs text-stone-700 bg-white p-3.5 rounded-lg border border-stone-200 leading-relaxed max-h-40 overflow-y-auto">
                {inspectHelpModal.description}
              </p>
            </div>

            {/* Status & Review Controls */}
            <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    Application Status:
                  </label>
                  <select
                    value={modalStatusChoice}
                    onChange={(e) => setModalStatusChoice(e.target.value as HelpRequestStatus)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-md bg-white text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="REJECTED">REJECTED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    Last Reviewer Audit:
                  </label>
                  <div className="text-xs text-stone-600 pt-1.5">
                    {inspectHelpModal.reviewedAt ? (
                      <span>Reviewed on {formatDate(inspectHelpModal.reviewedAt)}</span>
                    ) : (
                      <span className="text-stone-400 italic">Not yet formally reviewed</span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Internal Trust Secretariat Notes (Saved to MongoDB):
                </label>
                <textarea
                  rows={3}
                  value={modalAdminNotes}
                  onChange={(e) => setModalAdminNotes(e.target.value)}
                  placeholder="Record verification notes, hospital contact, sanctions amount, or reason for decline..."
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-md bg-white text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-between items-center gap-2 pt-2 border-t border-stone-200">
              <Button
                size="sm"
                variant="outline"
                disabled={isDeletingHelpRequest}
                className="text-rose-700 border-rose-200 hover:bg-rose-50 text-xs"
                onClick={() => handleDeleteHelpRequest(inspectHelpModal.id)}
              >
                {isDeletingHelpRequest ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                )}
                Delete Application
              </Button>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setInspectHelpModal(null)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={isSavingHelpUpdate}
                  className="bg-[#14532d] hover:bg-[#0f4023] text-white text-xs"
                  onClick={handleSaveHelpReview}
                >
                  {isSavingHelpUpdate ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      Saving...
                    </>
                  ) : (
                    "Save Review & Notes"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Create / Edit Campaign Modal */}
      <Modal
        isOpen={isCauseModalOpen}
        onClose={() => setIsCauseModalOpen(false)}
        title={editingCause ? `Edit Campaign: ${editingCause.title}` : "Create New Charitable Campaign"}
        size="lg"
      >
        <form onSubmit={handleSaveCause} className="space-y-4 text-xs sm:text-sm">
          {causeFormError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-md flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{causeFormError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Title */}
            <div className="sm:col-span-2 space-y-1">
              <label className="font-semibold text-stone-800 block">
                Campaign Title <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Rural School Digital Literacy Drive"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:bg-white focus:outline-none focus:border-[#14532d]"
              />
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="font-semibold text-stone-800 block">
                Category <span className="text-rose-600">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as CauseCategory })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:bg-white focus:outline-none focus:border-[#14532d]"
              >
                <option value="Education">Education</option>
                <option value="Medical Support">Medical Support</option>
                <option value="Food & Nutrition">Food & Nutrition</option>
                <option value="Emergency Relief">Emergency Relief</option>
                <option value="Environment">Environment</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="font-semibold text-stone-800 block">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:bg-white focus:outline-none focus:border-[#14532d]"
              >
                <option value="ACTIVE">ACTIVE (Published)</option>
                <option value="DRAFT">DRAFT (Hidden)</option>
                <option value="COMPLETED">COMPLETED (Goal Met)</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>

            {/* Target Amount */}
            <div className="space-y-1">
              <label className="font-semibold text-stone-800 block">
                Target Amount (₹) <span className="text-rose-600">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.targetAmount}
                onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                placeholder="e.g., 500000"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:bg-white focus:outline-none focus:border-[#14532d]"
              />
            </div>

            {/* Location */}
            <div className="space-y-1">
              <label className="font-semibold text-stone-800 block">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Nashik, Maharashtra"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:bg-white focus:outline-none focus:border-[#14532d]"
              />
            </div>

            {/* Image URL */}
            <div className="sm:col-span-2 space-y-1">
              <label className="font-semibold text-stone-800 block">
                Cover Image URL <span className="text-rose-600">*</span>
              </label>
              <input
                type="url"
                required
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://example.com/activity-photo.jpg"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:bg-white focus:outline-none focus:border-[#14532d]"
              />
            </div>

            {/* Short Description / Tagline */}
            <div className="sm:col-span-2 space-y-1">
              <label className="font-semibold text-stone-800 block">
                Short Description / Tagline <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                placeholder="One-sentence impact summary shown on cards"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:bg-white focus:outline-none focus:border-[#14532d]"
              />
            </div>

            {/* Full Narrative Description */}
            <div className="sm:col-span-2 space-y-1">
              <label className="font-semibold text-stone-800 block">
                Full Description / Narrative <span className="text-rose-600">*</span>
              </label>
              <textarea
                rows={4}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed explanation of the need, target beneficiaries, and execution plan..."
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:bg-white focus:outline-none focus:border-[#14532d]"
              />
            </div>

            {/* Toggles */}
            <div className="sm:col-span-2 flex items-center gap-6 pt-1">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isKumbhRelated}
                  onChange={(e) => setFormData({ ...formData, isKumbhRelated: e.target.checked })}
                  className="rounded text-[#14532d] focus:ring-[#14532d]"
                />
                <span className="font-medium text-stone-800 text-xs">Nashik Kumbh Mela Program</span>
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.urgent}
                  onChange={(e) => setFormData({ ...formData, urgent: e.target.checked })}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <span className="font-medium text-stone-800 text-xs">Urgent Appeal</span>
              </label>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-200">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCauseModalOpen(false)}
              disabled={isSavingCause}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSavingCause}
              className="bg-[#14532d] hover:bg-[#0f3d21] text-white"
              leftIcon={isSavingCause ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            >
              {isSavingCause ? "Saving..." : editingCause ? "Save Changes" : "Publish Campaign"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ================= EVENT CREATE / EDIT MODAL ================= */}
      <Modal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        title={editingEvent ? `Edit Event: ${editingEvent.title}` : "Schedule New Trust Event or Drive"}
      >
        <form onSubmit={handleSaveEvent} className="space-y-4 text-xs">
          {eventFormError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded text-rose-800 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{eventFormError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Event Title */}
            <div className="sm:col-span-2 space-y-1">
              <label className="font-semibold text-stone-800 block">
                Event Title <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={eventFormData.title}
                onChange={(e) => setEventFormData({ ...eventFormData, title: e.target.value })}
                placeholder="e.g., Godavari Ghat Cleanliness & Sevadar Briefing"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:bg-white focus:outline-none focus:border-[#14532d]"
              />
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="font-semibold text-stone-800 block">Category</label>
              <select
                value={eventFormData.category}
                onChange={(e) => setEventFormData({ ...eventFormData, category: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:bg-white focus:outline-none focus:border-[#14532d]"
              >
                <option value="Community Outreach">Community Outreach</option>
                <option value="Healthcare & Camps">Healthcare & Camps</option>
                <option value="River Hygiene & Environment">River Hygiene & Environment</option>
                <option value="Kumbh Mela Seva">Kumbh Mela Seva</option>
                <option value="Education & Youth">Education & Youth</option>
                <option value="Cultural & Festival">Cultural & Festival</option>
              </select>
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="font-semibold text-stone-800 block">Status</label>
              <select
                value={eventFormData.status}
                onChange={(e) => setEventFormData({ ...eventFormData, status: e.target.value as EventStatus })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:bg-white focus:outline-none focus:border-[#14532d]"
              >
                <option value="UPCOMING">UPCOMING (Open)</option>
                <option value="ONGOING">ONGOING (Active now)</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="DRAFT">DRAFT (Hidden from Public)</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            {/* Start Date & Time */}
            <div className="space-y-1">
              <label className="font-semibold text-stone-800 block">
                Start Date & Time <span className="text-rose-600">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={eventFormData.startDate}
                onChange={(e) => setEventFormData({ ...eventFormData, startDate: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:bg-white focus:outline-none focus:border-[#14532d]"
              />
            </div>

            {/* End Date & Time */}
            <div className="space-y-1">
              <label className="font-semibold text-stone-800 block">End Date & Time</label>
              <input
                type="datetime-local"
                value={eventFormData.endDate}
                onChange={(e) => setEventFormData({ ...eventFormData, endDate: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:bg-white focus:outline-none focus:border-[#14532d]"
              />
            </div>

            {/* Location */}
            <div className="sm:col-span-2 space-y-1">
              <label className="font-semibold text-stone-800 block">
                Location & Venue <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={eventFormData.location}
                onChange={(e) => setEventFormData({ ...eventFormData, location: e.target.value })}
                placeholder="e.g., Ramkund Ghats, Panchavati, Nashik"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:bg-white focus:outline-none focus:border-[#14532d]"
              />
            </div>

            {/* Cover Image URL */}
            <div className="sm:col-span-2 space-y-1">
              <label className="font-semibold text-stone-800 block">
                Cover Image URL <span className="text-rose-600">*</span>
              </label>
              <input
                type="url"
                required
                value={eventFormData.imageUrl}
                onChange={(e) => setEventFormData({ ...eventFormData, imageUrl: e.target.value })}
                placeholder="https://example.com/event-photo.jpg"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:bg-white focus:outline-none focus:border-[#14532d]"
              />
            </div>

            {/* Custom Slug (Optional) */}
            <div className="space-y-1">
              <label className="font-semibold text-stone-800 block">Custom URL Slug (Optional)</label>
              <input
                type="text"
                value={eventFormData.slug}
                onChange={(e) => setEventFormData({ ...eventFormData, slug: e.target.value })}
                placeholder="e.g., ramkund-hygiene-drive"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:bg-white focus:outline-none focus:border-[#14532d]"
              />
            </div>

            {/* Capacity / Registration Limit */}
            <div className="space-y-1">
              <label className="font-semibold text-stone-800 block">Attendee Quota / Limit</label>
              <input
                type="number"
                min="0"
                value={eventFormData.registrationLimit}
                onChange={(e) => setEventFormData({ ...eventFormData, registrationLimit: e.target.value })}
                placeholder="e.g., 150 (0 for unlimited)"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:bg-white focus:outline-none focus:border-[#14532d]"
              />
            </div>

            {/* Short Description */}
            <div className="sm:col-span-2 space-y-1">
              <label className="font-semibold text-stone-800 block">
                Short Description / Tagline <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={eventFormData.shortDescription}
                onChange={(e) => setEventFormData({ ...eventFormData, shortDescription: e.target.value })}
                placeholder="Brief summary displayed on cards and overview grids"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:bg-white focus:outline-none focus:border-[#14532d]"
              />
            </div>

            {/* Full Narrative Description */}
            <div className="sm:col-span-2 space-y-1">
              <label className="font-semibold text-stone-800 block">
                Full Description & Agenda <span className="text-rose-600">*</span>
              </label>
              <textarea
                rows={4}
                required
                value={eventFormData.description}
                onChange={(e) => setEventFormData({ ...eventFormData, description: e.target.value })}
                placeholder="Comprehensive agenda, guidelines, assembly point instructions, and requirements..."
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:bg-white focus:outline-none focus:border-[#14532d]"
              />
            </div>

            {/* Toggles */}
            <div className="sm:col-span-2 flex items-center gap-6 pt-1">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={eventFormData.registrationRequired}
                  onChange={(e) => setEventFormData({ ...eventFormData, registrationRequired: e.target.checked })}
                  className="rounded text-emerald-700 focus:ring-emerald-700"
                />
                <span className="font-medium text-stone-800 text-xs">Registration Required for Entry</span>
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={eventFormData.isKumbhRelated}
                  onChange={(e) => setEventFormData({ ...eventFormData, isKumbhRelated: e.target.checked })}
                  className="rounded text-amber-700 focus:ring-amber-700"
                />
                <span className="font-medium text-stone-800 text-xs">Nashik Kumbh Mela Initiative</span>
              </label>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-200">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEventModalOpen(false)}
              disabled={isSavingEvent}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSavingEvent}
              className="bg-[#14532d] hover:bg-[#0f3d21] text-white"
              leftIcon={isSavingEvent ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            >
              {isSavingEvent ? "Saving..." : editingEvent ? "Update Event" : "Schedule Event"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ================= INSPECT ATTENDEES MODAL ================= */}
      <Modal
        isOpen={!!inspectEvent}
        onClose={() => setInspectEvent(null)}
        title={inspectEvent ? `Registered Attendees: ${inspectEvent.title}` : "Event Attendees"}
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-semibold text-stone-900 block">{inspectEvent?.title}</span>
              <span className="text-stone-500 block text-[11px]">
                {inspectEvent?.date} • {inspectEvent?.location}
              </span>
            </div>
            <div className="text-right">
              <span className="text-base font-bold font-serif text-emerald-800 block">
                {inspectRegistrations.length}
                {inspectEvent?.registrationLimit ? ` / ${inspectEvent.registrationLimit}` : ""}
              </span>
              <span className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">
                Confirmed Registrations
              </span>
            </div>
          </div>

          {isLoadingRegistrations ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-stone-500">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-700" />
              <span>Loading attendee roster...</span>
            </div>
          ) : inspectRegistrations.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <Users className="w-8 h-8 text-stone-300 mx-auto" />
              <p className="font-semibold text-stone-700">No registrations recorded yet.</p>
              <p className="text-stone-500 text-[11px]">
                Attendees will appear here once registered via the public event portal.
              </p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto border border-stone-200 rounded-lg divide-y divide-stone-100">
              {inspectRegistrations.map((reg, idx) => (
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
            <Button size="sm" variant="outline" onClick={() => setInspectEvent(null)}>
              Close Roster
            </Button>
          </div>
        </div>
      </Modal>

      {/* ================= CREATE / EDIT BLOG POST MODAL ================= */}
      <Modal
        isOpen={isBlogModalOpen}
        onClose={() => setIsBlogModalOpen(false)}
        title={editingBlogPost ? `Edit Story: ${editingBlogPost.title}` : "Publish New Field Story or News Article"}
      >
        <form onSubmit={handleSaveBlog} className="space-y-4 text-xs">
          {blogFormError && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{blogFormError}</span>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1">
            <label className="font-semibold text-stone-800 block">
              Story Title <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Free Mobile Diagnostic Camps Screen 3,400 Rural Citizens"
              value={blogFormData.title}
              onChange={(e) => {
                const newTitle = e.target.value;
                setBlogFormData((prev) => ({
                  ...prev,
                  title: newTitle,
                  slug: editingBlogPost ? prev.slug : newTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
                }));
              }}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-700"
            />
          </div>

          {/* Slug */}
          <div className="space-y-1">
            <label className="font-semibold text-stone-800 block">
              URL Slug (Unique URL identifier)
            </label>
            <div className="flex items-center">
              <span className="px-2.5 py-2 bg-stone-100 border border-r-0 border-stone-200 rounded-l-md text-stone-500 font-mono text-[11px]">
                /blog/
              </span>
              <input
                type="text"
                placeholder="slug-auto-generated-or-custom"
                value={blogFormData.slug}
                onChange={(e) => setBlogFormData({ ...blogFormData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "") })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-r-md text-stone-900 font-mono text-xs focus:bg-white focus:outline-none focus:border-emerald-700"
              />
            </div>
            <p className="text-[10px] text-stone-400">Leave empty or use lowercase letters, numbers, and hyphens.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-1">
              <label className="font-semibold text-stone-800 block">
                Category <span className="text-rose-600">*</span>
              </label>
              <select
                value={blogFormData.category}
                onChange={(e) => setBlogFormData({ ...blogFormData, category: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-700"
              >
                <option value="Field Updates">Field Updates</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Transparency">Transparency</option>
                <option value="Education">Education</option>
                <option value="Governance & Impact">Governance & Impact</option>
                <option value="Kumbh Seva">Kumbh Seva</option>
              </select>
            </div>

            {/* Author */}
            <div className="space-y-1">
              <label className="font-semibold text-stone-800 block">
                Author / Editorial Desk
              </label>
              <input
                type="text"
                value={blogFormData.author}
                onChange={(e) => setBlogFormData({ ...blogFormData, author: e.target.value })}
                placeholder="e.g. Dr. A. Joshi, Chief Medical Officer"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-700"
              />
            </div>
          </div>

          {/* Cover Image Upload & URL */}
          <FileUploadField
            label="Cover Image"
            category="IMAGE"
            value={blogFormData.coverImage}
            onChange={(url) => setBlogFormData({ ...blogFormData, coverImage: url })}
            placeholder="https://... or click upload above"
            helperText="Upload a JPG, PNG, or WebP image under 5MB or paste a verified image URL."
          />

          {/* Excerpt */}
          <div className="space-y-1">
            <label className="font-semibold text-stone-800 block">
              Short Excerpt (Summary displayed on cards) <span className="text-rose-600">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={blogFormData.excerpt}
              onChange={(e) => setBlogFormData({ ...blogFormData, excerpt: e.target.value })}
              placeholder="Brief summary of the article or field report..."
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-700"
            />
          </div>

          {/* Content */}
          <div className="space-y-1">
            <label className="font-semibold text-stone-800 block">
              Full Story Content <span className="text-rose-600">*</span>
            </label>
            <textarea
              required
              rows={6}
              value={blogFormData.content}
              onChange={(e) => setBlogFormData({ ...blogFormData, content: e.target.value })}
              placeholder="Enter full article text. Separate paragraphs with blank lines."
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-700"
            />
          </div>

          {/* Tags */}
          <div className="space-y-1">
            <label className="font-semibold text-stone-800 block">
              Tags (Comma separated)
            </label>
            <input
              type="text"
              value={blogFormData.tags}
              onChange={(e) => setBlogFormData({ ...blogFormData, tags: e.target.value })}
              placeholder="Healthcare, Diagnostic, Nashik, Mobile Clinic"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-700"
            />
          </div>

          {/* Checkbox Toggles */}
          <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 space-y-2.5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={blogFormData.isPublished}
                onChange={(e) => setBlogFormData({ ...blogFormData, isPublished: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-800 focus:ring-emerald-700 accent-emerald-800"
              />
              <span className="font-semibold text-stone-800">Publish immediately (Make visible on live website)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={blogFormData.isFeatured}
                onChange={(e) => setBlogFormData({ ...blogFormData, isFeatured: e.target.checked })}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 accent-amber-600"
              />
              <span className="font-semibold text-stone-800">Mark as Featured (Highlights post at the top)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={blogFormData.isKumbhRelated}
                onChange={(e) => setBlogFormData({ ...blogFormData, isKumbhRelated: e.target.checked })}
                className="w-4 h-4 rounded text-amber-700 focus:ring-amber-600 accent-amber-700"
              />
              <span className="font-semibold text-stone-800">Nashik Simhastha Kumbh 2027 Field Dispatch</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsBlogModalOpen(false)}
              disabled={isSavingBlog}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSavingBlog}
              className="bg-[#14532d] hover:bg-[#0f4023] text-white inline-flex items-center gap-1.5"
            >
              {isSavingBlog ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving to MongoDB...</span>
                </>
              ) : (
                <span>{editingBlogPost ? "Update Story" : "Publish to Live Website"}</span>
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ================= CREATE / EDIT TRANSPARENCY REPORT MODAL ================= */}
      <Modal
        isOpen={isTransparencyModalOpen}
        onClose={() => setIsTransparencyModalOpen(false)}
        title={editingTransparencyReport ? `Edit Report: ${editingTransparencyReport.title}` : "Publish New Statutory / Audit Report"}
      >
        <form onSubmit={handleSaveTransparency} className="space-y-4 text-xs">
          {transparencyFormError && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{transparencyFormError}</span>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1">
            <label className="font-semibold text-stone-800 block">
              Report Title <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Annual Audited Financial Statements & Balance Sheet"
              value={transparencyFormData.title}
              onChange={(e) => setTransparencyFormData({ ...transparencyFormData, title: e.target.value })}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-700"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Report Type */}
            <div className="space-y-1">
              <label className="font-semibold text-stone-800 block">
                Report Type <span className="text-rose-600">*</span>
              </label>
              <select
                value={transparencyFormData.reportType}
                onChange={(e) => setTransparencyFormData({ ...transparencyFormData, reportType: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-700"
              >
                <option value="Annual Report">Annual Report</option>
                <option value="Financial Report">Financial Report</option>
                <option value="Audit Report">Audit Report</option>
                <option value="Impact Report">Impact Report</option>
                <option value="Donation Utilization Report">Donation Utilization Report</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Financial Year */}
            <div className="space-y-1">
              <label className="font-semibold text-stone-800 block">
                Financial Year <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. FY 2024-25"
                value={transparencyFormData.financialYear}
                onChange={(e) => setTransparencyFormData({ ...transparencyFormData, financialYear: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-700"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="font-semibold text-stone-800 block">
              Executive Summary / Overview <span className="text-rose-600">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="Brief summary of disclosures, audit findings, trust activities, or donor fund deployments..."
              value={transparencyFormData.description}
              onChange={(e) => setTransparencyFormData({ ...transparencyFormData, description: e.target.value })}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-700 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Auditor Firm */}
            <div className="space-y-1">
              <label className="font-semibold text-stone-800 block">
                Auditor Firm / Certifying CA
              </label>
              <input
                type="text"
                placeholder="e.g. M/s K. B. Deshmukh & Associates"
                value={transparencyFormData.auditorFirm}
                onChange={(e) => setTransparencyFormData({ ...transparencyFormData, auditorFirm: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-700"
              />
            </div>

            {/* Statutory Type */}
            <div className="space-y-1">
              <label className="font-semibold text-stone-800 block">
                Statutory Filing / Document Type
              </label>
              <input
                type="text"
                placeholder="e.g. Annual Audit Report or Institutional Review"
                value={transparencyFormData.statutoryType}
                onChange={(e) => setTransparencyFormData({ ...transparencyFormData, statutoryType: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Total Disbursal */}
            <div className="space-y-1">
              <label className="font-semibold text-stone-800 block">
                Reported Charitable Disbursal
              </label>
              <input
                type="text"
                placeholder="e.g. ₹1,42,80,000"
                value={transparencyFormData.totalDisbursal}
                onChange={(e) => setTransparencyFormData({ ...transparencyFormData, totalDisbursal: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-700"
              />
            </div>

            {/* Audit Rating */}
            <div className="space-y-1">
              <label className="font-semibold text-stone-800 block">
                Audit Rating / Opinion
              </label>
              <input
                type="text"
                placeholder="e.g. Unqualified Clean Opinion"
                value={transparencyFormData.auditRating}
                onChange={(e) => setTransparencyFormData({ ...transparencyFormData, auditRating: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-700"
              />
            </div>
          </div>

          {/* PDF Report Document Upload & URL */}
          <FileUploadField
            label="Annual/Financial Report Document (PDF)"
            category="DOCUMENT"
            value={transparencyFormData.fileUrl}
            onChange={(url) => setTransparencyFormData({ ...transparencyFormData, fileUrl: url })}
            onFileSizeChange={(sizeStr) => setTransparencyFormData((prev) => ({ ...prev, fileSize: sizeStr }))}
            placeholder="https://... or click upload above"
            helperText="Upload official PDF (under 10MB) or paste a verified document link."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* File Size / Format Display */}
            <div className="space-y-1">
              <label className="font-semibold text-stone-800 block text-xs">
                File Size / Format Indicator
              </label>
              <input
                type="text"
                placeholder="e.g. PDF (2.4 MB)"
                value={transparencyFormData.fileSize}
                onChange={(e) => setTransparencyFormData({ ...transparencyFormData, fileSize: e.target.value })}
                className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-700 text-xs"
              />
            </div>

            {/* Cover Image Upload & URL */}
            <FileUploadField
              label="Report Cover Image (Optional)"
              category="IMAGE"
              value={transparencyFormData.coverImage}
              onChange={(url) => setTransparencyFormData({ ...transparencyFormData, coverImage: url })}
              placeholder="https://... or click upload above"
              helperText="Optional report preview image."
            />
          </div>

          {/* Checkboxes */}
          <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 space-y-2.5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={transparencyFormData.isPublished}
                onChange={(e) => setTransparencyFormData({ ...transparencyFormData, isPublished: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-800 focus:ring-emerald-700 accent-emerald-800"
              />
              <span className="font-semibold text-stone-800">Publish immediately (Make visible on live website)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={transparencyFormData.isFeatured}
                onChange={(e) => setTransparencyFormData({ ...transparencyFormData, isFeatured: e.target.checked })}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 accent-amber-600"
              />
              <span className="font-semibold text-stone-800">Mark as Featured (Pin at top of Transparency page)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={transparencyFormData.isKumbhRelated}
                onChange={(e) => setTransparencyFormData({ ...transparencyFormData, isKumbhRelated: e.target.checked })}
                className="w-4 h-4 rounded text-amber-700 focus:ring-amber-600 accent-amber-700"
              />
              <span className="font-semibold text-stone-800">Nashik Simhastha Kumbh 2027 Special Audit / Disclosure</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsTransparencyModalOpen(false)}
              disabled={isSavingTransparency}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSavingTransparency}
              className="bg-[#14532d] hover:bg-[#0f4023] text-white inline-flex items-center gap-1.5"
            >
              {isSavingTransparency ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving to MongoDB...</span>
                </>
              ) : (
                <span>{editingTransparencyReport ? "Update Report" : "Publish to Live Website"}</span>
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
