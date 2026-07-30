"use client";

import PackageCard from "@/components/PackageCard";
import PackageFilters from "@/components/PackageFilters/PackageFilters";
import ChipThumbImage from "@/components/common/ChipThumbImage";
import ListingsEmptyState from "@/components/common/ListingsEmptyState";
import Popup from "@/components/Popup";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export default function ClientWrapper({
  packages = [],
  destinationIds = [],
  selectedDestinations = [],
  initialFilters = {},
  suitableForOptions = [],
}) {
  const router = useRouter();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filters = useMemo(
    () => ({
      tour_type: initialFilters.tour_type || "",
      price_from: initialFilters.price_range_from || "",
      price_to: initialFilters.price_range_to || "",
      suitable_id: initialFilters.suitable_id || "",
      sort_by_price: initialFilters.sort_by_price || "",
      duration: initialFilters.duration || "",
      destination: "",
    }),
    [initialFilters],
  );

  const destinationLabel = useMemo(() => {
    if (selectedDestinations.length === 0) return "your destinations";
    if (selectedDestinations.length <= 2) {
      return selectedDestinations.map((dest) => dest.name).join(" & ");
    }
    return `${selectedDestinations.length} destinations`;
  }, [selectedDestinations]);

  const updateURL = (nextFilters, nextDestinationIds = destinationIds) => {
    if (nextDestinationIds.length === 0 && !nextFilters.duration) {
      router.push("/explore");
      return;
    }

    if (nextDestinationIds.length === 1) {
      const destination = selectedDestinations.find(
        (item) => item.id === nextDestinationIds[0],
      );
      const countryId = destination?.state?.country_id;
      if (destination && countryId) {
        const params = new URLSearchParams({
          state: String(destination.state_id),
          destination: String(destination.id),
        });
        if (nextFilters.tour_type) params.set("tour_type", nextFilters.tour_type);
        if (nextFilters.suitable_id) params.set("suitable_id", nextFilters.suitable_id);
        if (nextFilters.sort_by_price) {
          params.set("sort_by_price", nextFilters.sort_by_price);
        }
        if (nextFilters.duration) params.set("duration", nextFilters.duration);
        if (nextFilters.price_from && nextFilters.price_to) {
          params.set("price_range_from", nextFilters.price_from);
          params.set("price_range_to", nextFilters.price_to);
        }
        router.push(`/packages/${countryId}?${params.toString()}`);
        return;
      }
    }

    const params = new URLSearchParams();
    params.set("destinations", nextDestinationIds.join(","));

    if (nextFilters.tour_type) params.set("tour_type", nextFilters.tour_type);
    else params.delete("tour_type");

    if (nextFilters.suitable_id) params.set("suitable_id", nextFilters.suitable_id);
    else params.delete("suitable_id");

    if (nextFilters.sort_by_price) params.set("sort_by_price", nextFilters.sort_by_price);
    else params.delete("sort_by_price");

    if (nextFilters.duration) params.set("duration", nextFilters.duration);
    else params.delete("duration");

    if (nextFilters.price_from && nextFilters.price_to) {
      params.set("price_range_from", nextFilters.price_from);
      params.set("price_range_to", nextFilters.price_to);
    } else {
      params.delete("price_range_from");
      params.delete("price_range_to");
    }

    router.push(`/packages/search?${params.toString()}`);
  };

  const handleFilterChange = (newFilters) => {
    updateURL(newFilters);
  };

  const clearAllFilters = () => {
    updateURL({
      tour_type: "",
      price_from: "",
      price_to: "",
      suitable_id: "",
      sort_by_price: "",
      duration: "",
      destination: "",
    });
  };

  const hasActiveFilters = () =>
    Boolean(
      filters.tour_type ||
        filters.suitable_id ||
        filters.sort_by_price ||
        filters.duration ||
        filters.price_from ||
        filters.price_to,
    );

  const removeDestination = (id) => {
    const nextIds = destinationIds.filter((destId) => destId !== id);
    updateURL(filters, nextIds);
  };

  const toggleFilter = () => {
    setIsFilterOpen((open) => !open);
    document.body.style.overflow = !isFilterOpen ? "hidden" : "unset";
  };

  const closeFilter = () => {
    setIsFilterOpen(false);
    document.body.style.overflow = "unset";
  };

  return (
    <main className="min-h-screen bg-white pb-24 lg:pb-8">
      <div className="border-b border-[#EBEBEB] bg-[#FAFAFA]">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          <nav className="mb-4 flex items-center gap-2 text-sm text-[#717171]">
            <Link href="/home" className="transition-colors hover:text-primary-600">
              Home
            </Link>
            <i className="fi fi-rr-angle-right text-[10px]" aria-hidden />
            <Link href="/explore" className="transition-colors hover:text-primary-600">
              Explore
            </Link>
            <i className="fi fi-rr-angle-right text-[10px]" aria-hidden />
            <span className="font-medium text-[#222222]">Search results</span>
          </nav>

          <h1 className="text-2xl font-medium tracking-tight text-[#222222] md:text-[32px]">
            {selectedDestinations.length > 0 ? (
              <>
                Packages in{" "}
                <span className="text-primary-600">{destinationLabel}</span>
              </>
            ) : (
              "Package search results"
            )}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#717171] sm:text-[15px]">
            {selectedDestinations.length > 0
              ? "Showing packages that visit at least one of your selected destinations."
              : "Showing packages that match your selected trip duration."}
          </p>

          {selectedDestinations.length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {selectedDestinations.map((destination) => (
                <button
                  key={destination.id}
                  type="button"
                  onClick={() => removeDestination(destination.id)}
                  className="inline-flex max-w-full items-center gap-2 rounded-full border border-primary-100 bg-white py-1.5 pl-1.5 pr-3 text-sm font-medium text-[#222222] shadow-sm transition-colors hover:border-primary-200 hover:bg-primary-50"
                  aria-label={`Remove ${destination.name}`}
                >
                  <ChipThumbImage
                    src={destination.thumb_image_url}
                    filename={destination.thumb_image}
                    alt={destination.name}
                    iconClass="fi fi-rr-map-marker text-[10px]"
                    className="h-7 w-7 rounded-full overflow-hidden relative flex-shrink-0"
                  />
                  <span className="truncate">{destination.name}</span>
                  <i className="fi fi-rr-cross-small text-xs text-[#717171]" />
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          <div className="hidden w-full shrink-0 lg:block lg:w-[300px] xl:w-[320px]">
            <div className="sticky top-24">
              <PackageFilters
                layout="sidebar"
                initialFilters={filters}
                onFilterChange={handleFilterChange}
                suitableForOptions={suitableForOptions}
                destinationOptions={[]}
                showDestination={false}
              />
            </div>
          </div>

          <div className="min-w-0 flex-grow">
            <div className="mb-4 flex items-start justify-between gap-3 sm:mb-6">
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-medium text-[#222222] sm:text-lg">
                  Matching packages
                </h2>
                <p className="mt-0.5 text-xs text-[#717171] sm:text-sm">
                  {packages.length}{" "}
                  {packages.length === 1 ? "package" : "packages"} found
                </p>
              </div>

              <div className="shrink-0 lg:hidden">
                <button
                  type="button"
                  onClick={toggleFilter}
                  className="relative flex items-center justify-center gap-1.5 rounded-full bg-gray-900 px-3 py-1.5 text-sm text-white shadow-sm transition-colors hover:bg-black"
                >
                  <i className="fi fi-rr-settings-sliders text-[13px]" />
                  <span>Filters</span>
                  {hasActiveFilters() ? (
                    <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-primary-500" />
                  ) : null}
                </button>
              </div>
            </div>

            <Popup
              isOpen={isFilterOpen}
              onClose={closeFilter}
              title="Filters"
              pos="right"
              className="lg:hidden"
              draggable
            >
              <div className="p-6">
                <PackageFilters
                  layout="mobile"
                  initialFilters={filters}
                  onFilterChange={(next) => {
                    handleFilterChange(next);
                    closeFilter();
                  }}
                  suitableForOptions={suitableForOptions}
                  destinationOptions={[]}
                  showDestination={false}
                  onClose={closeFilter}
                />
              </div>
            </Popup>

            {destinationIds.length === 0 && !filters.duration ? (
              <ListingsEmptyState
                icon="fi fi-rr-map-marker"
                title="No destinations selected"
                description="Choose two or more destinations from search to see matching packages."
              />
            ) : packages.length > 0 ? (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))] items-stretch gap-4 sm:gap-5 lg:gap-6">
                {packages.map((pkg) => (
                  <PackageCard
                    key={pkg.id}
                    package={{
                      id: pkg.id,
                      title: pkg.name,
                      image: pkg.images?.[0]?.image_url,
                      totalDays: pkg.total_days,
                      totalNights: pkg.total_nights,
                      price: parseFloat(pkg.final_adult_price),
                      childPrice: parseFloat(pkg.final_child_price),
                      startingFrom: pkg.starting_location,
                      pickupPoint: pkg.pickup_point,
                      tourType: pkg.tour_type,
                      minMembers: pkg.minimum_members,
                      maxMembers: pkg.maximum_members,
                      date: new Date().toISOString().split("T")[0],
                    }}
                  />
                ))}
              </div>
            ) : (
              <ListingsEmptyState
                icon="fi fi-rr-umbrella-beach"
                title="No packages found"
                hasActiveFilters={hasActiveFilters()}
                onClearFilters={hasActiveFilters() ? clearAllFilters : undefined}
                description={
                  hasActiveFilters()
                    ? "Try adjusting your filters or remove a destination."
                    : "We couldn't find packages covering these destinations together yet."
                }
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
