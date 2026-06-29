export const getPaymentErrorPayload = (payRes) => {
  const code = payRes?.error?.code;
  const description = String(payRes?.error?.description || "");

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
      message: description || "We couldn't load the payment gateway. Check your connection and try again.",
      hint: "If the problem continues, try a different browser or disable ad blockers for this site.",
      canRetry: true,
      primaryLabel: "Try again",
      primaryIcon: "fi-rr-refresh",
      secondaryLabel: "Close",
    };
  }

  if (/maximum amount/i.test(description)) {
    return {
      variant: "warning",
      title: "Payment amount too high",
      message:
        "This payment exceeds Razorpay's per-transaction limit. Large orders are split automatically — please try again.",
      hint: "If it still fails, your Razorpay account limit may need to be raised in the Dashboard (Account → Transaction limits).",
      canRetry: true,
      primaryLabel: "Try again",
      primaryIcon: "fi-rr-refresh",
      secondaryLabel: "Close",
    };
  }

  return {
    variant: "error",
    title: "Payment failed",
    message: description || "Your payment could not be processed. Please try again.",
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
