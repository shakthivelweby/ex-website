/**
 * Static preview of the supplier portal dashboard (matches ex-supplier Dashboard UI).
 */
export default function SupplierDashboardPreview({ className = "", compact = false }) {
  const stats = [
    { title: "Bookings", value: "248", sub: "This month", wash: "bg-sky-50/90" },
    { title: "Collected", value: "₹1.24L", sub: "Paid", wash: "bg-emerald-50/90" },
    { title: "Pending", value: "₹45K", sub: "12 txn", wash: "bg-amber-50/90" },
    { title: "Enquiries", value: "18", sub: "Packages", wash: "bg-violet-50/90" },
  ];

  const services = [
    { name: "Packages", bookings: 92, revenue: "₹48K", pct: 100 },
    { name: "Attractions", bookings: 64, revenue: "₹31K", pct: 70 },
    { name: "Activities", bookings: 52, revenue: "₹28K", pct: 56 },
    { name: "Events", bookings: 40, revenue: "₹17K", pct: 43 },
  ];

  return (
    <div
      className={[
        "overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-2xl ring-1 ring-slate-100",
        compact ? "text-[10px]" : "text-xs",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden
    >
      <div className="flex items-center gap-1.5 border-b border-slate-200 bg-white px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        <span className="ml-2 flex-1 truncate text-center text-[11px] font-medium text-slate-400">
          supplier.exploreworld.com/dashboard
        </span>
      </div>

      <div className={compact ? "space-y-2 p-3" : "space-y-4 p-5"}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className={`font-bold text-slate-900 ${compact ? "text-xs" : "text-base"}`}>
              Dashboard
            </p>
            <p className="text-slate-500">Acme Tours · Overview</p>
          </div>
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm">
            {["Today", "Month", "Year"].map((label, i) => (
              <span
                key={label}
                className={`rounded-md px-2.5 py-1 text-[11px] font-semibold ${
                  i === 1 ? "bg-teal-600 text-white" : "text-slate-500"
                }`}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className={`grid gap-2 ${compact ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4"}`}>
          {stats.map((s) => (
            <div
              key={s.title}
              className={`rounded-xl border border-slate-100 p-3 shadow-sm ${s.wash}`}
            >
              <p className="font-medium text-slate-600">{s.title}</p>
              <p className={`font-bold tabular-nums text-slate-900 ${compact ? "text-sm" : "text-lg"}`}>
                {s.value}
              </p>
              <p className="text-slate-500">{s.sub}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <p className="mb-2 font-bold text-slate-800">By service</p>
          <div className="space-y-2">
            {services.map((row) => (
              <div key={row.name}>
                <div className="flex justify-between gap-2 text-[11px]">
                  <span className="font-semibold text-slate-900">{row.name}</span>
                  <span className="text-slate-500">
                    {row.bookings} ·{" "}
                    <span className="font-medium text-emerald-700">{row.revenue}</span>
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-teal-500"
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {!compact && (
          <div className="grid grid-cols-3 gap-2">
            {[
              { title: "Packages", live: "12" },
              { title: "Attractions", live: "8" },
              { title: "Activities", live: "5" },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm"
              >
                <p className="font-bold text-slate-900">{card.title}</p>
                <p className="mt-1 text-slate-500">
                  Live <span className="font-semibold text-slate-900">{card.live}</span>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
