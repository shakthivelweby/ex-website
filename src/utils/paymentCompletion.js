export function roundMoney(n) {
  return Math.round(Number(n || 0) * 100) / 100;
}

/**
 * Remaining booking balance after a payment is verified (prefer verify response over create-order estimate).
 */
export function resolveRemainingBalance(
  verificationResponse,
  orderRes,
  { bookingRelation = "eventBooking", bookingRelationSnake = "event_booking" } = {}
) {
  if (verificationResponse?.data?.is_fully_paid === true) {
    return 0;
  }

  const verifyRemaining = verificationResponse?.data?.remaining_balance;
  if (verifyRemaining != null && Number.isFinite(Number(verifyRemaining))) {
    return roundMoney(verifyRemaining);
  }

  const payment = verificationResponse?.data?.payment;
  const bookingBalance = Number(
    payment?.[bookingRelation]?.balance ??
      payment?.[bookingRelationSnake]?.balance ??
      NaN
  );
  if (Number.isFinite(bookingBalance)) {
    return roundMoney(bookingBalance);
  }

  return roundMoney(Number(orderRes?.data?.remaining_balance ?? 0));
}

export function isPartialPayment(verificationResponse, orderRes, bookingKeys) {
  if (verificationResponse?.data?.is_fully_paid === true) {
    return false;
  }
  return resolveRemainingBalance(verificationResponse, orderRes, bookingKeys) > 0.01;
}
