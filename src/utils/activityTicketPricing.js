export function toActivityVisitYmd(date) {
  try {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return "";
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(d);
    const y = parts.find((p) => p.type === "year")?.value;
    const m = parts.find((p) => p.type === "month")?.value;
    const day = parts.find((p) => p.type === "day")?.value;
    return y && m && day ? `${y}-${m}-${day}` : "";
  } catch {
    return "";
  }
}

function isDateInRange(ymd, start, end) {
  if (!ymd || !start || !end) return false;
  return ymd >= start && ymd <= end;
}

export function getSeasonalPriceForTicket(seasonalDates, ticketTypeId, ymd) {
  if (!Array.isArray(seasonalDates) || !ticketTypeId || !ymd) return null;
  const row = seasonalDates.find((r) => {
    const rid =
      r.activity_ticket_type_id ??
      r.activityTicketTypeId ??
      r.ticket_type_id ??
      r.ticketTypeId ??
      r.activity_ticket_type?.id;
    const start = r.start_date ?? r.startDate;
    const end = r.end_date ?? r.endDate;
    return String(rid) === String(ticketTypeId) && isDateInRange(ymd, start, end);
  });
  return row || null;
}

function normalizeSlotTimeKey(timeString) {
  if (timeString == null || timeString === "") return "";
  const s = String(timeString).trim();
  const parts = s.split(":");
  if (parts.length < 2) return s.slice(0, 8);
  const h = String(parseInt(parts[0], 10)).padStart(2, "0");
  const m = String(parseInt(parts[1], 10)).padStart(2, "0");
  return `${h}:${m}`;
}

function mergeSeasonalWithSelectedSlot(seasonalRow, activitySlotObj) {
  if (!seasonalRow || !activitySlotObj) return seasonalRow;
  const merged = { ...seasonalRow };
  const slots = seasonalRow.time_slots || seasonalRow.timeSlots || [];
  if (!Array.isArray(slots) || slots.length === 0) return merged;

  const slotId = activitySlotObj.id != null ? String(activitySlotObj.id) : "";
  const slotStart = activitySlotObj.start_time ?? activitySlotObj.startTime;

  let match = null;
  if (slotId) {
    match = slots.find((ts) => {
      const tsSid = ts.activity_time_slot_id ?? ts.activityTimeSlotId;
      return tsSid != null && String(tsSid) === slotId;
    });
  }
  if (!match && slotStart) {
    const key = normalizeSlotTimeKey(slotStart);
    match = slots.find((ts) => {
      const tsSid = ts.activity_time_slot_id ?? ts.activityTimeSlotId;
      if (tsSid != null) return false;
      return normalizeSlotTimeKey(ts.start_time ?? ts.startTime) === key;
    });
  }

  if (!match) return merged;

  const oFull = match.full_rate ?? match.fullRate;
  const oAdult = match.adult_price ?? match.adultPrice;
  const oChild = match.child_price ?? match.childPrice;

  const hasOverride =
    (oFull !== undefined && oFull !== null && oFull !== "") ||
    (oAdult !== undefined && oAdult !== null && oAdult !== "") ||
    (oChild !== undefined && oChild !== null && oChild !== "");

  if (!hasOverride) return merged;

  if (oFull !== undefined && oFull !== null && oFull !== "") merged.full_rate = oFull;
  if (oAdult !== undefined && oAdult !== null && oAdult !== "") merged.adult_price = oAdult;
  if (oChild !== undefined && oChild !== null && oChild !== "") merged.child_price = oChild;

  return merged;
}

import { applyAdminCharge, applyDiscountOnAmount } from "@/utils/attractionPricing";

export function applyDiscountAndAdminCharge(amountRaw, discountRaw, adminChargeRaw = 0) {
  const amount = Number(amountRaw || 0);
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  const afterAdmin = applyAdminCharge(amount, Number(adminChargeRaw || 0));
  return applyDiscountOnAmount(afterAdmin, Number(discountRaw || 0));
}

