import { useQuery } from "@tanstack/react-query";
import { getPackageRate, getSupplierInfo } from "./service";

export const usePackageRate = (
  id,
  package_stay_category_id,
  selected_date,
  setIsLoading
) => {
  return useQuery({
    queryKey: ["package-rate", id, package_stay_category_id, selected_date],
    queryFn: () => {
      return getPackageRate(id, package_stay_category_id, selected_date);
    },
    onSuccess: () => {},
    onError: () => {},
    enabled: !!id && !!package_stay_category_id && !!selected_date,
  });
};


export const useSupplierInfo = (id) => {
  return useQuery({
    queryKey: ["supplier-info", id],
    queryFn: () => {
      return getSupplierInfo(id);
    },
  });
};