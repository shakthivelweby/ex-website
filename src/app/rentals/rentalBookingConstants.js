/**
 * Default minimum rental length (hours). Should match explore-world-api
 * config/rental.php `min_booking_hours` when env RENTAL_MIN_BOOKING_HOURS is unset.
 * The API also returns `min_booking_hours` on availability responses for the UI.
 */
export const RENTAL_MIN_BOOKING_HOURS_DEFAULT = 4;
