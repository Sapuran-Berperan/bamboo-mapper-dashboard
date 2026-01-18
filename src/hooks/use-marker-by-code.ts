import { useQuery } from "@tanstack/react-query";
import { getMarkerByCode } from "@/api/markers";

export const MARKER_BY_CODE_QUERY_KEY = (code: string | undefined) => [
	"marker",
	"code",
	code,
] as const;

export function useMarkerByCode(shortCode: string | undefined) {
	return useQuery({
		queryKey: MARKER_BY_CODE_QUERY_KEY(shortCode),
		queryFn: () => getMarkerByCode(shortCode as string),
		enabled: !!shortCode,
		retry: false, // Invalid codes should fail fast (404)
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
}
