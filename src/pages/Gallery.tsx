import React, { useState, useEffect } from "react";
import { Camera, MapPin, Calendar, Flame, Loader2 } from "lucide-react";
import { Modal } from "@/src/components/common/Modal";
import { EmptyState } from "@/src/components/common/EmptyState";
import { useKumbhMode } from "@/src/context/KumbhModeContext";
import { publicService } from "@/src/services/publicService";
import { GalleryItem } from "@/src/types";

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
          setItems(homeData.galleryPreview || []);
        }
      } catch (err) {
        console.warn("Could not load gallery items:", err);
        if (isMounted) setItems([]);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-200">
          <Camera className="w-3.5 h-3.5 text-emerald-700" />
          <span>Field Documentation Ledger</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
          Visual Field Proofs & Seva Gallery
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          Geotagged visual records capturing meals served, medical camps conducted,
          classroom setups, and preliminary Kumbh sanitation groundwork in Nashik and surrounding regions.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex justify-center flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === cat
                ? "bg-[#14532d] text-white shadow-2xs"
                : "bg-stone-100 hover:bg-stone-200 text-stone-700"
            }`}
          >
            {cat === "Kumbh Seva" ? (
              <span className="flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-300 fill-amber-300" />
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
          <Loader2 className="w-8 h-8 text-emerald-700 animate-spin" />
          <p className="text-xs text-stone-500">Loading verified visual proofs...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <EmptyState
          title="No published visual records available"
          description="Visual field proofs and photo documentation will appear here once trust events and seva activities are documented and published by the administration."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setActivePhoto(item)}
              className="group bg-white rounded-xl border border-stone-200 overflow-hidden shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col"
            >
              <div className="relative aspect-4/3 overflow-hidden bg-stone-100">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                />
                <div className="absolute top-2.5 left-2.5 flex gap-1">
                  <span className="bg-black/70 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                    {item.category}
                  </span>
                  {item.isKumbhRelated && (
                    <span className="bg-amber-600/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                      <Flame className="w-2.5 h-2.5" />
                      <span>Kumbh Seva</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif font-bold text-sm text-stone-900 leading-snug group-hover:text-emerald-800 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-stone-600 mt-1 line-clamp-2">
                    {item.caption}
                  </p>
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-stone-400" />
                    <span>{item.location}</span>
                  </span>
                  <span className="flex items-center gap-1">
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
          <div className="space-y-3">
            <div className="rounded-lg overflow-hidden max-h-[420px] bg-black flex items-center justify-center">
              <img
                src={activePhoto.imageUrl}
                alt={activePhoto.title}
                className="max-h-[420px] w-auto object-contain"
              />
            </div>
            <div className="p-2 space-y-1 text-xs">
              <div className="flex items-center justify-between text-stone-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  <span>{activePhoto.location}</span>
                </span>
                <span>{activePhoto.date}</span>
              </div>
              <p className="text-stone-700 leading-relaxed pt-1">
                {activePhoto.caption}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
