import apiServerMiddleware from "@/app/api/serverMiddleware";

export const getPackageDetails = async (id) => {
  const response = await apiServerMiddleware.get(`/package-details/${id}`);
  return response.data;
};
