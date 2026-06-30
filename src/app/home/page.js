"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import Search from "@/components/Search/Search";
import HeroSearch from "@/components/Search/HeroSearch";
import Footer from "@/components/Footer/Footer";
import PinnedModuleScroll from "@/components/home/PinnedModuleScroll";

const TYPE = {
  eyebrow:
    "text-[10px] font-semibold uppercase tracking-[0.18em] sm:text-[11px] sm:tracking-[0.2em]",
  heroTitle:
    "text-[30px] font-medium leading-[1.1] tracking-tight text-[#222222] sm:text-[34px] md:text-4xl",
  heroLead: "text-sm leading-relaxed text-[#717171] sm:text-[15px]",
  sectionTitle:
    "text-2xl font-medium leading-[1.12] tracking-tight text-[#222222] md:text-[32px]",
  cardTitle: "text-lg font-medium leading-snug text-[#222222]",
  body: "text-sm leading-relaxed text-[#717171] sm:text-[15px]",
  listItem: "text-sm leading-relaxed text-[#444444] sm:text-[15px]",
};

const HOME_CONTAINER =
  "mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8";

function SupplierMountainScene() {
  const farPeaks = [
    "0,120 95,28 190,120",
    "380,120 500,34 620,120",
    "810,120 930,38 1050,120",
    "1200,120 1350,42 1442,120",
  ];

  const midPeaks = [
    "165,120 285,8 405,120",
    "595,120 715,14 835,120",
    "1025,120 1145,10 1265,120",
  ];

  const nearPeaks = [
    "55,120 130,62 205,120",
    "330,120 405,72 480,120",
    "655,120 730,58 805,120",
    "980,120 1055,70 1130,120",
  ];

  const gapFillers = ["1145,10 1265,120 1345,32"];

  const trees = [
    "228,120 234,100 240,120",
    "248,120 252,108 256,120",
    "520,120 526,104 532,120",
    "870,120 875,106 880,120",
    "1100,120 1105,108 1110,120",
  ];

  return (
    <>
      <defs>
        <linearGradient id="supplier-mountain-far" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#011c1c" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#045858" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="supplier-mountain-mid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#045858" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#057676" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="supplier-mountain-near" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1ab2b2" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#057676" stopOpacity="0.95" />
        </linearGradient>
      </defs>

      <rect x="-2" y="96" width="1444" height="26" fill="#045858" />

      {farPeaks.map((points) => (
        <polygon
          key={`far-${points}`}
          points={points}
          fill="url(#supplier-mountain-far)"
        />
      ))}
      {midPeaks.map((points) => (
        <polygon
          key={`mid-${points}`}
          points={points}
          fill="url(#supplier-mountain-mid)"
        />
      ))}
      {gapFillers.map((points) => (
        <polygon
          key={`gap-${points}`}
          points={points}
          fill="url(#supplier-mountain-mid)"
        />
      ))}
      {nearPeaks.map((points) => (
        <polygon
          key={`near-${points}`}
          points={points}
          fill="url(#supplier-mountain-near)"
        />
      ))}
      {trees.map((points) => (
        <polygon
          key={`tree-${points}`}
          points={points}
          fill="#011c1c"
          fillOpacity="0.55"
        />
      ))}
    </>
  );
}

function SupplierMountainPattern() {
  return (
    <motion.svg
      className="pointer-events-none absolute bottom-0 left-0 h-14 w-full sm:h-16 md:h-20"
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
      initial={{ y: "100%", opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
    >
      <SupplierMountainScene />
    </motion.svg>
  );
}

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
      eyebrow: "text-primary-600",
      pill: "border-primary-100 bg-primary-50/80 text-primary-800",
      pinBg: "bg-[linear-gradient(160deg,#f4fbfb_0%,#ffffff_45%,#ffffff_100%)]",
      ring: "ring-primary-100",
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
      eyebrow: "text-sky-600",
      pill: "border-sky-100 bg-sky-50/80 text-sky-800",
      pinBg: "bg-[linear-gradient(160deg,#f0f8ff_0%,#ffffff_45%,#ffffff_100%)]",
      ring: "ring-sky-100",
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
      eyebrow: "text-emerald-600",
      pill: "border-emerald-100 bg-emerald-50/80 text-emerald-800",
      pinBg: "bg-[linear-gradient(160deg,#f0fdf8_0%,#ffffff_45%,#ffffff_100%)]",
      ring: "ring-emerald-100",
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
      eyebrow: "text-amber-600",
      pill: "border-amber-100 bg-amber-50/80 text-amber-900",
      pinBg: "bg-[linear-gradient(160deg,#fffbeb_0%,#ffffff_45%,#ffffff_100%)]",
      ring: "ring-amber-100",
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
      eyebrow: "text-rose-600",
      pill: "border-rose-100 bg-rose-50/80 text-rose-800",
      pinBg: "bg-[linear-gradient(160deg,#fff1f2_0%,#ffffff_45%,#ffffff_100%)]",
      ring: "ring-rose-100",
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
      eyebrow: "text-indigo-600",
      pill: "border-indigo-100 bg-indigo-50/80 text-indigo-800",
      pinBg: "bg-[linear-gradient(160deg,#eef2ff_0%,#ffffff_45%,#ffffff_100%)]",
      ring: "ring-indigo-100",
    },
  },
];

