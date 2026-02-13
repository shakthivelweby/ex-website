"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Search from "@/components/Search/Search";

export default function HomePage() {
    const [selectedTrip, setSelectedTrip] = useState("Packages");
    const [selectedLocation, setSelectedLocation] = useState("");
    const [isLocationPopupOpen, setIsLocationPopupOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const savedDestination = localStorage.getItem("choosedDestination");
        if (savedDestination) {
            const destination = JSON.parse(savedDestination);
            setSelectedLocation(destination.name);
        }
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        const savedDestination = localStorage.getItem("choosedDestination");
        if (!savedDestination) {
            setIsLocationPopupOpen(true);
            return;
        }
        const destination = JSON.parse(savedDestination);
        if (selectedTrip === "Packages") {
            let url = `/packages/${destination.country_id}`;
            if (destination.state_id) url += `?state=${destination.state_id}`;
            if (destination.destination_id) url += `${destination.state_id ? '&' : '?'}destination=${destination.destination_id}`;
            router.push(url);
        } else {
            router.push('/scheduled');
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <Search
                isOpen={isLocationPopupOpen}
                onClose={() => setIsLocationPopupOpen(false)}
                type={selectedTrip === "Packages" ? "package" : "schedule"}
            />

            {/* Hero Section */}
            <section className="relative h-[600px] overflow-hidden">
                <div className="absolute inset-0">
                    <Image
                        src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2400"
                        alt="Travel"
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/30" />
                </div>

                <div className="relative z-10 h-full flex items-center justify-center">
                    <div className="container mx-auto px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="max-w-3xl mx-auto text-center"
                        >
                            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
                                Pay Less, Book Direct
                            </h1>
                            <p className="text-xl text-white/90 mb-8">
                                The new way to plan your trip!
                            </p>

                            {/* Search Bar - Exact Design */}
                            <div className="bg-white rounded-full shadow-2xl max-w-3xl">
                                <form onSubmit={handleSearch} className="flex items-center">
                                    {/* What you are looking for */}
                                    <div className="flex-1 px-6 py-5">
                                        <div className="text-xs text-gray-500 mb-1">What you are looking for ?</div>
                                        <div className="flex items-center justify-between cursor-pointer">
                                            <select
                                                value={selectedTrip}
                                                onChange={(e) => setSelectedTrip(e.target.value)}
                                                className="text-base font-semibold text-gray-900 bg-transparent border-none outline-none w-full cursor-pointer pr-2"
                                            >
                                                <option value="Packages">Packages</option>
                                                <option value="Scheduled">Scheduled Trips</option>
                                            </select>
                                            <i className="fi fi-rr-angle-small-down text-gray-600 text-xl"></i>
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div className="w-px h-12 bg-gray-200"></div>

                                    {/* Where you want start from */}
                                    <div
                                        className="flex-1 px-6 py-5 cursor-pointer"
                                        onClick={() => setIsLocationPopupOpen(true)}
                                    >
                                        <div className="text-xs text-gray-500 mb-1">Where you want start from?</div>
                                        <div className="flex items-center justify-between">
                                            <div className="text-base font-semibold text-gray-900">
                                                {selectedLocation || "Select destination"}
                                            </div>
                                            <i className="fi fi-rr-angle-small-down text-gray-600 text-xl"></i>
                                        </div>
                                    </div>

                                    {/* Large Circular Search Button */}
                                    <button
                                        type="submit"
                                        className="w-16 h-16 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 rounded-full flex items-center justify-center text-white transition-all shadow-lg hover:shadow-xl mr-2"
                                    >
                                        <i className="fi fi-rr-search text-2xl"></i>
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Book Without Agency Fee */}
            <section className="py-20 bg-gradient-to-b from-pink-50 to-white">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Book your trip without<br />agency fee
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            We build the perfect solutions for travellers life easy
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                image: "https://images.unsplash.com/photo-1609920658906-8223bd289001?q=80&w=800",
                                title: "Save 20% on all bookings!",
                                desc: "We offer the best deals on all bookings, so you can save more and travel more."
                            },
                            {
                                image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=800",
                                title: "Easy booking process",
                                desc: "Book your dream destination in just a few clicks with our simple platform."
                            },
                            {
                                image: "https://images.unsplash.com/photo-1488085061387-422e29b40080?q=80&w=800",
                                title: "Book directly to local suppliers",
                                desc: "Connect directly with local suppliers and get authentic experiences."
                            },
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="group"
                            >
                                <div className="relative h-64 rounded-3xl overflow-hidden mb-6 shadow-lg">
                                    <Image
                                        src={item.image}
                                        alt={item.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Discover Amazing Places */}
            <section className="py-20 bg-gray-900 text-white">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            Discover Amazing Places<br />to Visit
                        </h2>
                        <p className="text-lg text-white/80 max-w-2xl mx-auto">
                            We build the perfect solutions for travellers life easy
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            {
                                name: "India",
                                image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=800",
                                packages: 8
                            },
                            {
                                name: "Dubai",
                                image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800",
                                packages: 12
                            },
                            {
                                name: "Paris",
                                image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800",
                                packages: 15
                            },
                            {
                                name: "Bali",
                                image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800",
                                packages: 10
                            },
                            {
                                name: "Maldives",
                                image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=800",
                                packages: 18
                            },
                            {
                                name: "Switzerland",
                                image: "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?q=80&w=800",
                                packages: 14
                            },
                        ].map((dest, idx) => (
                            <motion.div
                                key={dest.name}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="group cursor-pointer"
                            >
                                <div className="relative h-80 rounded-3xl overflow-hidden shadow-xl">
                                    <Image
                                        src={dest.image}
                                        alt={dest.name}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                    <div className="absolute bottom-6 left-6 right-6">
                                        <h3 className="text-3xl font-bold mb-2">{dest.name}</h3>
                                        <p className="text-white/90">{dest.packages} Tour Packages</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <Link
                            href="/destinations"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 rounded-full font-semibold hover:bg-gray-100 transition-colors shadow-xl"
                        >
                            Explore All Destinations
                            <i className="fi fi-rr-arrow-right"></i>
                        </Link>
                    </div>
                </div>
            </section>

            {/* What You Can Do */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            What you can do with<br />Exploreworld
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl">
                            We build the perfect solutions for travellers life easy
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Image Column */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="lg:col-span-1"
                        >
                            <div className="relative h-[600px] rounded-3xl overflow-hidden shadow-xl">
                                <Image
                                    src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800"
                                    alt="Travel"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </motion.div>

                        {/* Services Grid */}
                        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { icon: "fi fi-rr-calendar-clock", title: "Scheduled Tours", desc: "Fixed-date tours planned by trusted local suppliers" },
                                { icon: "fi fi-rr-suitcase-rolling", title: "Packages", desc: "Explore curated travel packages for all budgets" },
                                { icon: "fi fi-rr-hiking", title: "Activities", desc: "Thrilling outdoor and indoor activities" },
                                { icon: "fi fi-rr-ferris-wheel", title: "Attractions", desc: "Visit the world's most iconic landmarks" },
                                { icon: "fi fi-rr-car-side", title: "Rentals", desc: "Rent vehicles for your journey" },
                                { icon: "fi fi-rr-ticket", title: "Events", desc: "Book tickets for exclusive events" },
                            ].map((service, idx) => (
                                <motion.div
                                    key={service.title}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-gray-50 rounded-3xl p-6 hover:shadow-lg transition-all group cursor-pointer"
                                >
                                    <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <i className={`${service.icon} text-white text-2xl`}></i>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
                                    <p className="text-gray-600 mb-4">{service.desc}</p>
                                    <Link href="#" className="inline-flex items-center gap-2 text-rose-600 font-semibold hover:gap-3 transition-all">
                                        View all
                                        <i className="fi fi-rr-arrow-right text-sm"></i>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Travel Journal */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            From Our Travel Journal
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Latest travel stories and expert tips
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800",
                                category: "Adventure",
                                title: "10 Hidden Gems in Southeast Asia",
                                excerpt: "Discover the lesser-known destinations that will make your trip unforgettable",
                                date: "Dec 15, 2024",
                                readTime: "5 min read"
                            },
                            {
                                image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800",
                                category: "Travel Tips",
                                title: "Budget Travel: Explore More for Less",
                                excerpt: "Smart strategies to make the most of your travel budget without compromising on experiences",
                                date: "Dec 12, 2024",
                                readTime: "7 min read"
                            },
                            {
                                image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=800",
                                category: "Culture",
                                title: "Festival Season Travel Guide",
                                excerpt: "Plan your trips around vibrant cultural celebrations and festivals worldwide",
                                date: "Dec 10, 2024",
                                readTime: "6 min read"
                            },
                        ].map((post, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all group cursor-pointer"
                            >
                                <div className="relative h-64 overflow-hidden">
                                    <Image
                                        src={post.image}
                                        alt={post.title}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-rose-500 text-white px-4 py-1.5 rounded-full text-sm font-semibold">
                                            {post.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                                        <span>{post.date}</span>
                                        <span>•</span>
                                        <span>{post.readTime}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-rose-600 transition-colors">
                                        {post.title}
                                    </h3>
                                    <p className="text-gray-600 mb-4 leading-relaxed">
                                        {post.excerpt}
                                    </p>
                                    <div className="flex items-center gap-2 text-rose-600 font-semibold group-hover:gap-3 transition-all">
                                        Read More
                                        <i className="fi fi-rr-arrow-right text-sm"></i>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <Link
                            href="/blog"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-800 transition-colors shadow-lg"
                        >
                            Explore All Stories
                            <i className="fi fi-rr-arrow-right"></i>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-20 bg-gradient-to-b from-pink-50 to-white">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Voices from the Journey
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Real experiences from real travelers who've discovered the world with us
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {[
                            {
                                text: "Amazing experience! The Himachal package exceeded all expectations. Every detail was perfectly planned and the local guides were incredible.",
                                name: "Priya Sharma",
                                location: "Mumbai, India",
                                rating: 5
                            },
                            {
                                text: "Best decision to book through Explore World. Got luxury experiences at budget prices. The team's support was outstanding throughout.",
                                name: "Rajesh Kumar",
                                location: "Delhi, India",
                                rating: 5
                            },
                            {
                                text: "The Rajasthan tour was absolutely magical! From desert safaris to palace stays, everything was perfectly organized. Unforgettable memories!",
                                name: "Anjali Patel",
                                location: "Ahmedabad, India",
                                rating: 5
                            },
                        ].map((review, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow"
                            >
                                <div className="flex gap-1 mb-6">
                                    {[...Array(review.rating)].map((_, i) => (
                                        <i key={i} className="fi fi-sr-star text-amber-400 text-lg"></i>
                                    ))}
                                </div>
                                <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                                    "{review.text}"
                                </p>
                                <div className="pt-6 border-t border-gray-100">
                                    <h4 className="font-bold text-gray-900 mb-1">{review.name}</h4>
                                    <p className="text-sm text-gray-600">{review.location}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 bg-gradient-to-r from-rose-500 to-pink-600">
                <div className="container mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
                            Ready for your next<br />adventure?
                        </h2>
                        <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
                            Start planning your dream vacation today and create memories that last a lifetime
                        </p>
                        <Link
                            href="/packages"
                            className="inline-flex items-center gap-2 px-10 py-5 bg-white text-gray-900 rounded-full font-bold text-lg hover:bg-gray-50 transition-colors shadow-2xl"
                        >
                            Start Exploring
                            <i className="fi fi-rr-arrow-right"></i>
                        </Link>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
