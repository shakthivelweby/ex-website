import ClientWrapper from "./clientWrapper";
import { getPackages, stateInfo, stateDestinations, countryInfo, getStates } from "./service";

// Add default export metadata to specify fallback image
export const metadata = {
  images: {
    fallbackL: '/fallback-cover.webp',
    fallbackS: '/fallback-cover.webp',
  }
};

async function safeRequest(request, fallback = { data: null }) {
  try {
    return await request();
  } catch (error) {
    console.warn("[packages] metadata request failed:", error?.message || error);
    return fallback;
  }
}

const Packages = async ({ params, searchParams }) => {
  const { id } = await params;
  const { 
    state,
    destination,
    tour_type,
    suitable_id,
    sort_by_price,
    price_range_from,
    price_range_to
  } = await searchParams;

  const countryId = Number(id);
  if (!Number.isFinite(countryId) || countryId <= 0) {
    return (
      <ClientWrapper
        packages={[]}
        stateInfo={{}}
        stateDestinations={{ destinations: [] }}
        type="country"
        destinationId={destination}
        countryInfo={null}
        statesData={[]}
        initialFilters={{
          state: state || "",
          tourType: tour_type || "",
          suitableFor: suitable_id || "",
          sortBy: sort_by_price || "",
          price_range_from: price_range_from || "",
          price_range_to: price_range_to || ""
        }}
        fallbackImage={metadata.images}
      />
    );
  }

  const packages = await safeRequest(
    () =>
      getPackages({
        country_id: countryId,
        state_id: state,
        destination_id: destination,
        tour_type,
        suitable_id,
        sort_by_price,
        price_range_from,
        price_range_to
      }),
    { data: [] }
  );

  const countryInfoData = await safeRequest(
    () => countryInfo(countryId),
    { data: null }
  );

  let stateDestinationsData = { data: { destinations: [] } };
  let stateInfoData = { data: {} };

  if (state) {
    stateInfoData = await safeRequest(() => stateInfo(state), { data: {} });
    stateDestinationsData = await safeRequest(() => stateDestinations(state), {
      data: { destinations: [] },
    });
  }

  const statesData = await safeRequest(() => getStates(countryId), { data: [] });

  const type = destination ? "destination" : state ? "state" : "country";
  
  return (
    <ClientWrapper 
      packages={packages.data || []} 
      stateInfo={stateInfoData.data || {}} 
      stateDestinations={stateDestinationsData.data || { destinations: [] }} 
      type={type}
      destinationId={destination}
      countryInfo={countryInfoData.data}
      statesData={statesData.data || []}
      initialFilters={{
        state: state || "",
        tourType: tour_type || "",
        suitableFor: suitable_id || "",
        sortBy: sort_by_price || "",
        price_range_from: price_range_from || "",
        price_range_to: price_range_to || ""
      }}
      fallbackImage={metadata.images}
    />
  );
};

export default Packages;
