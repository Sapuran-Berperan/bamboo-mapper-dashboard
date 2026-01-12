import { useQuery } from "@tanstack/react-query";
import { getMarkers } from "@/api/markers";
import type { Marker, ParsedMarker } from "@/types/marker";

export const MARKERS_QUERY_KEY = ["markers"] as const;

function parseMarker(marker: Marker): ParsedMarker {
	return {
		...marker,
		latitude: Number.parseFloat(marker.latitude),
		longitude: Number.parseFloat(marker.longitude),
	};
}

export function useMarkers() {
	return useQuery({
		queryKey: MARKERS_QUERY_KEY,
		queryFn: getMarkers,
		select: (data) => data.map(parseMarker),
	});
}
