/**
 * GST is fixed at 18% on (discounted rent + admin). Convenience fee is fixed at 2% after GST.
 * Aligned with API `RentalPricingTotals`.
 */
export const RENTAL_CHECKOUT_GST_PERCENT = 18;

export const RENTAL_CHECKOUT_CONVENIENCE_FEE_PERCENT = 2;

function round2(n) {
  return Math.round((Number(n) || 0) * 100) / 100;
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
  const p = pricing || {};
  let admin = 0;
  const achType = p.admin_charge_type || null;
  const achValRaw = p.admin_charge_value;
  const achVal =
    achValRaw === "" || achValRaw === null || achValRaw === undefined ? null : Number(achValRaw);
  if ((achType === "flat" || achType === "percent") && achVal != null && Number.isFinite(achVal)) {
    admin =
      achType === "percent"
        ? round2((rentNet * Math.min(achVal, 100)) / 100)
        : round2(achVal);
  }
  const gstPct = RENTAL_CHECKOUT_GST_PERCENT;
  const gstBase = round2(rentNet + admin);
  const gst = round2((gstBase * gstPct) / 100);
  const afterGst = round2(gstBase + gst);
  const convPct = RENTAL_CHECKOUT_CONVENIENCE_FEE_PERCENT;
  const convenienceFee = round2((afterGst * convPct) / 100);
  const feesBeforeDeposit = round2(afterGst + convenienceFee);
  const deposit = round2(Number(p.security_deposit || 0) || 0);
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
