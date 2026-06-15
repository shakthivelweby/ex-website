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

export function shouldShowEnquiryOnly(selectedDate, rateAvailable) {
  return !isOnlineBookingAllowed(selectedDate) || !rateAvailable;
}