function pickNumber(obj, keys, fallback = 0) {
  for (const k of keys) {
    if (obj && obj[k] !== undefined && obj[k] !== null && obj[k] !== "") {
      const n = Number(obj[k]);
      if (Number.isFinite(n)) return n;
    }
  }
  return fallback;
}

function normalizeRateType(rateTypeRaw, { adultPrice, childPrice, fullRate } = {}) {
  const rt = String(rateTypeRaw || "pax").toLowerCase();
  const adult = Number(adultPrice || 0);
  const child = Number(childPrice || 0);
  const full = Number(fullRate || 0);

  if (rt === "full") {
    if (full > 0) return "full";
    if (adult > 0 || child > 0) return "pax";
    return "full";
  }

  if (adult > 0 || child > 0) return "pax";
  return "pax";
}

function getSlotRawById(timeSlotPricing, slotId) {
  if (!slotId) return null;
  const list = Array.isArray(timeSlotPricing) ? timeSlotPricing : [];
  return list.find((s) => String(s.id) === String(slotId)) || null;
}

function resolveSlotTicketUnitPrices(ticket, activityDetails, timeSlotId) {
  if (!ticket || !timeSlotId) return null;
  const slot = getSlotRawById(activityDetails?.time_slot_pricing, timeSlotId);
  if (!slot) return null;

  const ticketPriceRow = Array.isArray(slot.ticket_prices || slot.ticketPrices)
    ? (slot.ticket_prices || slot.ticketPrices).find(
        (p) => String(p.activity_ticket_type_id) === String(ticket.id)
      )
    : null;
  if (!ticketPriceRow) return null;

  const rateType = normalizeRateType(ticketPriceRow.rate_type || ticket.rateType, {
    adultPrice: ticketPriceRow.adult_price,
    childPrice: ticketPriceRow.child_price,
    fullRate: ticketPriceRow.full_rate,
  });

  const pricingFallback = activityDetails?.current_pricing || {};
  const discountPct =
    pickNumber(ticket, ["discount", "discount_percentage", "discountPercent"], 0) ||
    pickNumber(pricingFallback, ["discount", "discount_percentage", "discountPercent"], 0) ||
    pickNumber(ticketPriceRow, ["discount", "discount_percentage", "discountPercent"], 0);

  const adminChargePct =
    pickNumber(ticket, ["admin_charge", "adminCharge", "admin_charge_percentage"], 0) ||
    pickNumber(pricingFallback, ["admin_charge", "adminCharge", "admin_charge_percentage"], 0) ||
    pickNumber(ticketPriceRow, ["admin_charge", "adminCharge", "admin_charge_percentage"], 0);

  const hasBackendAdmin =
    ticketPriceRow?.adult_price_with_admin !== undefined ||
    ticketPriceRow?.full_rate_with_admin !== undefined;

  const adultUnitBase =
    rateType === "full"
      ? Number((hasBackendAdmin ? ticketPriceRow.full_rate_with_admin : ticketPriceRow.full_rate) || 0)
      : Number((hasBackendAdmin ? ticketPriceRow.adult_price_with_admin : ticketPriceRow.adult_price) || 0);
  const childUnitBase = Number(
    (hasBackendAdmin ? ticketPriceRow.child_price_with_admin : ticketPriceRow.child_price) || 0
  );

  const adultUnit = applyDiscountAndAdminCharge(adultUnitBase, discountPct, hasBackendAdmin ? 0 : adminChargePct);
  const childUnit = applyDiscountAndAdminCharge(childUnitBase, discountPct, hasBackendAdmin ? 0 : adminChargePct);

  return {
    rateType,
    adultUnit,
    childUnit,
    adultUnitBase,
    childUnitBase,
    discountPct,
    adminChargePct: hasBackendAdmin ? 0 : adminChargePct,
    catalogAdminChargePct: adminChargePct,
    adminChargePctRaw: pickNumber(
      ticketPriceRow,
      ["admin_charge", "adminCharge", "admin_charge_percentage"],
      adminChargePct
    ),
  };
}

