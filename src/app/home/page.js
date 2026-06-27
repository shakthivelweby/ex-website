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
  },
  {
    id: "scheduled",
    name: "Scheduled Trips",
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
  },
  {
    id: "attractions",
    name: "Attractions",
    icon: "fi fi-rr-ferris-wheel",
    href: "/attractions",
    image: "/attraction-image-1.jpg",
    description:
      "Book tickets to museums, theme parks, and landmarks. Skip queues and secure entry before you arrive.",
    highlights: [
      "Instant confirmation",
      "Top-rated sights",
      "Flexible dates",
    ],
  },
  {
    id: "events",
    name: "Events",
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
  },
  {
    id: "rentals",
    name: "Rentals",
    icon: "fi fi-rr-car-side",
    href: "/rentals",
    image: "/rental-image-1.jpg",
    description:
      "Rent cars and vehicles to explore at your own pace. Compare options from trusted local rental partners.",
    highlights: [
      "Flexible pickup",
      "Wide vehicle range",
      "Direct rates",
    ],
  },
  {
    id: "activities",
    name: "Activities",
    icon: "fi fi-rr-hiking",
    href: "/activities",
    image: "/activity-image-1.jpg",
    description:
      "Outdoor adventures, workshops, and local experiences that make your trip memorable. Book by location and date.",
    highlights: [
      "Adventure & wellness",
      "Local experiences",
      "Small groups",
    ],
  },
];

const TRUST_ITEMS = [
  { icon: "fi fi-rr-shield-check", label: "Verified suppliers" },
  { icon: "fi fi-rr-hand-holding-usd", label: "No middleman fees" },
  { icon: "fi fi-rr-badge-check", label: "Transparent pricing" },
  { icon: "fi fi-rr-headset", label: "24/7 support" },
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

function ModuleNav() {
  return (
    <div className="flex flex-wrap justify-center gap-2 md:gap-3">
      {MODULES.map((module) => (
        <Link
          key={module.id}
          href={`#module-${module.id}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#EBEBEB] bg-white text-sm font-medium text-[#222222] hover:border-[#222222] hover:shadow-sm transition-all"
        >
          <i className={`${module.icon} text-[#717171] text-sm`} />
          {module.name}
        </Link>
      ))}
    </div>
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
          <div
            className={`relative ${reversed ? "lg:order-2" : ""}`}
          >
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
        <div className="relative h-[55vh] min-h-[420px] max-h-[580px] w-full overflow-hidden">
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
                <br className="hidden sm:block" />
                {" "}Book direct.
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

      {/* Trust strip */}
      <section className="bg-[#FAFAFA] border-b border-[#EBEBEB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {TRUST_ITEMS.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 justify-center lg:justify-start"
              >
                <span className="flex items-center justify-center w-9 h-9 rounded-full bg-white border border-[#EBEBEB] shrink-0">
                  <i className={`${item.icon} text-primary-500 text-sm`} />
                </span>
                <span className="text-sm font-medium text-[#222222]">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Module intro + quick nav */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-20 pb-10 md:pb-12">
        <div className="text-center max-w-2xl mx-auto mb-10">
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
        <ModuleNav />
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
