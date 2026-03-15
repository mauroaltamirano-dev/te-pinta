import { useQuery } from "@tanstack/react-query";
import { getIngredientsNeeded } from "../../services/api/production.api";

export function useIngredientsNeeded() {
  return useQuery({
    queryKey: ["production", "ingredients-needed"],
    queryFn: getIngredientsNeeded,
  });
}