export function resolveActivityTicketUnitPricing({
  ticket,
  activityDetails,
  visitYmd = "",
  timeSlotId = "",
}) {
  if (!ticket) return null;

  const isSlotBased = Boolean(activityDetails?.time_slot_based);
  const seasonalRowRaw = getSeasonalPriceForTicket(
    activityDetails?.seasonal_dates,
    ticket.id,
    visitYmd
  );
  const selectedSlotRaw =
    isSlotBased && timeSlotId ? getSlotRawById(activityDetails?.time_slot_pricing, timeSlotId) : null;
  const seasonalRow =
    seasonalRowRaw && selectedSlotRaw
      ? mergeSeasonalWithSelectedSlot(seasonalRowRaw, selectedSlotRaw)
      : seasonalRowRaw;

  const slotUnit =
    isSlotBased && timeSlotId
      ? resolveSlotTicketUnitPrices(ticket, activityDetails, timeSlotId)
      : null;

  if (slotUnit && seasonalRow) {
    const rateType = normalizeRateType(
      seasonalRow.rate_type || slotUnit.rateType || ticket.rateType,
      {
        adultPrice: seasonalRow.adult_price,
        childPrice: seasonalRow.child_price,
        fullRate: seasonalRow.full_rate,
      }
    );
    const discountPct =
      pickNumber(seasonalRow, ["discount", "discount_percentage", "discountPercent"], null) ??
      slotUnit.discountPct;
    const adminChargePct =
      pickNumber(seasonalRow, ["admin_charge", "adminCharge", "admin_charge_percentage"], null) ??
      slotUnit.catalogAdminChargePct ??
      pickNumber(ticket, ["admin_charge", "adminCharge", "admin_charge_percentage"], 0);

    const adultUnitBase =
      rateType === "full"
        ? Number(seasonalRow.full_rate || 0)
        : Number(seasonalRow.adult_price || 0);
    const childUnitBase = Number(seasonalRow.child_price || 0);
    const adultUnit = applyDiscountAndAdminCharge(adultUnitBase, discountPct, adminChargePct);
    const childUnit = applyDiscountAndAdminCharge(childUnitBase, discountPct, adminChargePct);

    return {
      source: "slot-seasonal",
      rateType,
      adultUnit,
      childUnit,
      adultUnitBase,
      childUnitBase,
      discountPct,
      adminChargePct,
    };
  }

  if (slotUnit) return { source: "slot", ...slotUnit };

  if (seasonalRow) {
    const rateType = normalizeRateType(seasonalRow.rate_type || ticket.rateType, {
      adultPrice: seasonalRow.adult_price,
      childPrice: seasonalRow.child_price,
      fullRate: seasonalRow.full_rate,
    });
    const discountPct =
      pickNumber(seasonalRow, ["discount", "discount_percentage", "discountPercent"], null) ??
      pickNumber(ticket, ["discount", "discount_percentage", "discountPercent"], 0);
    const adminChargePct =
      pickNumber(seasonalRow, ["admin_charge", "adminCharge", "admin_charge_percentage"], null) ??
      pickNumber(ticket, ["admin_charge", "adminCharge", "admin_charge_percentage"], 0);

    const adultUnitBase =
      rateType === "full"
        ? Number(seasonalRow.full_rate || 0)
        : Number(seasonalRow.adult_price || 0);
    const childUnitBase = Number(seasonalRow.child_price || 0);
    const adultUnit = applyDiscountAndAdminCharge(adultUnitBase, discountPct, adminChargePct);
    const childUnit = applyDiscountAndAdminCharge(childUnitBase, discountPct, adminChargePct);

    return {
      source: "seasonal",
      rateType,
      adultUnit,
      childUnit,
      adultUnitBase,
      childUnitBase,
      discountPct,
      adminChargePct,
    };
  }

  const rateType = normalizeRateType(ticket.rateType, {
    adultPrice: ticket.adult_price,
    childPrice: ticket.child_price,
    fullRate: ticket.full_rate ?? ticket.price,
  });
  const discountPct = pickNumber(ticket, ["discount", "discount_percentage", "discountPercent"]);
  const adminChargePct = pickNumber(ticket, ["admin_charge", "adminCharge", "admin_charge_percentage"]);

  const adultUnitBase =
    rateType === "full"
      ? Number(ticket.price || ticket.full_rate || 0)
      : Number(ticket.price || ticket.adult_price || 0);
  const childUnitBase = Number(ticket.child_price || 0);
  const adultUnit = applyDiscountAndAdminCharge(adultUnitBase, discountPct, adminChargePct);
  const childUnit = applyDiscountAndAdminCharge(childUnitBase, discountPct, adminChargePct);

  return {
    source: "base",
    rateType,
    adultUnit,
    childUnit,
    adultUnitBase,
    childUnitBase,
    discountPct,
    adminChargePct,
  };
}

