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

/** Display basis for listing cards — all rentals with both rates use hybrid messaging. */
export function rentalListingPricingBasis(pricing) {
  const basis = rentalCatalogPricingBasis(pricing);
  if (basis === "hybrid" || (Number(pricing?.price_per_hour || 0) > 0 && Number(pricing?.price_per_day || 0) > 0)) {
    return "hybrid";
  }
  return basis;
}

/**
 * @param {Record<string, unknown>} pricing
 * @param {Record<string, unknown> | null | undefined} [quote]
 * @returns {'hour' | 'day' | 'hybrid' | null}
 */
export function rentalPricingBasis(pricing, quote) {
  const fromQuote = quote?.pricing_basis || quote?.effective_rates?.pricing_basis;
  if (fromQuote === "day" || fromQuote === "hour" || fromQuote === "hybrid") return fromQuote;
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

/** Full 24h blocks + remainder hours when both daily and hourly rates apply. */
export function computeBillingHybridParts(hours) {
  const totalHours = Math.max(0, Math.floor(Number(hours) || 0));
  if (totalHours < 24) {
    return { fullDays: 0, extraHours: totalHours };
  }
  return {
    fullDays: Math.floor(totalHours / 24),
    extraHours: totalHours % 24,
  };
}

function resolveEffectiveHourlyRate({ pricing, startDate, weekdayPrices, fallbackHourly }) {
  let rate = Number(fallbackHourly || 0) || 0;
  if (startDate && Array.isArray(weekdayPrices) && weekdayPrices.length) {
    const dow = new Date(`${startDate}T12:00:00`).getDay();
    const match = weekdayPrices.find((r) => Number(r?.day_of_week) === dow);
    const v = match?.price_per_hour;
    if (v !== undefined && v !== null && String(v) !== "") {
      const n = Number(v);
      if (Number.isFinite(n) && n > 0) rate = n;
    }
  }
  return rate;
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
 * Resolve hour vs day vs hybrid for a specific booking window (matches API RentalPricingTotals).
 * Hybrid: full 24h blocks at daily rate + remainder hours at hourly rate.
 * @returns {{
 *   basis: 'hour'|'day'|'hybrid'|null,
 *   units: number,
 *   extraHours?: number,
 *   rate: number,
 *   hourlyRate?: number,
 *   subtotal: number
 * }}
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
  const hourly = Number(p.price_per_hour || 0) || 0;
  const daily = Number(p.price_per_day || 0) || 0;

  const quoteBasis = quote?.pricing_basis || quote?.effective_rates?.pricing_basis;

  if (hours <= 0) {
    return { basis: null, units: 0, rate: 0, subtotal: 0 };
  }

  if (hours < 24 && hourly > 0) {
    const rate = resolveEffectiveHourlyRate({
      pricing: p,
      startDate,
      weekdayPrices,
      fallbackHourly: hourly,
    });
    if (quoteBasis === "hour") {
      const quoteRate = Number(quote?.effective_rates?.price_per_hour ?? rate) || rate;
      const quoteUnits = Number(quote?.billing_hours ?? hours) || hours;
      const subtotal =
        Number(quote?.estimated_rental_subtotal) > 0
          ? Number(quote.estimated_rental_subtotal)
          : quoteUnits * quoteRate;
      return { basis: "hour", units: quoteUnits, rate: quoteRate, subtotal: round2(subtotal) };
    }
    return { basis: "hour", units: hours, rate, subtotal: round2(hours * rate) };
  }

  if (hours >= 24 && daily > 0 && hourly > 0) {
    const { fullDays, extraHours } = computeBillingHybridParts(hours);
    const dailyRate = daily;
    const hourlyRate = resolveEffectiveHourlyRate({
      pricing: p,
      startDate,
      weekdayPrices,
      fallbackHourly: hourly,
    });

    if (quoteBasis === "hybrid") {
      const quoteDailyRate = Number(quote?.effective_rates?.price_per_day ?? dailyRate) || dailyRate;
      const quoteHourlyRate = Number(quote?.effective_rates?.price_per_hour ?? hourlyRate) || hourlyRate;
      const quoteDays = Number(quote?.billing_days ?? fullDays) || fullDays;
      const quoteExtraHours = Number(quote?.billing_extra_hours ?? extraHours) || 0;
      const subtotal =
        Number(quote?.estimated_rental_subtotal) > 0
          ? Number(quote.estimated_rental_subtotal)
          : quoteDays * quoteDailyRate + quoteExtraHours * quoteHourlyRate;
      return {
        basis: "hybrid",
        units: quoteDays,
        extraHours: quoteExtraHours,
        rate: quoteDailyRate,
        hourlyRate: quoteHourlyRate,
        subtotal: round2(subtotal),
      };
    }

    const subtotal = fullDays * dailyRate + extraHours * hourlyRate;
    return {
      basis: "hybrid",
      units: fullDays,
      extraHours,
      rate: dailyRate,
      hourlyRate,
      subtotal: round2(subtotal),
    };
  }

  if (daily > 0) {
    const days = computeBillingDaysCeilFromParts(startDate, endDate, pickupTime, dropoffTime);
    const rate = daily;
    if (quoteBasis === "day") {
      const quoteRate = Number(quote?.effective_rates?.price_per_day ?? rate) || rate;
      const quoteUnits = Number(quote?.billing_days ?? days) || days;
      const subtotal =
        Number(quote?.estimated_rental_subtotal) > 0
          ? Number(quote.estimated_rental_subtotal)
          : quoteUnits * quoteRate;
      return { basis: "day", units: quoteUnits, rate: quoteRate, subtotal: round2(subtotal) };
    }
    return { basis: "day", units: days, rate, subtotal: round2(days * rate) };
  }

  if (hourly > 0) {
    const rate = resolveEffectiveHourlyRate({
      pricing: p,
      startDate,
      weekdayPrices,
      fallbackHourly: hourly,
    });
    return { basis: "hour", units: hours, rate, subtotal: round2(hours * rate) };
  }

  return { basis: null, units: 0, rate: 0, subtotal: 0 };
}

/**
 * Gross rent line-item subtotal for booking summary display (before discount).
 */
export function rentalWindowPeriodSubtotalForDisplay(windowPricing, pricing) {
  const wp = windowPricing || {};
  const { basis, units = 0, extraHours = 0, rate = 0, hourlyRate = 0 } = wp;
  if (!basis) return 0;
  if (basis === "hybrid") {
    const dayAmt = units * rentalDailyRateWithAdmin({ ...(pricing || {}), price_per_day: rate });
    const hourAmt = extraHours * applyRentalAdminChargeOnly(hourlyRate, pricing);
    return round2(dayAmt + hourAmt);
  }
  if (units <= 0) return 0;
  if (basis === "day") {
    return round2(units * rentalDailyRateWithAdmin({ ...(pricing || {}), price_per_day: rate }));
  }
  return round2(units * applyRentalAdminChargeOnly(rate, pricing));
}

/**
 * Late return charge preview: 1 hour grace after scheduled drop-off, then hourly billing.
 * @returns {{ lateReturnHours: number, lateReturnSubtotalGross: number, lateReturnTotal: number } | null}
 */
export function computeRentalLateReturnCharge({
  scheduledEnd,
  actualReturn,
  pricing,
}) {
  if (!scheduledEnd || !actualReturn) return null;
  const end = new Date(scheduledEnd);
  const returned = new Date(actualReturn);
  if (!Number.isFinite(end.getTime()) || !Number.isFinite(returned.getTime())) return null;
  if (returned.getTime() <= end.getTime()) return null;

  const graceEnd = new Date(end.getTime() + 60 * 60 * 1000);
  if (returned.getTime() <= graceEnd.getTime()) return null;

  const hourly = Number(pricing?.price_per_hour || 0) || 0;
  if (hourly <= 0) return null;

  const lateMs = returned.getTime() - graceEnd.getTime();
  const lateHours = Math.max(1, Math.ceil(lateMs / (1000 * 60 * 60)));
  const subtotalGross = round2(lateHours * hourly);
  const breakdown = computeRentalBookingMonetaryBreakdown(subtotalGross, pricing);

  return {
    lateReturnHours: lateHours,
    lateReturnSubtotalGross: subtotalGross,
    lateReturnTotal: breakdown.feesBeforeDeposit,
  };
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
