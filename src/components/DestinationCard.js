"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ResolvableCoverImage from "@/components/common/ResolvableCoverImage";
import { pickImageSource } from "@/utils/imageUrl";

function isExternalImageUrl(url) {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  return (
    trimmed.startsWith("http") && !trimmed.includes("/images/destination/")
  );
}

const DestinationCard = ({ destination, className = "" }) => {
  const {
    name,
    image,
    cover_image,
    cover_image_url,
    coverImage,
    coverImageUrl,
    thumb_image,
    thumb_image_url,
    thumbImage,
    thumbImageUrl,
    description = "Discover amazing tour packages",
  } = destination;

  const [legacyImageFailed, setLegacyImageFailed] = useState(false);

  const storedImage = useMemo(
    () =>
      pickImageSource([
        {
          url: cover_image_url || coverImageUrl,
          filename: cover_image || coverImage,
        },
        {
          url: thumb_image_url || thumbImageUrl,
          filename: thumb_image || thumbImage,
        },
      ]),
    [
      cover_image,
      cover_image_url,
      coverImage,
      coverImageUrl,
      thumb_image,
      thumb_image_url,
      thumbImage,
      thumbImageUrl,
    ]
  );

  const legacyImage =
    !storedImage && isExternalImageUrl(image) && !legacyImageFailed
      ? image.trim()
      : null;

  return (
    <Link
      href={
        destination.href ||
        `/packages/${name.toLowerCase().replace(/\s+/g, "-")}`
      }
    >
      <div
        className={`relative w-full overflow-hidden group cursor-pointer bg-gray-900 rounded-xl ${
          className || "h-[500px]"
        }`}
      >
        <div className="absolute inset-0">
          {storedImage || !legacyImage ? (
            <ResolvableCoverImage
              src={storedImage?.url}
              filename={storedImage?.filename}
              alt={name}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-90"
            />
          ) : (
            <Image
              src={legacyImage}
              alt={name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-90"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={() => setLegacyImageFailed(true)}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-all duration-500" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-5 z-20">
          <h3 className="text-xl md:text-2xl font-semibold text-white leading-tight">
            {name}
          </h3>
          <p className="text-white/85 text-sm mt-1 line-clamp-1">{description}</p>
        </div>
      </div>
    </Link>
  );
};

export default DestinationCard;
