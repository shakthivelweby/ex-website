import Image from "next/image";
import Link from "next/link";
import { rentalDisplayRate } from "@/app/rentals/rentalPricingCalc";
import { isVehicleRental } from "@/app/rentals/rentalFilterUtils";
import { formTypeIcon, formTypeLabel } from "@/app/rentals/rentalCategoryTypeUtils";

const haversineKm = (lat1, lon1, lat2, lon2) => {
  const toRad = (d) => (Number(d) * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
};

const formatSeats = (seats) => {
  const value = String(seats || "").trim();
  if (!value) return null;
  if (/seater/i.test(value)) return value;
  return `${value} seater`;
};

const formatLocation = (location) => {
  const value = String(location || "").trim();
  if (!value) return null;
  const parts = value.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length <= 2) return value;
  return `${parts[0]}, ${parts[parts.length - 1]}`;
};

function PricingBlock({ displayRate }) {
  const amount =
    displayRate.amountDay != null && displayRate.amountDay > 0
      ? displayRate.amountDay
      : displayRate.amount;
  const unit =
    displayRate.amountDay != null && displayRate.amountDay > 0
      ? "/ day"
      : displayRate.unit;

  return (
    <div className="inline-flex items-baseline gap-1 rounded-md bg-gray-50 px-2 py-1 border border-gray-100">
      <span className="font-bold text-sm text-gray-900 leading-none">₹{amount ?? 0}</span>
      <span className="text-[11px] text-gray-500 leading-none">{unit}</span>
    </div>
  );
}

const RentalCard = ({ rental, userCoords }) => {
  const {
    id,
    title,
    brand,
    subtitle,
    thumbnail_image_url,
    pricing_rule,
    pricingRule,
    location,
    quantity,
    units,
    latitude,
    longitude,
    transmission,
    fuel_type,
    seats,
    category,
    sub_category,
  } = rental || {};

  const pricing = pricing_rule || pricingRule || {};
  const isVehicle = isVehicleRental(rental);
  const displayRate = rentalDisplayRate(pricing, { preferDay: true });
  const primaryUnit = Array.isArray(units) && units.length ? units[0] : null;
  const effectiveTransmission = transmission ?? primaryUnit?.transmission;
  const effectiveFuelType = fuel_type ?? primaryUnit?.fuel_type;
  const effectiveSeats = seats ?? primaryUnit?.seats;

  const formType = String(category?.form_type || "").trim().toLowerCase();
  const categoryTypeLabel = formType ? formTypeLabel(formType) : category?.name || null;
  const placeholderIcon = formType ? formTypeIcon(formType) : "fi fi-rr-box";

  const specChips = isVehicle
    ? [
        effectiveTransmission ? { icon: "fi fi-rr-settings", label: effectiveTransmission } : null,
        effectiveFuelType ? { icon: "fi fi-rr-gas-pump", label: effectiveFuelType } : null,
        formatSeats(effectiveSeats)
          ? { icon: "fi fi-rr-users", label: formatSeats(effectiveSeats) }
          : null,
      ].filter(Boolean)
    : [];

  const metaLine =
    !isVehicle && sub_category?.name
      ? sub_category.name
      : !isVehicle && category?.name
      ? category.name
      : null;
  const showMetaLine =
    metaLine &&
    metaLine.toLowerCase() !== String(title || "").trim().toLowerCase();

  const userLat = userCoords?.latitude;
  const userLng = userCoords?.longitude;
  const itemLat = latitude ?? primaryUnit?.location_lat;
  const itemLng = longitude ?? primaryUnit?.location_lng;
  const distanceKm =
    userLat &&
    userLng &&
    itemLat !== null &&
    itemLat !== undefined &&
    itemLng !== null &&
    itemLng !== undefined
      ? haversineKm(Number(userLat), Number(userLng), Number(itemLat), Number(itemLng))
      : null;

  const availableQty = Number(quantity) > 0 ? Number(quantity) : null;
  const locationLabel = formatLocation(location);

  return (
    <Link href={`/rentals/${id}`} className="block h-full group">
      <article className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-gray-200 hover:shadow-lg">
        <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-gray-100">
          {thumbnail_image_url ? (
            <Image
              src={thumbnail_image_url}
              alt={title || "Rental"}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 34vw"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-gray-100 to-gray-200">
              <i className={`${placeholderIcon} text-3xl text-gray-400`} aria-hidden />
              <span className="text-[11px] font-medium text-gray-400">No image</span>
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10" />

          {categoryTypeLabel ? (
            <span className="absolute left-3 top-3 z-10 inline-flex max-w-[calc(100%-1.5rem)] items-center gap-1.5 rounded-full border border-white/20 bg-black/45 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
              <i className={`${placeholderIcon} text-[10px]`} aria-hidden />
              <span className="truncate">{categoryTypeLabel}</span>
            </span>
          ) : null}

          {Number.isFinite(distanceKm) ? (
            <span className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/45 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">
              <i className="fi fi-rr-location-arrow text-[10px]" aria-hidden />
              {distanceKm.toFixed(1)} km
            </span>
          ) : null}

          {availableQty != null ? (
            <span className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-gray-800 shadow-sm backdrop-blur-md">
              <i className="fi fi-rr-box-open text-[10px] text-primary-600" aria-hidden />
              {availableQty} {availableQty === 1 ? "unit" : "units"}
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col gap-2 p-3.5">
          <div className="min-h-[2.75rem] space-y-0.5">
            <h3 className="line-clamp-1 text-[15px] font-semibold leading-tight text-gray-900 transition-colors group-hover:text-primary-700">
              {title || "Rental"}
            </h3>
            <p
              className={`line-clamp-1 text-xs leading-4 ${
                brand || subtitle ? "text-gray-500" : "invisible select-none"
              }`}
            >
              {brand || subtitle ? [brand, subtitle].filter(Boolean).join(" · ") : "—"}
            </p>
          </div>

          <div className="flex min-h-[1.125rem] items-start gap-1.5 text-xs text-gray-600">
            {locationLabel ? (
              <>
                <i className="fi fi-rr-marker mt-px shrink-0 text-primary-500 text-[11px]" aria-hidden />
                <span className="line-clamp-1 leading-snug">{locationLabel}</span>
              </>
            ) : (
              <span className="invisible select-none" aria-hidden>
                —
              </span>
            )}
          </div>

          <div className="flex min-h-[1.75rem] flex-wrap items-center gap-1.5">
            {specChips.length > 0
              ? specChips.map((chip) => (
                  <span
                    key={chip.label}
                    className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-700 ring-1 ring-gray-100"
                  >
                    <i className={`${chip.icon} text-[9px] text-gray-400`} aria-hidden />
                    {chip.label}
                  </span>
                ))
              : showMetaLine ? (
                  <span className="line-clamp-1 text-[11px] font-medium text-gray-500">{metaLine}</span>
                ) : null}
          </div>

          <div className="mt-auto flex items-center justify-between gap-3 border-t border-gray-100 pt-2.5">
            <PricingBlock displayRate={displayRate} />
            <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary-600 transition-colors group-hover:text-primary-700">
              View
              <i className="fi fi-rr-arrow-right text-[10px] transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default RentalCard;
