"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import Footer from "@/components/Footer/Footer";

const TYPE = {
  eyebrow:
    "text-[10px] font-semibold uppercase tracking-[0.18em] sm:text-[11px] sm:tracking-[0.2em]",
  heroTitle:
    "text-[30px] font-medium leading-[1.1] tracking-tight text-white sm:text-[34px] md:text-4xl",
  sectionTitle:
    "text-2xl font-medium leading-[1.12] tracking-tight text-[#222222] md:text-[32px]",
  cardTitle: "text-lg font-medium leading-snug text-[#222222]",
  body: "text-sm leading-relaxed text-[#717171] sm:text-[15px]",
};

const PAGE_CONTAINER = "mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8";

const STATS = [
  { value: "500+", label: "Experiences listed", icon: "fi fi-rr-compass-alt" },
  { value: "200+", label: "Verified suppliers", icon: "fi fi-rr-badge-check" },
  { value: "50+", label: "Destinations", icon: "fi fi-rr-marker" },
  { value: "10k+", label: "Happy travellers", icon: "fi fi-rr-heart" },
];

const VALUES = [
  {
    icon: "fi fi-rr-shield-check",
    title: "Trust first",
    description:
      "Every supplier is vetted. Transparent pricing and clear policies so you book with confidence.",
  },
  {
    icon: "fi fi-rr-handshake",
    title: "Direct connections",
    description:
      "We connect travellers with local operators — no unnecessary markups, better value for everyone.",
  },
  {
    icon: "fi fi-rr-globe",
    title: "Discovery made simple",
    description:
      "One place to browse packages, attractions, events, activities, and rentals by destination.",
  },
];

const TEAM = [
  {
    name: "Arjun Mehta",
    role: "Founder & CEO",
    bio: "Former travel operator turned product builder. Passionate about making authentic experiences accessible to everyone.",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&h=720&q=80",
  },
  {
    name: "Priya Sharma",
    role: "Chief Operating Officer",
    bio: "Leads operations and supplier onboarding. Ensures every listing meets our quality and safety standards.",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&h=720&q=80",
  },
  {
    name: "Rahul Nair",
    role: "Head of Product",
    bio: "Designs the booking experience end to end — from search to checkout — with clarity and speed in mind.",
    image:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&h=720&q=80",
  },
  {
    name: "Ananya Kapoor",
    role: "Head of Supplier Partnerships",
    bio: "Builds relationships with tour operators, activity hosts, and rental partners across India and beyond.",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&h=720&q=80",
  },
  {
    name: "David Chen",
    role: "Lead Engineer",
    bio: "Architects the platform that powers secure bookings, payments, and real-time availability at scale.",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&h=720&q=80",
  },
  {
    name: "Meera Iyer",
    role: "Head of Customer Experience",
    bio: "Champions traveller support — before, during, and after every trip — with empathy and speed.",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=600&h=720&q=80",
  },
];

