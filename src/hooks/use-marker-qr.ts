import { useQuery } from "@tanstack/react-query";
import { getMarkerQRCode } from "@/api/markers";

export function useMarkerQR(markerId: string | null) {
	return useQuery({
		queryKey: ["marker-qr", markerId],
		queryFn: () => getMarkerQRCode(markerId as string),
		enabled: !!markerId,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
}
