import ClientWrapper from "./clientWrapper";
import { getPackages, stateInfo, stateDestinations,  } from "./service";

const Packages = async ({ params, searchParams }) => {
  const { id } = await params;
  const { 
    destination,
    tour_type,
    suitable_id,
    sort_by_price,
    price_range_from,
    price_range_to
  } = await searchParams;

  const isDestination = destination ? true : false;

  const packages = await getPackages(id, destination, {
    tour_type,
    suitable_id,
    sort_by_price,
    price_range_from,
    price_range_to
  });
  const stateInfoData = await stateInfo(id);
  const stateDestinationsData = await stateDestinations(id);

  
  return (
    <ClientWrapper 
      packages={packages.data} 
      stateInfo={stateInfoData.data} 
      stateDestinations={stateDestinationsData.data} 
      isDestination={isDestination} 
      destinationId={destination}
      initialFilters={{
        tourType: tour_type || "",
        suitableFor: suitable_id || "",
        sortBy: sort_by_price || "",
        destination: destination || "",
        price_range_from: price_range_from || "",
        price_range_to: price_range_to || ""
      }}
    />
  );
};

export default Packages;