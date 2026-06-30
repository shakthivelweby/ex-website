"use client";

import Link from "next/link";
import ResolvableCoverImage from "@/components/common/ResolvableCoverImage";
import Footer from "@/components/Footer/Footer";
import { pickImageSource } from "@/utils/imageUrl";
import {
  getExploreData,
  getFeaturedDestinations,
  getPackageCount,
} from "./service";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";

const TYPE = {
  eyebrow:
    "text-[10px] font-semibold uppercase tracking-[0.18em] sm:text-[11px] sm:tracking-[0.2em]",
  sectionTitle:
    "text-2xl font-medium leading-[1.12] tracking-tight text-[#222222] md:text-[32px]",
  body: "text-sm leading-relaxed text-[#717171] sm:text-[15px]",
};

const EXPLORE_CONTAINER =
  "mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8";

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
        <linearGradient id="explore-mountain-far" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#011c1c" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#045858" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="explore-mountain-mid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#045858" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#057676" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="explore-mountain-near" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1ab2b2" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#057676" stopOpacity="0.95" />
        </linearGradient>
      </defs>

      <rect x="-2" y="96" width="1444" height="26" fill="#045858" />

      {farPeaks.map((points) => (
        <polygon
          key={`far-${points}`}
          points={points}
          fill="url(#explore-mountain-far)"
        />
      ))}
      {midPeaks.map((points) => (
        <polygon
          key={`mid-${points}`}
          points={points}
          fill="url(#explore-mountain-mid)"
        />
      ))}
      {nearPeaks.map((points) => (
        <polygon
          key={`near-${points}`}
          points={points}
          fill="url(#explore-mountain-near)"
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

function HeaderMountainPattern({ animate = true }) {
  const shouldReduceMotion = useReducedMotion();

  const className =
    "pointer-events-none absolute bottom-0 left-0 h-14 w-full sm:h-16 md:h-20";

  if (!animate || shouldReduceMotion) {
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

function ExploreHeader({ loading, children }) {
  return (
    <section className="relative overflow-hidden bg-primary-600">
      <HeaderMountainPattern animate={!loading} />
      <div className={`relative z-10 ${EXPLORE_CONTAINER} py-10 sm:py-12 lg:py-14`}>
        {loading ? (
          <div className="max-w-xl space-y-3" aria-hidden>
            <div className="h-3 w-20 animate-pulse rounded bg-white/25" />
            <div className="h-9 w-64 animate-pulse rounded bg-white/30 sm:w-80" />
            <div className="h-4 w-full animate-pulse rounded bg-white/20" />
          </div>
        ) : (
          children
        )}
      </div>
    </section>
  );
}

function SectionIntro({ eyebrow, title, description, action }) {
  return (
    <div className="mb-8 grid gap-4 sm:mb-10 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-12">
      <div className="max-w-xl">
        <div className="mb-4 h-0.5 w-10 bg-primary-600" />
        <p className={`mb-2 ${TYPE.eyebrow} text-primary-600`}>{eyebrow}</p>
        <h2 className={TYPE.sectionTitle}>{title}</h2>
        {description ? (
          <p className={`mt-3 max-w-md ${TYPE.body}`}>{description}</p>
        ) : null}
      </div>
      {action ? <div className="lg:text-right">{action}</div> : null}
    </div>
  );
}

function CardGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="space-y-3">
          <div className="aspect-[4/3] animate-pulse rounded-2xl bg-[#F3F3F3]" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-[#F3F3F3]" />
          <div className="h-3 w-1/3 animate-pulse rounded bg-[#F3F3F3]" />
        </div>
      ))}
    </div>
  );
}

function ExploreSkeleton() {
  return (
    <main className="min-h-screen bg-white text-[#222222]">
      <ExploreHeader loading />

      <section className={`${EXPLORE_CONTAINER} py-10 sm:py-12`}>
        <div className="mb-8 space-y-3">
          <div className="h-0.5 w-10 animate-pulse rounded bg-[#EBEBEB]" />
          <div className="h-4 w-24 animate-pulse rounded bg-[#F3F3F3]" />
          <div className="h-8 w-40 animate-pulse rounded bg-[#F3F3F3]" />
        </div>
        <CardGridSkeleton />
      </section>

      <section className="border-t border-[#EBEBEB] bg-[#FAFAFA]">
        <div className={`${EXPLORE_CONTAINER} py-10 sm:py-12`}>
          <div className="mb-8 space-y-3">
            <div className="h-0.5 w-10 animate-pulse rounded bg-[#EBEBEB]" />
            <div className="h-8 w-48 animate-pulse rounded bg-[#EBEBEB]" />
          </div>
          <div className="mb-6 flex gap-3 border-b border-[#EBEBEB] pb-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-4 w-16 animate-pulse rounded bg-[#EBEBEB]"
              />
            ))}
          </div>
          <CardGridSkeleton />
        </div>
      </section>
    </main>
  );
}

