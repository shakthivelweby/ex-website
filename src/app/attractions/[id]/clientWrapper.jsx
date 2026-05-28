"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Form from "./Form";
import TicketSelectionPopup from "./TicketSelectionPopup";
import Accordion from "@/components/Accordion";
import ImageViewer from "@/components/ImageViewer/ImageViewer";

const ClientOnlyHtml = ({ html, className }) => {
  const [mountedHtml, setMountedHtml] = useState("");

  useEffect(() => {
    setMountedHtml(typeof html === "string" ? html : "");
  }, [html]);

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: mountedHtml }}
      suppressHydrationWarning
    />
  );
};

const SectionTitle = ({ title, accent }) => (
  <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2.5 tracking-tight">
    {title}
    {accent ? (
      <>
        {" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">
          {accent}
        </span>
      </>
    ) : null}
  </h2>
);

const StatPill = ({ icon, label, value }) => (
  <div className="flex items-center gap-2.5 min-w-0 px-2 md:px-3">
    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-50 to-white text-primary-600 flex items-center justify-center shrink-0 ring-1 ring-primary-100/80">
      <i className={`${icon} text-sm`} />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{label}</p>
      <p className="text-sm font-semibold text-gray-900 truncate">{value}</p>
    </div>
  </div>
);

const ContentCard = ({ children, className = "" }) => (
  <section
    className={`bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100/80 p-4 shadow-sm shadow-gray-200/40 hover:shadow-md hover:shadow-primary-500/5 transition-shadow duration-300 ${className}`}
  >
    {children}
  </section>
);

const AttractionDetailClient = ({ attractionDetails }) => {
  const router = useRouter();
  const [selectedTickets, setSelectedTickets] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [isTicketPopupOpen, setIsTicketPopupOpen] = useState(false);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const handleTicketSelection = (tickets, price) => {
    setSelectedTickets(tickets);
    setTotalPrice(price);
    setIsTicketPopupOpen(false);
  };

  const openImageViewer = (index = 0) => {
    setSelectedImageIndex(index);
    setIsImageViewerOpen(true);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: attractionDetails.title,
          text: attractionDetails.description?.replace(/<[^>]*>/g, "").slice(0, 120),
          url,
        });
      } catch (_) {}
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  const handleMobileBooking = () => {
    router.push(`/attractions/${attractionDetails.id}/booking`);
  };

  const openDirections = () => {
    if (attractionDetails.mapLink) {
      window.open(attractionDetails.mapLink, "_blank");
      return;
    }
    const address = encodeURIComponent(
      attractionDetails.address || attractionDetails.location || ""
    );
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${address}`,
      "_blank"
    );
  };

  const hoursLabel =
    attractionDetails.openingTime && attractionDetails.closingTime
      ? `${attractionDetails.openingTime} – ${attractionDetails.closingTime}`
      : null;

  const heroImage = attractionDetails.image;

  return (
    <main className="min-h-screen bg-[#f6f8fa] pb-20 lg:pb-8">
      <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-primary-50/50 to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-5 md:pt-6">
        {/* Hero */}
        <section className="relative rounded-[22px] md:rounded-3xl overflow-hidden bg-gray-900 shadow-xl shadow-primary-900/10 ring-1 ring-black/5">
          <div className="relative h-[230px] sm:h-[270px] md:h-[310px]">
            {heroImage ? (
              <Image
                src={heroImage}
                alt={attractionDetails.title}
                fill
                className="object-cover scale-105"
                priority
                sizes="(max-width: 1280px) 100vw, 1280px"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/5" />

            <div className="absolute top-0 inset-x-0 z-10 p-3 md:p-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 text-sm font-medium text-white hover:text-white/90 transition-colors"
              >
                <span className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <i className="fi fi-rr-arrow-left text-sm" />
                </span>
                <span className="hidden sm:inline">Back</span>
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                aria-label="Share"
              >
                <i className="fi fi-rr-share text-sm" />
              </button>
            </div>

            <div className="absolute bottom-0 inset-x-0 z-10 p-4 md:p-5">
              {attractionDetails.categoryName ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/10 backdrop-blur-xl text-white border border-white/15 mb-2">
                  <i className="fi fi-rr-ferris-wheel text-[10px]" />
                  {attractionDetails.categoryName}
                </span>
              ) : null}

              <h1 className="text-xl sm:text-2xl md:text-[2rem] font-semibold text-white tracking-tight leading-tight max-w-3xl">
                {attractionDetails.title}
              </h1>
            </div>
          </div>
        </section>

        {/* Stats — keep z-index below datepicker popper */}
        <div className="relative z-[2] -mt-3.5 md:-mt-4 mx-1 md:mx-3">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white shadow-lg shadow-gray-200/50 py-3 md:py-3.5 grid grid-cols-2 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100/80">
            <StatPill
              icon="fi fi-rr-child"
              label="Kids"
              value={attractionDetails.attractionGuide.kidsFriendly}
            />
            <StatPill
              icon="fi fi-rr-paw"
              label="Pets"
              value={attractionDetails.attractionGuide.petsFriendly}
            />
            {hoursLabel ? (
              <StatPill icon="fi fi-rr-clock" label="Hours" value={hoursLabel} />
            ) : (
              <StatPill icon="fi fi-rr-ticket" label="Entry" value={attractionDetails.price} />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5 mt-4 md:mt-5">
          <div className="lg:col-span-2 space-y-3">
            <ContentCard>
              <SectionTitle title="About this" accent="attraction" />
              <ClientOnlyHtml
                className="text-gray-600 leading-relaxed text-sm prose prose-sm prose-gray max-w-none"
                html={attractionDetails.description}
              />
            </ContentCard>

            {attractionDetails.gallery?.length > 0 ? (
              <ContentCard>
                <SectionTitle title="Photo" accent="gallery" />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {attractionDetails.gallery.slice(0, 6).map((image, index) => (
                    <button
                      key={index}
                      type="button"
                      className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 ring-1 ring-black/[0.04]"
                      onClick={() => openImageViewer(index)}
                    >
                      <Image
                        src={image.image_url || image.image || image}
                        alt={image.alt_text || `Gallery image ${index + 1}`}
                        width={300}
                        height={300}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                      <span className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-white/90 text-gray-800 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all shadow-sm">
                        <i className="fi fi-rr-expand text-[10px]" />
                      </span>
                    </button>
                  ))}
                </div>
                {attractionDetails.gallery.length > 6 ? (
                  <button
                    type="button"
                    onClick={() => openImageViewer(0)}
                    className="mt-2.5 w-full py-2 text-sm font-semibold text-primary-600 hover:text-primary-700 bg-primary-50/60 hover:bg-primary-50 rounded-xl transition-all inline-flex items-center justify-center gap-2"
                  >
                    View all {attractionDetails.gallery.length} photos
                    <i className="fi fi-rr-arrow-right text-xs" />
                  </button>
                ) : null}
              </ContentCard>
            ) : null}

            {attractionDetails.attractionGuide.features?.length > 0 ? (
              <ContentCard>
                <SectionTitle title="Key" accent="features" />
                <div className="flex flex-wrap gap-1.5">
                  {attractionDetails.attractionGuide.features.map((feature, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-primary-50 to-white text-primary-700 ring-1 ring-primary-100/80"
                    >
                      <i className="fi fi-rr-check text-[10px]" />
                      {feature}
                    </span>
                  ))}
                </div>
              </ContentCard>
            ) : null}

            <ContentCard>
              <SectionTitle title="Where to" accent="find us" />
              <div className="rounded-xl bg-gradient-to-br from-gray-50 to-white ring-1 ring-gray-100 p-3.5 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-white text-primary-600 flex items-center justify-center shrink-0 shadow-sm ring-1 ring-gray-100">
                  <i className="fi fi-rr-marker" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {attractionDetails.address ||
                      attractionDetails.location ||
                      "Address not available"}
                  </p>
                  <button
                    type="button"
                    onClick={openDirections}
                    className="mt-2.5 inline-flex items-center gap-2 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 rounded-full px-4 py-2 transition-colors"
                  >
                    Get directions
                    <i className="fi fi-rr-arrow-right text-xs" />
                  </button>
                </div>
              </div>
            </ContentCard>

            {attractionDetails.faqs?.length > 0 ? (
              <ContentCard>
                <SectionTitle title="FAQ" />
                <div className="space-y-1.5">
                  {attractionDetails.faqs.map((faq, index) => (
                    <Accordion
                      key={index}
                      title={faq.question}
                      defaultOpen={false}
                      isControlled
                      isOpen={openFaqIndex === index}
                      onToggle={(open) => setOpenFaqIndex(open ? index : null)}
                      children={
                        <div className="text-sm text-gray-600 leading-relaxed">
                          {faq.answer}
                        </div>
                      }
                    />
                  ))}
                </div>
              </ContentCard>
            ) : null}

            {attractionDetails.terms ? (
              <ContentCard className="border-l-4 border-l-primary-400">
                <SectionTitle title="Note" />
                <ClientOnlyHtml
                  className="text-sm text-gray-600 prose prose-sm max-w-none leading-relaxed"
                  html={attractionDetails.terms}
                />
              </ContentCard>
            ) : null}
          </div>

          <aside className="lg:col-span-1 relative z-20">
            <div className="lg:sticky lg:top-16 space-y-2.5">
              <div className="hidden lg:block rounded-2xl bg-white ring-1 ring-gray-100 shadow-xl shadow-primary-500/10 overflow-visible">
                <div className="px-4 pt-4 pb-3 border-b border-gray-100 bg-gradient-to-r from-primary-50/80 to-white rounded-t-2xl">
                  <p className="text-xs font-medium text-primary-700">Book your visit</p>
                  <p className="text-xl font-bold text-gray-900 tracking-tight mt-0.5">
                    From {attractionDetails.price}
                  </p>
                </div>
                <div className="p-4">
                  <Form
                    attractionDetails={attractionDetails}
                    selectedTickets={selectedTickets}
                    totalPrice={totalPrice}
                    embedded
                  />
                </div>
              </div>

              <div className="hidden lg:grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleShare}
                  className="py-2.5 rounded-xl bg-white ring-1 ring-gray-100 text-sm font-medium text-gray-700 hover:ring-primary-200 hover:text-primary-600 hover:bg-primary-50/40 transition-all inline-flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <i className="fi fi-rr-share text-sm" />
                  Share
                </button>
                <button
                  type="button"
                  onClick={openDirections}
                  className="py-2.5 rounded-xl bg-white ring-1 ring-gray-100 text-sm font-medium text-gray-700 hover:ring-primary-200 hover:text-primary-600 hover:bg-primary-50/40 transition-all inline-flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <i className="fi fi-rr-marker text-sm" />
                  Map
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <TicketSelectionPopup
        isOpen={isTicketPopupOpen}
        onClose={() => setIsTicketPopupOpen(false)}
        attractionId={attractionDetails.id}
        onContinue={handleTicketSelection}
      />

      {attractionDetails.gallery?.length > 0 ? (
        <ImageViewer
          isOpen={isImageViewerOpen}
          onClose={() => setIsImageViewerOpen(false)}
          images={attractionDetails.gallery.map((img) => ({
            src: img.image_url || img.image || img,
            alt: img.alt_text || attractionDetails.title,
          }))}
          initialIndex={selectedImageIndex}
        />
      ) : null}

      <div className="fixed bottom-16 left-0 right-0 lg:hidden z-40 px-4">
        <div className="bg-white/95 backdrop-blur-2xl rounded-2xl ring-1 ring-gray-100 shadow-2xl shadow-gray-300/30 p-2 flex items-center gap-2">
          <div className="pl-2.5 min-w-0">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider leading-none">
              From
            </p>
            <p className="text-sm font-bold text-gray-900 truncate">{attractionDetails.price}</p>
          </div>
          <button
            type="button"
            onClick={handleMobileBooking}
            className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white py-2.5 px-4 rounded-xl font-semibold text-sm transition-all inline-flex items-center justify-center gap-2 shadow-lg shadow-primary-500/25"
          >
            Book now
            <i className="fi fi-rr-ticket text-sm" />
          </button>
        </div>
      </div>
    </main>
  );
};

export default AttractionDetailClient;
