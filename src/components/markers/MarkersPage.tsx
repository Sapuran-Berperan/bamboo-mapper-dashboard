import { AlertCircle, Loader2, Table2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { usePaginatedMarkers } from "@/hooks/use-paginated-markers";
import { MarkersPagination } from "./MarkersPagination";
import { MarkersTable } from "./MarkersTable";

export function MarkersPage() {
	const [page, setPage] = useState(1);
	const perPage = 10;

	const { data, isLoading, error, refetch, isFetching } = usePaginatedMarkers({
		page,
		per_page: perPage,
	});

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-[calc(100vh-3.5rem)]">
				<div className="flex flex-col items-center gap-2 text-muted-foreground">
					<Loader2 className="h-8 w-8 animate-spin" />
					<p>Memuat data marker...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center h-[calc(100vh-3.5rem)]">
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
		<main className="p-6">
			<div className="flex items-center gap-2 mb-6">
				<Table2 className="h-5 w-5 text-muted-foreground" />
				<h1 className="text-xl font-semibold">Daftar Marker</h1>
				<span className="text-sm text-muted-foreground">
					({data?.pagination.total_items ?? 0} total)
				</span>
				{isFetching && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
			</div>

			<div className="space-y-4">
				<MarkersTable data={data?.data ?? []} />

				{data?.pagination && (
					<MarkersPagination
						currentPage={data.pagination.current_page}
						totalPages={data.pagination.total_pages}
						onPageChange={setPage}
					/>
				)}
			</div>
		</main>
	);
}
