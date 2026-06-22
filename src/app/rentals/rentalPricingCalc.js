/**
 * GST is fixed at 18% on discounted rent. Convenience fee is fixed at 2% after GST.
 * Admin charge is informational only and is not added to ticket/rent totals.
 * Aligned with API `RentalPricingTotals`.
 */
export const RENTAL_CHECKOUT_GST_PERCENT = 18;

export const RENTAL_CHECKOUT_CONVENIENCE_FEE_PERCENT = 2;

function round2(n) {
  return Math.round((Number(n) || 0) * 100) / 100;
}

/**
 * Catalog-level basis (no dates selected yet).
 * @param {Record<string, unknown>} pricing
 * @returns {'hour' | 'day' | 'hybrid' | null}
 */
export function rentalCatalogPricingBasis(pricing) {
  const p = pricing || {};
  const hourly = Number(p.price_per_hour || 0) || 0;
  const daily = Number(p.price_per_day || 0) || 0;
  if (hourly > 0 && daily > 0) return "hybrid";
  if (hourly > 0) return "hour";
  if (daily > 0) return "day";
  return null;
}

/**
 * @param {Record<string, unknown>} pricing
 * @param {Record<string, unknown> | null | undefined} [quote]
 * @returns {'hour' | 'day' | 'hybrid' | null}
 */
export function rentalPricingBasis(pricing, quote) {
  const fromQuote = quote?.pricing_basis || quote?.effective_rates?.pricing_basis;
  if (fromQuote === "day" || fromQuote === "hour") return fromQuote;
  return rentalCatalogPricingBasis(pricing);
}

export function computeBillingHoursCeilFromParts(startDate, endDate, pickupTime, dropoffTime) {
  if (!startDate || !endDate || !pickupTime || !dropoffTime) return 0;
  const start = new Date(`${startDate}T${pickupTime}:00`);
  const end = new Date(`${endDate}T${dropoffTime}:00`);
  const ms = end.getTime() - start.getTime();
  if (!Number.isFinite(ms) || ms <= 0) return 0;
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60)));
}