export function getTicketCardDisplayPrice(ticket, activityDetails, { visitDate = null, timeSlotId = "" } = {}) {
  const catalogueBase = Number(ticket?.price || ticket?.adult_price || 0);
  if (!Number.isFinite(catalogueBase) || catalogueBase <= 0) {
    return { amount: null, strikeAmount: null, isSeasonal: false, showFrom: true };
  }

  const isSlotBased = Boolean(activityDetails?.time_slot_based);
  const visitYmd = visitDate ? toActivityVisitYmd(visitDate) : "";

  const basePricing = resolveActivityTicketUnitPricing({
    ticket,
    activityDetails,
    visitYmd: "",
    timeSlotId: "",
  });

  const baseAmount = basePricing
    ? basePricing.rateType === "full"
      ? basePricing.adultUnit
      : basePricing.adultUnit
    : catalogueBase;
  const baseStrike =
    basePricing &&
    Number(basePricing.discountPct || 0) > 0 &&
    Number(basePricing.adultUnitBase || 0) > Number(basePricing.adultUnit || 0)
      ? Number(basePricing.adultUnitBase)
      : null;

  if (!visitYmd) {
    const amount = Number(baseAmount || 0) > 0 ? baseAmount : catalogueBase;
    return {
      amount,
      strikeAmount: baseStrike,
      isSeasonal: false,
      showFrom: true,
    };
  }

  const pricing = resolveActivityTicketUnitPricing({
    ticket,
    activityDetails,
    visitYmd,
    timeSlotId,
  });

  if (!pricing) {
    return {
      amount: Number(baseAmount || 0) > 0 ? baseAmount : catalogueBase,
      strikeAmount: baseStrike,
      isSeasonal: false,
      showFrom: isSlotBased && !timeSlotId,
    };
  }

  const amount = pricing.rateType === "full" ? pricing.adultUnit : pricing.adultUnit;
  const isSeasonal = pricing.source === "seasonal" || pricing.source === "slot-seasonal";
  const displayAmount = Number(amount || 0) > 0 ? amount : catalogueBase;
  const strikeAmount =
    !isSeasonal &&
    Number(pricing.discountPct || 0) > 0 &&
    Number(pricing.adultUnitBase || 0) > Number(displayAmount)
      ? Number(pricing.adultUnitBase)
      : null;
  const showFrom = isSlotBased && !timeSlotId && !isSeasonal;

  return {
    amount: displayAmount,
    strikeAmount,
    isSeasonal,
    showFrom,
  };
}

export function computeActivityLineTotal(
  effective,
  { adultCount = 1, childCount = 0, ticketCount = 1, guideRate = 0, includeGuide = false } = {}
) {
  if (!effective) return 0;

  const guideTotal = includeGuide && Number(guideRate) > 0 ? Number(guideRate) : 0;

  if (effective.rateType === "full") {
    const qty = Math.max(1, Number(ticketCount) || 1);
    return Number(effective.adultUnit || 0) * qty + guideTotal;
  }

  const adultTotal = Number(effective.adultUnit || 0) * adultCount;
  const childUnit = Number(effective.childUnit || 0);
  const childTotal =
    childUnit > 0
      ? childUnit * childCount
      : Number(effective.adultUnit || 0) * 0.7 * childCount;

  return adultTotal + childTotal + guideTotal;
}
