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