function MountainScene() {
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
    "1265,120 1355,22 1442,120",
  ];

  const nearPeaks = [
    "55,120 130,62 205,120",
    "330,120 405,72 480,120",
    "655,120 730,58 805,120",
    "980,120 1055,70 1130,120",
  ];

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
        <linearGradient id="about-mountain-far" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#011c1c" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#045858" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="about-mountain-mid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#045858" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#057676" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="about-mountain-near" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1ab2b2" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#057676" stopOpacity="0.95" />
        </linearGradient>
      </defs>

      <rect x="-2" y="96" width="1444" height="26" fill="#045858" />

      {farPeaks.map((points) => (
        <polygon
          key={`far-${points}`}
          points={points}
          fill="url(#about-mountain-far)"
        />
      ))}
      {midPeaks.map((points) => (
        <polygon
          key={`mid-${points}`}
          points={points}
          fill="url(#about-mountain-mid)"
        />
      ))}
      {nearPeaks.map((points) => (
        <polygon
          key={`near-${points}`}
          points={points}
          fill="url(#about-mountain-near)"
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

function HeaderMountainPattern() {
  const shouldReduceMotion = useReducedMotion();

  const className =
    "pointer-events-none absolute bottom-0 left-0 h-14 w-full sm:h-16 md:h-20";

  if (shouldReduceMotion) {
    return (
      <svg
        className={className}
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        aria-hidden
        xmlns="http://www.w3.org/2000/svg"
      >
        <MountainScene />
      </svg>
    );
  }

  return (
    <motion.svg
      className={className}
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
      initial={{ y: "100%", opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
    >
      <MountainScene />
    </motion.svg>
  );
}

function SectionIntro({ eyebrow, title, description, action, centered = false }) {
  return (
    <div
      className={`mb-8 grid gap-4 sm:mb-10 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-12 ${
        centered ? "text-center lg:text-left" : ""
      }`}
    >
      <div className={`max-w-xl ${centered ? "mx-auto lg:mx-0" : ""}`}>
        <div
          className={`mb-4 h-0.5 w-10 bg-primary-600 ${
            centered ? "mx-auto lg:mx-0" : ""
          }`}
        />
        <p className={`mb-2 ${TYPE.eyebrow} text-primary-600`}>{eyebrow}</p>
        <h2 className={TYPE.sectionTitle}>{title}</h2>
        {description ? (
          <p className={`mt-3 max-w-md ${TYPE.body} ${centered ? "mx-auto lg:mx-0" : ""}`}>
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="lg:text-right">{action}</div> : null}
    </div>
  );
}

function TeamCard({ member, index }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      className="group overflow-hidden rounded-2xl bg-white ring-1 ring-[#EBEBEB] transition-all duration-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:ring-[#DDDDDD]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#F0F0F0]">
        <Image
          src={member.image}
          alt={member.name}
          fill
          className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
      <div className="px-4 py-4 sm:px-5 sm:py-5">
        <h3 className="text-[15px] font-medium text-[#222222] sm:text-base">
          {member.name}
        </h3>
        <p className="mt-0.5 text-sm font-medium text-primary-600">{member.role}</p>
        <p className={`mt-2 ${TYPE.body}`}>{member.bio}</p>
      </div>
    </motion.article>
  );
}

export default function AboutClient() {
  return (
    <main className="min-h-screen bg-white text-[#222222]">
      {/* Hero — full-width team photo */}
      <section className="relative w-full overflow-hidden bg-[#222222]">
        <div className="relative min-h-[min(85vw,560px)] w-full sm:min-h-[420px] md:min-h-[500px] lg:min-h-[560px]">
          <Image
            src="/group-photo.jpg"
            alt="The Explore World team"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-black/15" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />

          <div className="absolute inset-0 flex items-end">
            <div className={`${PAGE_CONTAINER} w-full pb-10 pt-20 sm:pb-12 md:pb-14 lg:pb-16`}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-2xl"
              >
                <p className={`${TYPE.eyebrow} text-primary-200`}>About us</p>
                <h1 className={`mt-2 ${TYPE.heroTitle}`}>
                  We help you explore the world, your way
                </h1>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/80 sm:text-[15px]">
                  Explore World is built by travellers, for travellers — connecting you
                  directly with verified suppliers for better prices and real experiences.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className={`${PAGE_CONTAINER} relative z-10 -mt-8 pb-2 sm:-mt-10`}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="overflow-hidden rounded-2xl bg-white ring-1 ring-[#EBEBEB]"
        >
          <div className="grid grid-cols-2 divide-x divide-y divide-[#EBEBEB] md:grid-cols-4 md:divide-y-0">
            {STATS.map((stat, index) => (
              <div
                key={stat.label}
                className={`p-5 sm:p-6 ${
                  index < 2 ? "border-b border-[#EBEBEB] md:border-b-0" : ""
                }`}
              >
                <span className="fi-box mb-3 h-9 w-9 rounded-xl bg-primary-50 text-sm text-primary-600">
                  <i className={stat.icon} />
                </span>
                <p className="text-2xl font-medium tracking-tight text-[#222222] md:text-[28px]">
                  {stat.value}
                </p>
                <p className="mt-0.5 text-xs text-[#717171] sm:text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Our story */}
      <section className={`${PAGE_CONTAINER} py-10 sm:py-12 lg:py-14`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16"
        >
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#F0F0F0] ring-1 ring-[#EBEBEB]">
            <Image
              src="/activity-image-1.jpg"
              alt="Travellers on an adventure experience"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          <div>
            <div className="mb-4 h-0.5 w-10 bg-primary-600" />
            <p className={`mb-2 ${TYPE.eyebrow} text-primary-600`}>Our story</p>
            <h2 className={TYPE.sectionTitle}>One platform for every kind of adventure</h2>
            <p className={`mt-4 ${TYPE.body}`}>
              Explore World started with a simple idea: travellers deserve a single,
              trustworthy place to discover and book packages, attractions, events,
              activities, and rentals — without hidden fees or unreliable middlemen.
            </p>
            <p className={`mt-3 ${TYPE.body}`}>
              Today we work with hundreds of verified suppliers across dozens of
              destinations. Our team combines deep travel industry experience with
              modern product design to make booking feel as exciting as the trip itself.
            </p>
            <Link
              href="/explore"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
            >
              Start exploring
              <i className="fi fi-rr-arrow-right text-xs" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Values */}
      <section className="border-t border-[#EBEBEB] bg-[#FAFAFA] py-14 md:py-20">
        <div className={PAGE_CONTAINER}>
          <SectionIntro
            eyebrow="What we stand for"
            title="Built on values that matter"
            description="Principles that guide how we build products and partner with suppliers."
          />

          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-[#EBEBEB]">
            <div className="grid grid-cols-1 md:grid-cols-3 md:divide-x md:divide-[#EBEBEB]">
              {VALUES.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  className={`p-6 sm:p-7 lg:p-8 ${
                    index < VALUES.length - 1
                      ? "border-b border-[#EBEBEB] md:border-b-0"
                      : ""
                  }`}
                >
                  <span className="fi-box mb-4 h-9 w-9 rounded-xl bg-primary-50 text-sm text-primary-600">
                    <i className={item.icon} />
                  </span>
                  <h3 className={TYPE.cardTitle}>{item.title}</h3>
                  <p className={`mt-2 ${TYPE.body}`}>{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission & vision */}
      <section className={`${PAGE_CONTAINER} py-10 sm:py-12 lg:py-14`}>
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="rounded-2xl bg-white p-6 ring-1 ring-[#EBEBEB] sm:p-8"
          >
            <span className="fi-box mb-4 h-10 w-10 rounded-xl bg-primary-600 text-base text-white">
              <i className="fi fi-rr-target" />
            </span>
            <h3 className={TYPE.cardTitle}>Our mission</h3>
            <p className={`mt-2 ${TYPE.body}`}>
              To empower travellers with transparent, direct access to the best
              experiences — and help local suppliers grow by reaching the right
              audience at fair terms.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.06 }}
            className="rounded-2xl bg-white p-6 ring-1 ring-[#EBEBEB] sm:p-8"
          >
            <span className="fi-box mb-4 h-10 w-10 rounded-xl bg-[#222222] text-base text-white">
              <i className="fi fi-rr-eye" />
            </span>
            <h3 className={TYPE.cardTitle}>Our vision</h3>
            <p className={`mt-2 ${TYPE.body}`}>
              A world where discovering and booking travel is effortless, honest,
              and inspiring — whether you&apos;re planning a weekend getaway or a
              once-in-a-lifetime journey.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Team */}
      <section className="border-t border-[#EBEBEB] bg-[#FAFAFA] py-14 md:py-20">
        <div className={PAGE_CONTAINER}>
          <SectionIntro
            eyebrow="The people behind it"
            title="Meet our team"
            description="A diverse group of travel enthusiasts, technologists, and operators working together to reshape how the world books experiences."
            centered
          />

          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {TEAM.map((member, index) => (
              <TeamCard key={member.name} member={member} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA — matches homepage ready-to-start card */}
      <section className="bg-white py-8 md:py-10">
        <div className={PAGE_CONTAINER}>
          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-[#EBEBEB]">
            <div className="relative aspect-[4/3] w-full sm:aspect-[16/9] lg:aspect-[2.35/1]">
              <Image
                src="/cover-image.jpg"
                alt="Travellers exploring together"
                fill
                className="object-cover"
                sizes="(max-width: 1152px) 100vw, 1152px"
              />
              <div className="absolute inset-0 hidden items-center p-6 sm:p-8 lg:flex">
                <div className="max-w-md rounded-2xl bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.12)] ring-1 ring-[#EBEBEB] sm:p-8">
                  <p className={`mb-2 ${TYPE.eyebrow} text-primary-600`}>
                    Ready to start?
                  </p>
                  <h2 className={`mb-4 ${TYPE.sectionTitle}`}>
                    Your next adventure is one search away.
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href="/explore"
                      className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
                    >
                      Explore experiences
                      <i className="fi fi-rr-arrow-right text-xs" />
                    </Link>
                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-2 rounded-xl border border-[#EBEBEB] bg-white px-5 py-2.5 text-sm font-semibold text-[#222222] transition-colors hover:bg-[#FAFAFA]"
                    >
                      Contact us
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 lg:hidden">
              <p className={`mb-2 ${TYPE.eyebrow} text-primary-600`}>Ready to start?</p>
              <h2 className={`mb-4 ${TYPE.sectionTitle}`}>
                Your next adventure is one search away.
              </h2>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/explore"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
                >
                  Explore experiences
                  <i className="fi fi-rr-arrow-right text-xs" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#EBEBEB] bg-white px-5 py-2.5 text-sm font-semibold text-[#222222] transition-colors hover:bg-[#FAFAFA]"
                >
                  Contact us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Supplier CTA — matches homepage footer band */}
      <section className="relative overflow-hidden bg-[#045858] pb-16 pt-10 text-white md:pb-20 md:pt-12">
        <HeaderMountainPattern />
        <div
          className={`relative z-10 ${PAGE_CONTAINER} flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between`}
        >
          <div className="max-w-lg">
            <p className={`mb-2 ${TYPE.eyebrow} text-primary-200`}>For suppliers</p>
            <h2 className={`mb-3 ${TYPE.sectionTitle} text-white`}>
              Want to list your experiences?
            </h2>
            <p className={`${TYPE.body} text-white/75`}>
              Join verified partners on Explore World. Simple onboarding and instant
              visibility after approval.
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
    </main>
  );
}
