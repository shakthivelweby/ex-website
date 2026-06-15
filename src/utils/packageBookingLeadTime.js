export const MIN_BOOKING_LEAD_DAYS = 10;

/** Whole calendar days from today (start of day) to the selected date. */
export function getDaysUntilDate(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.floor((target - today) / (1000 * 60 * 60 * 24));
}

/** Online booking is allowed only when the trip date is more than 10 days away. */
export function isOnlineBookingAllowed(selectedDate) {
  return getDaysUntilDate(selectedDate) > MIN_BOOKING_LEAD_DAYS;
}

/** First calendar date on which online booking is allowed (today + 11 days). */
export function getFirstBookableDate() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + MIN_BOOKING_LEAD_DAYS + 1);
  return date;
}

export function formatBookableFromDate(date) {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function shouldShowEnquiryOnly(selectedDate, rateAvailable) {
  return !isOnlineBookingAllowed(selectedDate) || !rateAvailable;
}
