import { useState, useEffect, useCallback } from "react";
import { Images, X, ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { imgUrl, imgLabel } from "../utils/media.js";

export default function PropertyGallery({ images = [], title }) {
  const [lightbox, setLightbox] = useState(false);
  const [index, setIndex] = useState(0);

  const main = images[0];
  const thumbs = images.slice(1, 5);

  const open = (i) => {
    setIndex(i);
    setLightbox(true);
  };

  const next = useCallback(
    () => setIndex((i) => (i + 1) % images.length),
    [images.length]
  );
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + images.length) % images.length),
    [images.length]
  );

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, next, prev]);

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:h-[520px]">
        {/* Main image */}
        <button
          onClick={() => open(0)}
          className="group relative col-span-1 overflow-hidden rounded-2xl shadow-card sm:row-span-2 lg:h-full"
        >
          <img
            src={imgUrl(main)}
            alt={imgLabel(main) || title}
            className="h-72 w-full object-cover transition-transform duration-700 group-hover:scale-105 sm:h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/55 via-transparent to-transparent" />
          {imgLabel(main) && (
            <span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-charcoal backdrop-blur">
              {imgLabel(main)}
            </span>
          )}
          <span className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-medium text-charcoal opacity-0 backdrop-blur transition group-hover:opacity-100">
            <Expand className="h-4 w-4" /> View
          </span>
        </button>

        {/* Thumbnails */}
        <div className="grid grid-cols-2 gap-3">
          {thumbs.map((src, i) => {
            const isLast = i === thumbs.length - 1;
            return (
              <button
                key={i}
                onClick={() => open(i + 1)}
                className="group relative overflow-hidden rounded-2xl shadow-card"
              >
                <img
                  src={imgUrl(src)}
                  alt={imgLabel(src) || `${title} ${i + 2}`}
                  className="h-40 w-full object-cover transition-transform duration-700 group-hover:scale-105 lg:h-[254px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/45 via-transparent to-transparent" />
                {imgLabel(src) && !(isLast && images.length > 5) && (
                  <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-charcoal backdrop-blur">
                    {imgLabel(src)}
                  </span>
                )}
                {isLast && images.length > 5 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-charcoal/55 text-white backdrop-blur-sm">
                    <Images className="h-6 w-6" />
                    <span className="text-sm font-semibold">
                      +{images.length - 5} Photos
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm text-charcoal/50">
          1 / {images.length} photos
        </span>
        <button
          onClick={() => open(0)}
          className="flex items-center gap-2 rounded-full bg-charcoal px-4 py-2 text-sm font-medium text-white transition hover:bg-gold"
        >
          <Images className="h-4 w-4" />
          View All Photos
        </button>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-charcoal/95 p-4">
          <button
            onClick={() => setLightbox(false)}
            className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-gold"
            aria-label="Close gallery"
          >
            <X className="h-5 w-5" />
          </button>

          <button
            onClick={prev}
            className="absolute left-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-gold sm:left-8"
            aria-label="Previous"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <figure className="max-h-[85vh] max-w-5xl">
            <img
              src={imgUrl(images[index])}
              alt={imgLabel(images[index]) || `${title} ${index + 1}`}
              className="max-h-[85vh] w-full rounded-xl object-contain"
            />
            <figcaption className="mt-4 text-center text-sm text-white/70">
              {imgLabel(images[index]) && (
                <span className="mr-2 font-semibold text-gold">
                  {imgLabel(images[index])}
                </span>
              )}
              {index + 1} / {images.length}
            </figcaption>
          </figure>

          <button
            onClick={next}
            className="absolute right-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-gold sm:right-8"
            aria-label="Next"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      )}
    </>
  );
}
