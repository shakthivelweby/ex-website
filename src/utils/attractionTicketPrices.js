/** One row per ticket type — API can return duplicate price rows for the same type. */
export function dedupeAttractionTicketPrices(prices) {
  if (!Array.isArray(prices)) return [];
  const byType = new Map();
  for (const row of prices) {
    const typeId = row?.attraction_ticket_type_id ?? row?.attractionTicketTypeId;
    if (!typeId || byType.has(typeId)) continue;
    byType.set(typeId, row);
  }
  return Array.from(byType.values());
}

export function normalizeAttractionBookingData(data) {
  if (!data || typeof data !== "object") return data;
  const rawPrices = data.attraction_ticket_type_prices ?? data.attractionTicketTypePrices;
  const prices = dedupeAttractionTicketPrices(rawPrices);
  return {
    ...data,
    attraction_ticket_type_prices: prices,
  };
}
