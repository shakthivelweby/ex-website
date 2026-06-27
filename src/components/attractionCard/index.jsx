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


const AttractionCard = ({ attraction }) => {
  const {
    title,
    location,
    city,
    type,
    image,
    price,
    rating,
    reviewCount,
    bestTimeToVisit,
    openingHours,
    features,
    kidsFriendly,
    petsFriendly,
    popular,
    recommended,
    interest_count,
    id,
  } = attraction || {};

  const locationLabel = formatLocation(location, city);
  const hasPrice = price && Number(price) > 0;

  const featureChips = (Array.isArray(features) ? features : [])
    .map((item) => (typeof item === "string" ? item : item?.name || item?.title || ""))
    .filter(Boolean)
    .slice(0, 3);

  const highlights = [
    rating > 0
      ? {
          icon: "fi fi-sr-star",
          label: `${Number(rating).toFixed(1)}${reviewCount > 0 ? ` (${reviewCount} reviews)` : ""}`,
        }
      : null,
    popular ? { icon: "fi fi-rr-flame", label: "Popular" } : null,
    recommended ? { icon: "fi fi-rr-badge-check", label: "Recommended" } : null,
    interest_count > 0 ? { icon: "fi fi-rr-heart", label: `${interest_count} interested` } : null,
  ].filter(Boolean);

  const metaChips = [
    openingHours
      ? { icon: "fi fi-rr-time-check", label: openingHours, tone: "amber" }
      : null,
    bestTimeToVisit
      ? { icon: "fi fi-rr-sun", label: `Best: ${bestTimeToVisit}`, tone: "amber" }
      : null,
    {
      icon: "fi fi-rr-child",
      label: kidsFriendly ? "Kids friendly" : "No kids",
      tone: kidsFriendly ? "green" : "muted",
    },
    {
      icon: "fi fi-rr-paw",
      label: petsFriendly ? "Pet friendly" : "No pets",
      tone: petsFriendly ? "green" : "muted",
    },
  ].filter(Boolean);

  const chipClass = (tone) => {
    if (tone === "green") {
      return "bg-emerald-50 text-emerald-700 ring-emerald-100";
    }
    if (tone === "amber") {
      return "bg-amber-50 text-amber-900 ring-amber-100";
    }
    return "bg-gray-50 text-gray-500 ring-gray-100";
  };

  return (
    <Link href={`/attractions/${id}`} className="block h-full group">
      <article className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-100 hover:shadow-lg">
        <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-gray-100">
          {image ? (
            <Image
              src={image}
              alt={title || "Attraction"}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 34vw"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-amber-50 to-gray-100">
              <i className="fi fi-rr-landmark text-3xl text-amber-500" aria-hidden />
              <span className="text-[11px] font-medium text-gray-400">No image</span>
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />

          {type ? (
            <span className="absolute left-3 top-3 z-10 max-w-[calc(100%-1.5rem)] truncate rounded-lg bg-amber-600/90 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
              {type}
            </span>
          ) : null}

          {(popular || recommended) && (
            <span className="absolute right-3 top-3 z-10 rounded-lg bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-600 shadow-sm">
              Must see
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2 p-3.5">
          <div className="space-y-1">
            <h3 className="line-clamp-1 text-[15px] font-semibold leading-snug text-gray-900 transition-colors group-hover:text-amber-700">
              {title || "Attraction"}
            </h3>

            {highlights.length > 0 ? (
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                {highlights.map((item) => (
                  <span
                    key={item.label}
                    className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-600"
                  >
                    <i className={`${item.icon} text-[9px] text-amber-500`} aria-hidden />
                    {item.label}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          {locationLabel ? (
            <p className="flex items-center gap-1.5 text-xs text-gray-600">
              <i className="fi fi-rr-marker shrink-0 text-amber-600 text-[11px]" aria-hidden />
              <span className="line-clamp-1">{locationLabel}</span>
            </p>
          ) : null}

          <div className="flex flex-wrap gap-1">
            {metaChips.map((chip) => (
              <span
                key={chip.label}
                className={`inline-flex max-w-full items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium leading-tight ring-1 ${chipClass(chip.tone)}`}
              >
                <i className={`${chip.icon} shrink-0 text-[9px]`} aria-hidden />
                <span className="truncate">{chip.label}</span>
              </span>
            ))}
          </div>

          {featureChips.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {featureChips.map((feature) => (
                <span
                  key={feature}
                  className="inline-flex items-center rounded-md bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-700 ring-1 ring-gray-100"
                >
                  {feature}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-auto flex items-center justify-between gap-3 border-t border-gray-100 pt-2.5">
            <div>
              {!hasPrice ? (
                <span className="inline-flex rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                  Free entry
                </span>
              ) : (
                <div className="inline-flex items-baseline gap-1 rounded-md border border-gray-100 bg-gray-50 px-2 py-1">
                  <span className="text-sm font-bold text-gray-900">₹{price}</span>
                  <span className="text-[10px] text-gray-500">onwards</span>
                </div>
              )}
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-amber-700 transition-colors group-hover:text-amber-800">
              Explore
              <i className="fi fi-rr-arrow-right text-[10px] transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default AttractionCard;
