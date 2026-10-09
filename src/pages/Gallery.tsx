import React, { useState, useEffect } from "react";
import { Camera, MapPin, Calendar, Flame, Loader2 } from "lucide-react";
import { Modal } from "@/src/components/common/Modal";
import { EmptyState } from "@/src/components/common/EmptyState";
import { PageHeader } from "@/src/components/common/PageHeader";
import { useKumbhMode } from "@/src/context/KumbhModeContext";
import { publicService } from "@/src/services/publicService";
import { GalleryItem } from "@/src/types";
import { MOCK_GALLERY_ITEMS } from "@/src/data/mockData";

export const Gallery: React.FC = () => {
  const { isKumbhMode } = useKumbhMode();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activePhoto, setActivePhoto] = useState<GalleryItem | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadGallery = async () => {
      setIsLoading(true);
      try {
        const homeData = await publicService.getHomeData();
        if (isMounted) {
          if (homeData?.galleryPreview && homeData.galleryPreview.length > 0) {
            setItems(homeData.galleryPreview as unknown as GalleryItem[]);
          } else {
            setItems(MOCK_GALLERY_ITEMS);
          }
        }
      } catch (err) {
        console.warn("Could not load gallery items, using verified mock items:", err);
        if (isMounted) setItems(MOCK_GALLERY_ITEMS);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadGallery();
    return () => {
      isMounted = false;
    };
  }, []);

  const categories = [
    "All",
    "Nutrition",
    "Healthcare",
    "Education",
    "Environment",
    ...(isKumbhMode ? ["Kumbh Seva"] : []),
  ];

  const filteredItems = items.filter((item) => {
    // If Kumbh mode is disabled, hide Kumbh items
    if (!isKumbhMode && item.isKumbhRelated) return false;
    if (selectedCategory === "All") return true;
    return item.category === selectedCategory;
  });

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#faf8f5]">
      {/* Subtle warm stone architectural texture */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#d6c9b3_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
        {/* 1. Cinematic Page Header */}
        <PageHeader
          variant="cinematic"
          backgroundImage="/activities/image.png"
          kicker="नाशिक क्षेत्रीय छायाचित्रे · Verified Field Proofs"
          title="Visual Field Proofs & Seva Gallery"
          description="Direct documented photographic records capturing medical camps, educational stationery distributions, tree plantations, and community assistance across Nashik district."
        />

        {/* Category Segmented Filter Tabs */}
        <div className="flex justify-center flex-wrap gap-1.5 p-1.5 bg-stone-100/80 rounded-2xl border border-stone-200/80 max-w-fit mx-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 sm:px-5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-stone-900 text-white shadow-xs"
                  : "text-stone-700 hover:text-stone-950 hover:bg-stone-200/60"
              }`}
            >
              {cat === "Kumbh Seva" ? (
                <span className="flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                  <span>Kumbh Seva 2027</span>
                </span>
              ) : (
                cat
              )}
            </button>
          ))}
        </div>

        {/* Grid or Empty State */}
        {isLoading ? (
          <div className="min-h-[260px] flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-amber-700 animate-spin" />
            <p className="text-xs text-stone-600 font-medium">Loading verified visual proofs...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <EmptyState
            title="No published visual records available"
            description="Visual field proofs and photo documentation will appear here once trust events and seva activities are documented and published by the administration."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setActivePhoto(item)}
                className="group bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-xs hover:border-amber-600/40 hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col"
              >
                <div className="relative aspect-4/3 overflow-hidden bg-stone-100">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-stone-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                    <span className="bg-stone-950/80 backdrop-blur-xs text-stone-200 text-[10px] font-semibold px-2 py-0.5 rounded border border-white/10 shadow-2xs">
                      {item.category}
                    </span>
                    {item.isKumbhRelated && (
                      <span className="bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 shadow-2xs border border-amber-400/40">
                        <Flame className="w-2.5 h-2.5 fill-white" />
                        <span>Kumbh</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif font-bold text-base text-stone-900 leading-snug group-hover:text-amber-900 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-stone-600 mt-1.5 line-clamp-2 leading-relaxed">
                      {item.caption}
                    </p>
                  </div>

                  <div className="pt-2.5 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                    <span className="flex items-center gap-1 font-medium text-stone-600">
                      <MapPin className="w-3 h-3 text-amber-700" />
                      <span>{item.location}</span>
                    </span>
                    <span className="flex items-center gap-1 text-stone-500">
                      <Calendar className="w-3 h-3 text-stone-400" />
                      <span>{item.date}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lightbox Modal */}
        <Modal
          isOpen={!!activePhoto}
          onClose={() => setActivePhoto(null)}
          title={activePhoto?.title || "Field Proof"}
        >
          {activePhoto && (
            <div className="space-y-4">
              <div className="rounded-2xl overflow-hidden max-h-[500px] bg-stone-950 flex items-center justify-center border border-stone-800 shadow-md">
                <img
                  src={activePhoto.imageUrl}
                  alt={activePhoto.title}
                  className="max-h-[480px] w-auto object-contain"
                />
              </div>
              <div className="p-2 space-y-2 text-xs">
                <div className="flex items-center justify-between text-stone-600 border-b border-stone-100 pb-2">
                  <span className="flex items-center gap-1.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-amber-700" />
                    <span>{activePhoto.location}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-700" />
                    <span>{activePhoto.date}</span>
                  </span>
                </div>
                <p className="text-stone-700 text-sm leading-relaxed pt-1">
                  {activePhoto.caption}
                </p>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};
