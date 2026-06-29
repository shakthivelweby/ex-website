"use client";

import { getSplitPaymentPlan } from "@/utils/razorpayLimits";

export default function SplitPaymentNotice({ grandTotal, className = "" }) {
  const plan = getSplitPaymentPlan(grandTotal);
  if (!plan.requiresSplit) return null;

  return (
    <div
      className={`rounded-xl border border-amber-200 bg-amber-50/90 px-3.5 py-3 ${className}`}
      role="status"
    >
      <div className="flex items-start gap-2.5">
        <span className="fi-box mt-0.5 h-8 w-8 shrink-0 rounded-lg border border-amber-200 bg-white text-amber-700">
          <i className="fi fi-rr-info text-sm" aria-hidden="true" />
        </span>
        <div className="min-w-0 text-sm leading-snug text-amber-950">
          <p className="font-semibold">Payment will be split into two steps</p>
          <p className="mt-1 text-amber-900/90">
            Your total{" "}
            <span className="font-semibold tabular-nums">₹{plan.grandTotal.toFixed(2)}</span>{" "}
            is above the online limit of{" "}
            <span className="font-semibold tabular-nums">₹{plan.maxPerTxn.toLocaleString("en-IN")}</span>{" "}
            per transaction.
          </p>
          <ul className="mt-2 space-y-1 text-xs text-amber-900/85">
            <li>
              <span className="font-medium">Step 1:</span> Pay{" "}
              <span className="font-semibold tabular-nums">₹{plan.firstPayment.toFixed(2)}</span> now
            </li>
            <li>
              <span className="font-medium">Step 2:</span> Pay remaining{" "}
              <span className="font-semibold tabular-nums">₹{plan.remaining.toFixed(2)}</span> right
              after (popup will appear)
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
