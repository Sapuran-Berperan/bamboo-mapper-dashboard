import { createFileRoute } from "@tanstack/react-router";
import { AlertCircle, Loader2, MapPin } from "lucide-react";
import { BambooMap } from "@/components/BambooMap";
import { Button } from "@/components/ui/button";
import { useMarkers } from "@/hooks/use-markers";

export const Route = createFileRoute("/")({
	component: HomePage,
});

function HomePage() {
	const { data: markers, isLoading, error, refetch } = useMarkers();

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-[calc(100vh-72px)]">
				<div className="flex flex-col items-center gap-2 text-muted-foreground">
					<Loader2 className="h-8 w-8 animate-spin" />
					<p>Memuat data marker...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center h-[calc(100vh-72px)]">
				<div className="flex flex-col items-center gap-3 text-destructive max-w-md text-center">
					<AlertCircle className="h-10 w-10" />
					<p className="font-medium">Gagal memuat data marker</p>
					<p className="text-sm text-muted-foreground">
						{error instanceof Error ? error.message : "Terjadi kesalahan"}
					</p>
					<Button onClick={() => refetch()} className="mt-2">
						Coba Lagi
					</Button>
				</div>
			</div>
		);
	}

	return (
		<main className="h-[calc(100vh-72px)] flex flex-col">
			<div className="px-4 py-3 bg-muted/50 border-b flex items-center gap-2">
				<MapPin className="h-4 w-4 text-muted-foreground" />
				<span className="text-sm text-muted-foreground">
					{markers?.length ?? 0} lokasi bambu terpetakan
				</span>
			</div>

			<div className="flex-1">
				<BambooMap markers={markers ?? []} />
			</div>
		</main>
	);
}
