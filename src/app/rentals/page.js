import ClientWrapper from "./clientWrapper";
import { getRentalCategories, getRentals } from "./service";

export default async function RentalsPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;

  const filters = {
    date: resolvedSearchParams.date || "",
    location: resolvedSearchParams.location || "",
    category: resolvedSearchParams.category || "",
    sub_category: resolvedSearchParams.sub_category || "",
    rating: resolvedSearchParams.rating || "",
    price_from: resolvedSearchParams.price_from || "",
    price_to: resolvedSearchParams.price_to || "",
    longitude: resolvedSearchParams.longitude || "",
    latitude: resolvedSearchParams.latitude || "",
    search: resolvedSearchParams.search || "",
    per_page: 24,
  };

  const categoriesRes = await getRentalCategories();
  const rentalsRes = await getRentals(filters);
  const rentals = rentalsRes?.data?.data || [];

  return (
    <ClientWrapper
      searchParams={resolvedSearchParams}
      initialRentals={rentals}
      initialCategories={categoriesRes?.data || []}
    />
  );
}

