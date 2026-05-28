import Image from "next/image";
import Link from "next/link";
import { applyRentalAdminChargeOnly } from "@/app/rentals/rentalPricingCalc";

const haversineKm = (lat1, lon1, lat2, lon2) => {
  const toRad = (d) => (Number(d) * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
};

const RentalCard = ({ rental, userCoords }) => {
  const {
    id,
    title,
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
  } = rental || {};

  const pricing = pricing_rule || pricingRule || {};
  const basePerHour = pricing?.price_per_hour ?? null;
  const displayPerHour =
    basePerHour === null || basePerHour === undefined || basePerHour === ""
      ? null
      : applyRentalAdminChargeOnly(Number(basePerHour), pricing);
  const primaryUnit = Array.isArray(units) && units.length ? units[0] : null;
  const effectiveTransmission = transmission ?? primaryUnit?.transmission;
  const effectiveFuelType = fuel_type ?? primaryUnit?.fuel_type;
  const effectiveSeats = seats ?? primaryUnit?.seats;
  const specParts = [
    effectiveTransmission ? String(effectiveTransmission).trim() : null,
    effectiveFuelType ? String(effectiveFuelType).trim() : null,
    effectiveSeats ? `${effectiveSeats} Seats` : null,
  ].filter(Boolean);

  const userLat = userCoords?.latitude;
  const userLng = userCoords?.longitude;
  const itemLat = latitude ?? primaryUnit?.location_lat;
  const itemLng = longitude ?? primaryUnit?.location_lng;
  const distanceKm =
    userLat && userLng && itemLat !== null && itemLat !== undefined && itemLng !== null && itemLng !== undefined
      ? haversineKm(
          Number(userLat),
          Number(userLng),
          Number(itemLat),
          Number(itemLng)
        )
      : null;

  return (
    <Link
      href={`/rentals/${id}`}
      className="block group transition-all duration-300"
    >
      <div className="flex flex-col h-full rounded-2xl bg-gray-50 border border-gray-100 p-4 shadow-sm hover:shadow-md hover:border-gray-200">
        <div className="relative w-full aspect-[5/3] rounded-xl overflow-hidden bg-gray-100">
          {thumbnail_image_url ? (
            <Image
              src={thumbnail_image_url}
              alt={title || "Rental"}
              fill
              className="object-contain object-center transition-transform duration-700 group-hover:scale-[1.02]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 34vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <i className="fi fi-rr-car text-gray-400 text-4xl"></i>
            </div>
          )}
        </div>

        <div className="flex flex-col flex-grow pt-4">
          <div className="flex items-center justify-between gap-3 mb-2">
            {location ? (
              <div className="flex items-start text-primary-600 font-medium text-sm capitalize tracking-wide">
                <i className="fi fi-rr-marker mr-1.5 mt-0.5"></i>
                <span className="leading-tight break-words">{location}</span>
              </div>
            ) : (
              <div />
            )}

            {Number.isFinite(distanceKm) && (
              <div className="flex items-center gap-1 text-sm text-gray-700 whitespace-nowrap">
                <i className="fi fi-rr-location-arrow text-gray-500"></i>
                <span>{distanceKm.toFixed(1)} km away</span>
              </div>
            )}
          </div>

          <h3 className="font-semibold text-lg text-gray-900 leading-snug mb-2 line-clamp-2">
            {title || "Rental"}
          </h3>

          {specParts.length > 0 && (
            <div className="text-sm text-gray-600 mb-2">
              {specParts.join(" · ")}
            </div>
          )}

          <div className="mt-auto pt-2 flex items-start justify-between gap-2">
            <div className="flex items-baseline flex-shrink-0">
              <span className="text-gray-900 font-bold text-xl leading-none">
                ₹{displayPerHour ?? 0}
              </span>
              <span className="text-gray-500 text-sm font-normal ml-1 leading-none">
                / hour
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {quantity ? `${quantity} units` : ""}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RentalCard;

