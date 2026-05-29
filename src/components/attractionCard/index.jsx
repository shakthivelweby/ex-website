import Image from "next/image";
import Link from "next/link";

/** Image top → title-first text below */
export function ListingCard({
  href,
  title,
  image,
  location,
  metaLabel = "Attraction",
  metaIcon = "fi fi-rr-clock",
  price,
  rating,
  typeBadge,
  popular,
  recommended,
  ctaLabel = "Book Now",
}) {
  const formatPrice = (value) => {
    if (!value || Number(value) === 0) return null;
    return `₹${Number(value).toLocaleString("en-IN")}`;
  };

  const priceText = formatPrice(price);

  return (
    <Link href={href} className="block group h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-2xl bg-white border border-gray-100/80 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary-200/80 hover:shadow-lg hover:shadow-primary-500/10">
        {/* Full-width image */}
        <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-gray-100">
          {image ? (
            <Image
              src={image}
              alt={title || "Experience"}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-800" />
          )}

          <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-2.5">
            <div className="flex flex-wrap gap-1">
              {popular && (
                <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                  Hot
                </span>
              )}
              {recommended && (
                <span className="rounded-full bg-primary-500 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                  Pick
                </span>
              )}
            </div>
            {Number(rating) > 0 && (
              <span className="rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-bold text-gray-900 shadow-sm">
                ★ {Number(rating).toFixed(1)}
              </span>
            )}
          </div>

          {typeBadge && (
            <span className="absolute bottom-2.5 left-2.5 rounded-full border border-white/25 bg-black/40 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
              {typeBadge}
            </span>
          )}
        </div>

        {/* Gradient divider */}
        <div className="h-0.5 w-full shrink-0 bg-gradient-to-r from-primary-600 via-primary-400 to-primary-300" />

        {/* Text — title on top */}
        <div className="flex flex-1 flex-col px-3 py-2.5 sm:px-3.5 sm:py-3">
          <h3 className="mb-1 line-clamp-2 text-[15px] font-bold leading-snug tracking-tight text-gray-900 transition-colors group-hover:text-primary-700">
            {title || "Untitled"}
          </h3>

          <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1 capitalize">
              <i className="fi fi-rr-marker text-[10px] text-primary-500" />
              {location || "Location TBA"}
            </span>
            <span className="text-gray-300">·</span>
            <span className="inline-flex items-center gap-1 font-medium text-primary-600">
              <i className={`${metaIcon} text-[10px]`} />
              {metaLabel}
            </span>
          </div>

          <div className="mt-auto flex items-center justify-between gap-2 pt-2">
            {priceText ? (
              <p className="text-sm font-bold text-gray-900">
                {priceText}
                <span className="ml-1 text-xs font-normal text-gray-400">onwards</span>
              </p>
            ) : (
              <p className="text-sm font-medium text-gray-400">Price TBA</p>
            )}

            <span className="inline-flex shrink-0 items-center gap-0.5 text-xs font-semibold text-primary-600 transition-colors group-hover:text-primary-700">
              {ctaLabel}
              <i className="fi fi-rr-arrow-right text-[10px] transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

const AttractionCard = ({ attraction }) => {
  const {
    title,
    location,
    type,
    image,
    price,
    duration,
    popular,
    recommended,
    rating,
  } = attraction;

  const metaLabel =
    duration && duration !== "updating"
      ? duration
      : type || "Attraction";

  const metaIcon =
    duration && duration !== "updating" ? "fi fi-rr-clock" : "fi fi-rr-ferris-wheel";

  return (
    <ListingCard
      href={`/attractions/${attraction.id}`}
      title={title}
      image={image}
      location={location}
      metaLabel={metaLabel}
      metaIcon={metaIcon}
      price={price}
      rating={rating}
      popular={popular}
      recommended={recommended}
    />
  );
};

export default AttractionCard;
