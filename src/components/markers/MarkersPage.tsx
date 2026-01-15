import { useNavigate } from "@tanstack/react-router";
import { AlertCircle, Loader2, Table2 } from "lucide-react";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { usePaginatedMarkers } from "@/hooks/use-paginated-markers";
import { type MarkersSearch, Route } from "@/routes/markers";
import { MarkersFilters } from "./MarkersFilters";
import { MarkersPagination } from "./MarkersPagination";
import { MarkersTable } from "./MarkersTable";

export function MarkersPage() {
	const search = Route.useSearch();
	const navigate = useNavigate({ from: Route.fullPath });

	const {
		page,
		per_page,
		sort_by,
		sort_dir,
		search: searchQuery,
		date_from,
		date_to,
		creator_id,
	} = search;

	const { data, isLoading, error, refetch, isFetching } = usePaginatedMarkers({
		page: page ?? 1,
		per_page: per_page ?? 10,
		sort_by,
		sort_dir,
		search: searchQuery,
		date_from,
		date_to,
		creator_id,
	});

	const updateFilters = useCallback(
		(updates: Partial<MarkersSearch>) => {
			navigate({
				search: (prev) => {
					const newSearch = { ...prev, ...updates };
					// Reset to page 1 when filters change (except page itself)
					if (!("page" in updates)) {
						newSearch.page = 1;
					}
					return newSearch;
				},
			});
		},
		[navigate],
	);

	const handleSort = useCallback(
		(column: MarkersSearch["sort_by"]) => {
			const newDir: MarkersSearch["sort_dir"] =
				sort_by === column && sort_dir === "desc" ? "asc" : "desc";
			updateFilters({ sort_by: column, sort_dir: newDir });
		},
		[sort_by, sort_dir, updateFilters],
	);

	const handlePageChange = useCallback(
		(newPage: number) => {
			updateFilters({ page: newPage });
		},
		[updateFilters],
	);

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

			<MarkersFilters
				search={searchQuery}
				sortBy={sort_by}
				sortDir={sort_dir}
				dateFrom={date_from}
				dateTo={date_to}
				creatorId={creator_id}
				onFilterChange={updateFilters}
			/>

			<div className="space-y-4">
				<MarkersTable
					data={data?.data ?? []}
					sortBy={sort_by}
					sortDir={sort_dir}
					onSort={handleSort}
				/>

				{data?.pagination && (
					<MarkersPagination
						currentPage={data.pagination.current_page}
						totalPages={data.pagination.total_pages}
						onPageChange={handlePageChange}
					/>
				)}
			</div>
		</main>
	);
}
