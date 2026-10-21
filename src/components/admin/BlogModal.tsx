import React, { useState, useEffect } from "react";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import { BlogPost } from "@/src/types";
import { blogService } from "@/src/services/blogService";
import { Modal } from "@/src/components/common/Modal";
import { Button } from "@/src/components/common/Button";
import { FileUploadField } from "@/src/components/common/FileUploadField";

interface BlogModalProps {
  isOpen: boolean;
  onClose: () => void;
  postToEdit: BlogPost | null;
  onSuccess: (savedPostTitle: string) => void;
}

export const BlogModal: React.FC<BlogModalProps> = ({
  isOpen,
  onClose,
  postToEdit,
  onSuccess,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("Field Updates");
  const [author, setAuthor] = useState("Siddhivinayak Trust");
  const [coverImage, setCoverImage] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isKumbhRelated, setIsKumbhRelated] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormError(null);
      if (postToEdit) {
        setTitle(postToEdit.title || "");
        setSlug(postToEdit.slug || "");
        setCategory(postToEdit.category || "Field Updates");
        setAuthor(postToEdit.author || "Siddhivinayak Trust");
        setCoverImage(postToEdit.coverImage || "");
        setExcerpt(postToEdit.excerpt || "");
        setContent(postToEdit.content || "");
        setTags(Array.isArray(postToEdit.tags) ? postToEdit.tags.join(", ") : "");
        setIsPublished(!!postToEdit.isPublished);
        setIsFeatured(!!postToEdit.isFeatured);
        setIsKumbhRelated(!!postToEdit.isKumbhRelated);
      } else {
        setTitle("");
        setSlug("");
        setCategory("Field Updates");
        setAuthor("Siddhivinayak Trust");
        setCoverImage("");
        setExcerpt("");
        setContent("");
        setTags("");
        setIsPublished(true);
        setIsFeatured(false);
        setIsKumbhRelated(false);
      }
    }
  }, [isOpen, postToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanTitle = title.trim();
    const cleanExcerpt = excerpt.trim();
    const cleanContent = content.trim();

    if (!cleanTitle) {
      setFormError("Story title is required.");
      return;
    }
    if (!cleanExcerpt) {
      setFormError("Short excerpt is required.");
      return;
    }
    if (!cleanContent) {
      setFormError("Story content is required.");
      return;
    }
    if (!coverImage.trim()) {
      setFormError("Cover image URL or upload is required.");
      return;
    }

    const parsedTags = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    setIsSaving(true);
    try {
      const payload = {
        title: cleanTitle,
        slug: slug.trim() || undefined,
        category,
        author: author.trim() || "Siddhivinayak Trust",
        coverImage: coverImage.trim(),
        excerpt: cleanExcerpt,
        content: cleanContent,
        tags: parsedTags,
        isPublished,
        isFeatured,
        isKumbhRelated,
      };

      if (postToEdit) {
        await blogService.updatePost(postToEdit.id, payload);
      } else {
        await blogService.createPost(payload);
      }

      onSuccess(cleanTitle);
      onClose();
    } catch (err: any) {
      console.error("Error saving blog post:", err);
      setFormError(err?.message || "Failed to save post. Please verify inputs.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={postToEdit ? `Edit Story: ${postToEdit.title}` : "Publish New Field Story or News Article"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
        {formError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-md flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{formError}</span>
          </div>
        )}

        <div className="space-y-4">
          {/* Title */}
          <div className="space-y-1">
            <label htmlFor="blog-title-input" className="font-semibold text-stone-800 block text-xs">
              Story Title <span className="text-rose-600">*</span>
            </label>
            <input
              id="blog-title-input"
              type="text"
              required
              placeholder="e.g. Free Mobile Diagnostic Camps Screen 3,400 Rural Citizens"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:bg-white focus:outline-none focus:border-purple-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Slug */}
            <div className="space-y-1">
              <label htmlFor="blog-slug-input" className="font-semibold text-stone-800 block text-xs">URL Slug</label>
              <input
                id="blog-slug-input"
                type="text"
                placeholder="slug-auto-generated-or-custom"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:bg-white focus:outline-none focus:border-purple-600"
              />
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label htmlFor="blog-category-select" className="font-semibold text-stone-800 block text-xs">Category</label>
              <select
                id="blog-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:bg-white focus:outline-none focus:border-purple-600"
              >
                <option value="Field Updates">Field Updates</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Education">Education</option>
                <option value="Kumbh Seva">Kumbh Seva</option>
                <option value="Annadanam">Annadanam</option>
                <option value="Transparency & Audits">Transparency & Audits</option>
                <option value="Volunteer Stories">Volunteer Stories</option>
              </select>
            </div>

            {/* Author */}
            <div className="space-y-1">
              <label htmlFor="blog-author-input" className="font-semibold text-stone-800 block text-xs">Author / Bylines</label>
              <input
                id="blog-author-input"
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:bg-white focus:outline-none focus:border-purple-600"
              />
            </div>
          </div>

          {/* Cover Image Upload & URL */}
          <div className="space-y-2">
            <FileUploadField
              label="Cover Image"
              category="IMAGE"
              value={coverImage}
              onChange={(url) => setCoverImage(url)}
              helperText="Upload JPG, PNG, WebP (max 5 MB) or enter image URL below."
            />
            <input
              type="url"
              required
              placeholder="https://images.unsplash.com/... or uploaded URL"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-md text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-purple-600"
            />
          </div>

          {/* Excerpt */}
          <div className="space-y-1">
            <label htmlFor="blog-excerpt-input" className="font-semibold text-stone-800 block text-xs">
              Summary / Excerpt (Lead Paragraph) <span className="text-rose-600">*</span>
            </label>
            <textarea
              id="blog-excerpt-input"
              required
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief 1-2 sentence lead summary displayed in news feed cards and search results..."
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:bg-white focus:outline-none focus:border-purple-600 leading-relaxed"
            />
          </div>

          {/* Content */}
          <div className="space-y-1">
            <label htmlFor="blog-content-input" className="font-semibold text-stone-800 block text-xs">
              Complete Article Body (Markdown supported) <span className="text-rose-600">*</span>
            </label>
            <textarea
              id="blog-content-input"
              required
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write the complete narrative here. Include beneficiary quotes, metrics, impact milestones, and photo captions..."
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:bg-white focus:outline-none focus:border-purple-600 leading-relaxed"
            />
          </div>

          {/* Tags */}
          <div className="space-y-1">
            <label htmlFor="blog-tags-input" className="font-semibold text-stone-800 block text-xs">Tags (comma separated)</label>
            <input
              id="blog-tags-input"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. health, rural clinic, nashik, medical seva"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:bg-white focus:outline-none focus:border-purple-600"
            />
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-stone-100">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="rounded text-purple-600 focus:ring-purple-500"
              />
              <span className="font-medium text-stone-800 text-xs">Publish Publicly</span>
            </label>

            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500"
              />
              <span className="font-medium text-stone-800 text-xs">Feature on Homepage</span>
            </label>

            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isKumbhRelated}
                onChange={(e) => setIsKumbhRelated(e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500"
              />
              <span className="font-medium text-stone-800 text-xs">Kumbh Mela Related</span>
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
            className="bg-purple-700 hover:bg-purple-800 text-white"
            leftIcon={isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          >
            {isSaving ? "Saving..." : postToEdit ? "Save Changes" : "Publish Story"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
