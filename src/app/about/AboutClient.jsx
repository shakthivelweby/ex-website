"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import Footer from "@/components/Footer/Footer";

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

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.55, ease: "easeOut" },
};

const stagger = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.08 } },
};

function TeamCard({ member, index }) {
  return (
    <motion.article
      variants={{
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
      }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      className="group"
    >
      <div className="overflow-hidden rounded-2xl border border-[#EBEBEB] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.03] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(6,148,148,0.12)] hover:border-primary-100">
        <div className="relative aspect-[4/5] overflow-hidden bg-[#F0F0F0]">
          <Image
            src={member.image}
            alt={member.name}
            fill
            className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h3 className="text-lg font-semibold text-white">{member.name}</h3>
            <p className="text-sm font-medium text-primary-300">{member.role}</p>
          </div>
        </div>
        <div className="p-5">
          <p className="text-sm leading-relaxed text-[#717171]">{member.bio}</p>
        </div>
      </div>
    </motion.article>
  );
}

export default function AboutClient() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero — team cover */}
      <section className="relative min-h-[52vh] md:min-h-[62vh] overflow-hidden">
        <Image
          src="/group-trip-image-1.jpg"
          alt="Explore World team exploring together"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/70" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(6,148,148,0.25),transparent)]" />

        <div className="relative z-10 flex min-h-[52vh] md:min-h-[62vh] flex-col items-center justify-center px-4 py-24 text-center sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-white/90 backdrop-blur-sm">
              <i className="fi fi-rr-users-alt text-primary-300" />
              Our team
            </span>
            <h1 className="text-[36px] font-semibold leading-[1.08] tracking-tight text-white md:text-[52px] lg:text-[56px]">
              We help you explore
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-300 to-teal-200">
                the world, your way
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/80 md:text-lg">
              Explore World is built by travellers, for travellers — connecting you
              directly with verified suppliers for better prices and real experiences.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="relative z-20 -mt-10 px-4 sm:-mt-14 sm:px-6">
        <motion.div
          {...fadeUp}
          className="mx-auto max-w-5xl rounded-2xl border border-white/80 bg-white p-6 shadow-[0_8px_40px_rgba(6,148,148,0.12)] ring-1 ring-black/[0.04] sm:p-8"
        >
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center md:text-left">
                <span className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <i className={`${stat.icon} text-sm`} />
                </span>
                <p className="text-2xl font-bold tracking-tight text-[#222222] md:text-3xl">
                  {stat.value}
                </p>
                <p className="mt-0.5 text-xs font-medium text-[#717171] md:text-sm">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Our story */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <motion.div {...fadeUp} className="relative">
            <div
              className="absolute -inset-4 rounded-[2rem] bg-primary-400/15 blur-2xl"
              aria-hidden
            />
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-[#F0F0F0] shadow-[0_20px_50px_rgba(0,0,0,0.1)] ring-1 ring-black/[0.06]">
              <Image
                src="/activity-image-1.jpg"
                alt="Travellers on an adventure experience"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </div>
          </motion.div>

          <motion.div {...fadeUp}>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-primary-600">
              Our story
            </p>
            <h2 className="text-[30px] font-semibold leading-[1.12] tracking-tight text-[#222222] md:text-[40px]">
              One platform for every kind of adventure
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-[#717171] md:text-base md:leading-7">
              Explore World started with a simple idea: travellers deserve a single,
              trustworthy place to discover and book packages, attractions, events,
              activities, and rentals — without hidden fees or unreliable middlemen.
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-[#717171] md:text-base md:leading-7">
              Today we work with hundreds of verified suppliers across dozens of
              destinations. Our team combines deep travel industry experience with
              modern product design to make booking feel as exciting as the trip itself.
            </p>
            <Link
              href="/explore"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-primary-700 hover:shadow-lg"
            >
              Start exploring
              <i className="fi fi-rr-arrow-right text-xs" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="relative overflow-hidden bg-[#FAFAFA] py-20 md:py-28">
        <div className="pointer-events-none absolute top-0 right-0 h-[500px] w-[500px] translate-x-1/3 -translate-y-1/2 rounded-full bg-primary-100/40 blur-[100px]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="mb-14 text-center md:mb-16">
            <span className="mb-4 inline-block rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary-700">
              What we stand for
            </span>
            <h2 className="text-[30px] font-semibold tracking-tight text-[#222222] md:text-[40px]">
              Built on values that matter
            </h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid gap-6 md:grid-cols-3"
          >
            {VALUES.map((item) => (
              <motion.div
                key={item.title}
                variants={{
                  initial: { opacity: 0, y: 20 },
                  whileInView: { opacity: 1, y: 0 },
                }}
                className="rounded-2xl border border-[#EBEBEB] bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
              >
                <span className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <i className={`${item.icon} text-lg`} />
                </span>
                <h3 className="text-lg font-semibold text-[#222222]">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#717171]">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Mission & vision */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          <motion.div
            {...fadeUp}
            className="rounded-2xl border border-[#EBEBEB] bg-gradient-to-br from-primary-50/80 to-white p-8 md:p-10"
          >
            <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary-600 text-white">
              <i className="fi fi-rr-target text-lg" />
            </span>
            <h3 className="text-xl font-semibold text-[#222222]">Our mission</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-[#717171]">
              To empower travellers with transparent, direct access to the best
              experiences — and help local suppliers grow by reaching the right
              audience at fair terms.
            </p>
          </motion.div>
          <motion.div
            {...fadeUp}
            className="rounded-2xl border border-[#EBEBEB] bg-gradient-to-br from-slate-50 to-white p-8 md:p-10"
          >
            <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#222222] text-white">
              <i className="fi fi-rr-eye text-lg" />
            </span>
            <h3 className="text-xl font-semibold text-[#222222]">Our vision</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-[#717171]">
              A world where discovering and booking travel is effortless, honest,
              and inspiring — whether you&apos;re planning a weekend getaway or a
              once-in-a-lifetime journey.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Team */}
      <section className="relative overflow-hidden bg-white py-20 md:py-28">
        <div className="pointer-events-none absolute bottom-0 left-0 h-[400px] w-[400px] -translate-x-1/2 translate-y-1/2 rounded-full bg-teal-100/30 blur-[90px]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="mb-14 text-center md:mb-16">
            <span className="mb-4 inline-block rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary-700">
              The people behind it
            </span>
            <h2 className="text-[30px] font-semibold tracking-tight text-[#222222] md:text-[40px]">
              Meet our team
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-[#717171] md:text-base">
              A diverse group of travel enthusiasts, technologists, and operators
              working together to reshape how the world books experiences.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
          >
            {TEAM.map((member, index) => (
              <TeamCard key={member.name} member={member} index={index} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-[#0f0f0f] py-20 md:py-24">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_100%,rgba(6,148,148,0.2),transparent)]"
          aria-hidden
        />
        <motion.div
          {...fadeUp}
          className="relative mx-auto max-w-3xl px-4 text-center sm:px-6"
        >
          <h2 className="text-[28px] font-semibold tracking-tight text-white md:text-[36px]">
            Ready for your next adventure?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-white/60">
            Browse packages, attractions, events, and more — or get in touch if
            you&apos;d like to partner with us as a supplier.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/explore"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary-600 px-8 text-sm font-semibold text-white transition-all hover:bg-primary-700"
            >
              Explore experiences
              <i className="fi fi-rr-arrow-right text-xs" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10"
            >
              Contact us
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer />
    </main>
  );
}
