import { useQuery } from "@tanstack/react-query";
import { getDestinations } from "./service";

export const useDestinations = () => {
    return useQuery({
        queryKey: ["destinations"],
        queryFn: () => getDestinations(),
    });
};