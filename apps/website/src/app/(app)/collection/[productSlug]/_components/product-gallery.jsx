"use client";

import { ChevronLeft, ChevronRight, Package } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Navigation, Thumbs } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";

export function ProductGallery({ product }) {
  const [thumbs, setThumbs] = useState(null);

  const images = product.images?.length > 0 ? product.images : product.image ? [product.image] : [];

  if (!images.length) {
    return (
      <div className="bg-muted/30 border-border flex aspect-square w-full items-center justify-center rounded-2xl border">
        <Package className="text-muted-foreground/30 size-20" />
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 space-y-3">
      {/* Main image */}
      <div className="bg-muted/20 border-border relative aspect-square w-full min-w-0 overflow-hidden rounded-2xl border">
        <Swiper
          modules={[Navigation, Thumbs]}
          thumbs={{
            swiper: thumbs && !thumbs.destroyed ? thumbs : null,
          }}
          navigation={
            images.length > 1
              ? {
                  prevEl: ".gallery-prev",
                  nextEl: ".gallery-next",
                }
              : false
          }
          className="h-full w-full min-w-0"
        >
          {images.map((src, i) => (
            <SwiperSlide key={src + i} className="h-full w-full">
              <div className="relative h-full w-full p-6 sm:p-10">
                <Image
                  src={src}
                  alt={`${product.name} - ${i + 1}`}
                  fill
                  unoptimized
                  priority={i === 0}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              className="gallery-prev bg-background/80 hover:bg-background absolute top-1/2 left-3 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border shadow-sm backdrop-blur"
            >
              <ChevronLeft className="size-4" />
            </button>

            <button
              type="button"
              aria-label="Next image"
              className="gallery-next bg-background/80 hover:bg-background absolute top-1/2 right-3 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border shadow-sm backdrop-blur"
            >
              <ChevronRight className="size-4" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <Swiper
          modules={[Thumbs]}
          onSwiper={setThumbs}
          watchSlidesProgress
          slidesPerView="auto"
          spaceBetween={8}
          className="w-full min-w-0"
        >
          {images.map((src, i) => (
            <SwiperSlide key={src + i} className="!h-16 !w-16">
              <div className="border-border hover:border-primary relative size-full cursor-pointer overflow-hidden rounded-lg border p-1 transition">
                <Image src={src} alt="" fill unoptimized sizes="64px" className="object-contain" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
}
