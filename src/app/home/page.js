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
      glow: "bg-primary-400/20",
      check: "text-primary-500",
      btn: "bg-primary-600 hover:bg-primary-700",
      hoverBorder: "hover:border-primary-200",
      cardHover: "hover:bg-primary-50/40",
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
      glow: "bg-sky-400/20",
      check: "text-sky-500",
      btn: "bg-sky-600 hover:bg-sky-700",
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
      glow: "bg-amber-400/20",
      check: "text-amber-500",
      btn: "bg-amber-600 hover:bg-amber-700",
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
      glow: "bg-rose-400/20",
      check: "text-rose-500",
      btn: "bg-rose-600 hover:bg-rose-700",
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
      glow: "bg-indigo-400/20",
      check: "text-indigo-500",
      btn: "bg-indigo-600 hover:bg-indigo-700",
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
      glow: "bg-emerald-400/20",
      check: "text-emerald-500",
      btn: "bg-emerald-600 hover:bg-emerald-700",
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
    icon: "fi fi-rr-search-alt",
  },
  {
    step: "02",
    title: "Book direct",
    description:
      "Reserve with verified suppliers — transparent pricing, no hidden fees.",
    icon: "fi fi-rr-shield-check",
  },
  {
    step: "03",
    title: "Enjoy",
    description:
      "Show up and experience it. Your booking details are always at hand.",
    icon: "fi fi-rr-heart",
  },
];

function ModuleCtaStrip() {
  return (
    <section className="relative z-10 -mt-10 px-4 sm:-mt-12 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="flex gap-2 overflow-x-auto rounded-2xl border border-white/80 bg-white/95 p-2 shadow-[0_8px_32px_rgba(6,148,148,0.1)] backdrop-blur-md [-ms-overflow-style:none] [scrollbar-width:none] sm:justify-between sm:p-2.5 [&::-webkit-scrollbar]:hidden">
          {MODULES.map((module) => (
            <Link
              key={module.id}
              href={module.href}
              className={`group flex shrink-0 items-center gap-2.5 rounded-xl border border-transparent px-3.5 py-2.5 transition-all sm:flex-1 sm:justify-center ${module.accent.cardHover} ${module.accent.hoverBorder} hover:border-current hover:shadow-sm`}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${module.accent.iconBg} ${module.accent.iconColor} transition-transform group-hover:scale-105`}
              >
                <i className={`${module.icon} text-sm`} />
              </span>
              <span className="whitespace-nowrap text-[13px] font-semibold text-[#222222]">
                {module.shortName}
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
      className="scroll-mt-28 border-t border-[#EBEBEB] bg-white"
    >
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20"
        >
          <div className={`relative ${reversed ? "lg:order-2" : ""}`}>
            <div
              className={`absolute -inset-3 rounded-[2rem] ${module.accent.glow} blur-2xl md:-inset-5`}
              aria-hidden
            />
            <div className="group relative aspect-[4/3] overflow-hidden rounded-3xl bg-[#F0F0F0] shadow-[0_20px_50px_rgba(0,0,0,0.12)] ring-1 ring-black/[0.06]">
              <Image
                src={module.image}
                alt={module.name}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
              <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/20 bg-white/90 px-3 py-1.5 shadow-lg backdrop-blur-sm">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${module.accent.iconBg}`}
                >
                  <i
                    className={`${module.icon} ${module.accent.iconColor} text-sm`}
                  />
                </span>
                <span className="text-xs font-semibold text-[#222222]">
                  {module.shortName}
                </span>
              </div>
            </div>
          </div>

          <div className={reversed ? "lg:order-1" : ""}>
            <div className="mb-5 flex items-center gap-3">
              <span
                className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${module.accent.iconBg}`}
              >
                <i className={`${module.icon} ${module.accent.iconColor} text-lg`} />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#C4C4C4]">
                {sectionNum} / 06
              </span>
            </div>

            <h2 className="text-[30px] font-semibold leading-[1.12] tracking-tight text-[#222222] md:text-[40px]">
              {module.name}
            </h2>

            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[#717171] md:text-base md:leading-7">
              {module.description}
            </p>

            <ul className="mt-7 space-y-3">
              {module.highlights.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-3 text-sm text-[#444444] md:text-[15px]"
                >
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${module.accent.iconBg}`}
                  >
                    <i className={`fi fi-rr-check text-[9px] ${module.accent.check}`} />
                  </span>
                  {point}
                </li>
              ))}
            </ul>

            <Link
              href={module.href}
              className={`mt-9 inline-flex items-center gap-2.5 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg ${module.accent.btn}`}
            >
              Explore {module.name.toLowerCase()}
              <i className="fi fi-rr-arrow-right text-xs" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="relative overflow-hidden bg-[#0f0f0f]">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(6,148,148,0.18),transparent)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-14 flex flex-col gap-4 md:mb-16 md:flex-row md:items-end md:justify-between"
        >
          <div className="max-w-xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary-400">
              Simple process
            </p>
            <h2 className="text-[32px] font-semibold leading-[1.08] tracking-tight text-white md:text-[40px]">
              How Explore World works
            </h2>
          </div>
          <p className="max-w-sm text-[15px] leading-relaxed text-white/55 md:text-right">
            Three steps from discovery to your next adventure — no middlemen,
            no surprises.
          </p>
        </motion.div>

        <div className="relative">
          <div
            className="absolute left-[27px] top-8 hidden h-[calc(100%-4rem)] w-px bg-gradient-to-b from-primary-500/60 via-white/15 to-transparent md:left-0 md:top-[52px] md:block md:h-px md:w-full md:bg-gradient-to-r md:from-transparent md:via-white/20 md:to-transparent"
            aria-hidden
          />

          <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
            {STEPS.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative md:pt-2"
              >
                <div className="flex gap-5 md:flex-col md:items-center md:text-center">
                  <div className="relative shrink-0">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary-500/30 bg-primary-500/10 shadow-[0_0_24px_rgba(6,148,148,0.15)] backdrop-blur-sm md:mx-auto">
                      <i className={`${item.icon} text-xl text-primary-400`} />
                    </div>
                    <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white md:-right-2 md:-top-2">
                      {index + 1}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1 border-l border-white/10 pl-5 md:border-l-0 md:pl-0 md:pt-6">
                    <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-white/30 md:mb-3">
                      Step {item.step}
                    </span>
                    <h3 className="mb-2 text-lg font-semibold text-white md:text-xl">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-white/55 md:text-[15px]">
                      {item.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
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

      <div className="h-8 bg-gradient-to-b from-primary-50/30 to-white md:h-10" />

      <section id="modules" className="bg-white pb-4 pt-10 md:pt-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        >
          <div className="flex flex-col gap-4 border-b border-[#EBEBEB] pb-10 md:flex-row md:items-end md:justify-between md:pb-12">
            <div className="max-w-xl">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary-600">
                Six ways to travel
              </p>
              <h2 className="text-[32px] font-semibold leading-[1.08] tracking-tight text-[#222222] md:text-[42px]">
                Everything you can book
              </h2>
            </div>
            <p className="max-w-sm text-[15px] leading-relaxed text-[#717171] md:text-right">
              One platform, six modules — each connects you directly to verified
              suppliers.
            </p>
          </div>
        </motion.div>

        {MODULES.map((module, index) => (
          <ModuleSection
            key={module.id}
            module={module}
            index={index}
            reversed={index % 2 === 1}
          />
        ))}
      </section>

      <HowItWorks />

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
