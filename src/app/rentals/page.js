import ClientWrapper from "./clientWrapper";
import { getRentalCategories, getRentals } from "./service";
import { normalizeRentalFilters } from "./rentalFilterUtils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RentalsPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;

  const filters = normalizeRentalFilters({
    date: resolvedSearchParams.date || "",
    location: resolvedSearchParams.location || "",
    category: resolvedSearchParams.category || "",
    sub_category: resolvedSearchParams.sub_category || "",
    transmission: resolvedSearchParams.transmission || "",
    fuel_type: resolvedSearchParams.fuel_type || "",
    seats: resolvedSearchParams.seats || "",
    rating: resolvedSearchParams.rating || "",
    price_from: resolvedSearchParams.price_from || "",
    price_to: resolvedSearchParams.price_to || "",
    longitude: resolvedSearchParams.longitude || "",
    latitude: resolvedSearchParams.latitude || "",
    search: resolvedSearchParams.search || "",
    per_page: 100,
  });

  let categoriesRes = { data: [] };
  let rentalsRes = { data: { data: [] } };
  try {
    categoriesRes = await getRentalCategories();
  } catch (e) {
    console.error("[rentals] categories SSR:", e?.message || e);
  }
  try {
    rentalsRes = await getRentals(filters);
  } catch (e) {
    console.error("[rentals] listings SSR:", e?.message || e);
  }
  const rentals = rentalsRes?.data?.data ?? [];

  return (
    <ClientWrapper
      searchParams={resolvedSearchParams}
      initialRentals={rentals}
      initialCategories={categoriesRes?.data || []}
    />
  );
}

