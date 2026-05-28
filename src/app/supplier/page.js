"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import Accordion from "@/components/Accordion";
import Footer from "@/components/Footer/Footer";
import dynamic from 'next/dynamic';

const SupplierHeroCarousel = dynamic(() => import('@/components/SupplierHeroCarousel'), { ssr: false });

const gradientText =
    "text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400";

export default function SupplierPage() {
    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.5 },
    };

    const staggerContainer = {
        initial: {},
        whileInView: { transition: { staggerChildren: 0.1 } },
    };

    return (
        <main className="min-h-screen bg-white">
            {/* 1. Supplier Hero Section */}
            <section className="relative pt-24 pb-10 md:pt-28 md:pb-12 bg-gray-50 overflow-hidden">
                <div className="absolute top-0 right-0 w-[480px] h-[480px] bg-blue-100/40 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-100/30 rounded-full blur-3xl pointer-events-none"></div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="lg:col-span-5 text-center lg:text-left"
                        >
                            <div className="inline-flex items-center gap-3 mb-4 justify-center lg:justify-start">
                                <span className="w-10 h-0.5 bg-primary-600 shrink-0" aria-hidden="true"></span>
                                <span className="text-primary-700 text-xs font-bold tracking-[0.2em] uppercase">
                                    Ecosystem
                                </span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-gray-900 mb-4 leading-[1.1] tracking-tight">
                                Powering Every Type of{" "}
                                <span className={gradientText}>Travel Experience</span>
                            </h1>
                            <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-6 max-w-lg mx-auto lg:mx-0">
                                Whether you guide small groups or manage large attractions, our platform scales to fit your unique business model.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3 mb-6">
                                <Link
                                    href="https://supplier.exploreworld.com/login"
                                    className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-primary-600 text-white font-bold text-base hover:bg-primary-700 transition-all hover:scale-[1.02] shadow-lg shadow-primary-600/20 gap-2 w-full sm:w-auto"
                                >
                                    Become a Supplier
                                    <i className="fi fi-rr-arrow-right text-sm"></i>
                                </Link>
                                <Link
                                    href="#how-it-works"
                                    className="inline-flex items-center justify-center h-12 px-6 rounded-full bg-white text-gray-700 font-semibold text-base border border-gray-200 hover:border-primary-200 hover:text-primary-600 transition-all gap-2 w-full sm:w-auto"
                                >
                                    See how it works
                                    <i className="fi fi-rr-angle-down text-sm"></i>
                                </Link>
                            </div>

                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                                {[
                                    { icon: "fi-rr-map-location-track", label: "Tour Operators" },
                                    { icon: "fi-rr-surfing", label: "Activities" },
                                    { icon: "fi-rr-ticket", label: "Attractions" },
                                    { icon: "fi-rr-calendar-star", label: "Events" },
                                ].map((item) => (
                                    <span
                                        key={item.label}
                                        className="inline-flex items-center gap-1.5 rounded-full bg-white border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm"
                                    >
                                        <i className={`fi ${item.icon} text-primary-600 text-sm`}></i>
                                        {item.label}
                                    </span>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.15 }}
                            className="lg:col-span-7"
                        >
                            <SupplierHeroCarousel />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* 2. Why Partner with Us */}
            <section className="py-10 md:py-14 bg-gray-100">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col gap-4 md:gap-5">
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
                        >
                            <div>
                                <div className="inline-flex items-center gap-3 mb-3">
                                    <span className="w-10 h-0.5 bg-primary-600 shrink-0" aria-hidden="true"></span>
                                    <span className="text-primary-700 text-xs font-bold tracking-[0.2em] uppercase">
                                        Key Benefits
                                    </span>
                                </div>
                                <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2 tracking-tight leading-tight">
                                    Why Partner with{" "}
                                    <span className={gradientText}>Us?</span>
                                </h2>
                                <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-xl">
                                    We empower suppliers with the tools, reach, and freedom they need to succeed in the modern travel marketplace.
                                </p>
                            </div>
                            <div className="flex shrink-0 gap-2">
                                {[
                                    { value: "0%", label: "Setup fee" },
                                    { value: "24/7", label: "Access" },
                                    { value: "Global", label: "Reach" },
                                ].map((stat) => (
                                    <div key={stat.label} className="rounded-xl bg-white border border-gray-200 px-3 py-2 text-center shadow-sm">
                                        <div className="text-base font-bold text-gray-900 leading-none">{stat.value}</div>
                                        <div className="text-[10px] text-gray-500 mt-1 uppercase tracking-wide">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            variants={staggerContainer}
                            initial="initial"
                            whileInView="whileInView"
                            viewport={{ once: true }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4"
                        >
                                {[
                                    {
                                        icon: "fi-rr-shopping-bag",
                                        title: "Direct Sales",
                                        desc: "Sell directly to travelers without middlemen eating your profits.",
                                        accent: "text-blue-600 bg-blue-50",
                                    },
                                    {
                                        icon: "fi-rr-chart-pie-alt",
                                        title: "Better Margins",
                                        desc: "Competitive commission rates so you keep more of what you earn.",
                                        accent: "text-emerald-600 bg-emerald-50",
                                    },
                                    {
                                        icon: "fi-rr-map-location-track",
                                        title: "Global Visibility",
                                        desc: "Showcase your products to a worldwide audience of travelers.",
                                        accent: "text-violet-600 bg-violet-50",
                                    },
                                    {
                                        icon: "fi-rr-dashboard",
                                        title: "Easy Management",
                                        desc: "Full control over availability, pricing, and bookings.",
                                        accent: "text-amber-600 bg-amber-50",
                                    },
                                ].map((item, index) => (
                                    <motion.div
                                        key={index}
                                        variants={fadeInUp}
                                        whileHover={{ y: -4 }}
                                        className="group rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 p-4 md:p-5"
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3 ${item.accent}`}>
                                            <i className={`fi ${item.icon}`}></i>
                                        </div>
                                        <h3 className="text-sm md:text-base font-bold text-gray-900 mb-1.5 group-hover:text-primary-600 transition-colors">
                                            {item.title}
                                        </h3>
                                        <p className="text-gray-500 text-xs md:text-sm leading-snug">{item.desc}</p>
                                    </motion.div>
                                ))}
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* 3. Who Can Join */}
            {/* 3. Who Can Join (Redesigned) */}
            {/* 3. Who Can Join (Now Merged into Hero - Section Removed) */}

            {/* 4. How It Works (Steps) */}
            <section id="how-it-works" className="py-10 md:py-14 bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="lg:col-span-4 lg:sticky lg:top-28"
                        >
                            <div className="inline-flex items-center gap-3 mb-3">
                                <span className="w-10 h-0.5 bg-primary-600 shrink-0" aria-hidden="true"></span>
                                <span className="text-primary-700 text-xs font-bold tracking-[0.2em] uppercase">
                                    4 Simple Steps
                                </span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4 tracking-tight leading-tight">
                                From sign-up to your{" "}
                                <span className={gradientText}>first payout</span>
                            </h2>
                            <p className="text-gray-600 text-base leading-relaxed mb-6">
                                Getting started takes minutes. List your experience, accept bookings, and get paid — we handle the rest.
                            </p>
                            <Link
                                href="https://supplier.exploreworld.com/login"
                                className="inline-flex items-center gap-2 text-primary-600 font-bold hover:text-primary-700 transition-colors group"
                            >
                                Create your free account
                                <i className="fi fi-rr-arrow-right text-sm transition-transform group-hover:translate-x-1"></i>
                            </Link>
                        </motion.div>

                        <motion.div
                            variants={staggerContainer}
                            initial="initial"
                            whileInView="whileInView"
                            viewport={{ once: true }}
                            className="lg:col-span-8 relative"
                        >
                            <div className="absolute left-[19px] top-3 bottom-3 w-px bg-gradient-to-b from-primary-200 via-primary-400 to-primary-200 hidden sm:block"></div>

                            {[
                                {
                                    title: "Sign Up",
                                    desc: "Create your free supplier account in minutes — no credit card required.",
                                    icon: "fi-rr-user-add",
                                },
                                {
                                    title: "List Experience",
                                    desc: "Add details, photos, pricing, and availability for your tours or activities.",
                                    icon: "fi-rr-edit",
                                },
                                {
                                    title: "Receive Bookings",
                                    desc: "Get instant notifications when travelers book. Manage everything from one dashboard.",
                                    icon: "fi-rr-calendar-check",
                                },
                                {
                                    title: "Get Paid",
                                    desc: "Receive secure payouts directly to your bank account on a regular schedule.",
                                    icon: "fi-rr-money-bill-wave",
                                },
                            ].map((step, idx) => (
                                <motion.div
                                    key={idx}
                                    variants={fadeInUp}
                                    className="relative flex gap-5 sm:gap-6 pb-8 last:pb-0 group"
                                >
                                    <div className="relative z-10 shrink-0">
                                        <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-primary-600/25 ring-4 ring-white group-hover:scale-110 transition-transform duration-300">
                                            {idx + 1}
                                        </div>
                                    </div>
                                    <div className="flex-1 pt-0.5 pb-1 border-b border-gray-100 last:border-0 group-last:border-0 min-w-0">
                                        <div className="flex items-start justify-between gap-4 mb-1.5">
                                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                                                {step.title}
                                            </h3>
                                            <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-primary-600 text-base shrink-0 group-hover:bg-primary-50 group-hover:border-primary-100 transition-colors">
                                                <i className={`fi ${step.icon}`}></i>
                                            </div>
                                        </div>
                                        <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* 5. Supplier Tools & Features */}
            <section className="py-16 md:py-24 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className="text-3xl lg:text-4xl font-semibold text-gray-900 mb-4 tracking-tight leading-tight">
                            Everything You Need to{" "}
                            <span className={gradientText}>Succeed</span>
                        </h2>
                        <p className="text-gray-600 text-lg">Powerful tools built for travel businesses.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            whileHover={{ y: -5 }}
                            className="col-span-1 lg:col-span-2 bg-gray-900 rounded-3xl p-6 md:p-10 lg:p-12 text-white relative overflow-hidden flex flex-col lg:block lg:min-h-[420px]"
                        >
                            <div className="relative z-10 w-full max-w-full lg:max-w-[42%] xl:max-w-[40%] shrink-0">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6 text-2xl">
                                    <i className="fi fi-rr-dashboard"></i>
                                </div>
                                <h3 className="text-2xl md:text-3xl font-bold mb-4">Comprehensive Dashboard</h3>
                                <p className="text-gray-400 leading-relaxed">
                                    Track your performance, view upcoming bookings, and analyze your revenue growth all in one intuitive interface. Get real-time insights to make better business decisions.
                                </p>
                            </div>
                            <div className="relative z-0 mt-8 ml-auto w-[94%] sm:w-[88%] -mr-4 -mb-4 sm:-mr-6 sm:-mb-6 rounded-tl-2xl overflow-hidden bg-white shadow-2xl ring-1 ring-white/10 pointer-events-none lg:absolute lg:mt-0 lg:ml-0 lg:mr-0 lg:mb-0 lg:right-0 lg:bottom-0 lg:w-[56%] xl:w-[54%] lg:translate-x-[12%] lg:translate-y-[16%]">
                                <Image
                                    src="/supplier-dashboard.png"
                                    alt="Supplier dashboard showing bookings, revenue, listings and service breakdown"
                                    width={1920}
                                    height={1080}
                                    className="w-full h-auto"
                                    quality={100}
                                    priority
                                    sizes="(max-width: 1024px) 88vw, 42vw"
                                />
                            </div>
                        </motion.div>

                        <div className="grid grid-cols-1 gap-8">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                whileHover={{ y: -5 }}
                                className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
                            >
                                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4 text-xl">
                                    <i className="fi fi-rr-calendar-clock"></i>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Availability Management</h3>
                                <p className="text-gray-500 text-sm">Update your calendar instantly. Avoid double bookings and manage seasonal capacity with ease.</p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                whileHover={{ y: -5 }}
                                className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
                            >
                                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-4 text-xl">
                                    <i className="fi fi-rr-money-check-edit"></i>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Payout Tracking</h3>
                                <p className="text-gray-500 text-sm">Transparent commission reports and payout history. Know exactly when and how much you&apos;re getting paid.</p>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. Trust, Payments & Support */}
            <section className="py-16 md:py-20 bg-white border-b border-gray-100">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                        {[
                            {
                                icon: "fi-rr-lock",
                                title: "Secure Payments",
                                desc: "We handle all payment processing securely so you don't have to worry about fraud or chargebacks.",
                            },
                            {
                                icon: "fi-rr-shield-check",
                                title: "Verified Onboarding",
                                desc: "We verify all suppliers to maintain a high-quality marketplace that travelers trust.",
                            },
                            {
                                icon: "fi-rr-headset",
                                title: "Dedicated Support",
                                desc: "Our partner support team is here to help you set up and optimize your listings.",
                            },
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <div className="w-16 h-16 mx-auto bg-gray-50 rounded-full flex items-center justify-center text-gray-800 text-2xl mb-6">
                                    <i className={`fi ${item.icon}`}></i>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-3">{item.title}</h3>
                                <p className="text-gray-500 leading-relaxed px-4">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 7. Strong Call to Action */}
            <section className="py-16 md:py-24 bg-primary-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10"></div>
                <div className="container mx-auto px-4 relative z-10 text-center text-white">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-bold mb-6"
                    >
                        Ready to Grow Your Business?
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-lg md:text-xl text-primary-100 mb-8 md:mb-10 max-w-2xl mx-auto"
                    >
                        Join thousands of suppliers selling their unique travel experiences on our platform.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                    >
                        <Link
                            href="https://supplier.exploreworld.com/login"
                            className="bg-white text-primary-600 px-8 py-4 md:px-10 md:py-5 rounded-full font-bold text-lg md:text-xl hover:bg-gray-100 transition-all hover:scale-105 shadow-2xl inline-flex items-center gap-2"
                        >
                            Start Selling Today
                            <i className="fi fi-rr-arrow-right"></i>
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* 8. FAQs */}
            {/* 8. FAQs (Full Width Split Layout) */}
            <section className="py-24 bg-white border-t border-gray-100">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
                        {/* Left: Sticky Header */}
                        <div className="lg:col-span-5">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="lg:sticky lg:top-32"
                            >
                                <div className="inline-flex items-center gap-3 mb-6">
                                    <span className="w-10 h-0.5 bg-primary-600 shrink-0" aria-hidden="true"></span>
                                    <span className="text-primary-700 text-xs font-bold tracking-[0.2em] uppercase">
                                        Support
                                    </span>
                                </div>
                                <h2 className="text-3xl lg:text-4xl font-semibold text-gray-900 mb-6 tracking-tight leading-tight">
                                    Frequently Asked <br />
                                    <span className={gradientText}>Questions</span>
                                </h2>
                                <p className="text-gray-500 text-lg leading-relaxed mb-8">
                                    Everything you need to know about partnering with us. Can’t find the answer you’re looking for?
                                </p>
                                <a href="#" className="inline-flex items-center text-lg font-bold text-blue-600 hover:text-blue-700 transition-colors group">
                                    Contact Support Team
                                    <i className="fi fi-rr-arrow-right ml-2 text-sm transition-transform group-hover:translate-x-1"></i>
                                </a>
                            </motion.div>
                        </div>

                        {/* Right: Accordions */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="lg:col-span-7"
                        >
                            <div className="space-y-4">
                                <Accordion title="Is there a fee to join?">
                                    <p className="text-gray-600 leading-relaxed">
                                        No, joining and listing your products is completely free. We work on a commission-based model, meaning we only earn a small percentage when you receive a confirmed booking.
                                    </p>
                                </Accordion>
                                <Accordion title="When do I get paid?" defaultOpen={false}>
                                    <p className="text-gray-600 leading-relaxed">
                                        Payouts are processed automatically on a regular schedule (typically weekly or monthly) for all completed bookings. You can track all your earnings directly from your dashboard.
                                    </p>
                                </Accordion>
                                <Accordion title="Can I control my own pricing and availability?" defaultOpen={false}>
                                    <p className="text-gray-600 leading-relaxed">
                                        Absolutely. You have full control over your rates, availability calendars, and booking cut-off times. You can update these instantly at any time.
                                    </p>
                                </Accordion>
                                <Accordion title="What kind of support do you provide?" defaultOpen={false}>
                                    <p className="text-gray-600 leading-relaxed">
                                        We have a dedicated supplier success team available to help you via email and chat. We assist with onboarding, content optimization, and troubleshooting technical issues.
                                    </p>
                                </Accordion>
                                <Accordion title="Do I need technical skills to use the platform?" defaultOpen={false}>
                                    <p className="text-gray-600 leading-relaxed">
                                        Not at all! Our supplier dashboard is reasonable designed to be user-friendly and intuitive. If you can send an email, you can manage your listings with us.
                                    </p>
                                </Accordion>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>
            <Footer />
        </main >
    );
}
