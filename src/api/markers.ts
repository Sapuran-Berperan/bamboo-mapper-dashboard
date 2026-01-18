import {
	apiClient,
	binaryApiClient,
	multipartApiClient,
	paginatedApiClient,
	publicApiClient,
} from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import type {
	CreateMarkerPayload,
	Marker,
	MarkerDetail,
	PaginatedMarkersParams,
	PaginatedMarkersResponse,
	UpdateMarkerPayload,
} from "@/types/marker";

export async function getMarkers(): Promise<Marker[]> {
	const accessToken = useAuthStore.getState().accessToken;

	return apiClient<Marker[]>("/markers/", {
		method: "GET",
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});
}

export async function getPaginatedMarkers(
	params: PaginatedMarkersParams = {},
): Promise<PaginatedMarkersResponse> {
	const accessToken = useAuthStore.getState().accessToken;

	const searchParams = new URLSearchParams();

	if (params.page !== undefined) {
		searchParams.set("page", String(params.page));
	}
	if (params.per_page !== undefined) {
		searchParams.set("per_page", String(params.per_page));
	}
	if (params.sort_by) {
		searchParams.set("sort_by", params.sort_by);
	}
	if (params.sort_dir) {
		searchParams.set("sort_dir", params.sort_dir);
	}
	if (params.search) {
		searchParams.set("search", params.search);
	}
	if (params.date_from) {
		searchParams.set("date_from", params.date_from);
	}
	if (params.date_to) {
		searchParams.set("date_to", params.date_to);
	}
	if (params.creator_id) {
		searchParams.set("creator_id", params.creator_id);
	}

	const queryString = searchParams.toString();
	const endpoint = `/markers/paginated${queryString ? `?${queryString}` : ""}`;

	const response = await paginatedApiClient<MarkerDetail[]>(endpoint, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

	return {
		data: response.data,
		pagination: response.pagination,
	};
}

export async function createMarker(
	data: CreateMarkerPayload,
	image?: File,
): Promise<MarkerDetail> {
	const accessToken = useAuthStore.getState().accessToken;
	const formData = new FormData();

	// Append required fields
	formData.append("name", data.name);
	formData.append("latitude", data.latitude);
	formData.append("longitude", data.longitude);

	// Append optional fields only if they have values
	if (data.description) formData.append("description", data.description);
	if (data.strain) formData.append("strain", data.strain);
	if (data.quantity !== undefined)
		formData.append("quantity", String(data.quantity));
	if (data.owner_name) formData.append("owner_name", data.owner_name);
	if (data.owner_contact) formData.append("owner_contact", data.owner_contact);
	if (image) formData.append("image", image);

	return multipartApiClient<MarkerDetail>("/markers/", formData, {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});
}

export async function updateMarker(
	id: string,
	data: UpdateMarkerPayload,
	image?: File,
): Promise<MarkerDetail> {
	const accessToken = useAuthStore.getState().accessToken;
	const formData = new FormData();

	// Append required fields
	formData.append("name", data.name);
	formData.append("latitude", data.latitude);
	formData.append("longitude", data.longitude);

	// Append optional fields only if they have values
	if (data.description) formData.append("description", data.description);
	if (data.strain) formData.append("strain", data.strain);
	if (data.quantity !== undefined)
		formData.append("quantity", String(data.quantity));
	if (data.owner_name) formData.append("owner_name", data.owner_name);
	if (data.owner_contact) formData.append("owner_contact", data.owner_contact);
	if (image) formData.append("image", image);

	return multipartApiClient<MarkerDetail>(`/markers/${id}`, formData, {
		method: "PUT",
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});
}

export async function deleteMarker(id: string): Promise<void> {
	const accessToken = useAuthStore.getState().accessToken;

	return apiClient(`/markers/${id}`, {
		method: "DELETE",
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});
}

export async function getMarkerQRCode(id: string): Promise<Blob> {
	const accessToken = useAuthStore.getState().accessToken;

	return binaryApiClient(`/markers/${id}/qr`, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});
}

/**
 * Fetch marker details by short code (public endpoint, no auth required).
 * Used for QR code deeplinks.
 */
export async function getMarkerByCode(shortCode: string): Promise<MarkerDetail> {
	return publicApiClient<MarkerDetail>(`/markers/code/${shortCode}`, {
		method: "GET",
	});
}
