"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import Accordion from "@/components/Accordion";
import Footer from "@/components/Footer/Footer";
import dynamic from 'next/dynamic';

const SupplierHeroCarousel = dynamic(() => import('@/components/SupplierHeroCarousel'), { ssr: false });

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
            {/* 1. Supplier Hero Section (Horizontal Scroll Snap) */}
            <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 bg-gray-50 overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center max-w-4xl mx-auto mb-16 md:mb-20">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <span className="inline-block py-1 px-3 rounded-full bg-primary-50 text-primary-700 text-xs font-bold tracking-wide mb-6 uppercase">
                                Ecosystem
                            </span>
                            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight tracking-tighter">
                                Powering Every Type of <br className="hidden md:block" />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-blue-600">Travel Experience</span>
                            </h1>
                            <p className="text-gray-600 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-10 font-light">
                                Whether you guide small groups or manage large attractions, our platform scales to fit your unique business model.
                            </p>

                            <Link
                                href="https://supplier.exploreworld.com/register"
                                className="inline-flex items-center justify-center h-14 px-10 rounded-full bg-primary-600 text-white font-bold text-lg hover:bg-primary-700 transition-all hover:scale-105 shadow-xl shadow-primary-600/20 gap-2"
                            >
                                Become a Supplier
                                <i className="fi fi-rr-arrow-right text-sm"></i>
                            </Link>
                        </motion.div>
                    </div>

                    {/* Carousel (Swiper) */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <SupplierHeroCarousel />
                    </motion.div>
                </div>
            </section>

            {/* 2. Why Sell on This Platform */}
            {/* 2. Why Sell on This Platform */}
            {/* 2. Why Partner with Us (Redesigned) */}
            <section className="py-20 md:py-32 relative overflow-hidden bg-gray-50/50">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-blue-100/30 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-purple-100/30 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2 pointer-events-none"></div>
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02]"></div>

                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="text-center mb-12 md:mb-20"
                    >
                        <span className="inline-block py-1 px-3 rounded-full bg-primary-50 text-primary-600 text-xs font-bold tracking-wide mb-4 border border-primary-100 uppercase">
                            Key Benefits
                        </span>
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
                            Why Partner with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-blue-600">Us?</span>
                        </h2>
                        <p className="text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto">
                            We empower suppliers with the tools, reach, and freedom they need to succeed in the modern travel marketplace.
                        </p>
                    </motion.div>

                    <motion.div
                        variants={staggerContainer}
                        initial="initial"
                        whileInView="whileInView"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        {[
                            {
                                icon: "fi-rr-shopping-bag",
                                title: "Direct Sales",
                                desc: "Sell directly to travelers without multiple middlemen eating your profits.",
                                gradient: "from-blue-500 to-cyan-500",
                                bg: "bg-blue-50",
                                text: "text-blue-600"
                            },
                            {
                                icon: "fi-rr-chart-pie-alt",
                                title: "Better Margins",
                                desc: "Competitive commission rates mean you keep more of what you earn.",
                                gradient: "from-emerald-500 to-teal-500",
                                bg: "bg-emerald-50",
                                text: "text-emerald-600"
                            },
                            {
                                icon: "fi-rr-map-location-track",
                                title: "Global Visibility",
                                desc: "Showcase your products to a worldwide audience of eager travelers.",
                                gradient: "from-violet-500 to-purple-500",
                                bg: "bg-violet-50",
                                text: "text-violet-600"
                            },
                            {
                                icon: "fi-rr-dashboard",
                                title: "Easy Management",
                                desc: "Full control over your availability, pricing, and bookings.",
                                gradient: "from-amber-500 to-orange-500",
                                bg: "bg-amber-50",
                                text: "text-amber-600"
                            },
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                variants={fadeInUp}
                                whileHover={{ y: -8 }}
                                className="group bg-white rounded-[2rem] p-8 shadow-sm hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] transition-all duration-500 border border-gray-100 relative overflow-hidden"
                            >
                                {/* Hover Gradient Fill */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`}></div>

                                <div className="flex flex-col h-full relative z-10">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`w-14 h-14 ${item.bg} ${item.text} rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-500`}>
                                            <i className={`fi ${item.icon}`}></i>
                                        </div>
                                        {/* Subtle Arrow */}
                                        <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-[-10px] group-hover:translate-x-0">
                                            <i className={`fi fi-rr-arrow-right ${item.text} text-xl`}></i>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">{item.title}</h3>
                                    <p className="text-gray-500 leading-relaxed mb-4">
                                        {item.desc}
                                    </p>
                                </div>

                                {/* Decorative Blob on Hover */}
                                <div className={`absolute -right-8 -bottom-8 w-32 h-32 ${item.bg} rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* 3. Who Can Join */}
            {/* 3. Who Can Join (Redesigned) */}
            {/* 3. Who Can Join (Now Merged into Hero - Section Removed) */}

            {/* 4. How It Works (Steps) */}
            <section className="py-16 md:py-20 bg-primary-900 text-white relative overflow-hidden">
                {/* Decorative Circles */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary-800 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-700 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 opacity-50"></div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold mb-4 tracking-tight">How It Works</h2>
                        <p className="text-primary-100/80 text-lg">Start selling in 4 simple steps</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden lg:block absolute top-[2.5rem] left-[10%] right-[10%] h-[2px] bg-primary-800/50 -z-10"></div>

                        {[
                            { title: "Sign Up", desc: "Create your free supplier account in minutes.", icon: "fi-rr-user-add" },
                            { title: "List Experience", desc: "Add details, photos, and set your prices.", icon: "fi-rr-edit" },
                            { title: "Receive Bookings", desc: "Get notified instantly when customers book.", icon: "fi-rr-calendar-check" },
                            { title: "Get Paid", desc: "Secure payouts directly to your bank account.", icon: "fi-rr-money-bill-wave" },
                        ].map((step, idx) => (
                            <motion.div
                                key={idx}
                                variants={fadeInUp}
                                initial="initial"
                                whileInView="whileInView"
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex flex-col items-center text-center"
                            >
                                <div className="w-20 h-20 bg-primary-800 rounded-full flex items-center justify-center text-3xl mb-6 shadow-lg border-4 border-primary-900 z-10">
                                    <i className={`fi ${step.icon}`}></i>
                                </div>
                                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                                <p className="text-primary-100/70 text-sm leading-relaxed">{step.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. Supplier Tools & Features */}
            <section className="py-16 md:py-24 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 tracking-tight">Everything You Need to Succeed</h2>
                        <p className="text-gray-600 text-lg">Powerful tools built for travel businesses.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            whileHover={{ y: -5 }}
                            className="col-span-1 lg:col-span-2 bg-black rounded-3xl p-6 md:p-12 text-white relative overflow-hidden flex flex-col justify-between"
                        >
                            <div className="relative z-10 max-w-md">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6 text-2xl">
                                    <i className="fi fi-rr-dashboard"></i>
                                </div>
                                <h3 className="text-2xl md:text-3xl font-bold mb-4">Comprehensive Dashboard</h3>
                                <p className="text-gray-400 mb-8 leading-relaxed">
                                    Track your performance, view upcoming bookings, and analyze your revenue growth all in one intuitive interface. Get real-time insights to make better business decisions.
                                </p>
                            </div>
                            <div className="absolute right-0 bottom-0 top-0 w-1/2 opacity-20 lg:opacity-100 lg:w-[45%] bg-gradient-to-l from-primary-900/50 to-transparent">
                                {/* Abstract UI representation */}
                                <div className="absolute right-[-40px] top-[20%] w-full h-full bg-slate-800 rounded-tl-3xl border-t border-l border-slate-700 p-6">
                                    <div className="flex gap-4 mb-6">
                                        <div className="w-1/2 h-24 bg-slate-700/50 rounded-xl"></div>
                                        <div className="w-1/2 h-24 bg-slate-700/50 rounded-xl"></div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="h-12 bg-slate-700/30 rounded-lg w-full"></div>
                                        <div className="h-12 bg-slate-700/30 rounded-lg w-full"></div>
                                        <div className="h-12 bg-slate-700/30 rounded-lg w-full"></div>
                                    </div>
                                </div>
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
                                <p className="text-gray-500 text-sm">Transparent commission reports and payout history. Know exactly when and how much you're getting paid.</p>
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
                            href="https://supplier.exploreworld.com/register"
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
                                <span className="inline-block py-1 px-3 rounded-full bg-primary-50 text-primary-600 text-xs font-bold tracking-wide mb-6 uppercase">
                                    Support
                                </span>
                                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
                                    Frequently Asked <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-blue-600">Questions</span>
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
