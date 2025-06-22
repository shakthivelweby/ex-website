

import ClientWrapper from "./clientWrapper";
import { getPackages, stateInfo, stateDestinations } from "./service";

const Packages = async ({ params, searchParams }) => {
  const { id } = await params;
  const { destination } = await searchParams;
  const isDestination = destination ? true : false;
  // console.log(destination)


  const packages = await getPackages(id, destination);
  const stateInfoData = await stateInfo(id);
  const stateDestinationsData = await stateDestinations(id);
  return (
    <ClientWrapper packages={packages.data} stateInfo={stateInfoData.data} stateDestinations={stateDestinationsData.data} isDestination={isDestination} destinationId={destination} />
  );
  
};

export default Packages;