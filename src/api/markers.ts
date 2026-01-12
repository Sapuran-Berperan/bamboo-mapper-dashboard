import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import type { Marker } from "@/types/marker";

export async function getMarkers(): Promise<Marker[]> {
	const accessToken = useAuthStore.getState().accessToken;

	return apiClient<Marker[]>("/markers/", {
		method: "GET",
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});
}
