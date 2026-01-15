export interface Marker {
	id: string;
	short_code: string;
	name: string;
	latitude: string;
	longitude: string;
}

export interface ParsedMarker extends Omit<Marker, "latitude" | "longitude"> {
	latitude: number;
	longitude: number;
}

export interface MarkerDetail {
	id: string;
	short_code: string;
	creator_id: string;
	name: string;
	description: string;
	strain: string;
	quantity: number;
	latitude: string;
	longitude: string;
	image_url: string;
	owner_name: string;
	owner_contact: string;
	created_at: string;
	updated_at: string;
}

export interface PaginationMeta {
	current_page: number;
	per_page: number;
	total_items: number;
	total_pages: number;
}

export interface PaginatedMarkersParams {
	page?: number;
	per_page?: number;
	sort_by?: "name" | "created_at" | "updated_at" | "strain" | "quantity";
	sort_dir?: "asc" | "desc";
	search?: string;
	date_from?: string;
	date_to?: string;
	creator_id?: string;
}

export interface PaginatedMarkersResponse {
	data: MarkerDetail[];
	pagination: PaginationMeta;
}

export interface CreateMarkerPayload {
	name: string;
	latitude: string;
	longitude: string;
	description?: string;
	strain?: string;
	quantity?: number;
	owner_name?: string;
	owner_contact?: string;
}
