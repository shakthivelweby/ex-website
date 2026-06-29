"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Form from "./Form";
import Button from "@/components/common/Button";
import Accordion from "@/components/Accordion";
import Popup from "@/components/Popup";
import ImageViewer from "@/components/ImageViewer/ImageViewer";
import DetailPageLayout from "@/components/layout/DetailPageLayout";
import DetailSubHeader, { DETAIL_SIDEBAR_STICKY_TOP } from "@/components/layout/DetailSubHeader";
import RichTextContent from "@/components/common/RichTextContent";

function SectionCard({ title, children, className = "" }) {
  return (
    <section
      className={`overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] sm:p-6 ${className}`}
    >
      {title ? (
        <h2 className="mb-3 text-base font-semibold tracking-tight text-gray-900">{title}</h2>
      ) : null}
      {children}
    </section>
  );
}

function GuideItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
      <span className="fi-box h-10 w-10 shrink-0 rounded-lg border border-gray-200 bg-white text-primary-600">
        <i className={`${icon} text-base`} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="mt-0.5 text-sm font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

const AttractionDetailClient = ({ attractionDetails }) => {
  const router = useRouter();
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showMobileForm, setShowMobileForm] = useState(false);

  const openImageViewer = (index) => {
    setSelectedImageIndex(index);
    setIsImageViewerOpen(true);
  };

  const handleShare = async () => {
    const shareData = {
      title: attractionDetails.title,
      text: attractionDetails.description?.replace(/<[^>]+>/g, "").slice(0, 120),
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const hoursLabel = [attractionDetails.openingTime, attractionDetails.closingTime]
    .filter(Boolean)
    .join(" – ");

  const galleryImages = attractionDetails.gallery || [];

  return (
    <main className="min-h-screen bg-[#f8f9fb] pb-28 lg:pb-12">
      <Popup
        isOpen={showMobileForm}
        onClose={() => setShowMobileForm(false)}
        title="Book your visit"
        pos="bottom"
        draggable
        className="lg:hidden w-full rounded-t-3xl"
        pannelStyle="h-[78vh]"
      >
        <div className="flex-1 overflow-y-auto p-4">
          <Form attractionDetails={attractionDetails} isMobilePopup />
        </div>
      </Popup>

      <DetailSubHeader
        backLabel="Attractions"
        onBack={() => router.back()}
        onShare={handleShare}
        shareAriaLabel="Share attraction"
      />

      <DetailPageLayout
        containerClassName="mt-6"
        stickyTop={DETAIL_SIDEBAR_STICKY_TOP}
        sidebar={<Form attractionDetails={attractionDetails} />}
      >
        <div className="space-y-6 lg:space-y-8">
          <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="relative aspect-[16/10] w-full bg-gray-200 sm:aspect-[2/1]">
              {attractionDetails.image ? (
                <Image
                  src={attractionDetails.image}
                  alt={attractionDetails.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  priority
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/75 via-gray-900/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                {(attractionDetails.categoryName || attractionDetails.categories?.[0]) && (
                  <span className="mb-2 inline-flex rounded-full border border-white/20 bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
                    {attractionDetails.categoryName || attractionDetails.categories[0]}
                  </span>
                )}
                <h1 className="text-2xl font-bold leading-tight text-white sm:text-3xl">
                  {attractionDetails.title}
                </h1>
                {attractionDetails.location ? (
                  <p className="fi-inline mt-2 text-sm text-white/90">
                    <i className="fi fi-rr-marker text-xs" aria-hidden="true" />
                    <span>{attractionDetails.location}</span>
                  </p>
                ) : null}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-gray-100 p-4 sm:grid-cols-3 sm:p-5">
              {hoursLabel ? (
                <div className="col-span-2 flex items-center gap-2.5 sm:col-span-1">
                  <span className="fi-box h-9 w-9 shrink-0 rounded-lg border border-gray-200 bg-gray-50 text-primary-600">
                    <i className="fi fi-rr-clock text-sm" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Hours</p>
                    <p className="text-sm font-semibold text-gray-900">{hoursLabel}</p>
                  </div>
                </div>
              ) : null}
              <GuideItem
                icon="fi fi-rr-child"
                label="Kids friendly"
                value={attractionDetails.attractionGuide.kidsFriendly}
              />
              <GuideItem
                icon="fi fi-rr-paw"
                label="Pets friendly"
                value={attractionDetails.attractionGuide.petsFriendly}
              />
            </div>
          </div>

          {attractionDetails.description ? (
            <SectionCard title="About">
              <RichTextContent html={attractionDetails.description} />
            </SectionCard>
          ) : null}

          {galleryImages.length > 0 ? (
            <SectionCard title="Gallery">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
                {galleryImages.slice(0, 6).map((image, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => openImageViewer(index)}
                    className="group relative aspect-square overflow-hidden rounded-xl bg-gray-100"
                  >
                    <Image
                      src={image.image_url || image.image || image}
                      alt={image.alt_text || `Gallery image ${index + 1}`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                  </button>
                ))}
              </div>
              {galleryImages.length > 6 ? (
                <button
                  type="button"
                  onClick={() => openImageViewer(0)}
                  className="mt-4 w-full rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-primary-700 transition-colors hover:bg-primary-50"
                >
                  View all {galleryImages.length} photos
                </button>
              ) : null}
            </SectionCard>
          ) : null}

          {attractionDetails.attractionGuide.features?.length > 0 ? (
            <SectionCard title="Highlights">
              <div className="grid gap-2 sm:grid-cols-2">
                {attractionDetails.attractionGuide.features.map((feature, index) => (
                  <div key={index} className="fi-inline text-sm text-gray-700">
                    <i className="fi fi-rr-check text-xs text-primary-600" aria-hidden="true" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </SectionCard>
          ) : null}

          <SectionCard title="Location">
            <div className="space-y-4">
              <div className="fi-inline items-start text-gray-700">
                <span className="fi-box mt-0.5 h-9 w-9 shrink-0 rounded-lg border border-gray-200 bg-gray-50 text-primary-600">
                  <i className="fi fi-rr-marker text-sm" aria-hidden="true" />
                </span>
                <p className="text-sm leading-relaxed">
                  {attractionDetails.address ||
                    attractionDetails.location ||
                    "Address not available"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (attractionDetails.mapLink) {
                    window.open(attractionDetails.mapLink, "_blank");
                  } else {
                    const address = encodeURIComponent(
                      attractionDetails.address || attractionDetails.location || ""
                    );
                    window.open(
                      `https://www.google.com/maps/search/?api=1&query=${address}`,
                      "_blank"
                    );
                  }
                }}
                className="fi-inline rounded-full border border-primary-200 bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700 transition-colors hover:bg-primary-100"
              >
                <span>Get directions</span>
                <i className="fi fi-rr-arrow-right text-xs" aria-hidden="true" />
              </button>
            </div>
          </SectionCard>

          {attractionDetails.faqs?.length > 0 ? (
            <SectionCard title="Frequently asked questions">
              <div className="space-y-2">
                {attractionDetails.faqs.map((faq, index) => (
                  <Accordion key={index} title={faq.question} defaultOpen={index === 0}>
                    <p className="text-sm text-gray-600">{faq.answer}</p>
                  </Accordion>
                ))}
              </div>
            </SectionCard>
          ) : null}

          {attractionDetails.terms ? (
            <SectionCard title="Terms & conditions">
              <Accordion title="Important information" defaultOpen>
                <RichTextContent html={attractionDetails.terms} className="text-sm text-gray-600" />
              </Accordion>
            </SectionCard>
          ) : null}
        </div>
      </DetailPageLayout>

      {galleryImages.length > 0 ? (
        <ImageViewer
          isOpen={isImageViewerOpen}
          onClose={() => setIsImageViewerOpen(false)}
          images={galleryImages.map((img) => ({
            src: img.image_url || img.image || img,
            alt: img.alt_text || attractionDetails.title,
          }))}
          initialIndex={selectedImageIndex}
        />
      ) : null}

      {!showMobileForm ? (
        <div className="fixed bottom-16 left-4 right-4 z-40 lg:hidden">
          <Button
            onClick={() => setShowMobileForm(true)}
            size="lg"
            className="w-full !justify-between !rounded-2xl px-5 shadow-lg"
          >
            <span className="text-sm font-semibold">Select tickets</span>
            <span className="text-sm font-bold tabular-nums">{attractionDetails.price}</span>
          </Button>
        </div>
      ) : null}
    </main>
  );
};

export default AttractionDetailClient;
