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
    packageCount,
    description = "Discover amazing tour packages",
    trending = false,
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
        className={`relative w-full rounded-[32px] overflow-hidden group cursor-pointer bg-gray-900 ${
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

        <div className="absolute top-6 left-6 right-6 z-10 flex justify-between items-start">
          {trending ? (
            <span className="bg-red-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg border border-red-500/20">
              Trending
            </span>
          ) : (
            <div />
          )}

          <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg group-hover:bg-white/20 transition-colors">
            <i className="fi fi-rr-umbrella-beach text-white"></i>
            {packageCount || 0} Packages
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
          <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-1 leading-tight drop-shadow-sm group-hover:text-primary-100 transition-colors">
              {name}
            </h3>

            <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-out">
              <div className="overflow-hidden">
                <div className="pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100 flex flex-col gap-4">
                  <p className="text-white/80 text-sm font-light leading-relaxed line-clamp-2">
                    {description}
                  </p>

                  <div className="flex items-center gap-2 text-primary-300 text-sm font-medium group/btn w-fit">
                    Explore Packages
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center group-hover/btn:bg-primary-500 group-hover/btn:text-white transition-all duration-300">
                      <i className="fi fi-rr-arrow-right text-[10px]"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-12 h-1 bg-primary-500 mt-4 rounded-full group-hover:w-0 group-hover:opacity-0 transition-all duration-500 origin-left delay-100"></div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default DestinationCard;
