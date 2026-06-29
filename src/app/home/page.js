"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import Search from "@/components/Search/Search";
import Footer from "@/components/Footer/Footer";

const MODULES = [
  {
    id: "packages",
    name: "Packages",
    shortName: "Packages",
    icon: "fi fi-rr-umbrella-beach",
    href: "/explore",
    image: "/package-image-1.webp",
    description:
      "Curated travel packages with stays, transport, and experiences bundled together. Book direct from verified suppliers.",
    highlights: [
      "All-inclusive itineraries",
      "Transparent pricing",
      "Verified operators",
    ],
    accent: {
      iconBg: "bg-primary-50",
      iconColor: "text-primary-600",
      hoverBorder: "hover:border-primary-200",
      cardHover: "hover:bg-primary-50/30",
    },
  },
  {
    id: "scheduled",
    name: "Scheduled Trips",
    shortName: "Scheduled",
    icon: "fi fi-rr-calendar",
    href: "/scheduled",
    image:
      "https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=1200",
    description:
      "Join fixed-departure group tours with set dates. Travel with like-minded explorers while the itinerary is handled for you.",
    highlights: [
      "Fixed departures",
      "Group experiences",
      "Hassle-free planning",
    ],
    accent: {
      iconBg: "bg-sky-50",
      iconColor: "text-sky-600",
      hoverBorder: "hover:border-sky-200",
      cardHover: "hover:bg-sky-50/40",
    },
  },
  {
    id: "attractions",
    name: "Attractions",
    shortName: "Attractions",
    icon: "fi fi-rr-ferris-wheel",
    href: "/attractions",
    image: "/attraction-image-1.jpg",
    description:
      "Book tickets to museums, theme parks, and landmarks. Skip queues and secure entry before you arrive.",
    highlights: ["Instant confirmation", "Top-rated sights", "Flexible dates"],
    accent: {
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      hoverBorder: "hover:border-amber-200",
      cardHover: "hover:bg-amber-50/40",
    },
  },
  {
    id: "events",
    name: "Events",
    shortName: "Events",
    icon: "fi fi-rr-glass-cheers",
    href: "/events",
    image: "/event-image-1.jpg",
    description:
      "Concerts, festivals, sports, and live shows — book tickets directly without markups from verified hosts.",
    highlights: [
      "Concerts & festivals",
      "Sports & theatre",
      "Date-based search",
    ],
    accent: {
      iconBg: "bg-rose-50",
      iconColor: "text-rose-600",
      hoverBorder: "hover:border-rose-200",
      cardHover: "hover:bg-rose-50/40",
    },
  },
  {
    id: "rentals",
    name: "Rentals",
    shortName: "Rentals",
    icon: "fi fi-rr-car-side",
    href: "/rentals",
    image: "/rental-image-1.jpg",
    description:
      "Rent cars and vehicles to explore at your own pace. Compare options from trusted local rental partners.",
    highlights: ["Flexible pickup", "Wide vehicle range", "Direct rates"],
    accent: {
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-600",
      hoverBorder: "hover:border-indigo-200",
      cardHover: "hover:bg-indigo-50/40",
    },
  },
  {
    id: "activities",
    name: "Activities",
    shortName: "Activities",
    icon: "fi fi-rr-hiking",
    href: "/activities",
    image: "/activity-image-1.jpg",
    description:
      "Outdoor adventures, workshops, and local experiences that make your trip memorable. Book by location and date.",
    highlights: ["Adventure & wellness", "Local experiences", "Small groups"],
    accent: {
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      hoverBorder: "hover:border-emerald-200",
      cardHover: "hover:bg-emerald-50/40",
    },
  },
];

const STEPS = [
  {
    step: "01",
    title: "Choose a module",
    description:
      "Pick packages, events, attractions, or any module that matches your plans.",
  },
  {
    step: "02",
    title: "Book direct",
    description:
      "Reserve with verified suppliers — transparent pricing, no hidden fees.",
  },
  {
    step: "03",
    title: "Enjoy",
    description:
      "Show up and experience it. Your booking details are always at hand.",
  },
];

