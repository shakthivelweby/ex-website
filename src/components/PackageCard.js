import Image from "next/image";
import Link from "next/link";

const slotConfig = {
  sold: { tone: "muted", icon: "fi fi-rr-cross-circle", label: "Sold out" },
  critical: { tone: "red", icon: "fi fi-rr-flame", label: (n) => `${n} seats left` },
  limited: { tone: "amber", icon: "fi fi-rr-time-quarter-past", label: (n) => `${n} seats left` },
  available: { tone: "green", icon: "fi fi-rr-check", label: "Seats available" },
};

function getSlotStatus(slotsAvailable) {
  if (slotsAvailable == null) return null;
  if (slotsAvailable <= 0) return slotConfig.sold;
  if (slotsAvailable < 10) {
    return { ...slotConfig.critical, label: slotConfig.critical.label(slotsAvailable) };
  }
  if (slotsAvailable < 30) {
    return { ...slotConfig.limited, label: slotConfig.limited.label(slotsAvailable) };
  }
  return { ...slotConfig.available, label: slotConfig.available.label };
}

function formatDuration(totalDays, totalNights, fallback = "") {
  const days = Number(totalDays);
  const nights = Number(totalNights);
  if (Number.isFinite(days) && days > 0 && Number.isFinite(nights) && nights >= 0) {
    const dayLabel = `${days} day${days === 1 ? "" : "s"}`;
    const nightLabel = `${nights} night${nights === 1 ? "" : "s"}`;
    return `${dayLabel} · ${nightLabel}`;
  }
  return fallback || "";
}

function formatGroupSize(minMembers, maxMembers) {
  const min = Number(minMembers);
  const max = Number(maxMembers);
  if (Number.isFinite(min) && min > 0 && Number.isFinite(max) && max > 0) {
    return min === max ? `${min} travellers` : `${min}–${max} travellers`;
  }
  if (Number.isFinite(min) && min > 0) return `Min ${min} travellers`;
  if (Number.isFinite(max) && max > 0) return `Up to ${max} travellers`;
  return null;
}

function tourTypeMeta(tourType) {
  const value = String(tourType || "").trim().toLowerCase();
  if (value === "fixed_departure" || value === "scheduled") {
    return { label: "Scheduled", icon: "fi fi-rr-calendar", tone: "sky" };
  }
  if (value === "private" || value === "private_tour") {
    return { label: "Private", icon: "fi fi-rr-user", tone: "primary" };
  }
  return null;
}

function normalizePackage(input = {}) {
  const totalDays = input.totalDays ?? input.total_days;
  const totalNights = input.totalNights ?? input.total_nights;

  if (input.id || input.packageId || input.title || input.name) {
    return {
      id: input.id || input.packageId,
      title: input.title || input.name || "Package",
      image: input.image || input.imageSrc || input.images?.[0]?.image_url || "",
      imageAlt: input.imageAlt || input.title || input.name || "Package",
      duration:
        input.duration || formatDuration(totalDays, totalNights),
      totalDays,
      totalNights,
      price: Number(input.price ?? input.final_adult_price ?? 0),
      childPrice: Number(input.childPrice ?? input.final_child_price ?? 0),
      startingFrom: input.startingFrom || input.starting_location || "",
      pickupPoint: input.pickupPoint || input.pickup_point || "",
      tourType: input.tourType || input.tour_type || "",
      minMembers: input.minMembers ?? input.minimum_members,
      maxMembers: input.maxMembers ?? input.maximum_members,
      slotsAvailable:
        input.slotsAvailable !== undefined ? input.slotsAvailable : input.available_slot,
      isCertified: Boolean(input.isCertified ?? input.is_certified),
      popular: Boolean(input.popular),
      recommended: Boolean(input.recommended),
      date: input.date || "",
    };
  }

  return {
    id: input.packageId,
    title: input.title || "Package",
    image: input.imageSrc || "",
    imageAlt: input.imageAlt || input.title || "Package",
    duration: input.duration || "",
    totalDays: null,
    totalNights: null,
    price: Number(input.price || 0),
    childPrice: 0,
    startingFrom: input.startingFrom || "",
    pickupPoint: "",
    tourType: input.tourType || "",
    minMembers: null,
    maxMembers: null,
    slotsAvailable: input.slotsAvailable,
    isCertified: Boolean(input.isCertified),
    popular: false,
    recommended: false,
    date: input.date || "",
  };
}

const chipClass = (tone) => {
  if (tone === "green") return "bg-emerald-50 text-emerald-700 ring-emerald-100";
  if (tone === "amber") return "bg-amber-50 text-amber-900 ring-amber-100";
  if (tone === "red") return "bg-red-50 text-red-700 ring-red-100";
  if (tone === "sky") return "bg-sky-50 text-sky-800 ring-sky-100";
  if (tone === "primary") return "bg-primary-50 text-primary-800 ring-primary-100";
  return "bg-gray-50 text-gray-600 ring-gray-100";
};

