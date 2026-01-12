import { Icon } from "leaflet";
// Fix for default marker icon in Leaflet with bundlers
import markerIconUrl from "leaflet/dist/images/marker-icon.png";
import markerIconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import markerShadowUrl from "leaflet/dist/images/marker-shadow.png";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import type { ParsedMarker } from "@/types/marker";

const defaultIcon = new Icon({
	iconUrl: markerIconUrl,
	iconRetinaUrl: markerIconRetinaUrl,
	shadowUrl: markerShadowUrl,
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41],
});

interface BambooMapProps {
	markers: ParsedMarker[];
	className?: string;
}

const DEFAULT_CENTER: [number, number] = [-7.434757155465858, 109.99181955541324];
const DEFAULT_ZOOM = 13;

export function BambooMap({ markers, className }: BambooMapProps) {
	const center: [number, number] =
		markers.length > 0
			? [markers[0].latitude, markers[0].longitude]
			: DEFAULT_CENTER;

	return (
		<MapContainer
			center={center}
			zoom={DEFAULT_ZOOM}
			className={className}
			style={{ height: "100%", width: "100%" }}
		>
			<TileLayer
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
			/>
			{markers.map((marker) => (
				<Marker
					key={marker.id}
					position={[marker.latitude, marker.longitude]}
					icon={defaultIcon}
				>
					<Popup>
						<div className="min-w-[150px]">
							<h3 className="font-semibold text-sm">{marker.name}</h3>
							<p className="text-xs text-muted-foreground mt-1">
								Kode: {marker.short_code}
							</p>
						</div>
					</Popup>
				</Marker>
			))}
		</MapContainer>
	);
}
