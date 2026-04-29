"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getRentalDetails } from "../../service";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { checkRentalAvailability, getRentalUnavailableDates } from "../../clientService";

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
  const advanceType = pricing.advance_type || null;
  const advanceValueRaw = pricing.advance_value;
  const advanceValue =
    advanceValueRaw === "" || advanceValueRaw === null || advanceValueRaw === undefined
      ? null
      : Number(advanceValueRaw);
  const legacyAdvanceAmount = Number(pricing.advance_amount || 0) || 0;
  const depositAmount = Number(pricing.security_deposit || 0) || 0;
  const adminChargeType = pricing.admin_charge_type || null;
  const adminChargeValueRaw = pricing.admin_charge_value;
  const adminChargeValue =
    adminChargeValueRaw === "" || adminChargeValueRaw === null || adminChargeValueRaw === undefined
      ? null
      : Number(adminChargeValueRaw);

  // Compute hours purely from chosen date+time so UI is always correct.
  const effectiveHours = useMemo(() => {
    if (!booking.start_date || !booking.end_date || !booking.pickup_time || !booking.dropoff_time) return 0;
    const start = new Date(`${booking.start_date}T${booking.pickup_time}:00`);
    const end = new Date(`${booking.end_date}T${booking.dropoff_time}:00`);
    const ms = end.getTime() - start.getTime();
    if (!Number.isFinite(ms) || ms <= 0) return 0;
    return Math.max(1, Math.ceil(ms / (1000 * 60 * 60)));
  }, [booking.start_date, booking.end_date, booking.pickup_time, booking.dropoff_time]);

  const rentSubtotal = useMemo(() => {
    if (effectiveHours <= 0) return 0;
    return effectiveHours * effectivePerHour;
  }, [effectiveHours, effectivePerHour]);

  const adminChargeAmount = useMemo(() => {
    if (!adminChargeType || adminChargeValue === null || !Number.isFinite(adminChargeValue)) return 0;
    if (adminChargeType === "percent") {
      return (rentSubtotal * adminChargeValue) / 100;
    }
    return adminChargeValue;
  }, [adminChargeType, adminChargeValue, rentSubtotal]);

  const totalWithAdminCharge = useMemo(() => {
    return rentSubtotal + adminChargeAmount;
  }, [rentSubtotal, adminChargeAmount]);

  const totalCostIncludingDeposit = useMemo(() => {
    return totalWithAdminCharge + depositAmount;
  }, [totalWithAdminCharge, depositAmount]);

  const payAdvanceAmount = useMemo(() => {
    // Preferred: advance_type/value
    if (advanceType && advanceValue != null && Number.isFinite(advanceValue)) {
      if (advanceType === "percent") {
        return (totalWithAdminCharge * advanceValue) / 100;
      }
      return Math.min(advanceValue, totalWithAdminCharge || advanceValue);
    }
    // Backward compatibility: legacy flat advance_amount
    if (legacyAdvanceAmount > 0) return Math.min(legacyAdvanceAmount, totalWithAdminCharge || legacyAdvanceAmount);
    return 0;
  }, [advanceType, advanceValue, totalWithAdminCharge, legacyAdvanceAmount]);

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

  // Fetch booked/blocked ranges for disabling calendar dates.
  useEffect(() => {
    if (!rentalId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await getRentalUnavailableDates(rentalId);
        if (cancelled) return;
        const payload = res?.data || {};
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

  const validateBooking = () => {
    const required = [
      "start_date",
      "end_date",
      "pickup_time",
      "dropoff_time",
    ];
    for (const k of required) {
      if (!String(booking[k] || "").trim()) return `Please fill ${k.replaceAll("_", " ")}.`;
    }
    if (!String(booking.pickup_location || "").trim()) return "Vehicle location is missing.";
    if (!String(booking.dropoff_location || "").trim()) return "Vehicle location is missing.";
    return "";
  };

  // Auto-check availability whenever the user completes date/time selection.
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
        if (d?.is_available === false) {
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
    if (avail?.is_available === false) {
      setError("This vehicle is already booked for the selected date/time. Please choose another slot.");
      return;
    }
    const params = new URLSearchParams({
      rental_item_id: String(rentalId),
      // Unit-level inventory removed; keep key for backward compatibility with checkout route.
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
            <div className="text-sm text-gray-500">Vehicle location, date and time</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600">Vehicle location</label>
              <div className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 text-gray-900">
                {vehicleLocation || "—"}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">&nbsp;</label>
              <div className="mt-1 w-full border border-transparent rounded-xl px-3 py-2 text-sm bg-transparent" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600">Start date *</label>
              <div className="mt-1">
                <DatePicker
                  selected={parseYmdToDate(booking.start_date)}
                  onChange={(d) => updateBooking("start_date", formatDateYmd(d))}
                  filterDate={(d) => !isDateUnavailable(d)}
                  minDate={new Date()}
                  placeholderText="Select start date"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">End date *</label>
              <div className="mt-1">
                <DatePicker
                  selected={parseYmdToDate(booking.end_date)}
                  onChange={(d) => updateBooking("end_date", formatDateYmd(d))}
                  filterDate={(d) => !isDateUnavailable(d)}
                  minDate={parseYmdToDate(booking.start_date) || new Date()}
                  placeholderText="Select end date"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
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
              onClick={onContinue}
              disabled={checking || avail?.is_available === false}
              className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-50"
            >
              {checking ? "Checking..." : "Continue"}
            </button>
          </div>

          {avail?.is_available === true ? (
            <div className="text-xs text-green-700 bg-green-50 border border-green-100 rounded-xl p-3">
              Slot available.
            </div>
          ) : null}
        </div>

        <div className="lg:col-span-5 bg-white border border-gray-200 rounded-2xl p-5">
          <div className="text-lg font-bold text-gray-900">{rental.title}</div>
          <div className="text-sm text-gray-500 mt-1">
            Total hours:{" "}
            <span className="font-semibold text-gray-900">
              {effectiveHours || 0}
            </span>
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Advance amount: <span className="font-semibold text-gray-900">₹{money(payAdvanceAmount)}</span>
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Deposit: <span className="font-semibold text-gray-900">₹{money(depositAmount)}</span>
          </div>
          <div className="text-sm text-gray-700 mt-1">
            Total cost: <span className="font-bold text-gray-900">₹{money(totalCostIncludingDeposit)}</span>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            Total amount includes deposit. The deposit amount will be refunded.
          </div>
        </div>
      </div>

    </div>
  );
}

