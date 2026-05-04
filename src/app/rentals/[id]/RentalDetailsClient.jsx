"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";
import Accordion from "@/components/Accordion";
import ImageViewer from "@/components/ImageViewer/ImageViewer";

const formatMoney = (v) => {
  const n = Number(v || 0);
  if (!Number.isFinite(n)) return "0";
  return n.toFixed(2);
};

const linesToList = (value) => {
  if (!value) return [];
  return String(value)
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((s) => s.replace(/^\s*-\s*/, "").trim())
    .filter(Boolean);
};

export default function RentalDetailsClient({ rental }) {
  const router = useRouter();
  const pricing = rental?.pricing_rule || rental?.pricingRule || {};

  const onBookNow = () => router.push(`/rentals/${rental.id}/booking`);

  const faqs = Array.isArray(rental?.faqs) ? rental.faqs : [];
  const termsContent = rental?.terms_and_condition?.content || "";
  const features = Array.isArray(rental?.features) ? rental.features : [];
  const inclusions = linesToList(rental?.inclusions);
  const exclusions = linesToList(rental?.exclusions);

  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("features");

  const gallery = useMemo(() => {
    const out = [];
    const imgs = Array.isArray(rental?.gallery_images) ? rental.gallery_images : [];
    const sorted = imgs
      .slice()
      .sort((a, b) => Number(Boolean(b?.is_primary)) - Number(Boolean(a?.is_primary)));
    for (const g of sorted) {
      const url = g?.image_url || g?.imageUrl || g?.url;
      if (url) out.push({ url, id: g?.id ?? url, is_primary: Boolean(g?.is_primary) });
    }
    if (!out.length && rental?.thumbnail_image_url) {
      out.push({ url: rental.thumbnail_image_url, id: "thumb" });
    }
    const seen = new Set();
    return out.filter((x) => {
      if (!x?.url) return false;
      if (seen.has(x.url)) return false;
      seen.add(x.url);
      return true;
    });
  }, [rental]);

  /** Cover image for hero (matches attractions: main image separate from gallery grid). */
  const heroImage =
    rental?.thumbnail_image_url ||
    gallery.find((g) => g.is_primary)?.url ||
    gallery[0]?.url ||
    "";

  const imageViewerImages = useMemo(
    () =>
      gallery.map((g, i) => ({
        id: g.id ?? `rental-img-${i}`,
        image_url: g.url,
        image_name: rental?.title || "Rental",
      })),
    [gallery, rental?.title]
  );

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
        new Set(arr.map((v) => (v == null ? "" : String(v).trim())).filter(Boolean))
      );
    const transmissions = uniq([
      ...units.map((u) => u?.transmission),
      rental?.transmission,
    ]);
    const fuels = uniq([...units.map((u) => u?.fuel_type), rental?.fuel_type]);
    const seats = uniq([...units.map((u) => u?.seats), rental?.seats]);

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
    if (seats.length)
      out.push({
        label: "Seating capacity",
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
  }, [rental]);

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

  const openImageViewer = () => {
    setIsImageViewerOpen(true);
  };

  const tabs = useMemo(
    () => [
      { id: "features", label: "Features" },
      { id: "inclusions_exclusions", label: "Inclusions / Exclusions" },
      { id: "faqs", label: "FAQs" },
      { id: "terms", label: "Terms & Conditions" },
    ],
    []
  );

  const handleMobileBooking = () => onBookNow();

  const addressLine =
    rental?.address ||
    rental?.location ||
    (typeof rental?.pickup_address === "string" ? rental.pickup_address : "") ||
    "";

  const mapLink =
    rental?.map_link ||
    (rental?.latitude != null &&
    rental?.longitude != null &&
    String(rental.latitude) !== "" &&
    String(rental.longitude) !== ""
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${rental.latitude},${rental.longitude}`
        )}`
      : null);

  const priceHourLabel = `₹${formatMoney(pricing.price_per_hour)}/hr`;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mt-5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleBackClick}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <i className="fi fi-rr-arrow-left text-base text-gray-800"></i>
              </button>
              <h1 className="text-base font-medium text-gray-800 truncate">back</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
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
          <div className="lg:col-span-2 space-y-6">
            <div className="relative">
              <div className="aspect-video rounded-2xl overflow-hidden bg-gray-200">
                {heroImage ? (
                  <Image
                    src={heroImage}
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

            {gallery.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-base font-medium text-gray-700 mb-4 tracking-tight">Gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {gallery.slice(0, 6).map((image, index) => (
                    <button
                      type="button"
                      key={image.id ?? index}
                      className="aspect-square rounded-lg overflow-hidden bg-gray-200 cursor-pointer hover:opacity-90 transition-opacity text-left p-0 border-0"
                      onClick={() => {
                        setIsImageViewerOpen(true);
                      }}
                    >
                      <Image
                        src={image.url}
                        alt={`${rental?.title || "Rental"} — ${index + 1}`}
                        width={300}
                        height={300}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
                {gallery.length > 6 && (
                  <button
                    type="button"
                    onClick={() => openImageViewer()}
                    className="w-full py-3 text-primary-600 font-medium hover:text-primary-700 transition-colors"
                  >
                    View All {gallery.length} Photos
                  </button>
                )}
              </div>
            )}

            <div className="space-y-4">
              <h2 className="text-base font-medium text-gray-700 mb-4 tracking-tight">About</h2>
              <div className="prose prose-gray max-w-none">
                {rental.description ? (
                  <div
                    className="text-gray-700 leading-relaxed text-sm"
                    dangerouslySetInnerHTML={{ __html: rental.description }}
                  />
                ) : (
                  <p className="text-gray-700 leading-relaxed text-sm">No description added.</p>
                )}
              </div>
            </div>

            {specs.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-base font-medium text-gray-700 mb-4 tracking-tight">
                  Vehicle details
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

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="p-4 sm:p-6 pb-3">
                <h2 className="text-base font-medium text-gray-700 mb-3 tracking-tight">Details</h2>
                <div
                  role="tablist"
                  aria-label="Rental information"
                  className="flex gap-1 overflow-x-auto rounded-xl bg-gray-100 p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap"
                >
                  {tabs.map((t) => {
                    const isActive = activeTab === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => setActiveTab(t.id)}
                        className={`relative shrink-0 rounded-lg px-3 py-2.5 text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                          isActive
                            ? "bg-white text-primary shadow-sm ring-1 ring-black/5"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div
                role="tabpanel"
                className="px-4 pb-4 sm:px-6 sm:pb-6 pt-4 min-h-[120px] border-t border-gray-100"
              >
                {activeTab === "features" && (
                  <div className="space-y-3">
                    {features.length ? (
                      <div className="flex flex-wrap gap-2">
                        {features.map((f) => (
                          <span
                            key={f.id || f.name}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-50 text-primary-700"
                          >
                            {f.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">No features added.</div>
                    )}
                  </div>
                )}

                {activeTab === "inclusions_exclusions" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="text-sm font-medium text-gray-800 mb-2">Inclusions</div>
                      {inclusions.length ? (
                        <ul className="space-y-2 text-sm text-gray-700">
                          {inclusions.map((v, idx) => (
                            <li key={`${v}-${idx}`} className="flex gap-2">
                              <span className="mt-1.5 w-2 h-2 rounded-full bg-primary/60 shrink-0" />
                              <span>{v}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-sm text-gray-500">No inclusions added.</div>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-800 mb-2">Exclusions</div>
                      {exclusions.length ? (
                        <ul className="space-y-2 text-sm text-gray-700">
                          {exclusions.map((v, idx) => (
                            <li key={`${v}-${idx}`} className="flex gap-2">
                              <span className="mt-1.5 w-2 h-2 rounded-full bg-primary/60 shrink-0" />
                              <span>{v}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-sm text-gray-500">No exclusions added.</div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "faqs" && (
                  <div className="space-y-3">
                    {faqs.length ? (
                      faqs.map((faq) => (
                        <Accordion key={faq.id} title={faq.question} defaultOpen={false}>
                          <div className="text-sm text-gray-700 whitespace-pre-line">{faq.answer}</div>
                        </Accordion>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500">No FAQs added.</div>
                    )}
                  </div>
                )}

                {activeTab === "terms" && (
                  <div className="prose prose-gray max-w-none text-sm text-gray-700">
                    {termsContent ? (
                      <div dangerouslySetInnerHTML={{ __html: termsContent }} />
                    ) : (
                      <p className="text-sm text-gray-500">No terms added.</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {(addressLine || rental?.location) && (
              <div className="space-y-4">
                <h2 className="text-base font-medium text-gray-700 mb-4 tracking-tight">Location</h2>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
                        <i className="fi fi-rr-marker text-lg text-primary-500"></i>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 mb-1">Address</p>
                        <p className="text-gray-700 font-medium leading-relaxed">
                          {addressLine || rental?.location || "Address not available"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (mapLink) {
                              window.open(mapLink, "_blank");
                            } else {
                              const q = encodeURIComponent(addressLine || rental?.location || "");
                              window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, "_blank");
                            }
                          }}
                          className="inline-flex items-center gap-2 bg-primary-50 border border-primary-200 rounded-full px-2 py-1 text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors cursor-pointer"
                        >
                          Get Directions
                          <i className="fi fi-rr-arrow-right text-xs"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24">
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
                        <p className="text-gray-500 text-xs">Price / Hour</p>
                        <p className="text-gray-700 font-medium">₹{formatMoney(pricing.price_per_hour)}</p>
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
      </div>

      {imageViewerImages.length > 0 && (
        <ImageViewer
          isOpen={isImageViewerOpen}
          onClose={() => setIsImageViewerOpen(false)}
          images={imageViewerImages}
        />
      )}

      <div className="fixed bottom-16 left-4 right-4 lg:hidden z-40">
        <button
          type="button"
          onClick={handleMobileBooking}
          className="w-full bg-primary-500 text-white py-3 px-6 rounded-full font-medium flex items-center justify-between shadow-lg"
        >
          <span className="text-sm">Book Now</span>
          <div className="flex items-center">
            <span className="text-sm font-bold">{priceHourLabel}</span>
            <i className="fi fi-rr-car ml-2 text-sm"></i>
          </div>
        </button>
      </div>
    </div>
  );
}
