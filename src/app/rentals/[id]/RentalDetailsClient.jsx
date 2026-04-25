"use client";

import Image from "next/image";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";
import Accordion from "@/components/Accordion";

const formatMoney = (v) => {
  const n = Number(v || 0);
  if (!Number.isFinite(n)) return "0";
  return n.toFixed(2);
};

export default function RentalDetailsClient({ rental }) {
  const router = useRouter();
  const pricing = rental?.pricing_rule || rental?.pricingRule || {};
  const primaryUnit = Array.isArray(rental?.units) && rental.units.length ? rental.units[0] : null;

  const onBookNow = () => router.push(`/rentals/${rental.id}/booking`);

  const faqs = Array.isArray(rental?.faqs) ? rental.faqs : [];
  const termsContent = rental?.terms_and_condition?.content || "";

  const chips = useMemo(() => {
    const out = [];
    if (rental?.category?.name) out.push(rental.category.name);
    if (rental?.sub_category?.name) out.push(rental.sub_category.name);
    return out;
  }, [rental]);

  const specs = useMemo(() => {
    const out = [];
    const units = Array.isArray(rental?.units) ? rental.units : [];

    const uniq = (arr) =>
      Array.from(
        new Set(
          arr
            .map((v) => (v == null ? "" : String(v).trim()))
            .filter(Boolean)
        )
      );

    const transmissions = uniq([
      ...units.map((u) => u?.transmission),
      rental?.transmission, // backward compatibility if present
    ]);
    const fuels = uniq([
      ...units.map((u) => u?.fuel_type),
      rental?.fuel_type, // backward compatibility if present
    ]);
    const seats = uniq(units.map((u) => u?.seats));

    if (transmissions.length)
      out.push({
        label: "Transmission",
        value: transmissions.join(", "),
        icon: "fi fi-rr-settings-sliders",
      });
    if (fuels.length)
      out.push({
        label: "Fuel type",
        value: fuels.join(", "),
        icon: "fi fi-rr-gas-pump",
      });
    // seats is per unit too; show unique values if present
    if (seats.length)
      out.push({
        label: "Seats",
        value: seats.join(", "),
        icon: "fi fi-rr-users",
      });
    if (rental?.running_limit)
      out.push({
        label: "Running limit",
        value: rental.running_limit,
        icon: "fi fi-rr-dashboard",
      });

    return out;
  }, [rental?.units, rental?.running_limit]);

  const handleBackClick = () => router.back();

  const handleShare = () => {
    try {
      if (navigator.share) {
        navigator.share({
          title: rental?.title || "Rental",
          text: rental?.description || "",
          url: window.location.href,
        });
        return;
      }
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    } catch (_) {
      // ignore
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header (same vibe as attraction details) */}
      <div className="mt-5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <button
                onClick={handleBackClick}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <i className="fi fi-rr-arrow-left text-base text-gray-800"></i>
              </button>
              <h1 className="text-base font-medium text-gray-800 truncate">back</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <i className="fi fi-rr-share text-xl text-gray-600"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero image */}
            <div className="relative">
              <div className="aspect-video rounded-2xl overflow-hidden bg-gray-200">
                {rental.thumbnail_image_url ? (
                  <Image
                    src={rental.thumbnail_image_url}
                    alt={rental.title || "Rental"}
                    width={800}
                    height={450}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <i className="fi fi-rr-car text-5xl" />
                  </div>
                )}
              </div>
            </div>

            {/* About */}
            <div className="space-y-4">
              <h2 className="text-base font-medium text-gray-700 mb-4 tracking-tight">About</h2>
              <div className="prose prose-gray max-w-none text-sm text-gray-700">
                {rental.description ? (
                  <div dangerouslySetInnerHTML={{ __html: rental.description }} />
                ) : (
                  <p className="text-gray-700 leading-relaxed">No description added.</p>
                )}
              </div>
            </div>

            {/* Basic details */}
            {specs.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-base font-medium text-gray-700 mb-4 tracking-tight">
                  Basic details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {specs.map((s) => (
                    <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center">
                          <i className={`${s.icon} text-lg text-primary-500`}></i>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">{s.label}</p>
                          <p className="font-medium text-gray-900">{s.value}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Terms */}
            <div className="space-y-4">
              <h2 className="text-base font-medium text-gray-700 mb-4 tracking-tight">
                Terms &amp; Conditions
              </h2>
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="prose prose-gray max-w-none text-sm text-gray-700">
                  {termsContent ? (
                    <div dangerouslySetInnerHTML={{ __html: termsContent }} />
                  ) : (
                    <p>No terms added.</p>
                  )}
                </div>
              </div>
            </div>

            {/* FAQs */}
            <div className="space-y-4">
              <h2 className="text-base font-medium text-gray-700 mb-4 tracking-tight">FAQs</h2>
              {faqs.length ? (
                <div className="space-y-3">
                  {faqs.map((f) => (
                    <Accordion key={f.id} title={f.question} defaultOpen={false}>
                      <div className="text-sm text-gray-700 whitespace-pre-line">{f.answer}</div>
                    </Accordion>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500">No FAQs added.</div>
              )}
            </div>
          </div>

          {/* Right booking card (attraction-like) */}
          <div className="hidden lg:block">
            <div className="!bg-[#f7f7f7] rounded-xl p-3 shadow-sm">
              <div className="bg-white rounded-xl p-4 mb-4">
                <h1 className="text-xl font-medium text-gray-800 tracking-tight mb-3">
                  {rental.title}
                </h1>
                {chips.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {chips.map((c, idx) => (
                      <span
                        key={`${c}-${idx}`}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#f7f7f7] text-gray-700"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl p-4 mb-4">
                <div className="space-y-4 text-sm">
                  <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center">
                      <i className="fi fi-rr-indian-rupee-sign text-base text-primary-500"></i>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Price / Day</p>
                      <p className="text-gray-700 font-medium">₹{formatMoney(pricing.price_per_day)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center">
                      <i className="fi fi-rr-shield-check text-base text-primary-500"></i>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Security deposit</p>
                      <p className="text-gray-700 font-medium">₹{formatMoney(pricing.security_deposit)}</p>
                    </div>
                  </div>

                  {rental.location && (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center">
                        <i className="fi fi-rr-marker text-base text-primary-500"></i>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Default location</p>
                        <p className="text-gray-700 font-medium">{rental.location}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-5">
                  <Button onClick={onBookNow} className="w-full !rounded-xl">
                    Book now
                  </Button>
                </div>
              </div>

              {(pricing.price_per_week != null && pricing.price_per_week !== "") ||
              (pricing.price_per_month != null && pricing.price_per_month !== "") ||
              (pricing.price_per_hour != null && pricing.price_per_hour !== "") ||
              (pricing.price_per_km != null && pricing.price_per_km !== "") ||
              (pricing.advance_amount != null && pricing.advance_amount !== "") ||
              (pricing.discount_type && pricing.discount_value != null && pricing.discount_value !== "") ? (
                <div className="bg-white rounded-xl p-4">
                  <div className="text-sm font-medium text-gray-800 mb-3">Other rates</div>
                  <div className="space-y-2 text-sm text-gray-700">
                    {pricing.price_per_week != null && pricing.price_per_week !== "" && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Per week</span>
                        <span className="font-medium">₹{formatMoney(pricing.price_per_week)}</span>
                      </div>
                    )}
                    {pricing.price_per_month != null && pricing.price_per_month !== "" && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Per month</span>
                        <span className="font-medium">₹{formatMoney(pricing.price_per_month)}</span>
                      </div>
                    )}
                    {pricing.price_per_hour != null && pricing.price_per_hour !== "" && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Per hour</span>
                        <span className="font-medium">₹{formatMoney(pricing.price_per_hour)}</span>
                      </div>
                    )}
                    {pricing.price_per_km != null && pricing.price_per_km !== "" && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Per km</span>
                        <span className="font-medium">₹{formatMoney(pricing.price_per_km)}</span>
                      </div>
                    )}
                    {pricing.advance_amount != null && pricing.advance_amount !== "" && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Advance</span>
                        <span className="font-medium">₹{formatMoney(pricing.advance_amount)}</span>
                      </div>
                    )}
                    {pricing.discount_type &&
                      pricing.discount_value != null &&
                      pricing.discount_value !== "" && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Discount</span>
                          <span className="font-medium">
                            {pricing.discount_type === "percent"
                              ? `${formatMoney(pricing.discount_value)}%`
                              : `₹${formatMoney(pricing.discount_value)}`}
                          </span>
                        </div>
                      )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Booking moved to /rentals/[id]/booking */}
    </div>
  );
}

