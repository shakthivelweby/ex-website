import Image from "next/image";
import Link from "next/link";

const formatDate = (dateString) => {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return null;
    return {
      day: date.toLocaleDateString("en-GB", { day: "2-digit" }),
      month: date.toLocaleDateString("en-GB", { month: "short" }).toUpperCase(),
      year: date.toLocaleDateString("en-GB", { year: "numeric" }),
      full: date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    };
  } catch {
    return null;
  }
};

const formatVenue = (venue) => {
  const value = String(venue || "").trim();
  if (!value) return null;
  const parts = value.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length <= 2) return value;
  return `${parts[0]}, ${parts[parts.length - 1]}`;
};

const formatDateRangeChip = (dateRange, multiDay) => {
  if (!dateRange || !multiDay) return null;
  if (String(dateRange).includes(" to ")) {
    const [start, end] = dateRange.split(" to ");
    const startLabel = formatDate(start)?.full;
    const endLabel = formatDate(end)?.full;
    if (startLabel && endLabel) return `${startLabel} – ${endLabel}`;
  }
  return dateRange;
};

const EventCard = ({ event }) => {
  const {
    title,
    date,
    dateRange,
    venue,
    type,
    image,
    price,
    popular,
    recommended,
    totalShows,
    availableSlots,
    interest_count,
    kidsFriendly,
    petsFriendly,
    multiDay,
    id,
  } = event || {};

  const dateParts = formatDate(date);
  const venueLabel = formatVenue(venue);
  const hasPrice = price && Number(price) > 0;
  const rangeLabel = formatDateRangeChip(dateRange, multiDay);

  const highlights = [
    popular ? { icon: "fi fi-rr-flame", label: "Popular" } : null,
    recommended ? { icon: "fi fi-rr-badge-check", label: "Top pick" } : null,
    interest_count > 0 ? { icon: "fi fi-rr-heart", label: `${interest_count} booked` } : null,
  ].filter(Boolean);

  const metaChips = [
    rangeLabel ? { icon: "fi fi-rr-calendar", label: rangeLabel, tone: "violet" } : null,
    totalShows > 0
      ? { icon: "fi fi-rr-presentation", label: `${totalShows} show${totalShows === 1 ? "" : "s"}`, tone: "violet" }
      : null,
    availableSlots > 0
      ? {
          icon: "fi fi-rr-ticket",
          label: `${availableSlots} slot${availableSlots === 1 ? "" : "s"}`,
          tone: "violet",
        }
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
    if (tone === "green") return "bg-emerald-50 text-emerald-700 ring-emerald-100";
    if (tone === "violet") return "bg-violet-50 text-violet-900 ring-violet-100";
    return "bg-gray-50 text-gray-500 ring-gray-100";
  };

  return (
    <Link href={`/events/${id}`} className="block h-full group">
      <article className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-100 hover:shadow-lg">
        <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-gray-900">
          {image ? (
            <Image
              src={image}
              alt={title || "Event"}
              fill
              className="object-cover opacity-95 transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 34vw"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-violet-900 to-gray-900">
              <i className="fi fi-rr-ticket text-3xl text-violet-300" aria-hidden />
              <span className="text-[11px] font-medium text-violet-200">No image</span>
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-black/25" />

          {dateParts ? (
            <div className="absolute left-3 top-3 z-10 flex w-11 flex-col overflow-hidden rounded-lg bg-white text-center shadow-md">
              <span className="bg-violet-600 px-1 py-0.5 text-[8px] font-bold tracking-wide text-white">
                {dateParts.month}
              </span>
              <span className="py-0.5 text-base font-bold leading-none text-gray-900">{dateParts.day}</span>
              <span className="pb-0.5 text-[8px] font-medium text-gray-500">{dateParts.year}</span>
            </div>
          ) : null}

          {type ? (
            <span className="absolute right-3 top-3 z-10 max-w-[calc(100%-3.5rem)] truncate rounded-lg bg-violet-600/90 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
              {type}
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col gap-2 p-3.5">
          <div className="space-y-1">
            <h3 className="line-clamp-1 text-[15px] font-semibold leading-snug text-gray-900 transition-colors group-hover:text-violet-700">
              {title || "Event"}
            </h3>

            {highlights.length > 0 ? (
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                {highlights.map((item) => (
                  <span
                    key={item.label}
                    className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-600"
                  >
                    <i className={`${item.icon} text-[9px] text-violet-500`} aria-hidden />
                    {item.label}
                  </span>
                ))}
              </div>
            ) : dateParts ? (
              <p className="text-[11px] font-medium text-violet-600">{dateParts.full}</p>
            ) : (
              <p className="text-[11px] font-medium text-gray-400">Date TBA</p>
            )}
          </div>

          {venueLabel ? (
            <p className="flex items-center gap-1.5 text-xs text-gray-600">
              <i className="fi fi-rr-marker shrink-0 text-violet-500 text-[11px]" aria-hidden />
              <span className="line-clamp-1">{venueLabel}</span>
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

          <div className="mt-auto flex items-center justify-between gap-3 border-t border-gray-100 pt-2.5">
            <div>
              {hasPrice ? (
                <div className="inline-flex items-baseline gap-1 rounded-md border border-gray-100 bg-gray-50 px-2 py-1">
                  <span className="text-sm font-bold text-gray-900">₹{price}</span>
                  <span className="text-[10px] text-gray-500">onwards</span>
                </div>
              ) : (
                <span className="text-xs font-medium text-gray-500">Price TBA</span>
              )}
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-violet-600 transition-colors group-hover:text-violet-700">
              Tickets
              <i className="fi fi-rr-arrow-right text-[10px] transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default EventCard;
