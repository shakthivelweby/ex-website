"use client";

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "Home", href: "/home" },
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Explore", href: "/explore" },
    { name: "Search", href: "/search" },
  ];

  const categories = [
    { name: "Packages", href: "/explore", description: "Travel packages" },
    { name: "Scheduled Trips", href: "/scheduled", description: "Fixed departure trips" },
    { name: "Attractions", href: "/attractions", description: "Tourist attractions" },
    { name: "Events", href: "/events", description: "Upcoming events" },
  ];

  const supportLinks = [
    { name: "My Bookings", href: "/my-bookings" },
    { name: "Profile", href: "/profile" },
    { name: "Help Center", href: "/contact" },
    { name: "FAQs", href: "/contact#faq" },
  ];

  const legalLinks = [
    { name: "Terms & Conditions", href: "/termsandcondition" },
    { name: "Privacy Policy", href: "/termsandcondition#privacy" },
    { name: "Cancellation Policy", href: "/termsandcondition#cancellation" },
    { name: "Refund Policy", href: "/termsandcondition#cancellation" },
  ];

  const socialLinks = [
    { name: "Facebook", href: "#", icon: "fi fi-brands-facebook" },
    { name: "Twitter", href: "#", icon: "fi fi-brands-twitter" },
    { name: "Instagram", href: "#", icon: "fi fi-brands-instagram" },
    { name: "LinkedIn", href: "#", icon: "fi fi-brands-linkedin" },
    { name: "YouTube", href: "#", icon: "fi fi-brands-youtube" },
  ];

  return (
    <footer className="bg-black text-gray-300 mt-16">
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link href="/home" className="inline-block mb-6">
              <Image
                src="/exploreworld-logo-white.png"
                alt="Explore World Logo"
                width={200}
                height={60}
                className="h-10 md:h-12 w-auto"
                priority
              />
            </Link>
            <p className="text-gray-400 mb-6 max-w-md">
              Your single discovery platform to easily find, compare, and book trips, activities, and rentals. 
              Focusing on destination-based browsing and trust-driven design to offer you better pricing and transparency.
            </p>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center gap-2">
                <i className="fi fi-rr-envelope text-primary-400"></i>
                <a href="mailto:Info@exploreworld.com" className="hover:text-white transition-colors">
                  Info@exploreworld.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <i className="fi fi-rr-phone-call text-primary-400"></i>
                <a href="tel:8891363636" className="hover:text-white transition-colors">
                  8891 36 36 36
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Categories</h3>
            <ul className="space-y-3">
              {categories.map((category) => (
                <li key={category.name}>
                  <Link
                    href={category.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                    title={category.description}
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Support</h3>
            <ul className="space-y-3 mb-6">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="text-white font-semibold mb-4 text-lg">Legal</h3>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social Media & Copyright */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Social Media Links */}
            <div className="flex items-center gap-4">
              <span className="text-gray-400 text-sm mr-2">Follow us:</span>
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  aria-label={social.name}
                  className="w-10 h-10 rounded-full bg-gray-900 hover:bg-primary-500 flex items-center justify-center transition-colors group"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className={`${social.icon} text-gray-400 group-hover:text-white transition-colors`}></i>
                </a>
              ))}
            </div>

            {/* Copyright */}
            <div className="text-gray-400 text-sm text-center md:text-right">
              <p>&copy; {currentYear} Explore World. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
