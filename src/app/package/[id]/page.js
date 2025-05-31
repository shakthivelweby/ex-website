import { getPackageDetails } from "@/app/services/package/service";
import ClientWrapper from "./clientWrapper";
export default async function PackageDetailPage({ params }) {
  const { id } = await params;
  const packageData = await getPackageDetails(id);
  return <ClientWrapper packageData={packageData} params={params} />;
}
