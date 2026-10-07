import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  ArrowRight,
  Flame,
  Newspaper,
  RefreshCw,
  AlertCircle,
  Search,
  BookOpen,
} from "lucide-react";
import { Button } from "@/src/components/common/Button";
import { useKumbhMode } from "@/src/context/KumbhModeContext";
import { useLanguage } from "@/src/context/LanguageContext";
import { blogService } from "@/src/services/blogService";
import { BlogPost } from "@/src/types";

export const Blog: React.FC = () => {
  const { isKumbhMode } = useKumbhMode();
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const categories = [
    "All",
    "Field Updates",
    "Healthcare",
    "Transparency",
    "Education",
    "Governance & Impact",
    ...(isKumbhMode ? ["Kumbh Seva"] : []),
  ];

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await blogService.getPosts({
        category: selectedCategory !== "All" ? selectedCategory : undefined,
        search: debouncedSearch || undefined,
        isKumbhRelated: isKumbhMode ? undefined : false,
        limit: 50,
      });
      setPosts(response.posts);
    } catch (err: any) {
      console.error("Failed to load blog posts:", err);
      setError(err?.message || t.blog.loadError);
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, debouncedSearch, isKumbhMode, t.blog.loadError]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3.5 py-1 rounded-full text-xs font-semibold border border-emerald-200 shadow-2xs">
          <Newspaper className="w-3.5 h-3.5 text-emerald-700" />
          <span>{t.blog.recentPosts}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-serif font-bold text-stone-900 tracking-tight leading-[1.15]">
          {t.blog.title}
        </h1>

        {/* Warm Subtle Decorative Divider */}
        <div className="flex items-center justify-center gap-2 mt-3.5 mb-2">
          <span className="w-8 h-px bg-amber-400/60" />
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span className="w-8 h-px bg-amber-400/60" />
        </div>

        <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-2xl mx-auto">
          {t.blog.subtitle}
        </p>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="space-y-4">
        <div className="max-w-md mx-auto relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search news, field reports, authors, tags..."
            className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-white border border-stone-200/90 rounded-full focus:outline-none focus:ring-2 focus:ring-[#14532d]/20 focus:border-[#14532d] transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex justify-center flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                selectedCategory === cat
                  ? "bg-[#14532d] text-white border-[#14532d] shadow-2xs"
                  : "bg-white hover:bg-stone-50 text-stone-700 border-stone-200/80 shadow-2xs"
              }`}
            >
              {cat === "Kumbh Seva" ? (
                <span className="flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-300 fill-amber-300" />
                  <span>Simhastha Kumbh 2027</span>
                </span>
              ) : (
                cat
              )}
            </button>
          ))}
        </div>
      </div>

      {/* State Handling: Loading */}
      {isLoading && (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <RefreshCw className="w-8 h-8 text-emerald-700 animate-spin" />
          <p className="text-xs sm:text-sm text-stone-500 font-medium">{t.blog.loading}</p>
        </div>
      )}

      {/* State Handling: Error */}
      {!isLoading && error && (
        <div className="max-w-lg mx-auto p-6 bg-red-50/70 border border-red-200 rounded-xl text-center space-y-3">
          <div className="w-10 h-10 mx-auto rounded-full bg-red-100 text-red-700 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-red-900">{t.blog.loadError}</h3>
          <p className="text-xs text-red-700 leading-relaxed">{error}</p>
          <Button
            size="sm"
            onClick={fetchPosts}
            className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t.blog.retry}</span>
          </Button>
        </div>
      )}

      {/* State Handling: Empty state */}
      {!isLoading && !error && posts.length === 0 && (
        <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4 border border-dashed border-stone-200 rounded-xl bg-stone-50/50">
          <div className="w-12 h-12 mx-auto rounded-full bg-stone-100 text-stone-400 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-serif font-bold text-stone-900">{t.blog.noPosts}</h3>
            <p className="text-xs text-stone-500">
              {searchQuery || selectedCategory !== "All"
                ? "No published stories match your current filters. Try resetting the category or search query."
                : "Official field chronicles, news articles, and project milestones will be published here by our editorial desk."}
            </p>
          </div>
          {(searchQuery || selectedCategory !== "All") && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedCategory("All");
                setSearchQuery("");
              }}
              className="text-xs"
            >
              Reset Filters
            </Button>
          )}
        </div>
      )}

      {/* Posts Grid */}
      {!isLoading && !error && posts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article
              key={post.id || post.slug}
              className="bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-xs hover:border-emerald-700/40 hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="relative aspect-16/10 overflow-hidden bg-stone-100">
                  <img
                    src={post.coverImage || post.imageUrl}
                    alt={post.title}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                    onError={(e) => {
                      // Fallback placeholder if broken URL
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?auto=format&fit=crop&w=800&q=80";
                    }}
                  />
                  <div className="absolute top-2.5 left-2.5 flex gap-1 flex-wrap">
                    <span className="bg-black/70 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                      {post.category}
                    </span>
                    {post.isFeatured && (
                      <span className="bg-emerald-700 text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                        Featured
                      </span>
                    )}
                    {post.isKumbhRelated && (
                      <span className="bg-amber-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                        <Flame className="w-2.5 h-2.5" />
                        <span>Kumbh</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-3 text-[11px] text-stone-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-stone-400" />
                      <span>{post.publishedDate || post.date}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-stone-400" />
                      <span>{post.readTime}</span>
                    </span>
                  </div>

                  <h2 className="font-serif font-bold text-base sm:text-lg text-stone-900 leading-snug hover:text-emerald-800 transition-colors">
                    <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                  </h2>

                  <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-stone-100 flex items-center justify-between text-xs mt-3">
                <span className="text-stone-500 font-medium truncate max-w-[50%]">
                  By {post.author}
                </span>
                <Link
                  to={`/blog/${post.slug}`}
                  className="text-emerald-800 font-semibold hover:text-emerald-950 flex items-center gap-1 shrink-0"
                >
                  <span>{t.blog.readStory}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
