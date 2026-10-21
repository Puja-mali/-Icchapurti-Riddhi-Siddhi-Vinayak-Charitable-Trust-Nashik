import React, { useState, useEffect } from "react";
import { AlertCircle, Check, Loader2, Sparkles, Image as ImageIcon } from "lucide-react";
import { Cause, CauseCategory } from "@/src/types";
import { causeService } from "@/src/services/causeService";
import { Modal } from "@/src/components/common/Modal";
import { Button } from "@/src/components/common/Button";
import { FileUploadField } from "@/src/components/common/FileUploadField";

interface CauseModalProps {
  isOpen: boolean;
  onClose: () => void;
  causeToEdit: Cause | null;
  onSuccess: (savedCauseTitle: string) => void;
}

export const CauseModal: React.FC<CauseModalProps> = ({
  isOpen,
  onClose,
  causeToEdit,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<"en" | "mr" | "hi">("en");
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form values maintained in local component state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<CauseCategory>("Education");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [location, setLocation] = useState("Nashik, Maharashtra");
  const [status, setStatus] = useState<"DRAFT" | "ACTIVE" | "COMPLETED" | "ARCHIVED">("ACTIVE");
  const [isKumbhRelated, setIsKumbhRelated] = useState(false);
  const [urgent, setUrgent] = useState(false);

  // Translations
  const [titleMr, setTitleMr] = useState("");
  const [shortDescMr, setShortDescMr] = useState("");
  const [descMr, setDescMr] = useState("");

  const [titleHi, setTitleHi] = useState("");
  const [shortDescHi, setShortDescHi] = useState("");
  const [descHi, setDescHi] = useState("");

  // Initialize or reset form whenever modal opens or causeToEdit changes
  useEffect(() => {
    if (isOpen) {
      setFormError(null);
      setActiveTab("en");

      if (causeToEdit) {
        setTitle(causeToEdit.title || "");
        setCategory(causeToEdit.category || "Education");
        setShortDescription(causeToEdit.shortDescription || causeToEdit.tagline || "");
        setDescription(causeToEdit.description || "");
        setTargetAmount(String(causeToEdit.targetAmount ?? ""));
        setImageUrl(causeToEdit.imageUrl || "");
        setLocation(causeToEdit.location || "Nashik, Maharashtra");
        setStatus((causeToEdit.status as any) || "ACTIVE");
        setIsKumbhRelated(!!causeToEdit.isKumbhRelated);
        setUrgent(!!causeToEdit.urgent);

        setTitleMr(causeToEdit.translations?.mr?.title || "");
        setShortDescMr(causeToEdit.translations?.mr?.shortDescription || "");
        setDescMr(causeToEdit.translations?.mr?.description || "");

        setTitleHi(causeToEdit.translations?.hi?.title || "");
        setShortDescHi(causeToEdit.translations?.hi?.shortDescription || "");
        setDescHi(causeToEdit.translations?.hi?.description || "");
      } else {
        setTitle("");
        setCategory("Education");
        setShortDescription("");
        setDescription("");
        setTargetAmount("");
        setImageUrl("");
        setLocation("Nashik, Maharashtra");
        setStatus("ACTIVE");
        setIsKumbhRelated(false);
        setUrgent(false);

        setTitleMr("");
        setShortDescMr("");
        setDescMr("");

        setTitleHi("");
        setShortDescHi("");
        setDescHi("");
      }
    }
  }, [isOpen, causeToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanTitle = title.trim();
    const cleanShortDesc = shortDescription.trim();
    const cleanDesc = description.trim();
    const parsedTarget = Number(targetAmount);

    if (!cleanTitle) {
      setFormError("Campaign title is required.");
      setActiveTab("en");
      return;
    }
    if (cleanTitle.length < 3) {
      setFormError("Campaign title must be at least 3 characters (current: " + cleanTitle.length + ").");
      setActiveTab("en");
      return;
    }
    if (cleanTitle.length > 200) {
      setFormError("Campaign title cannot exceed 200 characters.");
      setActiveTab("en");
      return;
    }

    if (!cleanShortDesc) {
      setFormError("Short description / tagline is required.");
      setActiveTab("en");
      return;
    }
    if (cleanShortDesc.length < 5) {
      setFormError("Short description must be at least 5 characters (current: " + cleanShortDesc.length + ").");
      setActiveTab("en");
      return;
    }
    if (cleanShortDesc.length > 500) {
      setFormError("Short description cannot exceed 500 characters.");
      setActiveTab("en");
      return;
    }

    if (!cleanDesc) {
      setFormError("Full narrative description is required.");
      setActiveTab("en");
      return;
    }
    if (cleanDesc.length < 10) {
      setFormError("Full narrative description must be at least 10 characters (current: " + cleanDesc.length + ").");
      setActiveTab("en");
      return;
    }

    if (isNaN(parsedTarget) || parsedTarget < 0) {
      setFormError("Target amount must be a valid non-negative number (e.g., 500000).");
      return;
    }

    if (!imageUrl.trim()) {
      setFormError("A cover image is required. Please upload an image or enter a valid URL.");
      return;
    }

    setIsSaving(true);

    try {
      const translationsPayload: any = {};
      if (titleMr.trim() || shortDescMr.trim() || descMr.trim()) {
        translationsPayload.mr = {
          title: titleMr.trim() || undefined,
          shortDescription: shortDescMr.trim() || undefined,
          description: descMr.trim() || undefined,
        };
      }
      if (titleHi.trim() || shortDescHi.trim() || descHi.trim()) {
        translationsPayload.hi = {
          title: titleHi.trim() || undefined,
          shortDescription: shortDescHi.trim() || undefined,
          description: descHi.trim() || undefined,
        };
      }

      const payload: Partial<Cause> = {
        title: cleanTitle,
        category,
        shortDescription: cleanShortDesc,
        tagline: cleanShortDesc,
        description: cleanDesc,
        targetAmount: parsedTarget,
        imageUrl: imageUrl.trim(),
        location: location.trim(),
        status,
        isKumbhRelated,
        urgent,
        translations: Object.keys(translationsPayload).length > 0 ? translationsPayload : undefined,
      };

      if (causeToEdit) {
        await causeService.updateCause(causeToEdit.id, payload);
      } else {
        await causeService.createCause(payload);
      }

      onSuccess(cleanTitle);
      onClose();
    } catch (err: any) {
      console.error("Error saving campaign:", err);
      const detailedMessage =
        err?.errors && Array.isArray(err.errors) && err.errors.length > 0
          ? err.errors.map((e: any) => e.message).join(". ")
          : err?.message || "Failed to save campaign. Please check the fields and try again.";
      setFormError(detailedMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={causeToEdit ? `Edit Campaign: ${causeToEdit.title}` : "Create New Charitable Campaign"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
        {formError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <div className="leading-relaxed font-medium">{formError}</div>
          </div>
        )}

        {/* Language Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-lg text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("en")}
            className={`flex-1 py-1.5 rounded-md transition-colors cursor-pointer text-center ${
              activeTab === "en" ? "bg-white text-stone-900 shadow-xs" : "text-stone-600 hover:text-stone-900"
            }`}
          >
            English (Primary)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("mr")}
            className={`flex-1 py-1.5 rounded-md transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "mr" ? "bg-[#14532d] text-white shadow-xs" : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <span>मराठी भाषांतर</span>
            {titleMr.trim() ? (
              <span className="text-[10px] bg-emerald-100 text-emerald-900 px-1 rounded font-bold">✓</span>
            ) : (
              <span className="text-[10px] text-amber-500 font-normal">Pending</span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("hi")}
            className={`flex-1 py-1.5 rounded-md transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "hi" ? "bg-amber-600 text-white shadow-xs" : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <span>हिंदी अनुवाद</span>
            {titleHi.trim() ? (
              <span className="text-[10px] bg-amber-100 text-amber-900 px-1 rounded font-bold">✓</span>
            ) : (
              <span className="text-[10px] text-amber-400 font-normal">Pending</span>
            )}
          </button>
        </div>

        {/* English Tab Content */}
        {activeTab === "en" && (
          <div className="space-y-4">
            {/* Title */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor="cause-title-input" className="font-semibold text-stone-800 block text-xs">
                  Campaign Title (English) <span className="text-rose-600">*</span>
                </label>
                <span className={`text-[11px] ${title.trim().length >= 3 ? "text-emerald-700 font-medium" : "text-stone-400"}`}>
                  {title.length}/200 (min 3 chars)
                </span>
              </div>
              <input
                id="cause-title-input"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Rural School Digital Literacy Drive"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:bg-white focus:outline-none focus:border-[#14532d]"
              />
            </div>

            {/* Short Description */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor="cause-short-desc-input" className="font-semibold text-stone-800 block text-xs">
                  Short Description / Tagline (English) <span className="text-rose-600">*</span>
                </label>
                <span className={`text-[11px] ${shortDescription.trim().length >= 5 ? "text-emerald-700 font-medium" : "text-stone-400"}`}>
                  {shortDescription.length}/500 (min 5 chars)
                </span>
              </div>
              <input
                id="cause-short-desc-input"
                type="text"
                required
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="One-sentence impact summary shown on cards"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:bg-white focus:outline-none focus:border-[#14532d]"
              />
            </div>

            {/* Full Description */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor="cause-description-input" className="font-semibold text-stone-800 block text-xs">
                  Full Description / Narrative (English) <span className="text-rose-600">*</span>
                </label>
                <span className={`text-[11px] ${description.trim().length >= 10 ? "text-emerald-700 font-medium" : "text-stone-400"}`}>
                  {description.length} chars (min 10 chars)
                </span>
              </div>
              <textarea
                id="cause-description-input"
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed explanation of the need, target beneficiaries, execution milestones, and fund deployment..."
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:bg-white focus:outline-none focus:border-[#14532d] leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* Marathi Tab Content */}
        {activeTab === "mr" && (
          <div className="space-y-4 p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/80">
            <div className="text-xs text-[#14532d] space-y-0.5">
              <div className="font-semibold">मराठी भाषांतर पुनरावलोकन (Marathi Translation)</div>
              <p className="text-[11px] text-stone-600">
                मराठी भाषेतील अधिकृत शीर्षक व माहिती प्रविष्ट करा. रिक्त राहिल्यास इंग्रजी मजकूर सुरक्षितपणे दर्शवला जाईल.
              </p>
            </div>

            <div className="space-y-1">
              <label htmlFor="cause-title-mr-input" className="font-semibold text-stone-800 block text-xs">
                मोहिमेचे शीर्षक (मराठी)
              </label>
              <input
                id="cause-title-mr-input"
                type="text"
                value={titleMr}
                onChange={(e) => setTitleMr(e.target.value)}
                placeholder="उदा. ग्रामीण शाळा डिजिटल साक्षरता अभियान"
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-md text-stone-900 focus:outline-none focus:border-[#14532d]"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="cause-short-desc-mr-input" className="font-semibold text-stone-800 block text-xs">
                संक्षिप्त घोषवाक्य / माहिती (मराठी)
              </label>
              <input
                id="cause-short-desc-mr-input"
                type="text"
                value={shortDescMr}
                onChange={(e) => setShortDescMr(e.target.value)}
                placeholder="एका वाक्यात उपक्रमाची ओळख..."
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-md text-stone-900 focus:outline-none focus:border-[#14532d]"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="cause-desc-mr-input" className="font-semibold text-stone-800 block text-xs">
                सविस्तर वर्णन (मराठी)
              </label>
              <textarea
                id="cause-desc-mr-input"
                rows={4}
                value={descMr}
                onChange={(e) => setDescMr(e.target.value)}
                placeholder="उपक्रमाची सविस्तर माहिती, लाभार्थी व प्रत्यक्ष कार्यप्रणाली..."
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-md text-stone-900 focus:outline-none focus:border-[#14532d]"
              />
            </div>
          </div>
        )}

        {/* Hindi Tab Content */}
        {activeTab === "hi" && (
          <div className="space-y-4 p-4 rounded-xl bg-amber-50/50 border border-amber-200/80">
            <div className="text-xs text-amber-950 space-y-0.5">
              <div className="font-semibold">हिंदी अनुवाद समीक्षा (Hindi Translation)</div>
              <p className="text-[11px] text-stone-600">
                हिंदी भाषा में शीर्षक एवं विवरण दर्ज करें। रिक्त रहने पर अंग्रेजी मूल विवरण सुरक्षित प्रदर्शित होगा।
              </p>
            </div>

            <div className="space-y-1">
              <label htmlFor="cause-title-hi-input" className="font-semibold text-stone-800 block text-xs">
                अभियान का शीर्षक (हिंदी)
              </label>
              <input
                id="cause-title-hi-input"
                type="text"
                value={titleHi}
                onChange={(e) => setTitleHi(e.target.value)}
                placeholder="उदा. ग्रामीण शाला डिजिटल साक्षरता अभियान"
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-md text-stone-900 focus:outline-none focus:border-amber-600"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="cause-short-desc-hi-input" className="font-semibold text-stone-800 block text-xs">
                संक्षिप्त विवरण (हिंदी)
              </label>
              <input
                id="cause-short-desc-hi-input"
                type="text"
                value={shortDescHi}
                onChange={(e) => setShortDescHi(e.target.value)}
                placeholder="एक वाक्य में प्रकल्प का सार..."
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-md text-stone-900 focus:outline-none focus:border-amber-600"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="cause-desc-hi-input" className="font-semibold text-stone-800 block text-xs">
                विस्तृत विवरण (हिंदी)
              </label>
              <textarea
                id="cause-desc-hi-input"
                rows={4}
                value={descHi}
                onChange={(e) => setDescHi(e.target.value)}
                placeholder="प्रकल्प का विस्तृत विवरण, लाभार्थी एवं क्रियान्वयन..."
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-md text-stone-900 focus:outline-none focus:border-amber-600"
              />
            </div>
          </div>
        )}

        {/* Operational Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100">
          {/* Category */}
          <div className="space-y-1">
            <label htmlFor="cause-category-select" className="font-semibold text-stone-800 block text-xs">
              Category <span className="text-rose-600">*</span>
            </label>
            <select
              id="cause-category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value as CauseCategory)}
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
            <label htmlFor="cause-status-select" className="font-semibold text-stone-800 block text-xs">Status</label>
            <select
              id="cause-status-select"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
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
            <label htmlFor="cause-target-amount-input" className="font-semibold text-stone-800 block text-xs">
              Target Amount (₹) <span className="text-rose-600">*</span>
            </label>
            <input
              id="cause-target-amount-input"
              type="number"
              min="0"
              required
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="e.g., 500000"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:bg-white focus:outline-none focus:border-[#14532d]"
            />
          </div>

          {/* Location */}
          <div className="space-y-1">
            <label htmlFor="cause-location-input" className="font-semibold text-stone-800 block text-xs">Location</label>
            <input
              id="cause-location-input"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Nashik, Maharashtra"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:bg-white focus:outline-none focus:border-[#14532d]"
            />
          </div>

          {/* Image Upload & URL */}
          <div className="sm:col-span-2 space-y-2">
            <FileUploadField
              label="Upload Cover Image"
              category="IMAGE"
              value={imageUrl}
              onChange={(url) => setImageUrl(url)}
              helperText="Upload a JPG, PNG, or WebP photo (max 5 MB) or specify an existing image URL below."
            />
            <div className="space-y-1">
              <label htmlFor="cause-image-url-input" className="block text-[11px] font-medium text-stone-600">
                Or Direct Image URL <span className="text-rose-600">*</span>
              </label>
              <input
                id="cause-image-url-input"
                type="url"
                required
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/... or uploaded URL"
                className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-md text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-[#14532d]"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="sm:col-span-2 flex items-center gap-6 pt-1">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isKumbhRelated}
                onChange={(e) => setIsKumbhRelated(e.target.checked)}
                className="rounded text-[#14532d] focus:ring-[#14532d]"
              />
              <span className="font-medium text-stone-800 text-xs">Nashik Kumbh Mela Program</span>
            </label>

            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={urgent}
                onChange={(e) => setUrgent(e.target.checked)}
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
            {isSaving ? "Saving..." : causeToEdit ? "Save Changes" : "Publish Campaign"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
