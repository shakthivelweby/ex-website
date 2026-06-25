"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { hasStoredImage } from "@/utils/imageUrl";

export default function ChipThumbImage({
  src,
  filename,
  alt = "",
  iconClass = "fi fi-rr-map-marker text-[10px]",
  className = "w-6 h-6 rounded-full overflow-hidden relative flex-shrink-0",
  sizes = "24px",
}) {
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    setErrored(false);
  }, [src, filename]);

  const hasValidSrc =
    src &&
    String(src).trim() &&
    !String(src).endsWith("/event-category-master") &&
    !String(src).endsWith("/event-category-master/");

  const showImage =
    (hasStoredImage(filename) || (!filename && hasValidSrc)) &&
    hasValidSrc &&
    !errored;

  if (!showImage) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300`}
        title="No image"
        aria-hidden={!alt}
      >
        <i className={`${iconClass} text-gray-500`} />
      </div>
    );
  }

  return (
    <div className={className}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes={sizes}
        onError={() => setErrored(true)}
      />
    </div>
  );
}
