"use client";

import Image from "next/image";
import { useMemo, useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";
import Accordion from "@/components/Accordion";
import ImageViewer from "@/components/ImageViewer/ImageViewer";
import RichTextContent from "@/components/common/RichTextContent";
import PickupLocationPicker from "@/components/rentals/PickupLocationPicker";
import { rentalDisplayRate } from "@/app/rentals/rentalPricingCalc";
import { isVehicleRental } from "@/app/rentals/rentalFilterUtils";
import { formTypeIcon, formTypeLabel } from "@/app/rentals/rentalCategoryTypeUtils";
import {
  normalizeRentalPickupOptions,
  getDefaultPickupOption,
} from "@/app/rentals/rentalPickupUtils";
import DetailSubHeader from "@/components/layout/DetailSubHeader";

const formatMoney = (v) => {
  const n = Number(v || 0);
  if (!Number.isFinite(n)) return "0";
  if (Number.isInteger(n) || n === Math.floor(n)) return String(Math.floor(n));
  return n.toFixed(2);
};

const formatSeats = (seats) => {
  const value = String(seats || "").trim();
  if (!value) return null;
  if (/seater/i.test(value)) return value;
  return `${value} seater`;
};

const formatLocation = (location) => {
  const value = String(location || "").trim();
  if (!value) return null;
  const parts = value.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length <= 2) return value;
  return `${parts[0]}, ${parts[parts.length - 1]}`;
};

