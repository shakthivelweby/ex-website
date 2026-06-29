"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Button from "@/components/common/Button";
import PickupLocationPicker from "@/components/rentals/PickupLocationPicker";
import { checkRentalAvailability, getRentalUnavailableDates, getRentalDetailsClient, getRentalPickupLocationsClient } from "../../clientService";
import { RENTAL_MIN_BOOKING_HOURS_DEFAULT, RENTAL_MIN_BILLING_HOURS } from "../../rentalBookingConstants";
import { requiresExtendedMinBookingHours } from "../../rentalFilterUtils";
import {
  normalizeRentalPickupOptions,
  getDefaultPickupOption,
  mergePickupLocationRows,
  extractRentalPickupRows,
} from "../../rentalPickupUtils";
import {
  emptyRentalBooking,
  hydrateRentalBookingDraft,
  mergeRentalBookingDraft,
  writeRentalBookingDraft,
  hasRentalBookingSchedule,
  buildRentalBookingFields,
  rentalBookingQueryString,
  restoreRentalBookingDraft,
  bookingDraftNeedsRestore,
  isRentalBookingCheckoutRestore,
  forceRentalBookingRestore,
} from "../../rentalBookingDraft";
import { applyRentalAdminChargeOnly, computeRentalBookingMonetaryBreakdown, rentalCatalogPricingBasis, rentalDailyRateWithAdmin, computeBillingDaysCeilFromParts, resolveRentalWindowPricing, rentalWindowPeriodSubtotalForDisplay } from "../../rentalPricingCalc";
import InlineSpinner from "@/components/loading/InlineSpinner";
import BookingPageSkeleton from "@/components/loading/BookingPageSkeleton";

const money = (v) => {
  const n = Number(v || 0);
  if (!Number.isFinite(n)) return "0.00";
  return n.toFixed(2);
};

const parseAvailabilityPayload = (res) => {
  if (!res || typeof res !== "object") return null;
  if (res.is_available !== undefined || res.available_units !== undefined) return res;
  if (res.data && typeof res.data === "object" && !Array.isArray(res.data)) return res.data;
  return null;
};

const isTruthyAvailabilityFlag = (value) =>
  value === true || value === 1 || value === "1" || value === "true";

const isAvailabilityOpen = (payload) => {
  if (!payload) return false;
  const units = Number(payload.available_units ?? 1);
  return isTruthyAvailabilityFlag(payload.is_available) && Number.isFinite(units) && units > 0;
};

const isAvailabilityClosed = (payload) =>
  Boolean(
    payload &&
      (payload.is_available === false ||
        payload.is_available === 0 ||
        (payload.available_units != null && Number(payload.available_units) <= 0))
  );

const computeBillingHoursCeil = (b) => {
  if (!b.start_date || !b.end_date || !b.pickup_time || !b.dropoff_time) return 0;
  const start = new Date(`${b.start_date}T${b.pickup_time}:00`);
  const end = new Date(`${b.end_date}T${b.dropoff_time}:00`);
  const ms = end.getTime() - start.getTime();
  if (!Number.isFinite(ms) || ms <= 0) return 0;
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60)));
};

const bookingFieldsEqual = (a, b) => {
  const left = buildRentalBookingFields(a);
  const right = buildRentalBookingFields(b);
  return (
    left.pickup_location === right.pickup_location &&
    left.dropoff_location === right.dropoff_location &&
    left.start_date === right.start_date &&
    left.end_date === right.end_date &&
    left.pickup_time === right.pickup_time &&
    left.dropoff_time === right.dropoff_time
  );
};

