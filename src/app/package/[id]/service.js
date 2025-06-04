import apiServerMiddleware from "@/app/api/serverMiddleware";
import apiMiddleware from "@/app/api/apiMiddleware";

export const getPackageDetails = async (id) => {
  const response = await apiServerMiddleware.get(`/package-details/${id}`);
  return response.data;
};

// get price from server
export const getPackageRateServer = async (
  id,
  package_stay_category_id,
  selected_date
) => {
  const response = await apiServerMiddleware.get(
    `/package-price?package_id=${id}&package_stay_category_id=${package_stay_category_id}&selected_date=${selected_date}`
  );
  return response.data;
};
// get combinations of package from server
export const getPackageCombinations = async (id, date) => {
  const response = await apiServerMiddleware.get(
    `/package-combinations?package_id=${id}`
  );
  return response.data;
};

// get price from client
export const getPackageRate = async (
  id,
  package_stay_category_id,
  selected_date
) => {
  const response = await apiMiddleware.get(
    `/package-price?package_id=${id}&package_stay_category_id=${package_stay_category_id}&selected_date=${selected_date}`
  );
  return response.data;
};
