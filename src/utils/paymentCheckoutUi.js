export const getPaymentErrorPayload = (payRes) => {
  const code = payRes?.error?.code;

  if (code === "PAYMENT_CANCELLED") {
    return {
      variant: "cancelled",
      title: "Payment not completed",
      message: "You closed the Razorpay window before finishing. Your booking details are saved on this page.",
      hint: "No amount was charged to your account. You can continue to payment whenever you're ready.",
      canRetry: true,
      primaryLabel: "Continue to payment",
      primaryIcon: "fi-rr-refresh",
      secondaryLabel: "Stay on checkout",
    };
  }

  if (code === "SCRIPT_LOAD_ERROR" || code === "RAZORPAY_OPEN_ERROR" || code === "RAZORPAY_NOT_AVAILABLE") {
    return {
      variant: "warning",
      title: "Couldn't open payment",
      message: payRes?.error?.description || "We couldn't load the payment gateway. Check your connection and try again.",
      hint: "If the problem continues, try a different browser or disable ad blockers for this site.",
      canRetry: true,
      primaryLabel: "Try again",
      primaryIcon: "fi-rr-refresh",
      secondaryLabel: "Close",
    };
  }

  return {
    variant: "error",
    title: "Payment failed",
    message: payRes?.error?.description || "Your payment could not be processed. Please try again.",
    hint: "If money was deducted, it is usually refunded within 5–7 business days.",
    canRetry: true,
    primaryLabel: "Try again",
    primaryIcon: "fi-rr-refresh",
    secondaryLabel: "Close",
  };
};

export const money = (v) => {
  const n = Number(v || 0);
  if (!Number.isFinite(n)) return "0.00";
  return n.toFixed(2);
};
