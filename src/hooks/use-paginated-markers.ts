import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getPaginatedMarkers } from "@/api/markers";
import type { PaginatedMarkersParams } from "@/types/marker";

export const PAGINATED_MARKERS_QUERY_KEY = ["markers", "paginated"] as const;

export function usePaginatedMarkers(params: PaginatedMarkersParams = {}) {
	return useQuery({
		queryKey: [...PAGINATED_MARKERS_QUERY_KEY, params],
		queryFn: () => getPaginatedMarkers(params),
		placeholderData: keepPreviousData,
	});
}
