"use client";

import { useState } from "react";
import Image from "next/image";
import { hasStoredImage } from "@/utils/imageUrl";

export default function ResolvableCoverImage({
  src,
  filename,
  alt = "",
  sizes,
  className = "object-cover transition-transform duration-700 group-hover:scale-110",
}) {
  const [errored, setErrored] = useState(false);
  const showImage = hasStoredImage(filename) && src && String(src).trim() && !errored;

  if (!showImage) {
    return (
      <div
        className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500"
        aria-hidden
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-sm">
          <i className="fi fi-rr-picture text-3xl text-white/90" />
        </div>
        <span className="mt-3 text-xs font-medium uppercase tracking-wide text-white/80">
          No image
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={className}
      sizes={sizes}
      onError={() => setErrored(true)}
    />
  );
}