function ModuleCtaStrip() {
  return (
    <section className="relative z-10 -mt-10 md:-mt-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
          {MODULES.map((module) => (
            <Link
              key={module.id}
              href={module.href}
              className={`group flex flex-col items-center text-center gap-2.5 sm:gap-3 px-3 py-4 sm:py-5 bg-white/95 backdrop-blur-sm rounded-2xl border border-white/60 shadow-[0_4px_24px_rgba(6,148,148,0.08)] ${module.accent.hoverBorder} ${module.accent.cardHover} hover:shadow-[0_12px_36px_rgba(6,148,148,0.14)] hover:-translate-y-0.5 transition-all duration-200`}
            >
              <span
                className={`flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl ${module.accent.iconBg} ${module.accent.iconColor} transition-transform duration-200 group-hover:scale-105`}
              >
                <i className={`${module.icon} text-base sm:text-lg`} />
              </span>
              <span className="text-[12px] sm:text-[13px] font-semibold text-[#222222] group-hover:text-[#111111] leading-tight tracking-tight transition-colors">
                <span className="sm:hidden">{module.shortName}</span>
                <span className="hidden sm:inline">{module.name}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function ModuleSection({ module, index, reversed }) {
  const sectionNum = String(index + 1).padStart(2, "0");

  return (
    <section
      id={`module-${module.id}`}
      className={`scroll-mt-24 ${index % 2 === 1 ? "bg-[#FAFAFA]" : "bg-white"}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className={`relative ${reversed ? "lg:order-2" : ""}`}>
            <div className="relative aspect-[5/4] rounded-2xl overflow-hidden bg-[#F0F0F0] shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
              <Image
                src={module.image}
                alt={module.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>

          <div className={reversed ? "lg:order-1" : ""}>
            <p className="text-xs font-semibold tracking-widest text-[#B0B0B0] mb-4">
              {sectionNum}
            </p>

            <h2 className="text-[28px] md:text-[36px] font-semibold text-[#222222] tracking-tight leading-[1.15] mb-4">
              {module.name}
            </h2>
            <p className="text-[#717171] text-[15px] md:text-base leading-relaxed mb-6 max-w-md">
              {module.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-8">
              {module.highlights.map((point) => (
                <span
                  key={point}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F7F7F7] text-xs font-medium text-[#222222] border border-[#EBEBEB]"
                >
                  <i className="fi fi-rr-check text-primary-500 text-[10px]" />
                  {point}
                </span>
              ))}
            </div>

            <Link
              href={module.href}
              className="group inline-flex items-center gap-2 text-[15px] font-semibold text-[#222222] hover:text-primary-600 transition-colors"
            >
              Explore {module.name.toLowerCase()}
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#222222] text-white group-hover:bg-primary-600 transition-colors">
                <i className="fi fi-rr-arrow-right text-xs" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-[#222222]">
      <Search isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Hero */}
      <section className="relative bg-[#222222]">
        <div className="relative h-[62vh] min-h-[480px] max-h-[640px] w-full overflow-hidden">
          <Image
            src="https://images.pexels.com/photos/2155749/pexels-photo-2155749.jpeg"
            alt="Explore destinations worldwide"
            fill
            priority
            className="object-cover opacity-90"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/25 to-black/60" />

          <div className="absolute inset-0 flex flex-col items-center justify-center px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-2xl mb-8"
            >
              <p className="text-white/70 text-xs font-semibold uppercase tracking-[0.2em] mb-4">
                Explore World
              </p>
              <h1 className="text-[36px] md:text-[52px] lg:text-[56px] font-semibold text-white leading-[1.08] tracking-tight mb-4">
                Pay less.
                <br className="hidden sm:block" /> Book direct.
              </h1>
              <p className="text-white/80 text-base md:text-lg leading-relaxed max-w-md mx-auto">
                Packages, events, attractions, activities & more — from verified
                suppliers, one search away.
              </p>
            </motion.div>

            <motion.button
              type="button"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              onClick={() => setIsSearchOpen(true)}
              className="w-full max-w-[480px] flex items-center gap-3 bg-white rounded-full px-5 py-3 hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)] transition-shadow"
            >
              <span className="flex items-center justify-center w-9 h-9 rounded-full bg-[#F7F7F7] shrink-0">
                <i className="fi fi-rr-search text-[#222222] text-sm" />
              </span>
              <span className="text-sm text-[#717171] flex-1 text-left">
                Where to? Search anything...
              </span>
              <span className="hidden sm:inline-flex items-center justify-center bg-[#222222] text-white text-xs font-semibold px-5 py-2.5 rounded-full shrink-0">
                Search
              </span>
            </motion.button>
          </div>
        </div>
      </section>

      <ModuleCtaStrip />

      <div className="h-10 md:h-12 bg-gradient-to-b from-primary-50/40 to-white" />

      {/* Module intro */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-10 pb-6 md:pb-8">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-600 mb-3">
            Six ways to travel
          </p>
          <h2 className="text-[28px] md:text-[36px] font-semibold text-[#222222] tracking-tight leading-tight mb-4">
            Everything you can book
          </h2>
          <p className="text-[#717171] text-[15px] md:text-base leading-relaxed">
            One platform, six modules. Each connects you directly to suppliers —
            pick what fits your trip and book with confidence.
          </p>
        </div>
      </section>

      {/* Module sections */}
      {MODULES.map((module, index) => (
        <ModuleSection
          key={module.id}
          module={module}
          index={index}
          reversed={index % 2 === 1}
        />
      ))}

      {/* How it works */}
      <section className="bg-[#111111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center max-w-xl mx-auto mb-14">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50 mb-3">
              Simple process
            </p>
            <h2 className="text-[28px] md:text-[36px] font-semibold text-white tracking-tight mb-3">
              How Explore World works
            </h2>
            <p className="text-[#999999] text-[15px]">
              Three steps from discovery to your next adventure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((item) => (
              <div
                key={item.step}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 hover:bg-white/[0.06] transition-colors"
              >
                <span className="text-xs font-semibold tracking-widest text-white/40 mb-6 block">
                  {item.step}
                </span>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-[#999999] text-[15px] leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="relative rounded-3xl overflow-hidden min-h-[280px] md:min-h-[340px] flex items-center">
          <Image
            src="/cover.jpg"
            alt="Travel inspiration"
            fill
            className="object-cover"
            sizes="(max-width: 1280px) 100vw, 1280px"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />
          <div className="relative z-10 p-8 md:p-14 max-w-lg">
            <p className="text-white/60 text-xs font-semibold uppercase tracking-[0.15em] mb-3">
              Ready to start?
            </p>
            <h2 className="text-2xl md:text-[32px] font-semibold text-white leading-tight mb-6">
              Find the right experience for your next trip.
            </h2>
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="inline-flex items-center gap-2 bg-white text-[#222222] px-6 py-3 rounded-full text-sm font-semibold hover:bg-[#F7F7F7] transition-colors"
            >
              Start searching
              <i className="fi fi-rr-arrow-right text-xs" />
            </button>
          </div>
        </div>
      </section>

      {/* Supplier CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-24">
        <div className="rounded-3xl bg-[#FAFAFA] border border-[#EBEBEB] p-8 md:p-12 lg:p-14 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="max-w-lg">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary-600 mb-3">
              For suppliers
            </p>
            <h2 className="text-2xl md:text-[28px] font-semibold text-[#222222] leading-tight mb-3">
              List your experiences.
              <br />
              Reach travelers worldwide.
            </h2>
            <p className="text-[#717171] text-[15px] leading-relaxed">
              Join verified partners on Explore World. Simple onboarding and
              instant visibility after approval.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              href="/supplier"
              className="inline-flex items-center gap-2 bg-[#222222] text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-black transition-colors"
            >
              Become a partner
              <i className="fi fi-rr-arrow-right text-xs" />
            </Link>
            <a
              href="https://supplier.exploreworld.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 rounded-full text-sm font-semibold text-[#222222] border border-[#DDDDDD] bg-white hover:border-[#222222] transition-colors"
            >
              Supplier login
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
