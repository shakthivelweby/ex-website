import { redirect } from "next/navigation";
import ClientWrapper from "./clientWrapper";
import { resolveSelectedStates } from "@/components/Search/packageLocations";
import {
  getAllDestinations,
  getPackagesByDestinations,
  getSuitableMasters,
  parseDestinationIds,
  parseStateIds,
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

function filterQueryFromParams(resolved) {
  return {
    tour_type: resolved.tour_type || "",
    suitable_id: resolved.suitable_id || "",
    sort_by_price: resolved.sort_by_price || "",
    price_range_from: resolved.price_range_from || "",
    price_range_to: resolved.price_range_to || "",
    duration: resolved.duration || "",
  };
}

function redirectWithFilters(path, extra, filters) {
  const params = new URLSearchParams(extra);
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  redirect(`${path}?${params.toString()}`);
}

export default async function PackageSearchPage({ searchParams }) {
  const resolved = await searchParams;
  const destinationIds = parseDestinationIds(resolved.destinations);
  const stateIds = parseStateIds(resolved.states);
  const initialFilters = filterQueryFromParams(resolved);

  const allDestinationsResponse = await safeRequest(getAllDestinations, { data: [] });
  const allDestinations = Array.isArray(allDestinationsResponse?.data)
    ? allDestinationsResponse.data
    : [];

  if (destinationIds.length === 1 && stateIds.length === 0) {
    const destination = allDestinations.find((item) => item.id === destinationIds[0]);
    const countryId = destination?.state?.country_id;
    if (destination && countryId) {
      redirectWithFilters(
        `/packages/${countryId}`,
        {
          state: String(destination.state_id),
          destination: String(destination.id),
        },
        initialFilters,
      );
    }
  }

  if (destinationIds.length === 0 && stateIds.length === 1) {
    const destinationInState = allDestinations.find(
      (item) => item.state_id === stateIds[0] || item.state?.id === stateIds[0],
    );
    const countryId = destinationInState?.state?.country_id;
    if (countryId) {
      redirectWithFilters(
        `/packages/${countryId}`,
        { state: String(stateIds[0]) },
        initialFilters,
      );
    }
  }

  const selectedDestinations = destinationIds
    .map((id) => allDestinations.find((item) => item.id === id))
    .filter(Boolean)
    .map((item) => ({ ...item, type: "destination" }));
  const selectedStates = resolveSelectedStates(allDestinations, stateIds);

  const packagesResponse = await safeRequest(
    () =>
      getPackagesByDestinations({
        destination_ids: destinationIds,
        state_ids: stateIds,
        ...initialFilters,
      }),
    { data: [] },
  );

  const suitableForResponse = await safeRequest(getSuitableMasters, { data: [] });

  return (
    <ClientWrapper
      packages={packagesResponse?.data || []}
      destinationIds={destinationIds}
      stateIds={stateIds}
      selectedDestinations={selectedDestinations}
      selectedStates={selectedStates}
      initialFilters={initialFilters}
      suitableForOptions={(suitableForResponse?.data || []).map((item) => ({
        value: item.id.toString(),
        label: item.name,
      }))}
    />
  );
}