const STEPS = [
  {
    step: "01",
    title: "Pick what you need",
    description:
      "Choose packages, events, attractions, or whatever fits your trip.",
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

function ModuleSection({ module, index, reversed, bare = false, total = 6 }) {
  const sectionNum = String(index + 1).padStart(2, "0");
  const totalNum = String(total).padStart(2, "0");

  const copyBlock = (
    <div className={`relative ${bare ? "lg:px-2" : ""}`}>
      {!bare ? (
        <span
          className="pointer-events-none absolute -left-1 -top-6 select-none text-[88px] font-medium leading-none tracking-tight text-[#F3F3F3] sm:text-[104px] lg:-top-10 lg:text-[120px]"
          aria-hidden
        >
          {sectionNum}
        </span>
      ) : null}

      <div className="relative">
        {bare ? (
          <div className="mb-5 flex items-center justify-between gap-4">
            <div
              className={`inline-flex items-center gap-2.5 rounded-full border px-3 py-1.5 ${module.accent.pill}`}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-lg ${module.accent.iconBg}`}
              >
                <i
                  className={`fi ${module.icon} text-sm ${module.accent.iconColor}`}
                />
              </span>
              <span
                className={`text-xs font-semibold uppercase tracking-wide ${module.accent.eyebrow}`}
              >
                {module.shortName}
              </span>
            </div>
            <span className="text-[11px] font-medium tabular-nums text-[#B0B0B0]">
              {sectionNum} / {totalNum}
            </span>
          </div>
        ) : (
          <>
            <div className={`mb-4 h-0.5 w-10 ${module.accent.btn}`} />
            <p className={`mb-2 ${TYPE.eyebrow} ${module.accent.eyebrow}`}>
              {module.shortName}
            </p>
          </>
        )}

        <h2 className={TYPE.sectionTitle}>{module.name}</h2>
        <p className={`mt-4 max-w-md ${TYPE.body}`}>{module.description}</p>

        <ul
          className={`mt-8 space-y-3 border-t border-[#EBEBEB] ${
            bare ? "pt-5" : "pt-6"
          }`}
        >
          {module.highlights.map((point) => (
            <li
              key={point}
              className="flex items-center gap-3 text-sm text-[#444444] sm:text-[15px]"
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${module.accent.iconBg}`}
              >
                <i className={`fi fi-rr-check text-[9px] ${module.accent.iconColor}`} />
              </span>
              {point}
            </li>
          ))}
        </ul>

        <Link
          href={module.href}
          className={`mt-8 inline-flex items-center gap-2 text-sm font-semibold transition-all hover:gap-3 ${
            bare
              ? `rounded-xl px-5 py-2.5 text-white ${module.accent.btn}`
              : module.accent.eyebrow
          }`}
        >
          {bare ? `Explore ${module.shortName.toLowerCase()}` : `Browse ${module.name.toLowerCase()}`}
          <i className="fi fi-rr-arrow-right text-xs" />
        </Link>
      </div>
    </div>
  );

  const imageBlock = (
    <div className="relative w-full min-w-0">
      {bare ? (
        <div
          className={`pointer-events-none absolute -inset-3 z-0 rounded-[28px] blur-3xl sm:-inset-4 ${module.accent.glow}`}
          aria-hidden
        />
      ) : null}
      <div
        className={`relative z-10 w-full min-w-0 overflow-hidden bg-[#F0F0F0] ${
          bare
            ? `aspect-[4/3] rounded-3xl shadow-[0_24px_48px_rgba(0,0,0,0.1)] ring-1 ${module.accent.ring} lg:max-h-[min(62vh,520px)] lg:aspect-auto lg:h-[min(62vh,520px)]`
            : "aspect-[4/3] rounded-2xl"
        }`}
      >
        <Image
          src={module.image}
          alt={module.name}
          fill
          className={`object-cover ${bare ? "transition-transform duration-700 ease-out hover:scale-[1.03]" : ""}`}
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>
    </div>
  );

  if (bare) {
    return (
      <section id={`module-${module.id}`} className="w-full scroll-mt-28">
        <div
          className={`${HOME_CONTAINER} grid w-full grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-16 xl:gap-20`}
        >
          <div
            className={`flex w-full min-w-0 items-center py-4 lg:py-0 ${
              reversed ? "lg:order-1" : "lg:order-2"
            }`}
          >
            {imageBlock}
          </div>
          <div
            className={`flex w-full min-w-0 items-center pb-8 pt-2 lg:py-0 ${
              reversed ? "lg:order-2" : "lg:order-1"
            }`}
          >
            {copyBlock}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id={`module-${module.id}`} className="scroll-mt-28 bg-white">
      <div className={`${HOME_CONTAINER} py-14 md:py-20`}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16"
        >
          <div className={reversed ? "lg:order-2" : ""}>{imageBlock}</div>
          <div className={reversed ? "lg:order-1" : ""}>{copyBlock}</div>
        </motion.div>
      </div>
    </section>
  );
}

function PinnedModuleSections() {
  return (
    <PinnedModuleScroll>
      {MODULES.map((module, index) => (
        <div
          key={module.id}
          className="module-pin-panel h-[100vh] min-h-[100vh] w-full"
        >
          <div
            className={`module-pin-inner relative flex h-[100vh] min-h-[100vh] w-full items-start justify-center overflow-x-hidden overflow-y-auto py-8 lg:items-center lg:overflow-hidden lg:py-0 ${module.accent.pinBg}`}
          >
            <span
              className="pointer-events-none absolute bottom-8 right-6 z-0 select-none text-[120px] font-medium leading-none tracking-tight text-[#000000]/[0.03] sm:right-10 sm:text-[160px] lg:bottom-12 lg:right-16 lg:text-[200px]"
              aria-hidden
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="relative z-10 w-full">
              <ModuleSection
                module={module}
                index={index}
                reversed={index % 2 === 1}
                bare
                total={MODULES.length}
              />
            </div>
          </div>
        </div>
      ))}
    </PinnedModuleScroll>
  );
}

function HowItWorks() {
  return (
    <section className="border-t border-[#EBEBEB] bg-[#FAFAFA] py-14 md:py-20">
      <div className={HOME_CONTAINER}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 grid gap-4 sm:mb-12 lg:grid-cols-2 lg:items-end lg:gap-12"
        >
          <div>
            <div className="mb-4 h-0.5 w-10 bg-primary-600" />
            <p className={`mb-2 ${TYPE.eyebrow} text-primary-600`}>
              Simple process
            </p>
            <h2 className={TYPE.sectionTitle}>How Explore World works</h2>
          </div>
          <p className={`max-w-sm lg:justify-self-end lg:text-right ${TYPE.body}`}>
            Three steps from discovery to your next adventure — no middlemen,
            no surprises.
          </p>
        </motion.div>

        <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-[#EBEBEB]">
          <div className="grid grid-cols-1 md:grid-cols-3 md:divide-x md:divide-[#EBEBEB]">
            {STEPS.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className={`relative p-6 sm:p-7 lg:p-8 ${
                  index < STEPS.length - 1 ? "border-b border-[#EBEBEB] md:border-b-0" : ""
                }`}
              >
                <span
                  className="pointer-events-none absolute right-6 top-5 select-none text-[56px] font-medium leading-none text-[#F3F3F3] lg:text-[64px]"
                  aria-hidden
                >
                  {item.step}
                </span>

                <div className="relative">
                  <span
                    className={`mb-4 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 ring-1 ring-primary-100`}
                  >
                    <i className={`${item.icon} text-sm text-primary-600`} />
                  </span>
                  <h3 className={`mb-2 ${TYPE.cardTitle}`}>{item.title}</h3>
                  <p className={TYPE.body}>{item.description}</p>
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
        <div className="relative w-full py-4 sm:flex sm:min-h-[500px] sm:items-center sm:justify-center sm:py-10 md:min-h-[560px] md:py-14 lg:min-h-[620px]">
          <div className="pointer-events-none absolute inset-0">
            <Image
              src="/home/banner-image.jpg"
              alt="Tropical resort with pool and ocean view"
              fill
              priority
              className="object-cover object-center"
              sizes="100vw"
            />
          </div>

          <div className={`relative z-10 ${HOME_CONTAINER}`}>
            <HeroSearch />
          </div>
        </div>
      </section>

      <section id="modules" className="border-t border-[#EBEBEB] bg-white pb-2 pt-10 md:pt-12 lg:pt-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className={`${HOME_CONTAINER} mb-6 lg:mb-8`}
        >
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-12">
            <div className="max-w-xl">
              <div className="mb-4 h-0.5 w-10 bg-primary-600" />
              <p className={`mb-2 ${TYPE.eyebrow} text-primary-600`}>
                Six ways to travel
              </p>
              <h2 className={TYPE.sectionTitle}>Everything you can book</h2>
            </div>
            <div className="lg:text-right">
              <p className={`max-w-sm lg:ml-auto ${TYPE.body}`}>
                One platform, six ways to travel — each connects you directly to
                verified suppliers.
              </p>
              <p className="mt-3 text-xs font-medium text-[#B0B0B0]">
                Scroll to explore each category
              </p>
            </div>
          </div>
        </motion.div>

        <PinnedModuleSections />
      </section>

      <HowItWorks />

      <section className="bg-[#FAFAFA] py-8 md:py-10">
        <div className={HOME_CONTAINER}>
          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-[#EBEBEB]">
            <div className="relative aspect-[4/3] w-full sm:aspect-[16/9] lg:aspect-[2.35/1]">
              <Image
                src="/cover-image.jpg"
                alt="Travelers on a desert adventure"
                fill
                className="object-cover"
                sizes="(max-width: 1152px) 100vw, 1152px"
              />
              <div className="absolute inset-0 hidden items-center p-6 sm:p-8 lg:flex">
                <div className="max-w-md rounded-2xl bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.12)] ring-1 ring-[#EBEBEB] sm:p-8">
                  <p className={`mb-2 ${TYPE.eyebrow} text-primary-600`}>
                    Ready to start?
                  </p>
                  <h2 className={`mb-5 ${TYPE.sectionTitle}`}>
                    Find the right experience for your next trip.
                  </h2>
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
                  >
                    Start searching
                    <i className="fi fi-rr-arrow-right text-xs" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 lg:hidden">
              <p className={`mb-2 ${TYPE.eyebrow} text-primary-600`}>
                Ready to start?
              </p>
              <h2 className={`mb-5 ${TYPE.sectionTitle}`}>
                Find the right experience for your next trip.
              </h2>
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
              >
                Start searching
                <i className="fi fi-rr-arrow-right text-xs" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Supplier CTA */}
      <section className="relative overflow-hidden bg-[#045858] pb-16 pt-10 text-white md:pb-20 md:pt-12">
        <SupplierMountainPattern />
        <div className={`relative z-10 ${HOME_CONTAINER} flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between`}>
          <div className="max-w-lg">
            <p className={`mb-2 ${TYPE.eyebrow} text-primary-200`}>For suppliers</p>
            <h2 className={`mb-3 ${TYPE.sectionTitle} text-white`}>
              List your experiences. Reach travelers worldwide.
            </h2>
            <p className={`${TYPE.body} text-white/75`}>
              Join verified partners on Explore World. Simple onboarding and
              instant visibility after approval.
            </p>
          </div>
          <div className="shrink-0">
            <a
              href="https://supplier.exploreworld.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-[#222222] transition-colors hover:bg-[#F7F7F7]"
            >
              Supplier login
              <i className="fi fi-rr-arrow-right text-xs" />
            </a>
          </div>
        </div>
      </section>

      <Footer className="mt-0" />
    </div>
  );
}
