"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LocationSearchPopup from "@/components/LocationSearchPopup";
import { getRentalDetails } from "../../service";
import { checkRentalAvailability } from "../../clientService";

const money = (v) => {
  const n = Number(v || 0);
  if (!Number.isFinite(n)) return "0.00";
  return n.toFixed(2);
};

const initialBooking = {
  pickup_location: "",
  dropoff_location: "",
  pickup_lat: "",
  pickup_lng: "",
  start_date: "",
  end_date: "",
  pickup_time: "",
  dropoff_time: "",
};

export default function RentalBookingPage({ params }) {
  const router = useRouter();
  const rentalId = params?.id;

  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(initialBooking);
  const [pickupPopupOpen, setPickupPopupOpen] = useState(false);
  const [dropoffPopupOpen, setDropoffPopupOpen] = useState(false);
  const [checking, setChecking] = useState(false);
  const [avail, setAvail] = useState(null);
  const [error, setError] = useState("");

  const [filterFuel, setFilterFuel] = useState("");
  const [filterTransmission, setFilterTransmission] = useState("");
  const [selectedUnitId, setSelectedUnitId] = useState(null);

  const pricing = rental?.pricing_rule || rental?.pricingRule || {};
  const perDay = Number(pricing.price_per_day || 0) || 0;
  const perWeek = Number(pricing.price_per_week || 0) || 0;
  const advanceAmount = Number(pricing.advance_amount || 0) || 0;
  const depositAmount = Number(pricing.security_deposit || 0) || 0;

  const expectedRentTotal = useMemo(() => {
    const days = Number(avail?.pricing_quote?.billing_days || 0) || 0;
    if (days <= 0) return 0;
    if (days > 7 && perWeek > 0) {
      const weeks = Math.floor(days / 7);
      const extra = days % 7;
      return weeks * perWeek + extra * perDay;
    }
    return days * perDay;
  }, [avail?.pricing_quote?.billing_days, perWeek, perDay]);

  useEffect(() => {
    if (!rentalId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const res = await getRentalDetails(rentalId);
      if (!cancelled) {
        setRental(res?.data || null);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [rentalId]);

  const updateBooking = (k, v) => {
    setBooking((p) => ({ ...p, [k]: v }));
    setError("");
    setAvail(null);
    setSelectedUnitId(null);
  };

  const applyPlaceToField = (field) => (place) => {
    if (!place) return;
    const locationName = place.name || place.formatted_address || place.vicinity || "";
    const lat =
      typeof place.geometry?.location?.lat === "function"
        ? place.geometry.location.lat()
        : place.geometry?.location?.lat;
    const lng =
      typeof place.geometry?.location?.lng === "function"
        ? place.geometry.location.lng()
        : place.geometry?.location?.lng;
    updateBooking(field, locationName);
    if (field === "pickup_location") {
      updateBooking("pickup_lat", lat || "");
      updateBooking("pickup_lng", lng || "");
    }
  };

  const validateBooking = () => {
    const required = [
      "pickup_location",
      "dropoff_location",
      "start_date",
      "end_date",
      "pickup_time",
      "dropoff_time",
    ];
    for (const k of required) {
      if (!String(booking[k] || "").trim()) return `Please fill ${k.replaceAll("_", " ")}.`;
    }
    return "";
  };

  const onCheckAvailability = async () => {
    const msg = validateBooking();
    if (msg) {
      setError(msg);
      return;
    }
    if (!rentalId) return;
    setChecking(true);
    setError("");
    try {
      const res = await checkRentalAvailability(rentalId, booking);
      const d = res?.data || null;
      setAvail(d);
      const ids = Array.isArray(d?.available_unit_ids) ? d.available_unit_ids : [];
      setSelectedUnitId(d?.suggested_unit_id || ids[0] || null);
      if (d?.is_available === false) {
        setError("No cars available for the selected location/date/time.");
      }
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to check availability.");
    } finally {
      setChecking(false);
    }
  };

  const availableUnits = useMemo(() => {
    const units = Array.isArray(rental?.units) ? rental.units : [];
    const ids = new Set((avail?.available_unit_ids || []).map((x) => String(x)));
    const filtered = units.filter((u) => ids.has(String(u?.id)));
    return filtered;
  }, [rental?.units, avail?.available_unit_ids]);

  const fuelOptions = useMemo(() => {
    const s = new Set();
    availableUnits.forEach((u) => {
      const v = (u?.fuel_type || "").toString().trim();
      if (v) s.add(v);
    });
    return Array.from(s);
  }, [availableUnits]);

  const transmissionOptions = useMemo(() => {
    const s = new Set();
    availableUnits.forEach((u) => {
      const v = (u?.transmission || "").toString().trim();
      if (v) s.add(v);
    });
    return Array.from(s);
  }, [availableUnits]);

  const shownUnits = useMemo(() => {
    return availableUnits.filter((u) => {
      if (filterFuel && String(u?.fuel_type || "").trim() !== filterFuel) return false;
      if (filterTransmission && String(u?.transmission || "").trim() !== filterTransmission) return false;
      return true;
    });
  }, [availableUnits, filterFuel, filterTransmission]);

  const onContinue = () => {
    if (!avail || avail?.is_available === false) {
      setError("Please check availability first.");
      return;
    }
    if (!selectedUnitId) {
      setError("Please select a vehicle/unit.");
      return;
    }
    const params = new URLSearchParams({
      rental_item_id: String(rentalId),
      rental_item_unit_id: String(selectedUnitId),
      pickup_location: booking.pickup_location,
      dropoff_location: booking.dropoff_location,
      start_date: booking.start_date,
      end_date: booking.end_date,
      pickup_time: booking.pickup_time,
      dropoff_time: booking.dropoff_time,
    });
    router.push(`/checkout/rentals?${params.toString()}`);
  };

  if (!rentalId) {
    return (
      <div className="container mx-auto px-4 pt-28 pb-10 text-gray-600">
        Missing rental id. <Link className="underline" href="/rentals">Back</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 pt-28 pb-10 text-gray-600">
        Loading…
      </div>
    );
  }

  if (!rental) {
    return (
      <div className="container mx-auto px-4 pt-28 pb-10 text-gray-600">
        Rental not found. <Link className="underline" href="/rentals">Back</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-28 pb-10">
      <div className="mb-5 text-sm text-gray-500">
        <Link href="/rentals" className="underline">Rentals</Link> /{" "}
        <Link href={`/rentals/${rentalId}`} className="underline">{rental.title}</Link> / Booking
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
          <div>
            <div className="text-lg font-bold text-gray-900">Booking details</div>
            <div className="text-sm text-gray-500">Pickup/Dropoff, date and time</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600">Pickup location *</label>
              <button
                type="button"
                onClick={() => setPickupPopupOpen(true)}
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white text-left text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                {booking.pickup_location ? (
                  <span>{booking.pickup_location}</span>
                ) : (
                  <span className="text-gray-400">Choose pickup location</span>
                )}
              </button>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">Dropoff location *</label>
              <button
                type="button"
                onClick={() => setDropoffPopupOpen(true)}
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white text-left text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                {booking.dropoff_location ? (
                  <span>{booking.dropoff_location}</span>
                ) : (
                  <span className="text-gray-400">Choose dropoff location</span>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600">Start date *</label>
              <input
                type="date"
                value={booking.start_date}
                onChange={(e) => updateBooking("start_date", e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">End date *</label>
              <input
                type="date"
                value={booking.end_date}
                onChange={(e) => updateBooking("end_date", e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600">Pickup time *</label>
              <input
                type="time"
                value={booking.pickup_time}
                onChange={(e) => updateBooking("pickup_time", e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">Dropoff time *</label>
              <input
                type="time"
                value={booking.dropoff_time}
                onChange={(e) => updateBooking("dropoff_time", e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
          </div>

          {error ? <div className="text-sm text-red-600 font-medium">{error}</div> : null}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCheckAvailability}
              disabled={checking}
              className="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-semibold disabled:opacity-60"
            >
              {checking ? "Checking..." : "Check availability"}
            </button>
            <button
              type="button"
              onClick={onContinue}
              disabled={!avail?.is_available || !selectedUnitId}
              className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-50"
            >
              Continue
            </button>
          </div>

          {avail && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm space-y-2">
              <div className="font-semibold text-gray-900">Availability</div>
              <div className="text-gray-700">
                Available now: <span className="font-semibold">{avail.available_units ?? 0}</span>
              </div>
              {avail.pricing_quote ? (
                <div className="text-xs text-gray-700">
                  Est. rent (sum of daily rates):{" "}
                  <span className="font-semibold">₹{money(avail.pricing_quote.estimated_rental_subtotal)}</span>
                </div>
              ) : null}
            </div>
          )}

          {avail?.is_available ? (
            <div className="border-t border-gray-100 pt-4 space-y-3">
              <div className="text-sm font-bold text-gray-900">Select available vehicle type</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600">Transmission</label>
                  <select
                    className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    value={filterTransmission}
                    onChange={(e) => setFilterTransmission(e.target.value)}
                  >
                    <option value="">All</option>
                    {transmissionOptions.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Fuel type</label>
                  <select
                    className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    value={filterFuel}
                    onChange={(e) => setFilterFuel(e.target.value)}
                  >
                    <option value="">All</option>
                    {fuelOptions.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                {shownUnits.length ? (
                  shownUnits.map((u) => (
                    <label
                      key={u.id}
                      className={`flex items-center justify-between gap-3 p-3 rounded-xl border cursor-pointer ${
                        String(selectedUnitId) === String(u.id) ? "border-primary bg-primary/5" : "border-gray-200 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="unit"
                          checked={String(selectedUnitId) === String(u.id)}
                          onChange={() => setSelectedUnitId(u.id)}
                        />
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {u.unit_code || `Unit #${(u.sort_order ?? 0) + 1}`}
                          </div>
                          <div className="text-xs text-gray-600">
                            {(u.transmission || "—")} • {(u.fuel_type || "—")} • {u.seats ? `${u.seats} seats` : "—"}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 text-right">
                        Price/day: <span className="font-semibold text-gray-900">₹{money(pricing.price_per_day)}</span>
                      </div>
                    </label>
                  ))
                ) : (
                  <div className="text-sm text-gray-500">No units match the filters.</div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        <div className="lg:col-span-5 bg-white border border-gray-200 rounded-2xl p-5">
          <div className="text-lg font-bold text-gray-900">{rental.title}</div>
          <div className="text-sm text-gray-500 mt-1">
            Regular ₹/day: <span className="font-semibold text-gray-900">₹{money(pricing.price_per_day)}</span>
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Expected total:{" "}
            <span className="font-semibold text-gray-900">
              ₹{money(avail?.pricing_quote ? expectedRentTotal : 0)}
            </span>
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Advance: <span className="font-semibold text-gray-900">₹{money(advanceAmount)}</span>
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Deposit (ref): <span className="font-semibold text-gray-500">₹{money(depositAmount)}</span>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            You’ll pay the advance on checkout. Rent is estimated by your selected days.
          </div>
        </div>
      </div>

      <LocationSearchPopup
        isOpen={pickupPopupOpen}
        onClose={() => setPickupPopupOpen(false)}
        onPlaceSelected={(place) => {
          applyPlaceToField("pickup_location")(place);
          setPickupPopupOpen(false);
        }}
        onClear={() => updateBooking("pickup_location", "")}
        initialValue={booking.pickup_location}
        googleApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
        title="Choose pickup location"
      />
      <LocationSearchPopup
        isOpen={dropoffPopupOpen}
        onClose={() => setDropoffPopupOpen(false)}
        onPlaceSelected={(place) => {
          applyPlaceToField("dropoff_location")(place);
          setDropoffPopupOpen(false);
        }}
        onClear={() => updateBooking("dropoff_location", "")}
        initialValue={booking.dropoff_location}
        googleApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
        title="Choose dropoff location"
      />
    </div>
  );
}

