import { redirect } from "next/navigation";
import ClientWrapper from "./clientWrapper";
import {
  getAllDestinations,
  getPackagesByDestinations,
  getSuitableMasters,
  parseDestinationIds,
} from "./service";

export const dynamic = "force-dynamic";

async function safeRequest(request, fallback) {
  try {
    return await request();
  } catch (error) {
    console.warn("[packages/search] request failed:", error?.message || error);
    return fallback;
  }
}

export default async function PackageSearchPage({ searchParams }) {
  const resolved = await searchParams;
  const destinationIds = parseDestinationIds(resolved.destinations);
  const initialFilters = {
    tour_type: resolved.tour_type || "",
    suitable_id: resolved.suitable_id || "",
    sort_by_price: resolved.sort_by_price || "",
    price_range_from: resolved.price_range_from || "",
    price_range_to: resolved.price_range_to || "",
    duration: resolved.duration || "",
  };

  const allDestinationsResponse = await safeRequest(getAllDestinations, { data: [] });
  const allDestinations = Array.isArray(allDestinationsResponse?.data)
    ? allDestinationsResponse.data
    : [];

  if (destinationIds.length === 1) {
    const destination = allDestinations.find((item) => item.id === destinationIds[0]);
    const countryId = destination?.state?.country_id;
    if (destination && countryId) {
      const params = new URLSearchParams({
        state: String(destination.state_id),
        destination: String(destination.id),
      });
      Object.entries(initialFilters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
      redirect(`/packages/${countryId}?${params.toString()}`);
    }
  }

  const selectedDestinations = destinationIds
    .map((id) => allDestinations.find((item) => item.id === id))
    .filter(Boolean);

  const packagesResponse = await safeRequest(
    () =>
      getPackagesByDestinations({
        destination_ids: destinationIds,
        ...initialFilters,
      }),
    { data: [] },
  );

  const suitableForResponse = await safeRequest(getSuitableMasters, { data: [] });

  return (
    <ClientWrapper
      packages={packagesResponse?.data || []}
      destinationIds={destinationIds}
      selectedDestinations={selectedDestinations}
      initialFilters={initialFilters}
      suitableForOptions={(suitableForResponse?.data || []).map((item) => ({
        value: item.id.toString(),
        label: item.name,
      }))}
    />
  );
}
