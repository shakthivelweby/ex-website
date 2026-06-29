/** Admin charge is stored as a percentage (e.g. 5 = 5%). */

export function attractionAdminPct(ticket) {
  return Math.max(0, Number(ticket?.admin_charge ?? 0));
}

export function applyAdminCharge(amountRaw, adminPctRaw) {
  const amount = Number(amountRaw || 0);
  const pct = Math.max(0, Number(adminPctRaw || 0));
  if (amount <= 0 || pct <= 0) {
    return Math.round(amount * 100) / 100;
  }
  return Math.round((amount + (amount * pct) / 100) * 100) / 100;
}

/** Discount applies on the admin-inclusive amount. */
export function applyDiscountOnAmount(amountRaw, discountPctRaw) {
  const amount = Number(amountRaw || 0);
  const pct = Math.max(0, Number(discountPctRaw || 0));
  if (pct <= 0) return Math.round(amount * 100) / 100;
  return Math.round((amount - (amount * pct) / 100) * 100) / 100;
}

export function resolvePaxAdultChildRaw(ticket) {
  let adultPrice = parseFloat(ticket?.adult_price || 0);
  let childPrice = parseFloat(ticket?.child_price || 0);
  if (adultPrice === 0 && childPrice === 0 && ticket?.full_rate) {
    adultPrice = parseFloat(ticket.full_rate);
    childPrice = parseFloat(ticket.full_rate);
  }
  return { adultPrice, childPrice };
}

export function attractionHasGuideOption(ticketPrices) {
  return (
    Array.isArray(ticketPrices) &&
    ticketPrices.some((ticket) => Number(ticket?.guide_rate ?? 0) > 0)
  );
}

export function computeAttractionGuideTotal(ticketPrices, adultChildTickets, needGuide) {
  if (!needGuide || !Array.isArray(ticketPrices)) return 0;

  let total = 0;
  Object.entries(adultChildTickets || {}).forEach(([ticketTypeId, tickets]) => {
    const qty = Number(tickets?.adult || 0) + Number(tickets?.child || 0);
    if (qty <= 0) return;

    const ticket = ticketPrices.find(
      (row) => String(row.attraction_ticket_type_id) === String(ticketTypeId)
    );
    const rate = Number(ticket?.guide_rate ?? 0);
    if (rate > 0) total += rate * qty;
  });

  return total;
}

export function minDisplayedEntryFeeFromRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return null;

  const candidates = [];
  for (const row of rows) {
    const rate = row?.rate_type;
    const adminPct = row?.admin_charge ?? 0;

    if (rate === "full") {
      const base = Number(row?.full_rate || 0);
      if (base > 0) candidates.push(applyAdminCharge(base, adminPct));
    } else if (rate === "pax") {
      const adult = Number(row?.adult_price || 0);
      if (adult > 0) candidates.push(applyAdminCharge(adult, adminPct));
    } else {
      const base = Number(row?.full_rate || row?.adult_price || 0);
      if (base > 0) candidates.push(applyAdminCharge(base, adminPct));
    }
  }

  return candidates.length ? Math.min(...candidates) : null;
}
