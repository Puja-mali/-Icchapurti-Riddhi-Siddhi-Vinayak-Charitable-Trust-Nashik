import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Share2,
  Flame,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  Check,
  Tag,
} from "lucide-react";
import { Button } from "@/src/components/common/Button";
import { useLanguage } from "@/src/context/LanguageContext";
import { blogService } from "@/src/services/blogService";
import { BlogPost as IBlogPost } from "@/src/types";

export const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useLanguage();
  const [post, setPost] = useState<IBlogPost | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    if (!slug) return;

    const fetchPost = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await blogService.getPostBySlug(slug);
        if (isMounted) {
          setPost(data);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || t.blog.storyNotFound);
          setPost(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchPost();

    return () => {
      isMounted = false;
    };
  }, [slug, t.blog.storyNotFound]);

  const handleShare = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // Fallback
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-8 h-8 text-emerald-700 animate-spin" />
        <p className="text-xs sm:text-sm text-stone-500 font-medium">{t.blog.loading}</p>
      </div>
    );
  }

  // Error / Not Found state
  if (error || !post) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-full bg-stone-100 text-stone-400 flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-stone-500" />
        </div>
        <h1 className="text-2xl font-serif font-bold text-stone-900">{t.blog.storyNotFound}</h1>
        <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
          {error || t.blog.storyNotFoundDesc}
        </p>
        <div className="pt-2">
          <Link to="/blog">
            <Button variant="outline" size="sm" className="text-xs">
              {t.blog.backToArchive}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Format content paragraphs
  const contentParagraphs = Array.isArray(post.content)
    ? post.content
    : typeof post.content === "string"
    ? post.content
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/blog"
          className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-emerald-900 font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.blog.backToArchive}</span>
        </Link>
      </div>

      {/* Header */}
      <header className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded">
            {post.category}
          </span>
          {post.isFeatured && (
            <span className="bg-emerald-800 text-white text-xs font-semibold px-2.5 py-0.5 rounded">
              Featured Story
            </span>
          )}
          {post.isKumbhRelated && (
            <span className="bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold px-2.5 py-0.5 rounded flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-600" />
              <span>Simhastha Kumbh 2027</span>
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-4xl font-serif font-bold text-stone-900 leading-tight">
          {post.title}
        </h1>

        <div className="flex items-center justify-between text-xs text-stone-500 border-y border-stone-200 py-2.5 gap-4 flex-wrap">
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <span className="font-medium text-stone-700">By {post.author}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              <span>{post.publishedDate || post.date}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              <span>{post.readTime}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1 text-emerald-800 hover:text-emerald-950 font-medium transition-colors cursor-pointer"
              title="Copy link to share"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Image */}
      <div className="rounded-2xl overflow-hidden aspect-16/9 bg-stone-100 border border-stone-200/90 shadow-sm">
        <img
          src={post.coverImage || post.imageUrl}
          alt={post.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?auto=format&fit=crop&w=1200&q=80";
          }}
        />
      </div>

      {/* Article Content */}
      <div className="prose prose-stone max-w-none text-stone-700 text-sm sm:text-base leading-relaxed space-y-5">
        {post.excerpt && (
          <p className="font-serif text-lg sm:text-xl text-stone-900 leading-snug border-l-4 border-amber-400 pl-4 py-2 italic bg-amber-50/40 rounded-r-xl">
            "{post.excerpt}"
          </p>
        )}

        {contentParagraphs.map((para, idx) => (
          <p key={idx} className="leading-relaxed">
            {para}
          </p>
        ))}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="pt-6 border-t border-stone-200 flex items-center gap-2 flex-wrap">
            <Tag className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span className="text-xs text-stone-500 font-medium">Tags:</span>
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="bg-stone-100 text-stone-600 text-xs px-2.5 py-0.5 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Trust Seal */}
      <div className="p-5 sm:p-6 bg-gradient-to-br from-emerald-50/90 via-emerald-50/50 to-amber-50/30 rounded-2xl border border-emerald-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-emerald-950 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
          <span className="font-medium">Verified Field Chronicle • Icchapurti Riddhi Siddhi Vinayak Charitable Trust</span>
        </div>
        <Link to="/causes" className="shrink-0">
          <Button size="sm" className="bg-[#14532d] hover:bg-[#0f4023] text-white text-xs px-4 py-2">
            Support Our Programs
          </Button>
        </Link>
      </div>
    </div>
  );
};
