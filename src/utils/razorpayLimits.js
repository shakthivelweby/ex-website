function round2(n) {
  return Math.round(Number(n || 0) * 100) / 100;
}

/** Keep in sync with API `RAZORPAY_MAX_TRANSACTION_AMOUNT` (INR per order). */
export function getRazorpayMaxTransactionAmount(serverMax) {
  const fromEnv = Number(process.env.NEXT_PUBLIC_RAZORPAY_MAX_TRANSACTION_AMOUNT);
  const envMax = Number.isFinite(fromEnv) && fromEnv > 0 ? fromEnv : 50000;
  const srv = Number(serverMax);
  return Number.isFinite(srv) && srv > 0 ? srv : envMax;
}

export function getSplitPaymentPlan(grandTotal, serverMax) {
  const total = round2(grandTotal);
  const maxPerTxn = getRazorpayMaxTransactionAmount(serverMax);

  if (total <= maxPerTxn + 0.001) {
    return {
      requiresSplit: false,
      grandTotal: total,
      maxPerTxn,
      firstPayment: total,
      remaining: 0,
    };
  }

  return {
    requiresSplit: true,
    grandTotal: total,
    maxPerTxn,
    firstPayment: maxPerTxn,
    remaining: round2(total - maxPerTxn),
  };
}
