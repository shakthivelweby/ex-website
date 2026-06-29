const ACTIVITY_TZ = "Asia/Kolkata";

/** Minutes before slot start required to book same-day slots. */
export const ACTIVITY_BOOKING_BUFFER_MINUTES = 30;

export function getTodayYmdInTz(timeZone = ACTIVITY_TZ) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const y = parts.find((p) => p.type === "year")?.value;
  const m = parts.find((p) => p.type === "month")?.value;
  const d = parts.find((p) => p.type === "day")?.value;
  return y && m && d ? `${y}-${m}-${d}` : "";
}

export function getCurrentMinutesInTz(timeZone = ACTIVITY_TZ) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const h = parseInt(parts.find((p) => p.type === "hour")?.value || "0", 10);
  const m = parseInt(parts.find((p) => p.type === "minute")?.value || "0", 10);
  return h * 60 + m;
}

export function parseTimeStringToMinutes(timeString) {
  if (timeString == null || timeString === "") return null;
  const parts = String(timeString).trim().split(":");
  if (parts.length < 2) return null;
  const h = parseInt(parts[0], 10);
  const min = parseInt(parts[1], 10);
  if (!Number.isFinite(h) || !Number.isFinite(min)) return null;
  return h * 60 + min;
}

export function slotHasTicketPrice(slot, ticketTypeId) {
  if (!ticketTypeId) return true;
  const prices = slot.ticket_prices || slot.ticketPrices || [];
  if (!Array.isArray(prices) || prices.length === 0) return true;
  return prices.some((p) => String(p.activity_ticket_type_id) === String(ticketTypeId));
}

/**
 * For today's visit date, only slots starting after (now + buffer) are bookable.
 */
export function isTimeSlotBookable(slot, visitYmd, options = {}) {
  const {
    ticketTypeId,
    bufferMinutes = ACTIVITY_BOOKING_BUFFER_MINUTES,
    timeZone = ACTIVITY_TZ,
    todayYmd = getTodayYmdInTz(timeZone),
    nowMinutes = getCurrentMinutesInTz(timeZone),
  } = options;

  if (!visitYmd) return false;
  if (!slotHasTicketPrice(slot, ticketTypeId)) return false;

  const startMinutes = parseTimeStringToMinutes(slot.start_time ?? slot.startTime);
  if (startMinutes == null) return false;

  if (visitYmd !== todayYmd) return true;

  return startMinutes > nowMinutes + bufferMinutes;
}

export function buildActivitySlotOptions(timeSlotPricing, { visitYmd, ticketTypeId, formatTime }) {
  if (!visitYmd || !Array.isArray(timeSlotPricing)) return [];

  const todayYmd = getTodayYmdInTz();
  const nowMinutes = getCurrentMinutesInTz();

  return timeSlotPricing
    .filter((slot) =>
      isTimeSlotBookable(slot, visitYmd, { ticketTypeId, todayYmd, nowMinutes })
    )
    .map((slot) => {
      const start = slot.start_time ?? slot.startTime;
      const end = slot.end_time ?? slot.endTime;
      return {
        id: String(slot.id),
        label: `${formatTime(start)} – ${formatTime(end)}`,
        raw: slot,
      };
    });
}

/** Keep a session-selected slot visible in the picker even during hydration races. */
export function mergeSelectedSlotIntoOptions(options, selectedSlotId, allSlots, formatTime) {
  const list = Array.isArray(options) ? [...options] : [];
  const id = String(selectedSlotId || "");
  if (!id || list.some((slot) => slot.id === id)) return list;

  const raw = Array.isArray(allSlots)
    ? allSlots.find((slot) => String(slot.id) === id)
    : null;
  if (!raw) return list;

  const start = raw.start_time ?? raw.startTime;
  const end = raw.end_time ?? raw.endTime;
  list.push({
    id,
    label: `${formatTime(start)} – ${formatTime(end)}`,
    raw,
  });

  return list.sort((a, b) => {
    const aMin = parseTimeStringToMinutes(a.raw?.start_time ?? a.raw?.startTime) ?? 0;
    const bMin = parseTimeStringToMinutes(b.raw?.start_time ?? b.raw?.startTime) ?? 0;
    return aMin - bMin;
  });
}
