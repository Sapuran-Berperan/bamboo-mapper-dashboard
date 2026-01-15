import type { Marker as LeafletMarker } from "leaflet";
import { Icon, type LeafletMouseEvent } from "leaflet";
import markerIconUrl from "leaflet/dist/images/marker-icon.png";
import markerIconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import markerShadowUrl from "leaflet/dist/images/marker-shadow.png";
import { useEffect, useId, useMemo, useRef } from "react";
import {
	MapContainer,
	Marker,
	TileLayer,
	useMap,
	useMapEvents,
} from "react-leaflet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const defaultIcon = new Icon({
	iconUrl: markerIconUrl,
	iconRetinaUrl: markerIconRetinaUrl,
	shadowUrl: markerShadowUrl,
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41],
});

const DEFAULT_CENTER: [number, number] = [
	-7.434757155465858, 109.99181955541324,
];
const DEFAULT_ZOOM = 13;

interface LocationPickerProps {
	latitude: string;
	longitude: string;
	onLatitudeChange: (value: string) => void;
	onLongitudeChange: (value: string) => void;
	error?: {
		latitude?: string;
		longitude?: string;
	};
}

// Component to handle map click events
function MapClickHandler({
	onLocationSelect,
}: {
	onLocationSelect: (lat: number, lng: number) => void;
}) {
	useMapEvents({
		click(e: LeafletMouseEvent) {
			onLocationSelect(e.latlng.lat, e.latlng.lng);
		},
	});
	return null;
}

// Component to recenter map when coordinates change from manual input
function MapCenterUpdater({
	latitude,
	longitude,
}: {
	latitude: number;
	longitude: number;
}) {
	const map = useMap();

	useEffect(() => {
		if (!Number.isNaN(latitude) && !Number.isNaN(longitude)) {
			map.setView([latitude, longitude], map.getZoom());
		}
	}, [map, latitude, longitude]);

	return null;
}

// Draggable marker component
function DraggableMarker({
	position,
	onDragEnd,
}: {
	position: [number, number];
	onDragEnd: (lat: number, lng: number) => void;
}) {
	const markerRef = useRef<LeafletMarker>(null);

	const eventHandlers = useMemo(
		() => ({
			dragend() {
				const marker = markerRef.current;
				if (marker) {
					const latlng = marker.getLatLng();
					onDragEnd(latlng.lat, latlng.lng);
				}
			},
		}),
		[onDragEnd],
	);

	return (
		<Marker
			draggable
			eventHandlers={eventHandlers}
			position={position}
			ref={markerRef}
			icon={defaultIcon}
		/>
	);
}

export function LocationPicker({
	latitude,
	longitude,
	onLatitudeChange,
	onLongitudeChange,
	error,
}: LocationPickerProps) {
	const formId = useId();
	const latitudeId = `${formId}-latitude`;
	const longitudeId = `${formId}-longitude`;

	const lat = Number.parseFloat(latitude) || DEFAULT_CENTER[0];
	const lng = Number.parseFloat(longitude) || DEFAULT_CENTER[1];
	const hasValidPosition =
		latitude !== "" &&
		longitude !== "" &&
		!Number.isNaN(Number.parseFloat(latitude)) &&
		!Number.isNaN(Number.parseFloat(longitude));

	const handleLocationSelect = (newLat: number, newLng: number) => {
		onLatitudeChange(newLat.toFixed(6));
		onLongitudeChange(newLng.toFixed(6));
	};

	return (
		<div className="space-y-3">
			<div>
				<Label className="text-sm font-medium">
					Lokasi Marker <span className="text-destructive">*</span>
				</Label>
				<p className="text-xs text-muted-foreground mt-0.5">
					Klik pada peta atau masukkan koordinat manual
				</p>
			</div>

			{/* Map Container */}
			<div className="h-[250px] w-full rounded-md border overflow-hidden">
				<MapContainer
					center={hasValidPosition ? [lat, lng] : DEFAULT_CENTER}
					zoom={DEFAULT_ZOOM}
					style={{ height: "100%", width: "100%" }}
				>
					<TileLayer
						attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
						url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
					/>
					<MapClickHandler onLocationSelect={handleLocationSelect} />
					{hasValidPosition && (
						<>
							<MapCenterUpdater latitude={lat} longitude={lng} />
							<DraggableMarker
								position={[lat, lng]}
								onDragEnd={handleLocationSelect}
							/>
						</>
					)}
				</MapContainer>
			</div>

			{/* Manual Coordinate Inputs */}
			<div className="grid grid-cols-2 gap-3">
				<div className="space-y-1.5">
					<Label htmlFor={latitudeId} className="text-sm">
						Latitude
					</Label>
					<Input
						id={latitudeId}
						type="text"
						inputMode="decimal"
						placeholder="-7.434757"
						value={latitude}
						onChange={(e) => onLatitudeChange(e.target.value)}
						className={error?.latitude ? "border-destructive" : ""}
					/>
					{error?.latitude && (
						<p className="text-xs text-destructive">{error.latitude}</p>
					)}
				</div>
				<div className="space-y-1.5">
					<Label htmlFor={longitudeId} className="text-sm">
						Longitude
					</Label>
					<Input
						id={longitudeId}
						type="text"
						inputMode="decimal"
						placeholder="109.991819"
						value={longitude}
						onChange={(e) => onLongitudeChange(e.target.value)}
						className={error?.longitude ? "border-destructive" : ""}
					/>
					{error?.longitude && (
						<p className="text-xs text-destructive">{error.longitude}</p>
					)}
				</div>
			</div>
		</div>
	);
}
