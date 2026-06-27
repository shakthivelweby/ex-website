import Image from "next/image";
import Link from "next/link";

const formatLocation = (location, city) => {
  const loc = String(location || "").trim();
  const cityName = String(city || "").trim();
  if (loc && cityName && !loc.toLowerCase().includes(cityName.toLowerCase())) {
    return `${cityName} · ${loc}`;
  }
  return loc || cityName || null;
};

const stripHtml = (value) =>
  String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const ActivityCard = ({ activity }) => {
  const {
    title,
    image,
    price,
    rating,
    reviewCount,
    popular,
    recommended,
    location,
    city,
    type,
    duration,
    description,
    bestTimeToVisit,
    openingHours,
    features,
    interest_count,
    id,
  } = activity || {};

  const locationLabel = formatLocation(location, city);
  const descriptionText = stripHtml(description);
  const hasPrice = price && Number(price) > 0;
  const hasValidStartTime = duration && duration !== "updating";

  const detailChips = [
    hasValidStartTime ? { icon: "fi fi-rr-clock", label: `Starts ${duration}` } : null,
    openingHours ? { icon: "fi fi-rr-time-check", label: openingHours } : null,
    bestTimeToVisit ? { icon: "fi fi-rr-sun", label: `Best: ${bestTimeToVisit}` } : null,
  ].filter(Boolean);

  const featureChips = (Array.isArray(features) ? features : [])
    .map((item) => (typeof item === "string" ? item : item?.name || item?.title || ""))
    .filter(Boolean)
    .slice(0, 2);

  return (
    <Link href={`/activities/${id}`} className="block h-full group">
      <article className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-100 hover:shadow-lg">
        <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-gray-100">
          {image ? (
            <Image
              src={image}
              alt={title || "Activity"}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 34vw"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary-50 to-gray-100">
              <i className="fi fi-rr-hiking text-3xl text-primary-400" aria-hidden />
              <span className="text-[11px] font-medium text-gray-400">No image</span>
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />

          {type ? (
            <span className="absolute left-3 top-3 z-10 rounded-lg bg-primary-600/90 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
              {type}
            </span>
          ) : null}

          {(popular || recommended) && (
            <span className="absolute right-3 top-3 z-10 rounded-lg bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-600 shadow-sm">
              {popular ? "Popular" : "Top pick"}
            </span>
          )}

          {rating > 0 ? (
            <span className="absolute bottom-3 left-3 z-10 inline-flex items-center gap-1 rounded-lg bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
              <i className="fi fi-sr-star text-[10px] text-amber-300" aria-hidden />
              {Number(rating).toFixed(1)}
              {reviewCount > 0 ? (
                <span className="font-normal text-white/80">({reviewCount})</span>
              ) : null}
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col gap-2.5 p-3.5">
          <div className="space-y-1">
            <h3 className="line-clamp-1 text-[15px] font-semibold leading-snug text-gray-900 transition-colors group-hover:text-primary-700">
              {title || "Activity"}
            </h3>
            {descriptionText ? (
              <p className="line-clamp-2 text-xs leading-relaxed text-gray-500">{descriptionText}</p>
            ) : null}
          </div>

          {locationLabel ? (
            <p className="flex items-center gap-1.5 text-xs text-gray-600">
              <i className="fi fi-rr-marker shrink-0 text-primary-500 text-[11px]" aria-hidden />
              <span className="line-clamp-1">{locationLabel}</span>
            </p>
          ) : null}

          {detailChips.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {detailChips.map((chip) => (
                <span
                  key={chip.label}
                  className="inline-flex max-w-full items-center gap-1 rounded-md bg-gray-50 px-2 py-1 text-[10px] font-medium text-gray-700 ring-1 ring-gray-100"
                >
                  <i className={`${chip.icon} shrink-0 text-[9px] text-gray-400`} aria-hidden />
                  <span className="truncate">{chip.label}</span>
                </span>
              ))}
            </div>
          ) : null}

          {featureChips.length > 0 || interest_count > 0 ? (
            <div className="flex flex-wrap items-center gap-1.5">
              {featureChips.map((feature) => (
                <span
                  key={feature}
                  className="inline-flex items-center rounded-md bg-primary-50 px-2 py-0.5 text-[10px] font-medium text-primary-700"
                >
                  {feature}
                </span>
              ))}
              {interest_count > 0 ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-500">
                  <i className="fi fi-rr-users text-[9px]" aria-hidden />
                  {interest_count} interested
                </span>
              ) : null}
            </div>
          ) : null}

          <div className="mt-auto flex items-center justify-between gap-3 border-t border-gray-100 pt-2.5">
            <div>
              {hasPrice ? (
                <div className="inline-flex items-baseline gap-1 rounded-md border border-gray-100 bg-gray-50 px-2 py-1">
                  <span className="text-sm font-bold text-gray-900">₹{price}</span>
                  <span className="text-[10px] text-gray-500">onwards</span>
                </div>
              ) : (
                <span className="text-xs font-medium text-gray-500">Price on request</span>
              )}
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary-600 transition-colors group-hover:text-primary-700">
              Book
              <i className="fi fi-rr-arrow-right text-[10px] transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default ActivityCard;
