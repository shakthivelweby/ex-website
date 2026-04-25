import Image from "next/image";
import Link from "next/link";

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
  } = rental || {};

  const pricing = pricing_rule || pricingRule || {};
  const pricePerDay = pricing?.price_per_day ?? null;
  const primaryUnit = Array.isArray(units) && units.length ? units[0] : null;
  const transmission = primaryUnit?.transmission;
  const fuel_type = primaryUnit?.fuel_type;
  const seats = primaryUnit?.seats;
  const specParts = [
    transmission ? String(transmission).trim() : null,
    fuel_type ? String(fuel_type).trim() : null,
    seats ? `${seats} Seats` : null,
  ].filter(Boolean);

  const unitWithCoords = (units || []).find(
    (u) => u?.location_lat !== null && u?.location_lat !== undefined && u?.location_lng !== null && u?.location_lng !== undefined
  );
  const userLat = userCoords?.latitude;
  const userLng = userCoords?.longitude;
  const distanceKm =
    userLat && userLng && unitWithCoords
      ? haversineKm(
          Number(userLat),
          Number(userLng),
          Number(unitWithCoords.location_lat),
          Number(unitWithCoords.location_lng)
        )
      : null;

  return (
    <Link
      href={`/rentals/${id}`}
      className="block group overflow-hidden transition-all duration-300"
    >
      <div className="flex flex-col h-full">
        <div className="relative w-full h-[400px] rounded-2xl overflow-hidden">
          {thumbnail_image_url ? (
            <Image
              src={thumbnail_image_url}
              alt={title || "Rental"}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <i className="fi fi-rr-car text-gray-400 text-4xl"></i>
            </div>
          )}
        </div>

        <div className="flex flex-col flex-grow pt-2">
          <div className="flex items-center justify-between gap-3 mb-2">
            {location ? (
              <div className="flex items-start text-primary-600 font-medium text-xs capitalize tracking-wide">
                <i className="fi fi-rr-marker mr-1.5"></i>
                <span className="leading-tight break-words">{location}</span>
              </div>
            ) : (
              <div />
            )}

            {Number.isFinite(distanceKm) && (
              <div className="flex items-center gap-1 text-xs text-gray-700 whitespace-nowrap">
                <i className="fi fi-rr-location-arrow text-gray-500"></i>
                <span>{distanceKm.toFixed(1)} km away</span>
              </div>
            )}
          </div>

          <h3 className="font-semibold text-base text-gray-900 leading-tight mb-2 line-clamp-2">
            {title || "Rental"}
          </h3>

          {specParts.length > 0 && (
            <div className="text-xs text-gray-600 mb-2">
              {specParts.join(" · ")}
            </div>
          )}

          <div className="mt-auto pt-1 flex items-start justify-between gap-2">
            <div className="flex items-baseline flex-shrink-0">
              <span className="text-gray-900 font-bold text-lg leading-none">
                ₹{pricePerDay ?? 0}
              </span>
              <span className="text-gray-500 text-xs font-normal ml-1 leading-none">
                / day
              </span>
            </div>
            <div className="text-xs text-gray-500">
              {quantity ? `${quantity} units` : ""}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RentalCard;

