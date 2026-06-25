/**
 * Rental booking draft persistence (URL + sessionStorage).
 * Used by booking and checkout so "Back" always restores dates/times.
 */

export const RENTAL_BOOKING_STORAGE_KEY = "rentalBookingData";

/** Query flag set by checkout “Back to booking” for a forced full restore. */
export const RENTAL_BOOKING_FROM_CHECKOUT_PARAM = "from_checkout";

export const emptyRentalBooking = () => ({
  pickup_location: "",
  dropoff_location: "",
  pickup_lat: "",
  pickup_lng: "",
  start_date: "",
  end_date: "",
  pickup_time: "",
  dropoff_time: "",
});

export const normalizeRentalTimeValue = (value) => {
  const s = String(value || "").trim();
  if (!s) return "";
  const match = s.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return s;
  return `${match[1].padStart(2, "0")}:${match[2]}`;
};

export const buildRentalBookingFields = (fields = {}) => {
  const base = emptyRentalBooking();
  const pickup = String(fields.pickup_location || "").trim();
  return {
    ...base,
    pickup_location: pickup,
    dropoff_location: String(fields.dropoff_location || "").trim() || pickup,
    pickup_lat: String(fields.pickup_lat || "").trim(),
    pickup_lng: String(fields.pickup_lng || "").trim(),
    start_date: String(fields.start_date || "").trim(),
    end_date: String(fields.end_date || "").trim(),
    pickup_time: normalizeRentalTimeValue(fields.pickup_time),
    dropoff_time: normalizeRentalTimeValue(fields.dropoff_time),
  };
};

export const buildRentalBookingFromSearchParams = (params) => {
  if (!params) return emptyRentalBooking();
  const get = (key) => {
    if (typeof params.get === "function") return params.get(key);
    return params[key];
  };
  return buildRentalBookingFields({
    pickup_location: get("pickup_location"),
    dropoff_location: get("dropoff_location"),
    start_date: get("start_date"),
    end_date: get("end_date"),
    pickup_time: get("pickup_time"),
    dropoff_time: get("dropoff_time"),
  });
};

export const hasRentalBookingSchedule = (booking) =>
  Boolean(
    booking?.start_date ||
      booking?.end_date ||
      booking?.pickup_time ||
      booking?.dropoff_time
  );

