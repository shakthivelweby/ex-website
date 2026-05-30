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
 * @param {Record<string, unknown>} pricing
 * @param {Record<string, unknown> | null | undefined} [quote]
 * @returns {'hour' | 'day' | null}
 */
export function rentalPricingBasis(pricing, quote) {
  const fromQuote = quote?.pricing_basis || quote?.effective_rates?.pricing_basis;
  if (fromQuote === "day" || fromQuote === "hour") return fromQuote;
  const p = pricing || {};
  const hourly = Number(p.price_per_hour || 0) || 0;
  if (hourly > 0) return "hour";
  const daily = Number(p.price_per_day || 0) || 0;
  if (daily > 0) return "day";
  return null;
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
 * @returns {{ amount: number | null, unit: string }}
 */
export function rentalDisplayRate(pricing) {
  const basis = rentalPricingBasis(pricing);
  if (basis === "day") {
    const amount = Number((pricing || {}).price_per_day ?? 0);
    return {
      amount: Number.isFinite(amount) && amount > 0 ? rentalDailyRateWithAdmin(pricing) : null,
      unit: "/ day",
    };
  }
  const amount = Number((pricing || {}).price_per_hour ?? 0);
  return {
    amount: Number.isFinite(amount) && amount > 0 ? rentalHourlyRateWithAdmin(pricing) : null,
    unit: "/ hour",
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