export default function RentalBookingClient({
  rentalId: rentalIdProp,
  initialRental = null,
  initialPickupLocations = [],
  initialPickupFromUrl = "",
  initialBookingFromUrl = null,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const routeParams = useParams();
  const rentalId = rentalIdProp || routeParams?.id;
  const pickupFromUrl =
    initialPickupFromUrl || searchParams.get("pickup_location") || "";

  const [rental, setRental] = useState(initialRental);
  const [pickupLocationRows, setPickupLocationRows] = useState(() =>
    mergePickupLocationRows(initialPickupLocations, extractRentalPickupRows(initialRental))
  );
  const [loadingPickupLocations, setLoadingPickupLocations] = useState(
    () => mergePickupLocationRows(initialPickupLocations, extractRentalPickupRows(initialRental)).length === 0
  );
  const [loading, setLoading] = useState(!initialRental);
  const searchParamsKey = searchParams.toString();
  const [booking, setBooking] = useState(() => {
    if (typeof window === "undefined") return emptyRentalBooking();
    const id = rentalIdProp || "";
    if (!id) return emptyRentalBooking();
    const params = new URLSearchParams(window.location.search);
    if (params.get("from_checkout") === "1") {
      return forceRentalBookingRestore(id, params, initialBookingFromUrl);
    }
    return hydrateRentalBookingDraft(id, { initialFromUrl: initialBookingFromUrl });
  });
  const [checking, setChecking] = useState(false);
  const [avail, setAvail] = useState(null);
  const [error, setError] = useState("");
  const [isContinuing, setIsContinuing] = useState(false);
  const availabilityRequestRef = useRef(0);
  const [unavailable, setUnavailable] = useState({ bookings: [], blocked: [] });
  const initialBookingFromUrlRef = useRef(initialBookingFromUrl);
  initialBookingFromUrlRef.current = initialBookingFromUrl;
  const bookingRef = useRef(booking);
  bookingRef.current = booking;

  const applyDraftRestore = (previous = null, paramsOverride = searchParams) => {
    if (!rentalId) return;
    setBooking((prev) => {
      const base = previous ?? prev;
      const merged = mergeRentalBookingDraft(base, rentalId, {
        searchParams: paramsOverride,
        initialFromUrl: initialBookingFromUrlRef.current,
      });
      return bookingFieldsEqual(prev, merged) ? prev : merged;
    });
    setAvail(null);
  };
  const applyDraftRestoreRef = useRef(applyDraftRestore);
  applyDraftRestoreRef.current = applyDraftRestore;

  const pricing = rental?.pricing_rule || rental?.pricingRule || {};
  const weekdayPrices = rental?.weekday_prices || rental?.weekdayPrices || [];
  const catalogBasis = useMemo(() => rentalCatalogPricingBasis(pricing), [pricing]);

  const windowPricing = useMemo(
    () =>
      resolveRentalWindowPricing({
        pricing,
        startDate: booking.start_date,
        endDate: booking.end_date,
        pickupTime: booking.pickup_time,
        dropoffTime: booking.dropoff_time,
        weekdayPrices,
        quote: avail?.pricing_quote,
      }),
    [
      pricing,
      booking.start_date,
      booking.end_date,
      booking.pickup_time,
      booking.dropoff_time,
      weekdayPrices,
      avail?.pricing_quote,
    ]
  );

  const pricingBasis = windowPricing.basis || catalogBasis;
  const basePerHour = Number(pricing.price_per_hour || 0) || 0;
  const basePerDay = Number(pricing.price_per_day || 0) || 0;

  const primaryUnit = Array.isArray(rental?.units) && rental.units.length ? rental.units[0] : null;
  const eligibleUnits = Math.max(1, Number(rental?.quantity ?? 1));
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

  const effectivePerDay = useMemo(() => {
    const fromQuote = avail?.pricing_quote?.effective_rates?.price_per_day;
    if (fromQuote !== undefined && fromQuote !== null && String(fromQuote) !== "") {
      const n = Number(fromQuote);
      if (Number.isFinite(n) && n > 0) return n;
    }
    return basePerDay;
  }, [avail, basePerDay]);
  const depositAmount = Number(pricing.security_deposit || 0) || 0;
  const effectiveHours = useMemo(() => computeBillingHoursCeil(booking), [
    booking.start_date,
    booking.end_date,
    booking.pickup_time,
    booking.dropoff_time,
  ]);

  const effectiveDays = useMemo(
    () =>
      computeBillingDaysCeilFromParts(
        booking.start_date,
        booking.end_date,
        booking.pickup_time,
        booking.dropoff_time
      ),
    [booking.start_date, booking.end_date, booking.pickup_time, booking.dropoff_time]
  );

  const enforceExtendedMinHours = requiresExtendedMinBookingHours(rental);

  const effectiveMinBookingHours = enforceExtendedMinHours
    ? avail?.min_booking_hours != null && String(avail.min_booking_hours) !== ""
      ? Math.max(1, Number(avail.min_booking_hours) || RENTAL_MIN_BOOKING_HOURS_DEFAULT)
      : RENTAL_MIN_BOOKING_HOURS_DEFAULT
    : RENTAL_MIN_BILLING_HOURS;

  const minBookingHours = effectiveMinBookingHours;

  const minHoursViolated = (hours) =>
    pricingBasis === "hour" &&
    enforceExtendedMinHours &&
    hours > 0 &&
    hours < effectiveMinBookingHours;

  const availabilityMinHoursBlocked = (payload) =>
    Boolean(
      payload?.minimum_hours_not_met &&
        pricingBasis === "hour" &&
        enforceExtendedMinHours
    );

  const rentSubtotal = useMemo(() => windowPricing.subtotal, [windowPricing]);

  const monetary = useMemo(
    () => computeRentalBookingMonetaryBreakdown(rentSubtotal, pricing),
    [rentSubtotal, pricing]
  );
  const rentSubtotalGross = monetary.rentSubtotalGross;
  const discountAmount = monetary.discountAmount;
  const adminChargeAmount = monetary.adminCharge;
  const gstAmount = monetary.gstAmount;
  const gstPercent = monetary.gstPercent;
  const convenienceFeeAmount = monetary.convenienceFeeAmount;
  const convenienceFeePercent = monetary.convenienceFeePercent;
  const feesBeforeDeposit = monetary.feesBeforeDeposit;
  const totalCostIncludingDeposit = monetary.grandTotal;

  const displayRateWithAdmin = useMemo(() => {
    if (windowPricing.basis === "day" || windowPricing.basis === "hybrid") {
      return rentalDailyRateWithAdmin({ ...pricing, price_per_day: windowPricing.rate });
    }
    if (windowPricing.basis === "hour") {
      return applyRentalAdminChargeOnly(windowPricing.rate, pricing);
    }
    if (catalogBasis === "day") return rentalDailyRateWithAdmin({ ...pricing, price_per_day: effectivePerDay });
    return applyRentalAdminChargeOnly(effectivePerHour, pricing);
  }, [windowPricing, catalogBasis, effectivePerDay, effectivePerHour, pricing]);

  const displayHourlyRateWithAdmin = useMemo(() => {
    if (windowPricing.basis === "hybrid") {
      return applyRentalAdminChargeOnly(windowPricing.hourlyRate, pricing);
    }
    if (windowPricing.basis === "hour") {
      return applyRentalAdminChargeOnly(windowPricing.rate, pricing);
    }
    return applyRentalAdminChargeOnly(effectivePerHour, pricing);
  }, [windowPricing, effectivePerHour, pricing]);

  const displayPerHourWithAdmin = displayRateWithAdmin;

  // For summary display: merge admin into the hourly subtotal line (do not show separately).
  // Backend computes admin on rent subtotal after discount; we still keep totals consistent by
  // adding the computed admin amount to the gross rent subtotal in the display line item.
  const rentSubtotalWithAdminForDisplay = useMemo(
    () => (adminChargeAmount > 0 ? rentSubtotalGross + adminChargeAmount : rentSubtotalGross),
    [rentSubtotalGross, adminChargeAmount]
  );

  const periodSubtotalWithAdminForDisplay = useMemo(
    () => rentalWindowPeriodSubtotalForDisplay(windowPricing, pricing),
    [windowPricing, pricing]
  );

  const hourlySubtotalWithAdminForDisplay = periodSubtotalWithAdminForDisplay;

  const discountAmountForDisplay = useMemo(() => {
    const gross = Number(hourlySubtotalWithAdminForDisplay || 0) || 0;
    if (gross <= 0) return 0;
    const type = pricing?.discount_type || null;
    const raw = pricing?.discount_value;
    if (!type || raw === "" || raw === null || raw === undefined) return 0;
    const v = Number(raw);
    if (!Number.isFinite(v) || v <= 0) return 0;
    if (type === "percent") return (gross * Math.min(v, 100)) / 100;
    if (type === "flat") return Math.min(gross, v);
    return 0;
  }, [hourlySubtotalWithAdminForDisplay, pricing]);

  const pickupOptions = useMemo(
    () => normalizeRentalPickupOptions(rental, pickupLocationRows),
    [rental, pickupLocationRows]
  );

  const selectedPickupOption = useMemo(
    () => getDefaultPickupOption(pickupOptions, booking.pickup_location),
    [pickupOptions, booking.pickup_location]
  );

  const effectiveBooking = useMemo(() => {
    const pickup = String(
      booking.pickup_location || selectedPickupOption?.name || rental?.location || ""
    ).trim();
    const dropoff = String(booking.dropoff_location || pickup).trim();
    return {
      ...booking,
      pickup_location: pickup,
      dropoff_location: dropoff,
    };
  }, [booking, selectedPickupOption, rental?.location]);

  const vehicleLocation = selectedPickupOption?.name || (rental?.location || "").toString().trim();

  const applyPickupOption = (option) => {
    if (!option?.name) return;
    setBooking((p) => {
      const locationChanged =
        String(p.pickup_location || "").trim() !== String(option.name).trim() ||
        String(p.dropoff_location || "").trim() !== String(option.name).trim();
      if (locationChanged) {
        setAvail(null);
      }
      return {
        ...p,
        pickup_location: option.name,
        dropoff_location: option.name,
        pickup_lat: option.latitude ?? "",
        pickup_lng: option.longitude ?? "",
      };
    });
    setError("");
  };

  useLayoutEffect(() => {
    if (!rentalId) return;

    if (isRentalBookingCheckoutRestore(searchParams)) {
      const restored = forceRentalBookingRestore(
        rentalId,
        searchParams,
        initialBookingFromUrlRef.current
      );
      setBooking(restored);
      writeRentalBookingDraft(rentalId, restored);
      setAvail(null);
      setError("");
      const cleanUrl = rentalBookingQueryString(rentalId, restored);
      if (cleanUrl && typeof window !== "undefined") {
        router.replace(cleanUrl, { scroll: false });
      }
      return;
    }

    applyDraftRestore();
  }, [rentalId, searchParamsKey, initialBookingFromUrl]);

  // Browser back/forward restores this page from bfcache with stale React state — re-hydrate draft.
  useEffect(() => {
    if (!rentalId || typeof window === "undefined") return;

    const onPageShow = (event) => {
      if (event.persisted) {
        applyDraftRestoreRef.current(emptyRentalBooking(), null);
        return;
      }
      setBooking((prev) => {
        if (!bookingDraftNeedsRestore(prev, rentalId)) return prev;
        const merged = restoreRentalBookingDraft(
          rentalId,
          emptyRentalBooking(),
          initialBookingFromUrlRef.current
        );
        return bookingFieldsEqual(prev, merged) ? prev : merged;
      });
    };

    const onPopState = () => {
      window.requestAnimationFrame(() =>
        applyDraftRestoreRef.current(emptyRentalBooking(), null)
      );
    };

    const onVisibility = () => {
      if (document.visibilityState !== "visible") return;
      setBooking((prev) => {
        if (!bookingDraftNeedsRestore(prev, rentalId)) return prev;
        const merged = restoreRentalBookingDraft(rentalId, prev, initialBookingFromUrlRef.current);
        return bookingFieldsEqual(prev, merged) ? prev : merged;
      });
    };

    const onPageHide = () => {
      writeRentalBookingDraft(rentalId, bookingRef.current);
    };

    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("popstate", onPopState);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);

    return () => {
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("popstate", onPopState);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [rentalId]);

  useEffect(() => {
    if (!rentalId || !hasRentalBookingSchedule(booking)) return;
    if (typeof window === "undefined") return;
    const current = new URLSearchParams(window.location.search);
    const missingSchedule =
      !current.get("start_date") ||
      !current.get("end_date") ||
      !current.get("pickup_time") ||
      !current.get("dropoff_time");
    if (!missingSchedule) return;
    const href = rentalBookingQueryString(rentalId, booking);
    router.replace(href, { scroll: false });
  }, [
    rentalId,
    booking.start_date,
    booking.end_date,
    booking.pickup_time,
    booking.dropoff_time,
    booking.pickup_location,
    booking.dropoff_location,
    router,
  ]);

  useEffect(() => {
    writeRentalBookingDraft(rentalId, booking);
  }, [
    rentalId,
    booking.start_date,
    booking.end_date,
    booking.pickup_time,
    booking.dropoff_time,
    booking.pickup_location,
    booking.dropoff_location,
  ]);

  useEffect(() => {
    if (!rental) return;
    const preferred = getDefaultPickupOption(pickupOptions, pickupFromUrl || booking.pickup_location);
    if (!preferred?.name) return;
    if (booking.pickup_location === preferred.name) {
      if (!booking.pickup_lat && (preferred.latitude || preferred.longitude)) {
        applyPickupOption(preferred);
      }
      return;
    }
    applyPickupOption(preferred);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rental?.id, pickupOptions, pickupFromUrl]);

  useEffect(() => {
    if (!rentalId) return;
    let cancelled = false;
    (async () => {
      setLoadingPickupLocations(true);
      try {
        const rows = await getRentalPickupLocationsClient(rentalId);
        if (!cancelled && rows.length) {
          setPickupLocationRows((prev) => mergePickupLocationRows(prev, rows));
        }
      } catch (_) {
        // keep SSR / rental-details rows
      } finally {
        if (!cancelled) setLoadingPickupLocations(false);
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
      if (!initialRental) setLoading(true);
      try {
        const res = await getRentalDetailsClient(rentalId);
        if (!cancelled) {
          const next = res?.data || null;
          if (next) {
            setRental((prev) => {
              const mergedLocations = mergePickupLocationRows(
                extractRentalPickupRows(prev),
                extractRentalPickupRows(next),
                initialPickupLocations
              );
              return {
                ...next,
                pickup_locations: mergedLocations.length
                  ? mergedLocations
                  : next.pickup_locations,
              };
            });
            const fromDetails = extractRentalPickupRows(next);
            if (fromDetails.length) {
              setPickupLocationRows((prev) =>
                mergePickupLocationRows(prev, fromDetails, initialPickupLocations)
              );
            }
          } else if (!initialRental) {
            setRental(null);
          }
        }
      } catch (_) {
        if (!cancelled && !initialRental) setRental(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [rentalId, initialRental, initialPickupLocations]);

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

  const overlapsWindow = (windowStartISO, windowEndISO, itemStartISO, itemEndISO) => {
    const ws = new Date(windowStartISO);
    const we = new Date(windowEndISO);
    const s = new Date(itemStartISO);
    const e = new Date(itemEndISO);
    if (![ws, we, s, e].every((d) => Number.isFinite(d.getTime()))) return false;
    return s < we && e > ws;
  };

  const countWindowBookingOverlaps = (windowStartISO, windowEndISO) => {
    let count = 0;
    for (const b of unavailable.bookings || []) {
      if (
        b?.start_datetime &&
        b?.end_datetime &&
        overlapsWindow(windowStartISO, windowEndISO, b.start_datetime, b.end_datetime)
      ) {
        count += 1;
      }
    }
    return count;
  };

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

    if (eligibleUnits <= 1) {
      for (const b of unavailable.bookings || []) {
        if (b?.start_datetime && b?.end_datetime && overlaps(b.start_datetime, b.end_datetime)) {
          return true;
        }
      }
    }

    for (const r of unavailable.blocked || []) {
      if (r?.start_datetime && r?.end_datetime && overlaps(r.start_datetime, r.end_datetime)) return true;
    }
    return false;
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

    for (const r of unavailable.blocked || []) {
      if (!r?.start_datetime || !r?.end_datetime) continue;
      if (!blockedAppliesToWindow(r, windowStartISO, windowEndISO)) continue;
      if (overlapsWindow(windowStartISO, windowEndISO, r.start_datetime, r.end_datetime)) return true;
    }

    return countWindowBookingOverlaps(windowStartISO, windowEndISO) >= eligibleUnits;
  };

  const isStartDateSelectable = (dateObj) => {
    if (!(dateObj instanceof Date) || !Number.isFinite(dateObj.getTime())) return true;
    const ymd = formatDateYmd(dateObj);
    const endYmd = String(booking.end_date || "").trim();
    if (endYmd && ymd > endYmd) return false;
    const pu = String(booking.pickup_time || "").trim();
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
    const startYmd = String(booking.start_date || "").trim();
    if (startYmd && ymd < startYmd) return false;
    const du = String(booking.dropoff_time || "").trim();
    const pu = String(booking.pickup_time || "").trim();
    if (timeRe.test(du) && startYmd && timeRe.test(pu)) {
      const startISO = `${startYmd}T${pu}:00`;
      const endISO = `${ymd}T${du}:00`;
      if (new Date(endISO) > new Date(startISO)) {
        return !isWindowUnavailable(startISO, endISO);
      }
      return false;
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
    setBooking((p) => {
      const next = { ...p, [k]: v };
      const startYmd = String(next.start_date || "").trim();
      const endYmd = String(next.end_date || "").trim();

      if (k === "start_date" && startYmd && endYmd && endYmd < startYmd) {
        next.end_date = startYmd;
      }

      if (k === "end_date" && startYmd && endYmd && endYmd < startYmd) {
        return p;
      }

      return next;
    });
    if (k === "end_date") {
      const startYmd = String(booking.start_date || "").trim();
      const endYmd = String(v || "").trim();
      if (startYmd && endYmd && endYmd < startYmd) {
        setError("End date cannot be before start date.");
        return;
      }
    }
    setError("");
    setAvail(null);
  };

  const selectPickupLocation = (option) => {
    applyPickupOption(option);
  };

  const timeRe = /^([01]?\d|2[0-3]):[0-5]\d$/;

  const validateBooking = () => {
    const b = effectiveBooking;
    const required = ["start_date", "end_date", "pickup_time", "dropoff_time"];
    for (const k of required) {
      if (!String(b[k] || "").trim()) return `Please fill ${k.replaceAll("_", " ")}.`;
    }
    if (!timeRe.test(String(b.pickup_time || "").trim())) {
      return "Pickup time must be in HH:MM format (24h).";
    }
    if (!timeRe.test(String(b.dropoff_time || "").trim())) {
      return "Dropoff time must be in HH:MM format (24h).";
    }
    const startYmd = String(b.start_date || "").trim();
    const endYmd = String(b.end_date || "").trim();
    if (endYmd < startYmd) {
      return "End date cannot be before start date.";
    }
    const startDt = new Date(`${startYmd}T${String(b.pickup_time).trim()}:00`);
    const endDt = new Date(`${endYmd}T${String(b.dropoff_time).trim()}:00`);
    if (!Number.isFinite(startDt.getTime()) || !Number.isFinite(endDt.getTime()) || endDt <= startDt) {
      return endYmd === startYmd
        ? "Dropoff time must be after pickup time on the same day."
        : "End date and time must be after start date and time.";
    }
    const pu = String(b.pickup_location || "").trim();
    const du = String(b.dropoff_location || "").trim();
    if (pickupOptions.length > 1 && !pu) return "Please select your preferred pickup location.";
    if (!pu) return "Pickup location is required.";
    if (!du) return "Dropoff location is required.";
    if (pu.length > 255 || du.length > 255) {
      return "Pickup and dropoff locations must be at most 255 characters each.";
    }
    const hours = computeBillingHoursCeil(b);
    if (minHoursViolated(hours)) {
      return `Minimum rental length is ${effectiveMinBookingHours} hours (selected: ${hours}). Please extend your drop-off time.`;
    }
    return "";
  };

  useEffect(() => {
    const msg = validateBooking();
    if (msg) {
      setAvail(null);
      setError(msg);
      setChecking(false);
      return;
    }
    if (!rentalId) return;

    const requestId = ++availabilityRequestRef.current;
    const timer = window.setTimeout(() => {
      const run = async () => {
        setChecking(true);
        setError("");
        try {
          const res = await checkRentalAvailability(rentalId, effectiveBooking);
          if (requestId !== availabilityRequestRef.current) return;
          const d = parseAvailabilityPayload(res);
          setAvail(d);
          if (
            d?.minimum_hours_not_met &&
            !enforceExtendedMinHours &&
            pricingBasis !== "day" &&
            pricingBasis !== "hybrid" &&
            computeBillingHoursCeil(effectiveBooking) >= RENTAL_MIN_BILLING_HOURS
          ) {
            setAvail({
              ...d,
              is_available: true,
              available_units: Math.max(1, Number(d?.eligible_units ?? 1)),
              minimum_hours_not_met: false,
              min_booking_hours: RENTAL_MIN_BILLING_HOURS,
            });
            setError("");
          } else if (availabilityMinHoursBlocked(d)) {
            const mh = d?.min_booking_hours ?? effectiveMinBookingHours;
            setError(
              `Minimum rental length is ${mh} hours. Please extend your drop-off time (or adjust dates).`
            );
          } else if (isAvailabilityClosed(d)) {
            const total = Number(d?.eligible_units ?? 1);
            setError(
              total > 1
                ? `All ${total} units are booked for the selected date/time. Please choose another slot.`
                : "This item is already booked for the selected date/time. Please choose another slot."
            );
          } else {
            setError("");
          }
        } catch (e) {
          if (requestId !== availabilityRequestRef.current) return;
          setAvail(null);
          setError(e?.response?.data?.message || "Failed to check availability.");
        } finally {
          if (requestId === availabilityRequestRef.current) {
            setChecking(false);
          }
        }
      };
      void run();
    }, 350);

    return () => {
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    rentalId,
    effectiveBooking.start_date,
    effectiveBooking.end_date,
    effectiveBooking.pickup_time,
    effectiveBooking.dropoff_time,
    effectiveBooking.pickup_location,
    effectiveBooking.dropoff_location,
  ]);

  const checkoutHref = useMemo(() => {
    if (!rentalId) return "";
    const b = effectiveBooking;
    if (!b.start_date || !b.end_date || !b.pickup_time || !b.dropoff_time) return "";
    if (!b.pickup_location || !b.dropoff_location) return "";
    const checkoutParams = new URLSearchParams({
      rental_item_id: String(rentalId),
      rental_item_unit_id: String(0),
      pickup_location: b.pickup_location,
      dropoff_location: b.dropoff_location,
      start_date: b.start_date,
      end_date: b.end_date,
      pickup_time: b.pickup_time,
      dropoff_time: b.dropoff_time,
    });
    return `/checkout/rentals?${checkoutParams.toString()}`;
  }, [rentalId, effectiveBooking]);

  const slotUnavailableMessage = () => {
    const total = Number(avail?.eligible_units ?? 1);
    return total > 1
      ? `All ${total} units are booked for the selected date/time. Please choose another slot.`
      : "This item is already booked for the selected date/time. Please choose another slot.";
  };

  const slotIsBookable = (payload) => {
    if (!payload) return false;
    if (availabilityMinHoursBlocked(payload)) return false;
    if (isAvailabilityOpen(payload)) return true;
    if (
      !enforceExtendedMinHours &&
      payload.minimum_hours_not_met &&
      pricingBasis !== "hybrid" &&
      computeBillingHoursCeil(effectiveBooking) >= RENTAL_MIN_BILLING_HOURS
    ) {
      return true;
    }
    return false;
  };

  const canContinueToCheckout = slotIsBookable(avail) && Boolean(checkoutHref);

  const onContinue = () => {
    const msg = validateBooking();
    if (msg) {
      setError(msg);
      return;
    }
    if (checking) {
      setError("Still checking availability. Please wait a moment.");
      return;
    }
    if (availabilityMinHoursBlocked(avail)) {
      const mh = avail?.min_booking_hours ?? effectiveMinBookingHours;
      setError(
        `Minimum rental length is ${mh} hours. Please extend your drop-off time (or adjust dates).`
      );
      return;
    }
    if (!canContinueToCheckout) {
      setError(avail ? slotUnavailableMessage() : "Waiting for availability check. Please wait a moment.");
      return;
    }
    setIsContinuing(true);
    writeRentalBookingDraft(rentalId, effectiveBooking);
    const bookingUrl = rentalBookingQueryString(rentalId, effectiveBooking);
    if (typeof window !== "undefined" && bookingUrl) {
      window.history.replaceState(null, "", bookingUrl);
      window.location.assign(checkoutHref);
      return;
    }
    router.push(checkoutHref);
  };

  const continueDisabled = checking || isContinuing || !canContinueToCheckout;

  const handleContinueClick = () => {
    onContinue();
  };
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
    return <BookingPageSkeleton />;
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

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-6 mt-4 lg:mt-8">
          <div className="min-w-0 max-w-full">
            <div className="bg-white rounded-lg shadow border overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200">
                <h2 className="text-base font-medium text-gray-800">Select dates &amp; times</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Choose your rental dates and times. We will check availability automatically.
                  {windowPricing.basis === "day"
                    ? " Billed per day."
                    : windowPricing.basis === "hybrid"
                      ? " Billed per day for full 24-hour blocks, plus extra hours at the hourly rate."
                      : windowPricing.basis === "hour" || catalogBasis === "hybrid" || catalogBasis === "hour"
                        ? requiresExtendedMinBookingHours(rental)
                          ? ` Minimum rental: ${minBookingHours} hours. Under 24 hours billed hourly; longer rentals use daily rate plus extra hours at the hourly rate.`
                          : " Any rental duration accepted. Under 24 hours billed hourly; longer rentals use daily rate plus extra hours at the hourly rate."
                        : " Billed per day."}
                </p>
              </div>
              <div className="p-4 sm:p-6 space-y-5">
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">
                    Vehicle location {pickupOptions.length > 1 ? "*" : ""}
                  </label>
                  {loading || loadingPickupLocations ? (
                    <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 flex items-center gap-2.5 text-sm text-gray-500">
                      <InlineSpinner />
                      Loading pickup locations…
                    </div>
                  ) : (
                    <PickupLocationPicker
                      options={pickupOptions}
                      selectedName={booking.pickup_location || selectedPickupOption?.name || ""}
                      onSelect={selectPickupLocation}
                      placeholder="Select pickup location"
                    />
                  )}
                  {pickupOptions.length > 1 && !booking.pickup_location ? (
                    <p className="text-xs text-amber-600 mt-1.5">
                      Please select where you want to pick up the vehicle.
                    </p>
                  ) : null}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Start date *</label>
                    <div className="mt-1.5">
                      <DatePicker
                        key={`start-${booking.start_date || "empty"}`}
                        selected={parseYmdToDate(booking.start_date)}
                        onChange={(d) => updateBooking("start_date", formatDateYmd(d))}
                        filterDate={isStartDateSelectable}
                        minDate={new Date()}
                        maxDate={parseYmdToDate(booking.end_date) || undefined}
                        placeholderText="Select start date"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">End date *</label>
                    <div className="mt-1.5">
                      <DatePicker
                        key={`end-${booking.end_date || "empty"}`}
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
                  <div className="text-sm text-primary-800 bg-primary-50 border border-primary-100 rounded-xl px-3 py-2.5 flex items-center gap-2.5">
                    <InlineSpinner className="h-4 w-4 text-primary-600" />
                    Checking availability and updating your price estimate…
                  </div>
                ) : null}

                {isAvailabilityClosed(avail) ? (
                  <div className="text-sm text-red-800 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 font-medium">
                    {Number(avail?.eligible_units ?? 1) > 1
                      ? `All ${avail.eligible_units} units are booked for this time slot.`
                      : "This item is sold out for the selected time slot."}
                  </div>
                ) : null}

                {slotIsBookable(avail) ? (
                  <div className="text-sm text-green-800 bg-green-50 border border-green-100 rounded-xl px-3 py-2.5">
                    {Number(avail?.eligible_units ?? 1) > 1 ? (
                      <>
                        {avail.available_units} of {avail.eligible_units} units available — you can continue to
                        payment.
                      </>
                    ) : (
                      <>This slot is available. You can continue to payment.</>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="hidden min-w-0 lg:block lg:shrink-0">
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
                  {(windowPricing.basis === "day"
                    ? windowPricing.rate > 0
                    : windowPricing.basis === "hour"
                      ? windowPricing.rate > 0
                      : basePerHour > 0 || basePerDay > 0) &&
                  !hasRentalBookingSchedule(booking) ? (
                    <div className="flex items-center gap-2">
                      <i className="fi fi-rr-indian-rupee-sign text-primary-500 text-sm shrink-0" />
                      <span className="text-gray-700">
                        {windowPricing.basis === "day" ? (
                          <>From ₹{money(displayRateWithAdmin)} / day</>
                        ) : windowPricing.basis === "hour" ? (
                          <>From ₹{money(displayRateWithAdmin)} / hour</>
                        ) : windowPricing.basis === "hybrid" ? (
                          <>
                            From ₹{money(displayRateWithAdmin)} / day + ₹{money(displayHourlyRateWithAdmin)} / hr
                          </>
                        ) : catalogBasis === "hybrid" ? (
                          <>
                            From ₹{money(applyRentalAdminChargeOnly(basePerHour, pricing))} / hr or ₹
                            {money(rentalDailyRateWithAdmin(pricing))} / day
                          </>
                        ) : (
                          <>
                            From ₹{money(displayRateWithAdmin)}{" "}
                            {catalogBasis === "day" ? "/ day" : "/ hour"}
                          </>
                        )}
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow border overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-3">
                  <h3 className="text-base font-semibold text-gray-900">Price estimate</h3>
                  {checking ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-600">
                      <InlineSpinner className="h-3.5 w-3.5" />
                      Updating
                    </span>
                  ) : null}
                </div>
                <div
                  className={`px-4 py-3 space-y-2 text-sm border-b border-gray-100 transition-opacity duration-200 ${
                    checking ? "opacity-60" : "opacity-100"
                  }`}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-1">
                    Rental charges
                  </p>
                  {windowPricing.basis === "hybrid" ? (
                    <>
                      {windowPricing.units > 0 ? (
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-gray-600">
                            {windowPricing.units} day{windowPricing.units === 1 ? "" : "s"} × ₹{money(displayRateWithAdmin)}
                          </span>
                          <span className="font-medium text-gray-900">
                            ₹{money(windowPricing.units * displayRateWithAdmin)}
                          </span>
                        </div>
                      ) : null}
                      {windowPricing.extraHours > 0 ? (
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-gray-600">
                            {windowPricing.extraHours} hr × ₹{money(displayHourlyRateWithAdmin)}
                          </span>
                          <span className="font-medium text-gray-900">
                            ₹{money(windowPricing.extraHours * displayHourlyRateWithAdmin)}
                          </span>
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-gray-600">
                        {windowPricing.basis === "day"
                          ? `${windowPricing.units || 0} day(s) × ₹${money(displayRateWithAdmin)}`
                          : windowPricing.basis === "hour"
                            ? `${windowPricing.units || 0} hr × ₹${money(displayRateWithAdmin)}`
                            : "Select dates to see price"}
                      </span>
                      <span className="font-medium text-gray-900">₹{money(hourlySubtotalWithAdminForDisplay)}</span>
                    </div>
                  )}
                  {discountAmountForDisplay > 0 ? (
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-gray-600">
                        Discount
                        {pricing.discount_type === "percent" &&
                        pricing.discount_value != null &&
                        String(pricing.discount_value) !== "" ? (
                          <span className="text-gray-400"> ({String(pricing.discount_value)}%)</span>
                        ) : null}
                      </span>
                      <span className="font-medium text-green-700">−₹{money(discountAmountForDisplay)}</span>
                    </div>
                  ) : null}
                  {gstAmount > 0 ? (
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-gray-600">GST ({money(gstPercent)}%)</span>
                      <span className="font-medium text-gray-900">₹{money(gstAmount)}</span>
                    </div>
                  ) : null}
                  {convenienceFeeAmount > 0 ? (
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-gray-600">Convenience fee ({money(convenienceFeePercent)}%)</span>
                      <span className="font-medium text-gray-900">₹{money(convenienceFeeAmount)}</span>
                    </div>
                  ) : null}
                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-100">
                    <span className="font-semibold text-gray-900">Rental total</span>
                    <span className="font-semibold text-gray-900">₹{money(feesBeforeDeposit)}</span>
                  </div>
                </div>

                {depositAmount > 0 ? (
                  <div
                    className={`px-4 py-3 border-b border-gray-100 space-y-1 transition-opacity duration-200 ${
                      checking ? "opacity-60" : "opacity-100"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-gray-600">Refundable deposit</span>
                      <span className="font-medium text-gray-900">₹{money(depositAmount)}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-snug">
                      Returned when the vehicle is returned in good condition.
                    </p>
                  </div>
                ) : null}

                <div className="px-4 py-4 space-y-3">
                  <div
                    className={`flex items-center justify-between gap-3 transition-opacity duration-200 ${
                      checking ? "opacity-60" : "opacity-100"
                    }`}
                  >
                    <span className="text-sm font-semibold text-gray-900">Estimated total</span>
                    <span className="text-xl font-bold text-primary-600">
                      ₹{money(totalCostIncludingDeposit)}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-snug">
                    Includes rental, taxes{depositAmount > 0 ? ", and refundable deposit" : ""}.
                  </p>
                {error ? <p className="text-sm text-red-600 mb-3">{error}</p> : null}
                {!error && checking ? (
                  <p className="text-sm text-primary-700 mb-3 flex items-center gap-2">
                    <InlineSpinner className="h-3.5 w-3.5" />
                    Verifying your selected slot…
                  </p>
                ) : null}
                {!error && !checking && avail && !isAvailabilityOpen(avail) ? (
                  <p className="text-sm text-red-600 mb-3">{slotUnavailableMessage()}</p>
                ) : null}
                <Button
                  onClick={handleContinueClick}
                  size="lg"
                  className="w-full"
                  disabled={continueDisabled}
                  isLoading={isContinuing}
                >
                  {isContinuing ? "Redirecting to payment…" : "Continue to payment"}
                </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:hidden fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <div>
              <p className="text-xs text-gray-500">Estimated total</p>
              <p
                className={`text-lg font-bold text-primary-600 transition-opacity duration-200 ${
                  checking ? "opacity-60" : "opacity-100"
                }`}
              >
                ₹{money(totalCostIncludingDeposit)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Rental</p>
              <p
                className={`text-base font-semibold text-gray-900 transition-opacity duration-200 ${
                  checking ? "opacity-60" : "opacity-100"
                }`}
              >
                ₹{money(feesBeforeDeposit)}
              </p>
            </div>
          </div>
          <div className="px-4 pb-4">
            {error ? <p className="text-sm text-red-600 mb-2">{error}</p> : null}
            {!error && checking ? (
              <p className="text-xs text-primary-700 mb-2 flex items-center gap-1.5">
                <InlineSpinner className="h-3.5 w-3.5" />
                Checking availability…
              </p>
            ) : null}
            <Button
              onClick={handleContinueClick}
              size="lg"
              className="w-full"
              disabled={continueDisabled}
              isLoading={isContinuing}
            >
              {isContinuing ? "Redirecting to payment…" : "Continue to payment"}
            </Button>
          </div>
        </div>

        <div className="lg:hidden h-40" aria-hidden />
      </div>
    </div>
  );
}