export const readRentalBookingDraft = (rentalId) => {
  if (typeof window === "undefined" || !rentalId) return null;
  try {
    const raw = sessionStorage.getItem(RENTAL_BOOKING_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (String(parsed?.rentalId) !== String(rentalId) || !parsed?.booking) return null;
    return buildRentalBookingFields(parsed.booking);
  } catch (_) {
    return null;
  }
};

export const writeRentalBookingDraft = (rentalId, booking) => {
  if (typeof window === "undefined" || !rentalId) return;
  const fields = buildRentalBookingFields(booking);
  if (!hasRentalBookingSchedule(fields)) return;
  try {
    sessionStorage.setItem(
      RENTAL_BOOKING_STORAGE_KEY,
      JSON.stringify({
        rentalId: String(rentalId),
        booking: {
          pickup_location: fields.pickup_location,
          dropoff_location: fields.dropoff_location,
          start_date: fields.start_date,
          end_date: fields.end_date,
          pickup_time: fields.pickup_time,
          dropoff_time: fields.dropoff_time,
        },
      })
    );
  } catch (_) {
    // ignore quota / private mode
  }
};

const fieldHasValue = (booking, field) => Boolean(String(booking?.[field] || "").trim());

const scheduleFieldCount = (booking) => {
  let count = 0;
  if (fieldHasValue(booking, "start_date")) count += 1;
  if (fieldHasValue(booking, "end_date")) count += 1;
  if (fieldHasValue(booking, "pickup_time")) count += 1;
  if (fieldHasValue(booking, "dropoff_time")) count += 1;
  return count;
};

const fillMissingFields = (target, donor, fields) => {
  const next = { ...target };
  for (const field of fields) {
    if (!fieldHasValue(next, field) && fieldHasValue(donor, field)) {
      next[field] = donor[field];
    }
  }
  return next;
};

/**
 * Synchronous client-side hydrate (use in useState initializer).
 */
export const hydrateRentalBookingDraft = (
  rentalId,
  { searchParams = null, initialFromUrl = null } = {}
) => {
  if (!rentalId) return emptyRentalBooking();
  const browserParams =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : null;
  return mergeRentalBookingDraft(emptyRentalBooking(), rentalId, {
    searchParams: browserParams || searchParams,
    initialFromUrl,
  });
};

/**
 * Merge external sources into booking state without clobbering in-progress edits.
 * Priority per field: live URL → Next searchParams → SSR props → sessionStorage → previous state.
 */
export const mergeRentalBookingDraft = (
  previous,
  rentalId,
  { searchParams = null, initialFromUrl = null } = {}
) => {
  const fromBrowser =
    typeof window !== "undefined"
      ? buildRentalBookingFromSearchParams(new URLSearchParams(window.location.search))
      : emptyRentalBooking();

  const fromParams = searchParams
    ? buildRentalBookingFromSearchParams(searchParams)
    : emptyRentalBooking();

  const fromProps = buildRentalBookingFields(initialFromUrl || {});
  const fromStorage = readRentalBookingDraft(rentalId) || emptyRentalBooking();
  const prev = buildRentalBookingFields(previous || {});

  const sources = [prev, fromStorage, fromProps, fromParams, fromBrowser];
  const fields = [
    "pickup_location",
    "dropoff_location",
    "pickup_lat",
    "pickup_lng",
    "start_date",
    "end_date",
    "pickup_time",
    "dropoff_time",
  ];

  const merged = { ...emptyRentalBooking() };
  for (const field of fields) {
    for (let i = sources.length - 1; i >= 0; i -= 1) {
      if (fieldHasValue(sources[i], field)) {
        merged[field] = sources[i][field];
        break;
      }
    }
  }

  // Never drop a full saved draft because the URL only has pickup location.
  if (scheduleFieldCount(fromStorage) > scheduleFieldCount(merged)) {
    fillMissingFields(merged, fromStorage, fields);
  }

  if (!merged.dropoff_location && merged.pickup_location) {
    merged.dropoff_location = merged.pickup_location;
  }

  return merged;
};

export const rentalBookingQueryString = (rentalId, booking) => {
  if (!rentalId) return "";
  const b = buildRentalBookingFields(booking);
  const params = new URLSearchParams({
    pickup_location: b.pickup_location,
    dropoff_location: b.dropoff_location,
    start_date: b.start_date,
    end_date: b.end_date,
    pickup_time: b.pickup_time,
    dropoff_time: b.dropoff_time,
  });
  return `/rentals/${rentalId}/booking?${params.toString()}`;
};

/** Checkout → booking: every field in the URL plus a restore flag (full page navigation). */
export const rentalBookingBackUrlFromCheckout = (rentalId, booking) => {
  if (!rentalId) return "/rentals";
  const b = buildRentalBookingFields(booking);
  const params = new URLSearchParams({
    pickup_location: b.pickup_location,
    dropoff_location: b.dropoff_location,
    start_date: b.start_date,
    end_date: b.end_date,
    pickup_time: b.pickup_time,
    dropoff_time: b.dropoff_time,
    [RENTAL_BOOKING_FROM_CHECKOUT_PARAM]: "1",
  });
  return `/rentals/${rentalId}/booking?${params.toString()}`;
};

export const isRentalBookingCheckoutRestore = (searchParams) => {
  if (!searchParams) return false;
  const get = (key) =>
    typeof searchParams.get === "function" ? searchParams.get(key) : searchParams[key];
  return get(RENTAL_BOOKING_FROM_CHECKOUT_PARAM) === "1";
};

/**
 * Used when landing from checkout “Back to booking” — URL fields win, then SSR props, then storage.
 */
export const forceRentalBookingRestore = (rentalId, searchParams = null, initialFromUrl = null) => {
  const fromBrowser =
    typeof window !== "undefined"
      ? buildRentalBookingFromSearchParams(new URLSearchParams(window.location.search))
      : emptyRentalBooking();

  const fromParams = searchParams
    ? buildRentalBookingFromSearchParams(searchParams)
    : emptyRentalBooking();

  const fromProps = buildRentalBookingFields(initialFromUrl || {});
  const fromStorage = readRentalBookingDraft(rentalId) || emptyRentalBooking();

  const fields = [
    "pickup_location",
    "dropoff_location",
    "pickup_lat",
    "pickup_lng",
    "start_date",
    "end_date",
    "pickup_time",
    "dropoff_time",
  ];

  const sources = [fromStorage, fromProps, fromParams, fromBrowser];
  const merged = { ...emptyRentalBooking() };
  for (const field of fields) {
    for (let i = sources.length - 1; i >= 0; i -= 1) {
      if (fieldHasValue(sources[i], field)) {
        merged[field] = sources[i][field];
        break;
      }
    }
  }
  if (!merged.dropoff_location && merged.pickup_location) {
    merged.dropoff_location = merged.pickup_location;
  }
  return merged;
};

/**
 * Force-restore booking draft from URL + sessionStorage (browser back / bfcache).
 */
export const restoreRentalBookingDraft = (rentalId, previous = null, initialFromUrl = null) =>
  mergeRentalBookingDraft(previous || emptyRentalBooking(), rentalId, {
    initialFromUrl,
  });

export const bookingDraftNeedsRestore = (booking, rentalId) => {
  if (!rentalId) return false;
  const current = buildRentalBookingFields(booking || {});
  if (scheduleFieldCount(current) >= 4) return false;
  const stored = readRentalBookingDraft(rentalId);
  if (!stored) return false;
  return scheduleFieldCount(stored) > scheduleFieldCount(current);
};
