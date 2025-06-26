import ClientWrapper from "./clientWrapper";
import { getPackages, stateInfo, stateDestinations, countryInfo, getStates } from "./service";

// Add default export metadata to specify fallback image
export const metadata = {
  images: {
    fallbackL: '/fallback-cover.webp',
    fallbackS: '/fallback-cover.webp',
  }
};

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

  const packages = await getPackages({
    country_id: id,
    state_id: state,
    destination_id: destination,
    tour_type,
    suitable_id,
    sort_by_price,
    price_range_from,
    price_range_to
  });

  const countryInfoData = await countryInfo(id);

  let stateDestinationsData = { data: { destinations: [] } };
  let statesData = { data: [] };
  let stateInfoData = { data: {} };
  // If we have a state parameter, fetch destinations
  if (state) {
    stateInfoData = await stateInfo(state);
    stateDestinationsData = await stateDestinations(state);
  } else {
    // Only fetch states if we're at country level
  }

  statesData = await getStates(id);

  console.log(statesData)


  // Determine type based on URL parameters
  const type = destination ? "destination" : state ? "state" : "country";
  
  return (
    <ClientWrapper 
      packages={packages.data} 
      stateInfo={stateInfoData.data} 
      stateDestinations={stateDestinationsData.data} 
      type={type}
      destinationId={destination}
      countryInfo={countryInfoData.data}
      statesData={statesData.data}
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