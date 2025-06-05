import {
  getPackageDetails,
  getPackageRateServer,
  getPackageCombinations,
} from "./service";
import ClientWrapper from "./clientWrapper";
export default async function PackageDetailPage({ params, searchParams }) {
  const { id } = await params;
  const { date } = await searchParams;
  const packageData = await getPackageDetails(id);
  const packageStayCategory = packageData.data.package_stay_categories[0];
  const packageCombinations = await getPackageCombinations(id, date);



  const packageRate = await getPackageRateServer(
    id,
    packageStayCategory.id,
    date
  );



  return (
    <ClientWrapper
      packageData={packageData}
      date={date}
      packagePriceData={packageRate.data}
      packageStayCategory={packageStayCategory}
      packageCombinations={packageCombinations}
    />
  );
}