export function computeBillingDaysCeilFromParts(startDate, endDate, pickupTime, dropoffTime) {
  if (!startDate || !endDate || !pickupTime || !dropoffTime) return 0;
  const start = new Date(`${startDate}T${pickupTime}:00`);
  const end = new Date(`${endDate}T${dropoffTime}:00`);
  const ms = end.getTime() - start.getTime();
  if (!Number.isFinite(ms) || ms <= 0) return 0;
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

/**
 * @param {Record<string, unknown>} pricing
 * @returns {number}
 */
export function rentalDailyRateWithAdmin(pricing) {
  const basePerDay = Number((pricing || {}).price_per_day || 0) || 0;
  return applyRentalAdminChargeOnly(basePerDay, pricing);
}

/**
 * Display rate and unit suffix for listing cards.
 * @param {Record<string, unknown>} pricing
 * @param {{ preferDay?: boolean }} [opts]
 * @returns {{ amount: number | null, unit: string, hybrid?: boolean, amountDay?: number | null, unitDay?: string }}
 */
export function rentalDisplayRate(pricing, opts = {}) {
  const preferDay = Boolean(opts.preferDay);
  const basis = rentalCatalogPricingBasis(pricing);
  const p = pricing || {};

  if (preferDay) {
    const daily = Number(p.price_per_day ?? 0);
    if (Number.isFinite(daily) && daily > 0) {
      return {
        amount: rentalDailyRateWithAdmin(pricing),
        unit: "/ day",
        hybrid: false,
      };
    }
  }

  if (basis === "hybrid") {
    const hourly = Number(p.price_per_hour ?? 0);
    const daily = Number(p.price_per_day ?? 0);
    return {
      amount: Number.isFinite(hourly) && hourly > 0 ? rentalHourlyRateWithAdmin(pricing) : null,
      amountDay: Number.isFinite(daily) && daily > 0 ? rentalDailyRateWithAdmin(pricing) : null,
      unit: "/ hour",
      unitDay: "/ day",
      hybrid: true,
    };
  }
  if (basis === "day") {
    const amount = Number(p.price_per_day ?? 0);
    return {
      amount: Number.isFinite(amount) && amount > 0 ? rentalDailyRateWithAdmin(pricing) : null,
      unit: "/ day",
      hybrid: false,
    };
  }
  const amount = Number(p.price_per_hour ?? 0);
  return {
    amount: Number.isFinite(amount) && amount > 0 ? rentalHourlyRateWithAdmin(pricing) : null,
    unit: "/ hour",
    hybrid: false,
  };
}

/**
 * Resolve hour vs day for a specific booking window (matches API RentalPricingTotals).
 * @returns {{ basis: 'hour'|'day'|null, units: number, rate: number, subtotal: number }}
 */
export function resolveRentalWindowPricing({
  pricing,
  startDate,
  endDate,
  pickupTime,
  dropoffTime,
  weekdayPrices = [],
  quote = null,
}) {
  const p = pricing || {};
  const hours = computeBillingHoursCeilFromParts(startDate, endDate, pickupTime, dropoffTime);
  const days = computeBillingDaysCeilFromParts(startDate, endDate, pickupTime, dropoffTime);
  const catalogBasis = rentalCatalogPricingBasis(p);

  const quoteBasis = quote?.pricing_basis || quote?.effective_rates?.pricing_basis;

  // Hybrid rentals: always resolve basis from duration (matches API RentalPricingTotals).
  if (catalogBasis === "hybrid" && hours > 0) {
    const basis = hours < 24 ? "hour" : "day";
    const units = basis === "day" ? days : hours;
    let rate = basis === "day" ? Number(p.price_per_day || 0) || 0 : Number(p.price_per_hour || 0) || 0;
    if (basis === "hour" && startDate && Array.isArray(weekdayPrices) && weekdayPrices.length) {
      const dow = new Date(`${startDate}T12:00:00`).getDay();
      const match = weekdayPrices.find((r) => Number(r?.day_of_week) === dow);
      const v = match?.price_per_hour;
      if (v !== undefined && v !== null && String(v) !== "") {
        const n = Number(v);
        if (Number.isFinite(n) && n > 0) rate = n;
      }
    }
    if (quoteBasis === basis) {
      const quoteRate =
        basis === "day"
          ? Number(quote?.effective_rates?.price_per_day ?? rate) || rate
          : Number(quote?.effective_rates?.price_per_hour ?? rate) || rate;
      if (quoteRate > 0) rate = quoteRate;
      const quoteUnits =
        basis === "day"
          ? Number(quote?.billing_days ?? units) || units
          : Number(quote?.billing_hours ?? units) || units;
      const subtotal =
        quoteBasis === basis && Number(quote?.estimated_rental_subtotal) > 0
          ? Number(quote.estimated_rental_subtotal)
          : quoteUnits * rate;
      return { basis, units: quoteUnits, rate, subtotal: round2(subtotal) };
    }
    return { basis, units, rate, subtotal: round2(units * rate) };
  }

  if (
    (quoteBasis === "hour" || quoteBasis === "day") &&
    hours > 0
  ) {
    const units =
      quoteBasis === "day"
        ? Number(quote?.billing_days ?? days) || days
        : Number(quote?.billing_hours ?? hours) || hours;
    const rate =
      quoteBasis === "day"
        ? Number(quote?.effective_rates?.price_per_day ?? p.price_per_day ?? 0) || 0
        : Number(quote?.effective_rates?.price_per_hour ?? p.price_per_hour ?? 0) || 0;
    const subtotal =
      Number(quote?.estimated_rental_subtotal) > 0
        ? Number(quote.estimated_rental_subtotal)
        : units * rate;
    return { basis: quoteBasis, units, rate, subtotal: round2(subtotal) };
  }

  if (hours <= 0) {
    return { basis: null, units: 0, rate: 0, subtotal: 0 };
  }

  if (catalogBasis === "day") {
    const rate = Number(p.price_per_day || 0) || 0;
    return { basis: "day", units: days, rate, subtotal: round2(days * rate) };
  }

  let rate = Number(p.price_per_hour || 0) || 0;
  if (startDate && Array.isArray(weekdayPrices) && weekdayPrices.length) {
    const dow = new Date(`${startDate}T12:00:00`).getDay();
    const match = weekdayPrices.find((r) => Number(r?.day_of_week) === dow);
    const v = match?.price_per_hour;
    if (v !== undefined && v !== null && String(v) !== "") {
      const n = Number(v);
      if (Number.isFinite(n) && n > 0) rate = n;
    }
  }
  return { basis: "hour", units: hours, rate, subtotal: round2(hours * rate) };
}

/**
 * Returns base amount only; admin charge is not added to the price.
 * @param {number} baseAmount
 * @param {Record<string, unknown>} pricing
 * @returns {number}
 */
export function applyRentalAdminChargeOnly(baseAmount, pricing) {
  return round2(Number(baseAmount || 0) || 0);
}

/**
 * Convenience helper to compute hourly display rate.
 * @param {Record<string, unknown>} pricing
 * @returns {number}
 */
export function rentalHourlyRateWithAdmin(pricing) {
  const p = pricing || {};
  const basePerHour = Number(p.price_per_hour || 0) || 0;
  return applyRentalAdminChargeOnly(basePerHour, p);
}

/**
 * @param {number} grossRentSubtotal — hours × hourly rate (before pricing-rule discount)
 * @param {Record<string, unknown>} pricing
 * @returns {{ gross: number, discountAmount: number, net: number }}
 */
export function splitRentDiscount(grossRentSubtotal, pricing) {
  const gross = round2(Number(grossRentSubtotal || 0) || 0);
  const p = pricing || {};
  const type = p.discount_type || null;
  const raw = p.discount_value;
  if (raw === "" || raw === null || raw === undefined || !type) {
    return { gross, discountAmount: 0, net: gross };
  }
  const v = Number(raw);
  if (!Number.isFinite(v) || v < 0) {
    return { gross, discountAmount: 0, net: gross };
  }
  if (type === "percent") {
    const discountAmount = round2((gross * Math.min(v, 100)) / 100);
    return { gross, discountAmount, net: round2(Math.max(0, gross - discountAmount)) };
  }
  if (type === "flat") {
    const discountAmount = round2(Math.min(gross, v));
    return { gross, discountAmount, net: round2(Math.max(0, gross - discountAmount)) };
  }
  return { gross, discountAmount: 0, net: gross };
}

/**
 * @param {number} rentSubtotalGross — hours × effective hourly rate before discount
 * @param {Record<string, unknown>} pricing — `pricing_rule` / `pricingRule` object (gst_percent on rule is ignored)
 */
export function computeRentalBookingMonetaryBreakdown(rentSubtotalGross, pricing) {
  const split = splitRentDiscount(rentSubtotalGross, pricing);
  const rentNet = split.net;
  const admin = 0;
  const gstPct = RENTAL_CHECKOUT_GST_PERCENT;
  const gstBase = round2(rentNet);
  const gst = round2((gstBase * gstPct) / 100);
  const afterGst = round2(gstBase + gst);
  const convPct = RENTAL_CHECKOUT_CONVENIENCE_FEE_PERCENT;
  const convenienceFee = round2((afterGst * convPct) / 100);
  const feesBeforeDeposit = round2(afterGst + convenienceFee);
  const deposit = round2(Number((pricing || {}).security_deposit || 0) || 0);
  const grandTotal = round2(feesBeforeDeposit + deposit);
  return {
    rentSubtotalGross: split.gross,
    discountAmount: split.discountAmount,
    rentSubtotal: rentNet,
    adminCharge: admin,
    gstPercent: gstPct,
    gstAmount: gst,
    convenienceFeePercent: convPct,
    convenienceFeeAmount: convenienceFee,
    feesBeforeDeposit,
    deposit,
    grandTotal,
  };
}