function DestinationCard({ href, image, title, count }) {
  return (
    <Link href={href} className="group block">
      <article className="overflow-hidden rounded-2xl bg-white ring-1 ring-[#EBEBEB] transition-all duration-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:ring-[#DDDDDD]">
        <div className="relative aspect-[4/3] overflow-hidden bg-[#F0F0F0]">
          <div className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-[1.03]">
            <ResolvableCoverImage
              src={image?.url}
              filename={image?.filename}
              alt={title}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          </div>
        </div>
        <div className="px-4 py-3.5">
          <h3 className="text-[15px] font-medium text-[#222222] sm:text-base">
            {title}
          </h3>
          <p className="mt-1 text-sm text-[#717171]">
            {count || 0} package{count === 1 ? "" : "s"}
          </p>
        </div>
      </article>
    </Link>
  );
}

export default function Explore() {
  const [mounted, setMounted] = useState(false);
  const [countries, setCountries] = useState([]);
  const [packageCounts, setPackageCounts] = useState({});
  const [activeCountryId, setActiveCountryId] = useState(null);

  const { data: featuredDestinationsData, isLoading: featuredLoading } =
    useQuery({
      queryKey: ["featuredDestinations"],
      queryFn: getFeaturedDestinations,
    });

  const featuredDestinations = featuredDestinationsData?.data || [];

  useEffect(() => {
    const fetchData = async () => {
      const response = await getExploreData();
      const list = response.data || [];
      setCountries(list);
      if (list.length > 0) setActiveCountryId(list[0].id);
      setMounted(true);

      const counts = {};
      await Promise.all(
        list.map(async (country) => {
          counts[country.id] = await getPackageCount(country.id);
        }),
      );
      setPackageCounts(counts);
    };
    fetchData();
  }, []);

  const activeCountry = countries.find((c) => c.id === activeCountryId);

  const activeCountryPackageCount = activeCountry
    ? (packageCounts[activeCountry.id] ??
      activeCountry.state?.reduce((t, s) => t + (s.package_count || 0), 0) ??
      0)
    : 0;

  if (!mounted) return <ExploreSkeleton />;

  return (
    <main className="min-h-screen bg-white text-[#222222]">
      <ExploreHeader loading={!mounted}>
        <div className="max-w-2xl">
          <p
            className={`${TYPE.eyebrow} text-primary-200`}
          >
            Packages
          </p>
          <h1 className="mt-2 text-[30px] font-medium leading-[1.1] tracking-tight text-white sm:text-[34px] md:text-4xl">
            Explore destinations
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/80 sm:text-[15px]">
            Curated travel packages from verified suppliers — browse by country
            and book direct.
          </p>
        </div>
      </ExploreHeader>

      <section className={`${EXPLORE_CONTAINER} py-10 sm:py-12 lg:py-14`}>
        <SectionIntro
          eyebrow="Popular picks"
          title="Featured destinations"
          description="Hand-picked places travelers are booking right now."
        />

        {featuredLoading ? (
          <CardGridSkeleton />
        ) : featuredDestinations.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {featuredDestinations.map((destination) => {
              const packagesHref = `/packages/${destination.state.country_id}?state=${destination.state_id}&destination=${destination.id}`;
              const destinationImage = pickImageSource([
                {
                  url: destination.cover_image_url,
                  filename: destination.cover_image,
                },
                {
                  url: destination.thumb_image_url,
                  filename: destination.thumb_image,
                },
              ]);

              return (
                <DestinationCard
                  key={destination.id}
                  href={packagesHref}
                  image={destinationImage}
                  title={destination.name}
                  count={destination.package_count}
                />
              );
            })}
          </div>
        ) : (
          <p className={`py-12 text-center ${TYPE.body}`}>
            No featured destinations available.
          </p>
        )}
      </section>

      <section className="border-t border-[#EBEBEB] bg-[#FAFAFA]">
        <div className={`${EXPLORE_CONTAINER} py-10 sm:py-12 lg:py-14`}>
          <SectionIntro
            eyebrow="By country"
            title="Browse by region"
            description="Select a country to view its states and available packages."
            action={
              activeCountry ? (
                <Link
                  href={`/packages/${activeCountry.id}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 transition-all hover:gap-3 hover:text-primary-700"
                >
                  View all in {activeCountry.name}
                  <i className="fi fi-rr-arrow-right text-xs" />
                </Link>
              ) : null
            }
          />

          {countries.length > 0 && (
            <div className="mb-8 flex gap-0.5 overflow-x-auto border-b border-[#EBEBEB] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {countries.map((country) => {
                const isActive = country.id === activeCountryId;
                return (
                  <button
                    key={country.id}
                    type="button"
                    onClick={() => setActiveCountryId(country.id)}
                    className={`shrink-0 border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors sm:px-4 ${
                      isActive
                        ? "border-primary-600 text-[#222222]"
                        : "border-transparent text-[#717171] hover:text-[#222222]"
                    }`}
                  >
                    {country.name}
                  </button>
                );
              })}
            </div>
          )}

          {activeCountry ? (
            <div>
              <p className={`mb-6 ${TYPE.body}`}>
                {activeCountry.state?.length || 0} regions ·{" "}
                {activeCountryPackageCount} packages
              </p>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
                {(activeCountry.state || []).map((state) => {
                  const stateImage = pickImageSource([
                    {
                      url: state.cover_image_url,
                      filename: state.cover_image,
                    },
                    {
                      url: state.thumb_image_url,
                      filename: state.thumb_image,
                    },
                  ]);

                  return (
                    <DestinationCard
                      key={state.id}
                      href={`/packages/${activeCountry.id}?state=${state.id}`}
                      image={stateImage}
                      title={state.name}
                      count={state.package_count}
                    />
                  );
                })}
              </div>

              {(activeCountry.state?.length || 0) === 0 && (
                <p className={`py-12 text-center ${TYPE.body}`}>
                  No regions listed for this country yet.
                </p>
              )}
            </div>
          ) : (
            <p className={`py-12 text-center ${TYPE.body}`}>
              No countries available yet.
            </p>
          )}
        </div>
      </section>

      <section className={`${EXPLORE_CONTAINER} py-10 sm:py-12`}>
        <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-[#EBEBEB]">
          <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="max-w-md">
              <p className={`mb-2 ${TYPE.eyebrow} text-primary-600`}>
                Scheduled trips
              </p>
              <h2 className="text-xl font-medium tracking-tight text-[#222222] sm:text-2xl">
                Fixed departure dates?
              </h2>
              <p className={`mt-2 ${TYPE.body}`}>
                Browse scheduled group trips with confirmed itineraries and
                like-minded travelers.
              </p>
            </div>
            <Link
              href="/scheduled"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
            >
              View scheduled trips
              <i className="fi fi-rr-arrow-right text-xs" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
