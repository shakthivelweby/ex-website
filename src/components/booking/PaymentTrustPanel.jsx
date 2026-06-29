"use client";

const TRUST_ITEMS = [
  {
    icon: "fi-rr-shield-check",
    title: "256-bit SSL encryption",
    description: "Your payment details are protected end-to-end",
  },
  {
    icon: "fi-rr-credit-card",
    title: "Powered by Razorpay",
    description: "Trusted by millions of businesses in India",
  },
  {
    icon: "fi-rr-bank",
    title: "All major payment methods",
    description: "UPI, cards, net banking & wallets accepted",
  },
  {
    icon: "fi-rr-ticket",
    title: "Instant confirmation",
    description: "E-ticket sent to your email after payment",
  },
];

export default function PaymentTrustPanel({ className = "", compact = false }) {
  if (compact) {
    return (
      <div
        className={`flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] text-gray-500 ${className}`}
      >
        <span className="inline-flex items-center gap-1.5">
          <i className="fi fi-rr-shield-check relative top-0 text-primary-600" aria-hidden="true" />
          Secure checkout
        </span>
        <span className="hidden sm:inline text-gray-300">|</span>
        <span className="inline-flex items-center gap-1.5">
          <i className="fi fi-rr-credit-card relative top-0 text-gray-400" aria-hidden="true" />
          Razorpay
        </span>
        <span className="hidden sm:inline text-gray-300">|</span>
        <span>UPI · Cards · Net banking</span>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border border-gray-100 bg-gray-50/80 p-4 ${className}`}>
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
        Safe & secure payments
      </p>
      <ul className="space-y-3">
        {TRUST_ITEMS.map((item) => (
          <li key={item.title} className="flex items-start gap-3">
            <span className="fi-box h-9 w-9 shrink-0 rounded-lg border border-gray-200 bg-white text-primary-600">
              <i className={`fi ${item.icon} text-sm`} aria-hidden="true" />
            </span>
            <div className="min-w-0 pt-0.5">
              <p className="text-sm font-medium text-gray-900">{item.title}</p>
              <p className="text-xs leading-relaxed text-gray-500">{item.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