const formatFeatureName = (name) => {
  const value = String(name || "").trim();
  if (!value) return "";
  const lower = value.toLowerCase();
  if (lower === "ac" || lower === "a/c") return "AC";
  if (lower === "gps") return "GPS";
  return value.charAt(0).toUpperCase() + value.slice(1);
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
  const [isBooking, startBookingTransition] = useTransition();
  const pricing = rental?.pricing_rule || rental?.pricingRule || {};
  const [selectedPickupName, setSelectedPickupName] = useState("");

  const pickupOptions = useMemo(() => normalizeRentalPickupOptions(rental), [rental]);

  useEffect(() => {
    const def = getDefaultPickupOption(pickupOptions);
    if (def?.name) setSelectedPickupName(def.name);
  }, [rental?.id, pickupOptions]);

  const selectedPickup =
    getDefaultPickupOption(pickupOptions, selectedPickupName) || pickupOptions[0] || null;

  const onBookNow = () => {
    if (isBooking) return;
    startBookingTransition(() => {
      const pickup = getDefaultPickupOption(pickupOptions, selectedPickupName);
      const qs = pickup?.name
        ? `?pickup_location=${encodeURIComponent(pickup.name)}`
        : "";
      router.push(`/rentals/${rental.id}/booking${qs}`);
    });
  };

  const faqs = Array.isArray(rental?.faqs) ? rental.faqs : [];
  const termsContent = rental?.terms_and_condition?.content || "";
  const features = Array.isArray(rental?.features) ? rental.features : [];
  const inclusions = linesToList(rental?.inclusions);
  const exclusions = linesToList(rental?.exclusions);

  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
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

  useEffect(() => {
    const primaryIdx = gallery.findIndex((g) => g.is_primary);
    setHeroIndex(primaryIdx >= 0 ? primaryIdx : 0);
  }, [rental?.id, gallery]);

  const displayHeroUrl = gallery[heroIndex]?.url || heroImage;
  const isVehicle = isVehicleRental(rental);
  const formType = String(rental?.category?.form_type || "").trim().toLowerCase();
  const categoryIcon = formType ? formTypeIcon(formType) : "fi fi-rr-box";

  const vehicleSpecChips = useMemo(() => {
    if (!isVehicle) return [];
    const units = Array.isArray(rental?.units) ? rental.units : [];
    const primaryUnit = units[0] || null;
    const transmission = rental?.transmission ?? primaryUnit?.transmission;
    const fuel = rental?.fuel_type ?? primaryUnit?.fuel_type;
    const seats = rental?.seats ?? primaryUnit?.seats;
    return [
      transmission ? { icon: "fi fi-rr-settings", label: transmission } : null,
      fuel ? { icon: "fi fi-rr-gas-pump", label: fuel } : null,
      formatSeats(seats) ? { icon: "fi fi-rr-users", label: formatSeats(seats) } : null,
    ].filter(Boolean);
  }, [isVehicle, rental]);

  const subtitleLine = [rental?.brand, rental?.subtitle].filter(Boolean).join(" · ");

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
        value: /km|mile|limit/i.test(String(rental.running_limit))
          ? rental.running_limit
          : `${rental.running_limit} km/day`,
        icon: "fi fi-rr-dashboard",
      });
    return out;
  }, [rental]);

  const handleBackClick = () => router.push("/rentals");

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

  const tabs = useMemo(() => {
    const items = [
      { id: "features", label: "Features", visible: features.length > 0 },
      { id: "inclusions", label: "Inclusions", visible: inclusions.length > 0 },
      { id: "exclusions", label: "Exclusions", visible: exclusions.length > 0 },
      { id: "faqs", label: "FAQs", visible: faqs.length > 0 },
      { id: "terms", label: "Terms & Conditions", visible: Boolean(termsContent?.trim()) },
    ];
    return items.filter((t) => t.visible);
  }, [features.length, inclusions.length, exclusions.length, faqs.length, termsContent]);

  useEffect(() => {
    if (!tabs.length) return;
    if (!tabs.some((t) => t.id === activeTab)) {
      setActiveTab(tabs[0].id);
    }
  }, [tabs, activeTab]);

  const handleMobileBooking = () => onBookNow();

  const pickupLocations = pickupOptions;

  const getMapLinkForPickup = (loc) => {
    const lat = loc?.latitude;
    const lng = loc?.longitude;
    if (lat != null && lng != null && String(lat) !== "" && String(lng) !== "") {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`;
    }
    if (loc?.name) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.name)}`;
    }
    return null;
  };

  const displayRate = rentalDisplayRate(pricing, { preferDay: isVehicle });
  const priceLabel =
    displayRate.amount != null
      ? `₹${formatMoney(displayRate.amount)}${displayRate.unit === "/ day" ? "/day" : "/hr"}`
      : "—";
  const priceUnitLabel = displayRate.unit === "/ day" ? "per day" : "per hour";
  const availableQty = Number(rental?.quantity) > 0 ? Number(rental.quantity) : null;
  const locationSummary =
    formatLocation(selectedPickup?.name || pickupLocations[0]?.name || rental?.location) || null;

  return (
    <div className="min-h-screen bg-gray-50 pb-24 lg:pb-8">
      <DetailSubHeader
        backLabel="Back to rentals"
        title={rental.title}
        onBack={handleBackClick}
        onShare={handleShare}
        shareAriaLabel="Share rental"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-6 lg:gap-8">
          <div className="min-w-0 max-w-full space-y-6">
            <div className="relative group">
              <button
                type="button"
                onClick={openImageViewer}
                disabled={!displayHeroUrl}
                className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gray-200 block text-left disabled:cursor-default"
                aria-label={displayHeroUrl ? "Open photo gallery" : "No image available"}
              >
                {displayHeroUrl ? (
                  <Image
                    src={displayHeroUrl}
                    alt={rental.title || "Rental"}
                    width={800}
                    height={450}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <i className={`${categoryIcon} text-5xl`} />
                  </div>
                )}
                {displayHeroUrl ? (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent pointer-events-none" />
                ) : null}
                {formType ? (
                  <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-xs font-medium text-gray-800 shadow-sm">
                    <i className={`${categoryIcon} text-sm`} />
                    {formTypeLabel(formType)}
                  </span>
                ) : null}
                {gallery.length > 1 ? (
                  <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white">
                    <i className="fi fi-rr-picture text-sm" />
                    {gallery.length} photos
                  </span>
                ) : null}
                {displayHeroUrl ? (
                  <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                    <i className="fi fi-rr-expand text-sm" />
                    View gallery
                  </span>
                ) : null}
              </button>
            </div>

            {gallery.length > 1 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-gray-800 tracking-tight">Gallery</h2>
                  {gallery.length > 8 ? (
                    <button
                      type="button"
                      onClick={openImageViewer}
                      className="text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
                    >
                      View all {gallery.length}
                    </button>
                  ) : null}
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {gallery.slice(0, 8).map((image, index) => {
                    const isLastSlot = index === 7 && gallery.length > 8;
                    const isSelected = heroIndex === index && !isLastSlot;
                    return (
                      <button
                        type="button"
                        key={image.id ?? index}
                        className={`relative aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer transition-all text-left p-0 border ${
                          isSelected
                            ? "border-primary-500 ring-2 ring-primary-500 ring-offset-2"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => (isLastSlot ? openImageViewer() : setHeroIndex(index))}
                        aria-label={
                          isLastSlot
                            ? `View ${gallery.length - 8} more photos`
                            : `Show photo ${index + 1}`
                        }
                        aria-current={isSelected ? "true" : undefined}
                      >
                        <Image
                          src={image.url}
                          alt={`${rental?.title || "Rental"} — ${index + 1}`}
                          width={300}
                          height={300}
                          className="w-full h-full object-cover"
                        />
                        {isLastSlot ? (
                          <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-white text-sm font-semibold">
                            +{gallery.length - 8}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <h2 className="text-base font-semibold text-gray-800 tracking-tight">About</h2>
              {rental.description ? (
                <RichTextContent html={rental.description} />
              ) : (
                <p className="text-gray-600 leading-relaxed text-sm">No description added.</p>
              )}
            </div>

            {specs.length > 0 && (
              <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h2 className="text-base font-semibold text-gray-900 tracking-tight">
                    Vehicle details
                  </h2>
                </div>
                <dl className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y divide-gray-100">
                  {specs.map((s) => (
                    <div key={s.label} className="px-4 py-3.5 flex items-start gap-2.5 min-w-0">
                      <i className={`${s.icon} text-primary-500 text-sm mt-0.5 shrink-0`} />
                      <div className="min-w-0">
                        <dt className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
                          {s.label}
                        </dt>
                        <dd className="text-sm font-semibold text-gray-900 mt-0.5 leading-snug">
                          {s.value}
                        </dd>
                      </div>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            {tabs.length > 0 && (
            <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-5 pt-5">
                <h2 className="text-base font-semibold text-gray-900 tracking-tight mb-4">
                  Details
                </h2>
                <div
                  role="tablist"
                  aria-label="Rental information"
                  className="flex gap-5 sm:gap-8 overflow-x-auto border-b border-gray-200 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
                        className={`relative shrink-0 pb-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                          isActive
                            ? "border-primary-500 text-primary-600"
                            : "border-transparent text-gray-500 hover:text-gray-800"
                        }`}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div role="tabpanel" className="px-5 py-5 min-h-[100px]">
                {activeTab === "features" && (
                  <div className="flex flex-wrap gap-2">
                    {features.map((f) => (
                      <span
                        key={f.id || f.name}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-50 text-gray-800 border border-gray-200"
                      >
                        <i className="fi fi-rr-check text-primary-500 text-xs" />
                        {formatFeatureName(f.name)}
                      </span>
                    ))}
                  </div>
                )}

                {activeTab === "inclusions" && (
                  <ul className="space-y-2.5 text-sm text-gray-700">
                    {inclusions.map((v, idx) => (
                      <li key={`${v}-${idx}`} className="flex gap-2.5">
                        <i className="fi fi-rr-check text-emerald-500 text-xs mt-1 shrink-0" />
                        <span>{v}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {activeTab === "exclusions" && (
                  <ul className="space-y-2.5 text-sm text-gray-700">
                    {exclusions.map((v, idx) => (
                      <li key={`${v}-${idx}`} className="flex gap-2.5">
                        <i className="fi fi-rr-cross-small text-rose-500 text-xs mt-1 shrink-0" />
                        <span>{v}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {activeTab === "faqs" && (
                  <div className="space-y-3">
                    {faqs.map((faq) => (
                      <Accordion key={faq.id} title={faq.question} defaultOpen={false}>
                        <div className="text-sm text-gray-700 whitespace-pre-line">{faq.answer}</div>
                      </Accordion>
                    ))}
                  </div>
                )}

                {activeTab === "terms" && <RichTextContent html={termsContent} />}
              </div>
            </section>
            )}

            {pickupLocations.length > 0 && (
              <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
                  <h2 className="text-base font-semibold text-gray-900 tracking-tight">
                    {pickupLocations.length > 1 ? "Pickup location" : "Location"}
                  </h2>
                  {pickupLocations.length > 1 ? (
                    <span className="text-xs text-gray-500 shrink-0">
                      {pickupLocations.length} options
                    </span>
                  ) : null}
                </div>

                <div className="p-5 space-y-4">
                  {pickupLocations.length > 1 ? (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">
                          Choose where to pick up
                        </label>
                        <PickupLocationPicker
                          options={pickupOptions}
                          selectedName={selectedPickupName}
                          onSelect={(opt) => setSelectedPickupName(opt.name)}
                          placeholder="Select pickup location"
                        />
                      </div>
                      {selectedPickup ? (
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1 border-t border-gray-100">
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
                              <i className="fi fi-rr-marker text-primary-500" />
                            </div>
                            <p className="text-sm font-medium text-gray-900 leading-snug pt-1.5">
                              {selectedPickup.name}
                            </p>
                          </div>
                          {getMapLinkForPickup(selectedPickup) ? (
                            <button
                              type="button"
                              onClick={() =>
                                window.open(getMapLinkForPickup(selectedPickup), "_blank")
                              }
                              className="inline-flex items-center justify-center gap-2 self-start sm:self-auto rounded-xl border border-primary-200 bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700 hover:bg-primary-100 transition-colors"
                            >
                              Get directions
                              <i className="fi fi-rr-arrow-up-right-from-square text-xs" />
                            </button>
                          ) : null}
                        </div>
                      ) : null}
                    </>
                  ) : (
                    pickupLocations.map((loc) => {
                      const directionsLink = getMapLinkForPickup(loc);
                      return (
                        <div
                          key={String(loc.id)}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
                              <i className="fi fi-rr-marker text-primary-500" />
                            </div>
                            <p className="text-sm font-medium text-gray-900 leading-snug pt-1.5">
                              {loc.name}
                            </p>
                          </div>
                          {directionsLink ? (
                            <button
                              type="button"
                              onClick={() => window.open(directionsLink, "_blank")}
                              className="inline-flex items-center justify-center gap-2 self-start sm:self-auto rounded-xl border border-primary-200 bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700 hover:bg-primary-100 transition-colors"
                            >
                              Get directions
                              <i className="fi fi-rr-arrow-up-right-from-square text-xs" />
                            </button>
                          ) : null}
                        </div>
                      );
                    })
                  )}
                </div>
              </section>
            )}
          </div>

          <div className="min-w-0 lg:shrink-0">
            <div className="sticky top-[4.5rem]">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
                    {rental.title}
                  </h1>
                  {subtitleLine ? (
                    <p className="text-sm text-gray-500 mt-1">{subtitleLine}</p>
                  ) : null}
                  {(chips.length > 0 || vehicleSpecChips.length > 0) && (
                    <div className="mt-3 space-y-2">
                      {chips.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {chips.map((c, idx) => (
                            <span
                              key={`${c}-${idx}`}
                              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      )}
                      {vehicleSpecChips.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {vehicleSpecChips.map((spec) => (
                            <span
                              key={spec.label}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-800"
                            >
                              <i className={`${spec.icon} text-xs`} />
                              {spec.label}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="p-5 bg-gradient-to-b from-gray-50/90 to-white">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Starting from
                  </p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-bold text-gray-900">
                      ₹{formatMoney(displayRate.amount ?? 0)}
                    </span>
                    <span className="text-sm text-gray-500">{priceUnitLabel}</span>
                  </div>
                  {availableQty ? (
                    <p className="text-xs text-emerald-700 font-medium mt-2">
                      {availableQty} available
                    </p>
                  ) : null}
                </div>

                <div className="px-5 pb-5 space-y-3 text-sm">
                  {pricing.security_deposit != null && Number(pricing.security_deposit) > 0 ? (
                    <div className="flex items-center justify-between py-3 border-t border-gray-100">
                      <span className="inline-flex items-center gap-2 text-gray-600">
                        <i className="fi fi-rr-shield-check text-primary-500" />
                        Security deposit
                      </span>
                      <span className="font-semibold text-gray-900">
                        ₹{formatMoney(pricing.security_deposit)}
                      </span>
                    </div>
                  ) : null}

                  {locationSummary ? (
                    <div className="flex items-start justify-between gap-3 py-3 border-t border-gray-100">
                      <span className="inline-flex items-center gap-2 text-gray-600 shrink-0">
                        <i className="fi fi-rr-marker text-primary-500" />
                        {pickupLocations.length > 1 ? "Pickup" : "Location"}
                      </span>
                      <span className="font-medium text-gray-900 text-right leading-snug">
                        {locationSummary}
                      </span>
                    </div>
                  ) : null}

                  {(pricing.price_per_week != null && pricing.price_per_week !== "") ||
                  (pricing.price_per_month != null && pricing.price_per_month !== "") ||
                  (pricing.advance_amount != null && pricing.advance_amount !== "") ||
                  (pricing.discount_type &&
                    pricing.discount_value != null &&
                    pricing.discount_value !== "") ? (
                    <div className="pt-3 border-t border-gray-100 space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Other rates
                      </p>
                      {pricing.price_per_week != null && pricing.price_per_week !== "" && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Per week</span>
                          <span className="font-medium text-gray-900">
                            ₹{formatMoney(pricing.price_per_week)}
                          </span>
                        </div>
                      )}
                      {pricing.price_per_month != null && pricing.price_per_month !== "" && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Per month</span>
                          <span className="font-medium text-gray-900">
                            ₹{formatMoney(pricing.price_per_month)}
                          </span>
                        </div>
                      )}
                      {pricing.advance_amount != null && pricing.advance_amount !== "" && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Advance</span>
                          <span className="font-medium text-gray-900">
                            ₹{formatMoney(pricing.advance_amount)}
                          </span>
                        </div>
                      )}
                      {pricing.discount_type &&
                        pricing.discount_value != null &&
                        pricing.discount_value !== "" && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Discount</span>
                            <span className="font-medium text-emerald-700">
                              {pricing.discount_type === "percent"
                                ? `${formatMoney(pricing.discount_value)}%`
                                : `₹${formatMoney(pricing.discount_value)}`}
                            </span>
                          </div>
                        )}
                    </div>
                  ) : null}
                </div>

                <div className="hidden lg:block p-5 pt-0">
                  <Button
                    onClick={onBookNow}
                    isLoading={isBooking}
                    className="w-full !rounded-xl !py-3"
                  >
                    Book now
                  </Button>
                  <p className="text-center text-xs text-gray-500 mt-3">
                    You won&apos;t be charged yet
                  </p>
                </div>
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

      <div className="fixed bottom-0 inset-x-0 lg:hidden z-40 pointer-events-none">
        <div className="pointer-events-auto mx-4 mb-4 pb-[env(safe-area-inset-bottom)]">
          <button
            type="button"
            onClick={handleMobileBooking}
            disabled={isBooking}
            className="w-full bg-primary-500 text-white py-3.5 px-5 rounded-2xl font-medium flex items-center justify-between shadow-xl shadow-primary-500/25 border border-primary-400/30 disabled:opacity-80"
          >
            <span className="text-sm font-semibold inline-flex items-center gap-2">
              {isBooking ? (
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : null}
              {isBooking ? "Loading…" : "Book now"}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">{priceLabel}</span>
              <i className={`${categoryIcon} text-sm opacity-90`} />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
