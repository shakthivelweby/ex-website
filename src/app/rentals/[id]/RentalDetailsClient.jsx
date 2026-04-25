"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";
import Accordion from "@/components/Accordion";
import LocationSearchPopup from "@/components/LocationSearchPopup";
import { checkRentalAvailability } from "../clientService";

const formatMoney = (v) => {
  const n = Number(v || 0);
  if (!Number.isFinite(n)) return "0";
  return n.toFixed(2);
};

const initialBooking = {
  pickup_location: "",
  dropoff_location: "",
  start_date: "",
  end_date: "",
  pickup_time: "",
  dropoff_time: "",
};

export default function RentalDetailsClient({ rental }) {
  const router = useRouter();
  const pricing = rental?.pricing_rule || rental?.pricingRule || {};

  const [open, setOpen] = useState(false);
  const [pickupPopupOpen, setPickupPopupOpen] = useState(false);
  const [dropoffPopupOpen, setDropoffPopupOpen] = useState(false);
  const [booking, setBooking] = useState(initialBooking);
  const [checking, setChecking] = useState(false);
  const [avail, setAvail] = useState(null);
  const [selectedUnitId, setSelectedUnitId] = useState(null);
  const [error, setError] = useState("");
  const [docName, setDocName] = useState("");

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
    if (rental?.transmission) out.push({ label: "Transmission", value: rental.transmission, icon: "fi fi-rr-settings-sliders" });
    if (rental?.fuel_type) out.push({ label: "Fuel type", value: rental.fuel_type, icon: "fi fi-rr-gas-pump" });
    if (rental?.seats) out.push({ label: "Seats", value: rental.seats, icon: "fi fi-rr-users" });
    if (rental?.running_limit) out.push({ label: "Running limit", value: rental.running_limit, icon: "fi fi-rr-dashboard" });
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

  const updateBooking = (k, v) => {
    setBooking((p) => ({ ...p, [k]: v }));
    setError("");
    setAvail(null);
    setSelectedUnitId(null);
  };

  const toDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });

  const onSelectDoc = async (file) => {
    if (!file) {
      setDocName("");
      try {
        sessionStorage.removeItem("rental_booking_doc_data_url");
        sessionStorage.removeItem("rental_booking_doc_name");
        sessionStorage.removeItem("rental_booking_doc_type");
      } catch (_) {}
      return;
    }

    // Soft limit: store in sessionStorage only if reasonably small.
    // If large, user can still upload later on checkout page.
    if (file.size > 1.5 * 1024 * 1024) {
      setDocName(file.name);
      try {
        sessionStorage.removeItem("rental_booking_doc_data_url");
        sessionStorage.removeItem("rental_booking_doc_name");
        sessionStorage.removeItem("rental_booking_doc_type");
      } catch (_) {}
      setError("Document is large. Please upload in checkout (or choose a smaller file).");
      return;
    }

    try {
      const dataUrl = await toDataUrl(file);
      setDocName(file.name);
      setError("");
      sessionStorage.setItem("rental_booking_doc_data_url", dataUrl);
      sessionStorage.setItem("rental_booking_doc_name", file.name);
      sessionStorage.setItem("rental_booking_doc_type", file.type || "application/octet-stream");
    } catch (_) {
      setDocName(file.name);
      setError("Failed to attach document. You can upload it on checkout.");
    }
  };

  const applyPlaceToField = (field) => (place) => {
    if (!place) return;
    const locationName = place.name || place.formatted_address || place.vicinity || "";
    updateBooking(field, locationName);
  };

  const validateBooking = () => {
    const required = [
      "pickup_location",
      "dropoff_location",
      "start_date",
      "end_date",
      "pickup_time",
      "dropoff_time",
    ];
    for (const k of required) {
      if (!String(booking[k] || "").trim()) return `Please fill ${k.replaceAll("_", " ")}.`;
    }
    return "";
  };

  const onCheckAvailability = async () => {
    const msg = validateBooking();
    if (msg) {
      setError(msg);
      return;
    }
    setChecking(true);
    setError("");
    try {
      const res = await checkRentalAvailability(rental.id, booking);
      setAvail(res?.data || null);
      setSelectedUnitId(
        res?.data?.suggested_unit_id ||
          (Array.isArray(res?.data?.available_unit_ids) ? res.data.available_unit_ids[0] : null) ||
          null
      );
      if (res?.data?.is_available === false) {
        setError("No cars available for the selected location/date/time.");
      }
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to check availability.");
    } finally {
      setChecking(false);
    }
  };

  const onContinue = () => {
    if (!avail || avail?.is_available === false) {
      setError("Please check availability first.");
      return;
    }
    if (!selectedUnitId) {
      setError("No car/unit selected. Please check availability again.");
      return;
    }
    const params = new URLSearchParams({
      rental_item_id: String(rental.id),
      rental_item_unit_id: String(selectedUnitId),
      pickup_location: booking.pickup_location,
      dropoff_location: booking.dropoff_location,
      start_date: booking.start_date,
      end_date: booking.end_date,
      pickup_time: booking.pickup_time,
      dropoff_time: booking.dropoff_time,
    });
    router.push(`/checkout/rentals?${params.toString()}`);
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
                  <Button onClick={() => setOpen(true)} className="w-full !rounded-xl">
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

      {/* Booking modal (kept) */}
      {open && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => {
              setOpen(false);
              setBooking(initialBooking);
              setAvail(null);
              setError("");
            }}
          />
          <div className="absolute inset-x-0 top-16 mx-auto max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-gray-900">Book {rental.title}</div>
                <div className="text-xs text-gray-500">Pickup/Dropoff, date and time</div>
              </div>
              <button
                type="button"
                className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700"
                onClick={() => {
                  setOpen(false);
                  setBooking(initialBooking);
                  setAvail(null);
                  setError("");
                }}
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600">Pickup location *</label>
                  <button
                    type="button"
                    onClick={() => setPickupPopupOpen(true)}
                    className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white text-left text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  >
                    {booking.pickup_location ? (
                      <span>{booking.pickup_location}</span>
                    ) : (
                      <span className="text-gray-400">Choose pickup location</span>
                    )}
                  </button>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Dropoff location *</label>
                  <button
                    type="button"
                    onClick={() => setDropoffPopupOpen(true)}
                    className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white text-left text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  >
                    {booking.dropoff_location ? (
                      <span>{booking.dropoff_location}</span>
                    ) : (
                      <span className="text-gray-400">Choose dropoff location</span>
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600">Start date *</label>
                  <input
                    type="date"
                    value={booking.start_date}
                    onChange={(e) => updateBooking("start_date", e.target.value)}
                    className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">End date *</label>
                  <input
                    type="date"
                    value={booking.end_date}
                    onChange={(e) => updateBooking("end_date", e.target.value)}
                    className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600">Pickup time *</label>
                  <input
                    type="time"
                    value={booking.pickup_time}
                    onChange={(e) => updateBooking("pickup_time", e.target.value)}
                    className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Dropoff time *</label>
                  <input
                    type="time"
                    value={booking.dropoff_time}
                    onChange={(e) => updateBooking("dropoff_time", e.target.value)}
                    className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">Document (optional)</label>
                <div className="text-[11px] text-gray-500 mt-1">
                  Upload driving license / ID proof (jpg, png, pdf). Optional.
                </div>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  className="mt-2 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white text-gray-900"
                  onChange={(e) => onSelectDoc(e.target.files?.[0] || null)}
                />
                {docName ? (
                  <div className="mt-1 text-xs text-gray-700">Selected: {docName}</div>
                ) : null}
              </div>

              {error && <div className="text-sm text-red-600 font-medium">{error}</div>}

              {avail && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm">
                  <div className="font-semibold text-gray-900">Availability</div>
                  <div className="text-gray-700 mt-1">
                    Eligible units: <span className="font-semibold">{avail.eligible_units ?? 0}</span>
                  </div>
                  <div className="text-gray-700">
                    Available now: <span className="font-semibold">{avail.available_units ?? 0}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-gray-100 flex items-center justify-between gap-3">
              <button
                type="button"
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold"
                onClick={() => {
                  setBooking(initialBooking);
                  setAvail(null);
                  setError("");
                }}
              >
                Reset
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onCheckAvailability}
                  disabled={checking}
                  className="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-semibold disabled:opacity-60"
                >
                  {checking ? "Checking..." : "Check availability"}
                </button>
                <button
                  type="button"
                  onClick={onContinue}
                  disabled={!avail?.is_available || !selectedUnitId}
                  className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Location pickers */}
      <LocationSearchPopup
        isOpen={pickupPopupOpen}
        onClose={() => setPickupPopupOpen(false)}
        onPlaceSelected={(place) => {
          applyPlaceToField("pickup_location")(place);
          setPickupPopupOpen(false);
        }}
        onClear={() => updateBooking("pickup_location", "")}
        initialValue={booking.pickup_location}
        googleApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
        title="Choose pickup location"
      />
      <LocationSearchPopup
        isOpen={dropoffPopupOpen}
        onClose={() => setDropoffPopupOpen(false)}
        onPlaceSelected={(place) => {
          applyPlaceToField("dropoff_location")(place);
          setDropoffPopupOpen(false);
        }}
        onClear={() => updateBooking("dropoff_location", "")}
        initialValue={booking.dropoff_location}
        googleApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
        title="Choose dropoff location"
      />
    </div>
  );
}

