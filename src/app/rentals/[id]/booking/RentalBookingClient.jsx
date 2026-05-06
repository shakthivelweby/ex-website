"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Button from "@/components/common/Button";
import { getRentalDetails } from "../../service";
import { checkRentalAvailability, getRentalUnavailableDates } from "../../clientService";
import { RENTAL_MIN_BOOKING_HOURS_DEFAULT } from "../../rentalBookingConstants";
import { computeRentalBookingMonetaryBreakdown } from "../../rentalPricingCalc";

const money = (v) => {
  const n = Number(v || 0);
  if (!Number.isFinite(n)) return "0.00";
  return n.toFixed(2);
};

const computeBillingHoursCeil = (b) => {
  if (!b.start_date || !b.end_date || !b.pickup_time || !b.dropoff_time) return 0;
  const start = new Date(`${b.start_date}T${b.pickup_time}:00`);
  const end = new Date(`${b.end_date}T${b.dropoff_time}:00`);
  const ms = end.getTime() - start.getTime();
  if (!Number.isFinite(ms) || ms <= 0) return 0;
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60)));
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

export default function RentalBookingClient() {
  const router = useRouter();
  const routeParams = useParams();
  const rentalId = routeParams?.id;

  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(initialBooking);
  const [checking, setChecking] = useState(false);
  const [avail, setAvail] = useState(null);
  const [error, setError] = useState("");
  const [unavailable, setUnavailable] = useState({ bookings: [], blocked: [] });

  const pricing = rental?.pricing_rule || rental?.pricingRule || {};
  const basePerHour = Number(pricing.price_per_hour || 0) || 0;

  const primaryUnit = Array.isArray(rental?.units) && rental.units.length ? rental.units[0] : null;
  const displayTransmission = rental?.transmission ?? primaryUnit?.transmission;
  const displayFuel = rental?.fuel_type ?? primaryUnit?.fuel_type;

  const effectivePerHour = useMemo(() => {
    const fromQuote = avail?.pricing_quote?.effective_rates?.price_per_hour;
    if (fromQuote !== undefined && fromQuote !== null && String(fromQuote) !== "") {
      const n = Number(fromQuote);
      if (Number.isFinite(n) && n > 0) return n;
    }

    if (booking.start_date) {
      const d = new Date(`${booking.start_date}T12:00:00`);
      if (Number.isFinite(d.getTime())) {
        const dow = d.getDay();
        const rows = rental?.weekday_prices || rental?.weekdayPrices || [];
        if (Array.isArray(rows) && rows.length) {
          const match = rows.find((r) => Number(r?.day_of_week) === dow);
          const v = match?.price_per_hour;
          if (v !== undefined && v !== null && String(v) !== "") {
            const n = Number(v);
            if (Number.isFinite(n) && n > 0) return n;
          }
        }
      }
    }

    return basePerHour;
  }, [avail, rental, booking.start_date, basePerHour]);
  const depositAmount = Number(pricing.security_deposit || 0) || 0;
  const effectiveHours = useMemo(() => computeBillingHoursCeil(booking), [
    booking.start_date,
    booking.end_date,
    booking.pickup_time,
    booking.dropoff_time,
  ]);

  const minBookingHours =
    avail?.min_booking_hours != null && String(avail.min_booking_hours) !== ""
      ? Math.max(1, Number(avail.min_booking_hours) || RENTAL_MIN_BOOKING_HOURS_DEFAULT)
      : RENTAL_MIN_BOOKING_HOURS_DEFAULT;

  const rentSubtotal = useMemo(() => {
    if (effectiveHours <= 0) return 0;
    return effectiveHours * effectivePerHour;
  }, [effectiveHours, effectivePerHour]);

  const monetary = useMemo(
    () => computeRentalBookingMonetaryBreakdown(rentSubtotal, pricing),
    [rentSubtotal, pricing]
  );
  const rentSubtotalGross = monetary.rentSubtotalGross;
  const discountAmount = monetary.discountAmount;
  const gstAmount = monetary.gstAmount;
  const gstPercent = monetary.gstPercent;
  const convenienceFeeAmount = monetary.convenienceFeeAmount;
  const convenienceFeePercent = monetary.convenienceFeePercent;
  const totalCostIncludingDeposit = monetary.grandTotal;

  const vehicleLocation = (rental?.location || "").toString().trim();

  useEffect(() => {
    if (!rentalId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const res = await getRentalDetails(rentalId);
      if (!cancelled) {
        const r = res?.data || null;
        setRental(r);
        const loc = (r?.location || "").toString().trim();
        if (loc) {
          setBooking((p) => ({
            ...p,
            pickup_location: loc,
            dropoff_location: loc,
          }));
        }
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [rentalId]);

  useEffect(() => {
    if (!rentalId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await getRentalUnavailableDates(rentalId);
        if (cancelled) return;
        // API wrappers differ across endpoints; accept both {data:{...}} and direct payloads.
        const payload =
          (res && typeof res === "object" && res.data && typeof res.data === "object" ? res.data : res) || {};
        setUnavailable({
          bookings: Array.isArray(payload.bookings) ? payload.bookings : [],
          blocked: Array.isArray(payload.blocked) ? payload.blocked : [],
        });
      } catch (_) {
        if (!cancelled) setUnavailable({ bookings: [], blocked: [] });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [rentalId]);

  const isDateUnavailable = (dateObj) => {
    if (!(dateObj instanceof Date) || !Number.isFinite(dateObj.getTime())) return false;
    const dayStart = new Date(dateObj);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dateObj);
    dayEnd.setHours(23, 59, 59, 999);

    const overlaps = (startISO, endISO) => {
      const s = new Date(startISO);
      const e = new Date(endISO);
      if (!Number.isFinite(s.getTime()) || !Number.isFinite(e.getTime())) return false;
      return s <= dayEnd && e >= dayStart;
    };

    for (const b of unavailable.bookings || []) {
      if (b?.start_datetime && b?.end_datetime && overlaps(b.start_datetime, b.end_datetime)) return true;
    }
    for (const r of unavailable.blocked || []) {
      if (r?.start_datetime && r?.end_datetime && overlaps(r.start_datetime, r.end_datetime)) return true;
    }
    return false;
  };

  const overlapsWindow = (windowStartISO, windowEndISO, itemStartISO, itemEndISO) => {
    const ws = new Date(windowStartISO);
    const we = new Date(windowEndISO);
    const s = new Date(itemStartISO);
    const e = new Date(itemEndISO);
    if (![ws, we, s, e].every((d) => Number.isFinite(d.getTime()))) return false;
    return s < we && e > ws;
  };

  const blockedAppliesToWindow = (blockedRow, windowStartISO, windowEndISO) => {
    const ad = blockedRow?.applicable_days;
    if (!ad) return true;
    const allowed = [];
    const keys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    keys.forEach((k, idx) => {
      if (ad?.[k]) allowed.push(idx);
    });
    // if applicable_days exists but none enabled, treat as non-blocking
    if (allowed.length === 0) return false;

    const ws = new Date(windowStartISO);
    const we = new Date(windowEndISO);
    if (![ws, we].every((d) => Number.isFinite(d.getTime()))) return true;
    const cursor = new Date(ws);
    cursor.setHours(0, 0, 0, 0);
    const endDay = new Date(we);
    endDay.setHours(0, 0, 0, 0);
    while (cursor <= endDay) {
      if (allowed.includes(cursor.getDay())) return true;
      cursor.setDate(cursor.getDate() + 1);
    }
    return false;
  };

  const isWindowUnavailable = (windowStartISO, windowEndISO) => {
    const ws = new Date(windowStartISO);
    const we = new Date(windowEndISO);
    if (![ws, we].every((d) => Number.isFinite(d.getTime()))) return false;
    if (we <= ws) return false;

    for (const b of unavailable.bookings || []) {
      if (b?.start_datetime && b?.end_datetime && overlapsWindow(windowStartISO, windowEndISO, b.start_datetime, b.end_datetime)) {
        return true;
      }
    }
    for (const r of unavailable.blocked || []) {
      if (!r?.start_datetime || !r?.end_datetime) continue;
      if (!blockedAppliesToWindow(r, windowStartISO, windowEndISO)) continue;
      if (overlapsWindow(windowStartISO, windowEndISO, r.start_datetime, r.end_datetime)) return true;
    }
    return false;
  };

  const isStartDateSelectable = (dateObj) => {
    if (!(dateObj instanceof Date) || !Number.isFinite(dateObj.getTime())) return true;
    const ymd = formatDateYmd(dateObj);
    const pu = String(booking.pickup_time || "").trim();
    const endYmd = String(booking.end_date || "").trim();
    const du = String(booking.dropoff_time || "").trim();
    if (timeRe.test(pu) && endYmd && timeRe.test(du)) {
      const startISO = `${ymd}T${pu}:00`;
      const endISO = `${endYmd}T${du}:00`;
      if (new Date(endISO) > new Date(startISO)) {
        return !isWindowUnavailable(startISO, endISO);
      }
    }
    // fallback: day-level block
    return !isDateUnavailable(dateObj);
  };

  const isEndDateSelectable = (dateObj) => {
    if (!(dateObj instanceof Date) || !Number.isFinite(dateObj.getTime())) return true;
    const ymd = formatDateYmd(dateObj);
    const du = String(booking.dropoff_time || "").trim();
    const startYmd = String(booking.start_date || "").trim();
    const pu = String(booking.pickup_time || "").trim();
    if (timeRe.test(du) && startYmd && timeRe.test(pu)) {
      const startISO = `${startYmd}T${pu}:00`;
      const endISO = `${ymd}T${du}:00`;
      if (new Date(endISO) > new Date(startISO)) {
        return !isWindowUnavailable(startISO, endISO);
      }
    }
    return !isDateUnavailable(dateObj);
  };

  const parseYmdToDate = (ymd) => {
    if (!ymd) return null;
    const d = new Date(`${ymd}T00:00:00`);
    return Number.isFinite(d.getTime()) ? d : null;
  };
  const formatDateYmd = (d) => {
    if (!(d instanceof Date) || !Number.isFinite(d.getTime())) return "";
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const updateBooking = (k, v) => {
    setBooking((p) => ({ ...p, [k]: v }));
    setError("");
    setAvail(null);
  };

  const timeRe = /^([01]?\d|2[0-3]):[0-5]\d$/;

  const validateBooking = () => {
    const required = ["start_date", "end_date", "pickup_time", "dropoff_time"];
    for (const k of required) {
      if (!String(booking[k] || "").trim()) return `Please fill ${k.replaceAll("_", " ")}.`;
    }
    if (!timeRe.test(String(booking.pickup_time || "").trim())) {
      return "Pickup time must be in HH:MM format (24h).";
    }
    if (!timeRe.test(String(booking.dropoff_time || "").trim())) {
      return "Dropoff time must be in HH:MM format (24h).";
    }
    const pu = String(booking.pickup_location || "").trim();
    const du = String(booking.dropoff_location || "").trim();
    if (!pu) return "Pickup location is required.";
    if (!du) return "Dropoff location is required.";
    if (pu.length > 255 || du.length > 255) {
      return "Pickup and dropoff locations must be at most 255 characters each.";
    }
    const hours = computeBillingHoursCeil(booking);
    const minH =
      avail?.min_booking_hours != null && String(avail.min_booking_hours) !== ""
        ? Math.max(1, Number(avail.min_booking_hours) || RENTAL_MIN_BOOKING_HOURS_DEFAULT)
        : RENTAL_MIN_BOOKING_HOURS_DEFAULT;
    if (hours > 0 && hours < minH) {
      return `Minimum rental length is ${minH} hours (selected: ${hours}). Please extend your drop-off time.`;
    }
    return "";
  };

  useEffect(() => {
    const msg = validateBooking();
    if (msg) return;
    if (!rentalId) return;
    let cancelled = false;
    const run = async () => {
      setChecking(true);
      setError("");
      try {
        const res = await checkRentalAvailability(rentalId, booking);
        const d = res?.data || null;
        if (cancelled) return;
        setAvail(d);
        if (d?.minimum_hours_not_met) {
          const mh = d?.min_booking_hours ?? RENTAL_MIN_BOOKING_HOURS_DEFAULT;
          setError(
            `Minimum rental length is ${mh} hours. Please extend your drop-off time (or adjust dates).`
          );
        } else if (d?.is_available === false) {
          setError("This vehicle is already booked for the selected date/time. Please choose another slot.");
        }
      } catch (e) {
        if (!cancelled) setError(e?.response?.data?.message || "Failed to check availability.");
      } finally {
        if (!cancelled) setChecking(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rentalId, booking.start_date, booking.end_date, booking.pickup_time, booking.dropoff_time, booking.pickup_location, booking.dropoff_location]);

  const onContinue = () => {
    const msg = validateBooking();
    if (msg) {
      setError(msg);
      return;
    }
    if (checking) return;
    if (avail?.minimum_hours_not_met) {
      const mh = avail?.min_booking_hours ?? RENTAL_MIN_BOOKING_HOURS_DEFAULT;
      setError(
        `Minimum rental length is ${mh} hours. Please extend your drop-off time (or adjust dates).`
      );
      return;
    }
    if (avail?.is_available === false) {
      setError("This vehicle is already booked for the selected date/time. Please choose another slot.");
      return;
    }
    const params = new URLSearchParams({
      rental_item_id: String(rentalId),
      rental_item_unit_id: String(0),
      pickup_location: booking.pickup_location,
      dropoff_location: booking.dropoff_location,
      start_date: booking.start_date,
      end_date: booking.end_date,
      pickup_time: booking.pickup_time,
      dropoff_time: booking.dropoff_time,
    });
    router.push(`/checkout/rentals?${params.toString()}`);
  };

  const continueDisabled =
    checking || avail?.is_available === false || avail?.minimum_hours_not_met === true;
  const thumb = rental?.thumbnail_image_url;

  if (!rentalId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center text-gray-600">
          <p className="mb-2">Missing rental id.</p>
          <Link href="/rentals" className="text-primary-600 font-medium underline">
            Back to rentals
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (!rental) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Rental not found</h2>
          <p className="text-gray-600 mb-4">The rental you are looking for does not exist.</p>
          <Link href="/rentals" className="text-primary-600 font-medium underline">
            Back to rentals
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="hidden lg:flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link href="/rentals" className="hover:text-primary-600">
            Rentals
          </Link>
          <span>/</span>
          <Link href={`/rentals/${rentalId}`} className="hover:text-primary-600 truncate max-w-[200px]">
            {rental.title}
          </Link>
          <span>/</span>
          <span className="text-gray-700">Booking</span>
        </div>

        <div className="lg:hidden mb-6">
          <div className="bg-white rounded-lg shadow border p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                {thumb ? (
                  <Image src={thumb} alt={rental.title || "Rental"} fill className="object-cover" sizes="64px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <i className="fi fi-rr-car text-gray-400 text-xl" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-semibold text-gray-800">Book rental</h1>
                <p className="text-sm text-gray-600 truncate">{rental.title}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              {vehicleLocation ? (
                <div className="flex items-center gap-2">
                  <i className="fi fi-rr-map-marker text-primary-500 text-sm shrink-0" />
                  <span className="text-gray-700">{vehicleLocation}</span>
                </div>
              ) : null}
              {rental?.category?.name ? (
                <div className="flex items-center gap-2">
                  <i className="fi fi-rr-tag text-primary-500 text-sm shrink-0" />
                  <span className="text-gray-700">
                    {rental.category.name}
                    {rental?.sub_category?.name ? ` · ${rental.sub_category.name}` : ""}
                  </span>
                </div>
              ) : null}
              {(displayTransmission || displayFuel) && (
                <div className="flex items-center gap-2">
                  <i className="fi fi-rr-settings-sliders text-primary-500 text-sm shrink-0" />
                  <span className="text-gray-700">
                    {[displayTransmission, displayFuel].filter(Boolean).join(" · ")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4 lg:mt-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow border overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200">
                <h2 className="text-base font-medium text-gray-800">Select dates &amp; times</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Choose when you need the vehicle. We will check availability automatically. Minimum rental:{" "}
                  {minBookingHours} hours.
                </p>
              </div>
              <div className="p-4 sm:p-6 space-y-5">
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Vehicle location</label>
                  <div className="mt-1.5 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 text-gray-900">
                    {vehicleLocation || "—"}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Start date *</label>
                    <div className="mt-1.5">
                      <DatePicker
                        selected={parseYmdToDate(booking.start_date)}
                        onChange={(d) => updateBooking("start_date", formatDateYmd(d))}
                        filterDate={isStartDateSelectable}
                        minDate={new Date()}
                        placeholderText="Select start date"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">End date *</label>
                    <div className="mt-1.5">
                      <DatePicker
                        selected={parseYmdToDate(booking.end_date)}
                        onChange={(d) => updateBooking("end_date", formatDateYmd(d))}
                        filterDate={isEndDateSelectable}
                        minDate={parseYmdToDate(booking.start_date) || new Date()}
                        placeholderText="Select end date"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Pickup time *</label>
                    <input
                      type="time"
                      value={booking.pickup_time}
                      onChange={(e) => updateBooking("pickup_time", e.target.value)}
                      className="mt-1.5 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Dropoff time *</label>
                    <input
                      type="time"
                      value={booking.dropoff_time}
                      onChange={(e) => updateBooking("dropoff_time", e.target.value)}
                      className="mt-1.5 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>
                </div>

                {error ? <div className="text-sm text-red-600 font-medium">{error}</div> : null}

                {checking ? (
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
                    Checking availability…
                  </div>
                ) : null}

                {avail?.is_available === true && !avail?.minimum_hours_not_met ? (
                  <div className="text-sm text-green-800 bg-green-50 border border-green-100 rounded-xl px-3 py-2.5">
                    This slot is available. You can continue to payment.
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              <div className="bg-white rounded-lg shadow border p-4">
                <div className="relative aspect-video w-full rounded-lg overflow-hidden mb-3 bg-gray-100">
                  {thumb ? (
                    <Image
                      src={thumb}
                      alt={rental.title || "Rental"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <i className="fi fi-rr-car text-gray-400 text-4xl" />
                    </div>
                  )}
                </div>
                <h3 className="text-base font-medium text-gray-800 mb-1">{rental.title}</h3>
                {rental?.category?.name ? (
                  <p className="text-sm text-gray-600 mb-3">
                    {rental.category.name}
                    {rental?.sub_category?.name ? ` · ${rental.sub_category.name}` : ""}
                  </p>
                ) : (
                  <p className="text-sm text-gray-600 mb-3">Rental vehicle</p>
                )}
                <div className="space-y-1.5 text-sm">
                  {vehicleLocation ? (
                    <div className="flex items-start gap-2">
                      <i className="fi fi-rr-map-marker text-primary-500 text-sm mt-0.5 shrink-0" />
                      <span className="text-gray-700">{vehicleLocation}</span>
                    </div>
                  ) : null}
                  {effectivePerHour > 0 ? (
                    <div className="flex items-center gap-2">
                      <i className="fi fi-rr-indian-rupee-sign text-primary-500 text-sm shrink-0" />
                      <span className="text-gray-700">From ₹{money(effectivePerHour)} / hour</span>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow border p-4">
                <h3 className="text-base font-medium text-gray-800 mb-3">Booking summary</h3>
                <div className="space-y-2.5 mb-4 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-600">
                      {effectiveHours || 0} h × ₹{money(effectivePerHour)}
                    </span>
                    <span className="font-medium text-gray-900">₹{money(rentSubtotalGross)}</span>
                  </div>
                  {discountAmount > 0 ? (
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-gray-600">
                        Discount
                        {pricing.discount_type === "percent" &&
                        pricing.discount_value != null &&
                        String(pricing.discount_value) !== "" ? (
                          <span className="text-gray-400"> ({String(pricing.discount_value)}%)</span>
                        ) : null}
                      </span>
                      <span className="font-medium text-green-700">−₹{money(discountAmount)}</span>
                    </div>
                  ) : null}
                  {gstAmount > 0 ? (
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-gray-600">GST{gstPercent > 0 ? ` (${money(gstPercent)}%)` : ""}</span>
                      <span className="font-medium text-gray-900">₹{money(gstAmount)}</span>
                    </div>
                  ) : null}
                  {convenienceFeeAmount > 0 ? (
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-gray-600">
                        Convenience fee{convenienceFeePercent > 0 ? ` (${money(convenienceFeePercent)}%)` : ""}
                      </span>
                      <span className="font-medium text-gray-900">₹{money(convenienceFeeAmount)}</span>
                    </div>
                  ) : null}
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-600">Refundable deposit</span>
                    <span className="font-medium text-gray-900">₹{money(depositAmount)}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-3">
                    <span className="text-gray-800 font-medium">Total</span>
                    <span className="text-lg font-semibold text-primary-600">
                      ₹{money(totalCostIncludingDeposit)}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-gray-500 mb-4 leading-snug">
                  Total includes taxes and refundable deposit.
                </p>
                <Button onClick={onContinue} size="lg" className="w-full" disabled={continueDisabled}>
                  {checking ? "Checking…" : "Continue to payment"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:hidden fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <div>
              <p className="text-xs text-gray-500">Total amount</p>
              <p className="text-lg font-bold text-primary-600">₹{money(totalCostIncludingDeposit)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Total hours</p>
              <p className="text-base font-semibold text-gray-900">{effectiveHours || 0}</p>
            </div>
          </div>
          <div className="px-4 pb-4">
            <Button onClick={onContinue} size="lg" className="w-full" disabled={continueDisabled}>
              {checking ? "Checking…" : "Continue to payment"}
            </Button>
          </div>
        </div>

        <div className="lg:hidden h-40" aria-hidden />
      </div>
    </div>
  );
}