function MetaChip({ icon, label, tone = "muted" }) {
  if (!label) return null;
  return (
    <span
      className={`inline-flex max-w-full items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium leading-tight ring-1 ${chipClass(tone)}`}
    >
      <i className={`${icon} shrink-0 text-[9px]`} aria-hidden />
      <span className="truncate">{label}</span>
    </span>
  );
}

const PackageCard = (props) => {
  const pkg = normalizePackage(props.package ? props.package : props);
  const slotStatus = getSlotStatus(pkg.slotsAvailable);
  const hasPrice = Number.isFinite(pkg.price) && pkg.price > 0;
  const tourMeta = tourTypeMeta(pkg.tourType);
  const groupSize = formatGroupSize(pkg.minMembers, pkg.maxMembers);
  const href = `/package/${pkg.id}${pkg.date ? `?date=${pkg.date}` : ""}`;

  const showPickup =
    pkg.pickupPoint &&
    pkg.pickupPoint.trim().toLowerCase() !== pkg.startingFrom?.trim().toLowerCase();

  const metaChips = [
    tourMeta ? { icon: tourMeta.icon, label: tourMeta.label, tone: tourMeta.tone } : null,
    pkg.duration ? { icon: "fi fi-rr-calendar-clock", label: pkg.duration, tone: "muted" } : null,
    groupSize ? { icon: "fi fi-rr-users", label: groupSize, tone: "muted" } : null,
    slotStatus
      ? { icon: slotStatus.icon, label: slotStatus.label, tone: slotStatus.tone }
      : null,
  ].filter(Boolean);

  return (
    <Link href={href} className="block h-full group">
      <article className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-100 hover:shadow-lg">
        <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-gray-100">
          {pkg.image ? (
            <Image
              src={pkg.image}
              alt={pkg.imageAlt}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 34vw"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary-50 to-gray-100">
              <i className="fi fi-rr-umbrella-beach text-3xl text-primary-500" aria-hidden />
              <span className="text-[11px] font-medium text-gray-400">No image</span>
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

          {pkg.duration ? (
            <span className="absolute left-3 top-3 z-10 rounded-lg bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-gray-900 shadow-sm">
              {pkg.totalDays && pkg.totalNights != null
                ? `${pkg.totalDays}D ${pkg.totalNights}N`
                : pkg.duration}
            </span>
          ) : null}

          <div className="absolute right-3 top-3 z-10 flex flex-col items-end gap-1.5">
            {tourMeta ? (
              <span className="rounded-lg bg-primary-600/90 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                {tourMeta.label}
              </span>
            ) : null}
            {pkg.popular || pkg.recommended ? (
              <span className="rounded-lg bg-amber-500/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
                {pkg.popular ? "Popular" : "Top pick"}
              </span>
            ) : null}
          </div>

          {pkg.isCertified ? (
            <span className="absolute bottom-3 left-3 z-10 inline-flex items-center gap-1 rounded-lg bg-white/95 px-2 py-1 text-[10px] font-semibold text-emerald-700 shadow-sm">
              <i className="fi fi-rr-shield-check text-[10px]" aria-hidden />
              Explore World Assured
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col gap-2.5 p-4">
          <div className="space-y-1.5">
            <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-gray-900 transition-colors group-hover:text-primary-700">
              {pkg.title}
            </h3>

            {metaChips.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {metaChips.map((chip) => (
                  <MetaChip key={chip.label} {...chip} />
                ))}
              </div>
            ) : null}
          </div>

          <div className="space-y-1.5 text-xs text-gray-600">
            {pkg.startingFrom ? (
              <p className="flex items-start gap-1.5">
                <i className="fi fi-rr-marker mt-0.5 shrink-0 text-primary-600 text-[11px]" aria-hidden />
                <span className="line-clamp-2">
                  <span className="font-medium text-gray-700">Starts </span>
                  {pkg.startingFrom}
                </span>
              </p>
            ) : null}

            {showPickup ? (
              <p className="flex items-start gap-1.5">
                <i className="fi fi-rr-bus mt-0.5 shrink-0 text-gray-400 text-[11px]" aria-hidden />
                <span className="line-clamp-2">
                  <span className="font-medium text-gray-700">Pickup </span>
                  {pkg.pickupPoint}
                </span>
              </p>
            ) : null}
          </div>

          <div className="mt-auto flex items-center justify-between gap-3 border-t border-gray-100 pt-3">
            {hasPrice ? (
              <div className="inline-flex min-w-0 items-baseline gap-1.5 rounded-lg border border-gray-100 bg-gray-50 px-2.5 py-1.5">
                <span className="text-[10px] font-medium uppercase tracking-wide text-gray-500">
                  From
                </span>
                <span className="text-base font-bold text-gray-900">
                  ₹{pkg.price.toLocaleString()}
                </span>
                <span className="text-[10px] text-gray-500">/ person</span>
              </div>
            ) : (
              <span className="text-xs font-medium text-gray-500">Price on request</span>
            )}

            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gray-900 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors group-hover:bg-primary-600">
              View package
              <i className="fi fi-rr-arrow-right text-[10px] transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default PackageCard;
