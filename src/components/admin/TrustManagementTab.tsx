import React, { useState, useEffect, useCallback } from "react";
import {
  Building2,
  Users,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  RefreshCw,
  Search,
  ExternalLink,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowUpDown,
} from "lucide-react";
import { TrustProfile, Trustee } from "@/src/types";
import { trustService } from "@/src/services/trustService";
import { useTrust } from "@/src/context/TrustContext";
import { Button } from "@/src/components/common/Button";
import { Modal } from "@/src/components/common/Modal";
import { FileUploadField } from "@/src/components/common/FileUploadField";

interface Props {
  onNotify: (message: string) => void;
}

export const TrustManagementTab: React.FC<Props> = ({ onNotify }) => {
  const { refreshAll: refreshGlobalTrust } = useTrust();

  // Sub-tab selection: "profile" | "trustees"
  const [subTab, setSubTab] = useState<"profile" | "trustees">("profile");

  // ==========================================
  // PROFILE STATE
  // ==========================================
  const [profile, setProfile] = useState<Partial<TrustProfile>>({});
  const [isProfileLoading, setIsProfileLoading] = useState<boolean>(false);
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // ==========================================
  // TRUSTEES STATE
  // ==========================================
  const [trustees, setTrustees] = useState<Trustee[]>([]);
  const [isTrusteesLoading, setIsTrusteesLoading] = useState<boolean>(false);
  const [trusteesError, setTrusteesError] = useState<string | null>(null);
  const [trusteeSearch, setTrusteeSearch] = useState<string>("");
  const [trusteeFilterActive, setTrusteeFilterActive] = useState<string>("all");

  // Modal for Create/Edit Trustee
  const [isTrusteeModalOpen, setIsTrusteeModalOpen] = useState<boolean>(false);
  const [editingTrustee, setEditingTrustee] = useState<Trustee | null>(null);
  const [isSavingTrustee, setIsSavingTrustee] = useState<boolean>(false);
  const [trusteeFormError, setTrusteeFormError] = useState<string | null>(null);

  const [trusteeFormData, setTrusteeFormData] = useState({
    name: "",
    designation: "",
    role: "Trustee",
    bio: "",
    qualification: "",
    photo: "",
    displayOrder: 0,
    isActive: true,
  });

  // Load Admin Profile
  const fetchProfile = useCallback(async () => {
    setIsProfileLoading(true);
    setProfileError(null);
    try {
      const data = await trustService.getAdminTrustProfile();
      if (data) {
        setProfile(data);
      }
    } catch (err: any) {
      console.error("Failed to load admin trust profile:", err);
      setProfileError(err?.message || "Failed to load trust profile.");
    } finally {
      setIsProfileLoading(false);
    }
  }, []);

  // Load Admin Trustees
  const fetchTrustees = useCallback(async () => {
    setIsTrusteesLoading(true);
    setTrusteesError(null);
    try {
      const data = await trustService.getAdminTrustees({
        isActive: trusteeFilterActive !== "all" ? trusteeFilterActive : undefined,
        search: trusteeSearch.trim() || undefined,
      });
      setTrustees(data);
    } catch (err: any) {
      console.error("Failed to load admin trustees:", err);
      setTrusteesError(err?.message || "Failed to load trustees list.");
    } finally {
      setIsTrusteesLoading(false);
    }
  }, [trusteeFilterActive, trusteeSearch]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (subTab === "trustees") {
      fetchTrustees();
    }
  }, [subTab, fetchTrustees]);

  // Save Profile Handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileError(null);
    try {
      await trustService.updateAdminTrustProfile(profile);
      await refreshGlobalTrust();
      onNotify("Trust profile and institutional records updated successfully!");
    } catch (err: any) {
      console.error("Failed to update profile:", err);
      setProfileError(err?.message || "Failed to save trust profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Open Create Trustee
  const openCreateTrusteeModal = () => {
    setEditingTrustee(null);
    setTrusteeFormError(null);
    setTrusteeFormData({
      name: "",
      designation: "",
      role: "Trustee",
      bio: "",
      qualification: "",
      photo: "",
      displayOrder: trustees.length + 1,
      isActive: true,
    });
    setIsTrusteeModalOpen(true);
  };

  // Open Edit Trustee
  const openEditTrusteeModal = (trustee: Trustee) => {
    setEditingTrustee(trustee);
    setTrusteeFormError(null);
    setTrusteeFormData({
      name: trustee.name,
      designation: trustee.designation,
      role: trustee.role,
      bio: trustee.bio,
      qualification: trustee.qualification || "",
      photo: trustee.photo || "",
      displayOrder: trustee.displayOrder,
      isActive: trustee.isActive,
    });
    setIsTrusteeModalOpen(true);
  };

  // Save Trustee Handler
  const handleSaveTrustee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trusteeFormData.name.trim() || !trusteeFormData.designation.trim() || !trusteeFormData.bio.trim()) {
      setTrusteeFormError("Name, designation, and biography are required.");
      return;
    }

    setIsSavingTrustee(true);
    setTrusteeFormError(null);
    try {
      if (editingTrustee) {
        await trustService.updateTrustee(editingTrustee.id, trusteeFormData);
        onNotify(`Trustee "${trusteeFormData.name}" updated successfully.`);
      } else {
        await trustService.createTrustee(trusteeFormData);
        onNotify(`New trustee "${trusteeFormData.name}" added to the board.`);
      }
      setIsTrusteeModalOpen(false);
      await fetchTrustees();
      await refreshGlobalTrust();
    } catch (err: any) {
      console.error("Failed to save trustee:", err);
      setTrusteeFormError(err?.message || "Failed to save trustee record.");
    } finally {
      setIsSavingTrustee(false);
    }
  };

  // Toggle Active Status
  const handleToggleTrusteeActive = async (trustee: Trustee) => {
    try {
      const newStatus = !trustee.isActive;
      await trustService.updateTrustee(trustee.id, { isActive: newStatus });
      setTrustees((prev) =>
        prev.map((t) => (t.id === trustee.id ? { ...t, isActive: newStatus } : t))
      );
      await refreshGlobalTrust();
      onNotify(`Trustee "${trustee.name}" is now ${newStatus ? "ACTIVE" : "INACTIVE"}.`);
    } catch (err: any) {
      console.error("Failed to toggle status:", err);
      onNotify(err?.message || "Failed to toggle status.");
    }
  };

  // Delete Trustee
  const handleDeleteTrustee = async (trustee: Trustee) => {
    if (!window.confirm(`Are you sure you want to permanently remove trustee "${trustee.name}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await trustService.deleteTrustee(trustee.id);
      setTrustees((prev) => prev.filter((t) => t.id !== trustee.id));
      await refreshGlobalTrust();
      onNotify(`Trustee "${trustee.name}" deleted from database.`);
    } catch (err: any) {
      console.error("Failed to delete trustee:", err);
      onNotify(err?.message || "Failed to delete trustee.");
    }
  };

  // Helper to add an objective
  const handleAddObjective = () => {
    const current = profile.objectives || [];
    setProfile({
      ...profile,
      objectives: [
        ...current,
        { title: "New Objective", description: "", category: "Core Mandate" },
      ],
    });
  };

  // Helper to remove an objective
  const handleRemoveObjective = (index: number) => {
    const current = profile.objectives || [];
    setProfile({
      ...profile,
      objectives: current.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      {/* Sub-Tabs Header */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-3 flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSubTab("profile")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              subTab === "profile"
                ? "bg-[#14532d] text-white shadow-xs"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Trust Profile & Coordinates</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab("trustees")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              subTab === "trustees"
                ? "bg-[#14532d] text-white shadow-xs"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Board of Trustees ({trustees.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              if (subTab === "profile") fetchProfile();
              else fetchTrustees();
            }}
            disabled={isProfileLoading || isTrusteesLoading}
            className="text-xs px-2.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isProfileLoading || isTrusteesLoading ? "animate-spin" : ""}`} />
            <span className="ml-1">Refresh</span>
          </Button>

          {subTab === "trustees" && (
            <Button
              size="sm"
              variant="primary"
              onClick={openCreateTrusteeModal}
              className="text-xs px-3 bg-[#14532d] hover:bg-[#0f4023] text-white flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Trustee</span>
            </Button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. TRUST PROFILE SUBTAB */}
      {/* ========================================================================= */}
      {subTab === "profile" && (
        <div>
          {profileError && (
            <div className="p-3 mb-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{profileError}</span>
            </div>
          )}

          {isProfileLoading ? (
            <div className="py-16 text-center text-stone-500 space-y-2">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-800" />
              <p className="text-xs">Loading Trust Profile from MongoDB...</p>
            </div>
          ) : (
            <form onSubmit={handleSaveProfile} className="space-y-6 text-xs sm:text-sm">
              {/* Identity & Branding */}
              <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs space-y-4">
                <h3 className="text-sm font-serif font-bold text-stone-900 border-b border-stone-100 pb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-800" />
                  <span>Institutional Identity & Brand</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-semibold text-stone-700 block">Trust Full Legal Name</label>
                    <input
                      type="text"
                      required
                      value={profile.trustName || ""}
                      onChange={(e) => setProfile({ ...profile, trustName: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md focus:bg-white focus:outline-none focus:border-emerald-800 text-xs sm:text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-stone-700 block">Short Name / Brand</label>
                    <input
                      type="text"
                      value={profile.shortName || ""}
                      onChange={(e) => setProfile({ ...profile, shortName: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md focus:bg-white focus:outline-none focus:border-emerald-800 text-xs sm:text-sm"
                    />
                  </div>

                  <div className="sm:col-span-3 space-y-1">
                    <label className="font-semibold text-stone-700 block">Subtitle / Motto</label>
                    <input
                      type="text"
                      value={profile.subtitle || ""}
                      onChange={(e) => setProfile({ ...profile, subtitle: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md focus:bg-white focus:outline-none focus:border-emerald-800 text-xs sm:text-sm"
                    />
                  </div>

                  <div className="sm:col-span-3 space-y-1">
                    <label className="font-semibold text-stone-700 block">About / Narrative Overview</label>
                    <textarea
                      rows={3}
                      value={profile.description || ""}
                      onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md focus:bg-white focus:outline-none focus:border-emerald-800 text-xs sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Vision & Mission */}
              <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs space-y-4">
                <h3 className="text-sm font-serif font-bold text-stone-900 border-b border-stone-100 pb-2">
                  Vision & Mission Statements
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-stone-700 block">Institutional Vision</label>
                    <textarea
                      rows={3}
                      value={profile.vision || ""}
                      onChange={(e) => setProfile({ ...profile, vision: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md focus:bg-white focus:outline-none focus:border-emerald-800 text-xs sm:text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-stone-700 block">Institutional Mission</label>
                    <textarea
                      rows={3}
                      value={profile.mission || ""}
                      onChange={(e) => setProfile({ ...profile, mission: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md focus:bg-white focus:outline-none focus:border-emerald-800 text-xs sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Objectives List */}
              <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <h3 className="text-sm font-serif font-bold text-stone-900">
                    Statutory Objectives & Thrust Areas ({(profile.objectives || []).length})
                  </h3>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAddObjective}
                    className="text-xs px-2.5 h-7"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    <span>Add Objective</span>
                  </Button>
                </div>

                <div className="space-y-3">
                  {(profile.objectives || []).map((obj, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-stone-50 rounded-lg border border-stone-200 space-y-2 relative"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[11px] text-emerald-800 font-semibold">
                          Objective #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveObjective(idx)}
                          className="text-stone-400 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer"
                          title="Remove objective"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="Category (e.g. Healthcare, Education)"
                          value={obj.category || ""}
                          onChange={(e) => {
                            const updated = [...(profile.objectives || [])];
                            updated[idx] = { ...updated[idx], category: e.target.value };
                            setProfile({ ...profile, objectives: updated });
                          }}
                          className="px-2.5 py-1.5 bg-white border border-stone-200 rounded text-xs focus:outline-none focus:border-emerald-800"
                        />
                        <input
                          type="text"
                          placeholder="Title"
                          value={obj.title || ""}
                          onChange={(e) => {
                            const updated = [...(profile.objectives || [])];
                            updated[idx] = { ...updated[idx], title: e.target.value };
                            setProfile({ ...profile, objectives: updated });
                          }}
                          className="sm:col-span-2 px-2.5 py-1.5 bg-white border border-stone-200 rounded text-xs focus:outline-none focus:border-emerald-800"
                        />
                      </div>

                      <textarea
                        rows={2}
                        placeholder="Description of objective..."
                        value={obj.description || ""}
                        onChange={(e) => {
                          const updated = [...(profile.objectives || [])];
                          updated[idx] = { ...updated[idx], description: e.target.value };
                          setProfile({ ...profile, objectives: updated });
                        }}
                        className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded text-xs focus:outline-none focus:border-emerald-800"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Registration & Legal Details */}
              <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs space-y-4">
                <h3 className="text-sm font-serif font-bold text-stone-900 border-b border-stone-100 pb-2">
                  Registration & Statutory Credentials
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-stone-700 block">Registration Number</label>
                    <input
                      type="text"
                      value={profile.registrationDetails?.registrationNumber || ""}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          registrationDetails: {
                            ...profile.registrationDetails,
                            registrationNumber: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md focus:bg-white focus:outline-none focus:border-emerald-800 text-xs sm:text-sm font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-stone-700 block">Established Year</label>
                    <input
                      type="text"
                      value={profile.registrationDetails?.establishedYear || ""}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          registrationDetails: {
                            ...profile.registrationDetails,
                            establishedYear: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md focus:bg-white focus:outline-none focus:border-emerald-800 text-xs sm:text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-stone-700 block">FCRA Number</label>
                    <input
                      type="text"
                      value={profile.registrationDetails?.fcraNumber || ""}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          registrationDetails: {
                            ...profile.registrationDetails,
                            fcraNumber: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md focus:bg-white focus:outline-none focus:border-emerald-800 text-xs sm:text-sm font-mono"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-semibold text-stone-700 block">Entity Type</label>
                    <input
                      type="text"
                      value={profile.registrationDetails?.entityType || ""}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          registrationDetails: {
                            ...profile.registrationDetails,
                            entityType: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md focus:bg-white focus:outline-none focus:border-emerald-800 text-xs sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information & Office Coordinates */}
              <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs space-y-4">
                <h3 className="text-sm font-serif font-bold text-stone-900 border-b border-stone-100 pb-2">
                  Official Secretariat & Contact Coordinates
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-semibold text-stone-700 block">Registered Physical Address</label>
                    <input
                      type="text"
                      value={profile.address || ""}
                      onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md focus:bg-white focus:outline-none focus:border-emerald-800 text-xs sm:text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-stone-700 block">Helpline / Phone</label>
                    <input
                      type="text"
                      value={profile.phone || ""}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md focus:bg-white focus:outline-none focus:border-emerald-800 text-xs sm:text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-stone-700 block">Secretariat Email</label>
                    <input
                      type="email"
                      value={profile.email || ""}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md focus:bg-white focus:outline-none focus:border-emerald-800 text-xs sm:text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-stone-700 block">Public Desk / Office Hours</label>
                    <input
                      type="text"
                      value={profile.officeHours || ""}
                      onChange={(e) => setProfile({ ...profile, officeHours: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md focus:bg-white focus:outline-none focus:border-emerald-800 text-xs sm:text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-stone-700 block">Official Website</label>
                    <input
                      type="text"
                      value={profile.website || ""}
                      onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md focus:bg-white focus:outline-none focus:border-emerald-800 text-xs sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Statutory Charter & Public Notice */}
              <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs space-y-4">
                <h3 className="text-sm font-serif font-bold text-stone-900 border-b border-stone-100 pb-2">
                  Institutional Charter & Regulatory Disclaimers
                </h3>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700 block">Public Charter Notice Text</label>
                  <textarea
                    rows={2}
                    value={profile.academicNote || ""}
                    onChange={(e) => setProfile({ ...profile, academicNote: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md focus:bg-white focus:outline-none focus:border-emerald-800 text-xs sm:text-sm"
                  />
                  <p className="text-[11px] text-stone-500">
                    This notice is rendered across the footer and trust information sections to convey official statutory status and compliance guidelines.
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="submit"
                  size="md"
                  disabled={isSavingProfile}
                  className="bg-[#14532d] hover:bg-[#0f4023] text-white flex items-center gap-2 px-5"
                >
                  {isSavingProfile ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Persisting to MongoDB...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Trust Profile Changes</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. BOARD OF TRUSTEES SUBTAB */}
      {/* ========================================================================= */}
      {subTab === "trustees" && (
        <div className="space-y-4">
          {trusteesError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{trusteesError}</span>
            </div>
          )}

          {/* Search & Filters */}
          <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={trusteeSearch}
                onChange={(e) => setTrusteeSearch(e.target.value)}
                placeholder="Search trustee by name or designation..."
                className="w-full pl-9 pr-3 py-1.5 text-xs text-stone-800 placeholder-stone-400 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={trusteeFilterActive}
                onChange={(e) => setTrusteeFilterActive(e.target.value)}
                className="px-3 py-1.5 text-xs border border-stone-300 rounded-lg bg-white text-stone-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
              >
                <option value="all">All Trustees</option>
                <option value="true">Active Only</option>
                <option value="false">Inactive Only</option>
              </select>
            </div>
          </div>

          {/* Trustees List */}
          {isTrusteesLoading ? (
            <div className="py-16 text-center text-stone-500 space-y-2">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-800" />
              <p className="text-xs">Loading board members from MongoDB...</p>
            </div>
          ) : trustees.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-xl border border-stone-200 space-y-3">
              <Users className="w-12 h-12 text-stone-300 mx-auto" />
              <h4 className="text-sm font-serif font-bold text-stone-800">No Trustees Found</h4>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                No trustees match the current filter. Add a new trustee to initialize the board directory.
              </p>
              <Button
                size="sm"
                variant="primary"
                onClick={openCreateTrusteeModal}
                className="text-xs bg-[#14532d] text-white"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Trustee
              </Button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200">
                    <tr>
                      <th className="py-3 px-4">Order</th>
                      <th className="py-3 px-4">Trustee Member</th>
                      <th className="py-3 px-4">Designation & Role</th>
                      <th className="py-3 px-4">Qualification</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {trustees.map((t) => (
                      <tr key={t.id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-stone-500">
                          #{t.displayOrder}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-stone-100 border border-stone-200 overflow-hidden shrink-0 flex items-center justify-center font-bold text-emerald-900 text-xs">
                              {t.photo ? (
                                <img
                                  src={t.photo}
                                  alt={t.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = "none";
                                  }}
                                />
                              ) : (
                                t.name.slice(0, 2).toUpperCase()
                              )}
                            </div>
                            <div>
                              <span className="font-semibold text-stone-900 block">{t.name}</span>
                              <span className="text-[11px] text-stone-500 line-clamp-1 max-w-xs">{t.bio}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-stone-800 block">{t.designation}</span>
                          <span className="text-[10px] text-stone-400 uppercase tracking-wider">{t.role}</span>
                        </td>
                        <td className="py-3 px-4 text-stone-600 font-mono text-[11px]">
                          {t.qualification || "—"}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              t.isActive
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : "bg-stone-100 text-stone-500 border border-stone-200"
                            }`}
                          >
                            {t.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* Toggle Active */}
                            <button
                              type="button"
                              onClick={() => handleToggleTrusteeActive(t)}
                              title={t.isActive ? "Deactivate Trustee" : "Activate Trustee"}
                              className="p-1.5 rounded text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                            >
                              {t.isActive ? (
                                <Eye className="w-3.5 h-3.5 text-emerald-700" />
                              ) : (
                                <EyeOff className="w-3.5 h-3.5" />
                              )}
                            </button>

                            {/* Edit */}
                            <button
                              type="button"
                              onClick={() => openEditTrusteeModal(t)}
                              title="Edit Trustee"
                              className="p-1.5 rounded text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => handleDeleteTrustee(t)}
                              title="Delete Trustee"
                              className="p-1.5 rounded text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
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
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE / EDIT TRUSTEE */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isTrusteeModalOpen}
        onClose={() => setIsTrusteeModalOpen(false)}
        title={editingTrustee ? `Edit Trustee: ${editingTrustee.name}` : "Add New Trustee to Board"}
        size="md"
      >
        <form onSubmit={handleSaveTrustee} className="space-y-4 text-xs sm:text-sm">
          {trusteeFormError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{trusteeFormError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="font-semibold text-stone-800 block">
                Trustee Full Name <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={trusteeFormData.name}
                onChange={(e) => setTrusteeFormData({ ...trusteeFormData, name: e.target.value })}
                placeholder="e.g. Dr. Ramesh Joshi"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md focus:bg-white focus:outline-none focus:border-emerald-800"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-800 block">
                Designation <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={trusteeFormData.designation}
                onChange={(e) => setTrusteeFormData({ ...trusteeFormData, designation: e.target.value })}
                placeholder="e.g. Managing Trustee & Medical Director"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md focus:bg-white focus:outline-none focus:border-emerald-800"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-800 block">Board Role</label>
              <select
                value={trusteeFormData.role}
                onChange={(e) => setTrusteeFormData({ ...trusteeFormData, role: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md focus:bg-white focus:outline-none focus:border-emerald-800"
              >
                <option value="Managing Trustee">Managing Trustee</option>
                <option value="Trustee">Trustee</option>
                <option value="Advisory Board Member">Advisory Board Member</option>
                <option value="Treasurer">Treasurer</option>
                <option value="Secretary">Secretary</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-800 block">Academic Qualification</label>
              <input
                type="text"
                value={trusteeFormData.qualification}
                onChange={(e) => setTrusteeFormData({ ...trusteeFormData, qualification: e.target.value })}
                placeholder="e.g. M.B.B.S., M.D., Fellow AIIMS"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md focus:bg-white focus:outline-none focus:border-emerald-800"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-800 block">Display Order</label>
              <input
                type="number"
                value={trusteeFormData.displayOrder}
                onChange={(e) => setTrusteeFormData({ ...trusteeFormData, displayOrder: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md focus:bg-white focus:outline-none focus:border-emerald-800 font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <FileUploadField
                label="Trustee Photo"
                category="IMAGE"
                value={trusteeFormData.photo}
                onChange={(url) => setTrusteeFormData({ ...trusteeFormData, photo: url })}
                placeholder="https://... or click upload above"
                helperText="Upload official photograph (under 5MB) or paste a verified image URL."
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="font-semibold text-stone-800 block">
                Biography / Profile Summary <span className="text-rose-600">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={trusteeFormData.bio}
                onChange={(e) => setTrusteeFormData({ ...trusteeFormData, bio: e.target.value })}
                placeholder="Summary of experience, civic leadership, and contribution to charitable missions..."
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md focus:bg-white focus:outline-none focus:border-emerald-800"
              />
            </div>

            <div className="sm:col-span-2 flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="trusteeIsActive"
                checked={trusteeFormData.isActive}
                onChange={(e) => setTrusteeFormData({ ...trusteeFormData, isActive: e.target.checked })}
                className="rounded text-emerald-800 focus:ring-emerald-800"
              />
              <label htmlFor="trusteeIsActive" className="font-semibold text-stone-800 cursor-pointer">
                Active Member (Visible on public About & Board Directory page)
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsTrusteeModalOpen(false)}
              disabled={isSavingTrustee}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSavingTrustee}
              className="bg-[#14532d] hover:bg-[#0f4023] text-white flex items-center gap-1.5"
            >
              {isSavingTrustee ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{editingTrustee ? "Update Trustee" : "Add to Board"}</span>
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
