import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { MarkerDetail } from "@/types/marker";
import type { MarkersSearch } from "@/routes/markers";

function formatDateTime(dateString: string): string {
	const date = new Date(dateString);
	return date.toLocaleString("id-ID", {
		day: "numeric",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		timeZone: "Asia/Jakarta",
	});
}

function truncateText(text: string, maxLength: number): string {
	if (!text) return "-";
	if (text.length <= maxLength) return text;
	return `${text.slice(0, maxLength)}...`;
}

type SortableColumn = NonNullable<MarkersSearch["sort_by"]>;

interface SortableHeaderProps {
	label: string;
	column: SortableColumn;
	currentSort: SortableColumn | undefined;
	sortDir: MarkersSearch["sort_dir"];
	onSort: (column: SortableColumn) => void;
}

function SortableHeader({
	label,
	column,
	currentSort,
	sortDir,
	onSort,
}: SortableHeaderProps) {
	const isActive = currentSort === column;

	return (
		<Button
			variant="ghost"
			size="sm"
			className="-ml-3 h-8 data-[state=open]:bg-accent"
			onClick={() => onSort(column)}
		>
			{label}
			{isActive ? (
				sortDir === "asc" ? (
					<ArrowUp className="ml-1 h-3 w-3" />
				) : (
					<ArrowDown className="ml-1 h-3 w-3" />
				)
			) : (
				<ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />
			)}
		</Button>
	);
}

interface MarkersTableProps {
	data: MarkerDetail[];
	sortBy: MarkersSearch["sort_by"];
	sortDir: MarkersSearch["sort_dir"];
	onSort: (column: SortableColumn) => void;
}

export function MarkersTable({
	data,
	sortBy,
	sortDir,
	onSort,
}: MarkersTableProps) {
	const columns: ColumnDef<MarkerDetail>[] = [
		{
			accessorKey: "short_code",
			header: "Kode",
			cell: ({ row }) => (
				<span className="font-mono text-sm">{row.getValue("short_code")}</span>
			),
		},
		{
			accessorKey: "name",
			header: () => (
				<SortableHeader
					label="Nama"
					column="name"
					currentSort={sortBy}
					sortDir={sortDir}
					onSort={onSort}
				/>
			),
		},
		{
			accessorKey: "description",
			header: "Deskripsi",
			cell: ({ row }) => (
				<span title={row.getValue("description")}>
					{truncateText(row.getValue("description"), 30)}
				</span>
			),
		},
		{
			accessorKey: "strain",
			header: () => (
				<SortableHeader
					label="Jenis Bambu"
					column="strain"
					currentSort={sortBy}
					sortDir={sortDir}
					onSort={onSort}
				/>
			),
			cell: ({ row }) => row.getValue("strain") || "-",
		},
		{
			accessorKey: "quantity",
			header: () => (
				<SortableHeader
					label="Jumlah"
					column="quantity"
					currentSort={sortBy}
					sortDir={sortDir}
					onSort={onSort}
				/>
			),
			cell: ({ row }) => {
				const quantity = row.getValue("quantity") as number;
				return quantity ?? "-";
			},
		},
		{
			id: "coordinates",
			header: "Koordinat",
			cell: ({ row }) => {
				const lat = row.original.latitude;
				const lng = row.original.longitude;
				return (
					<span className="font-mono text-xs">
						{lat}, {lng}
					</span>
				);
			},
		},
		{
			accessorKey: "owner_name",
			header: "Pemilik",
			cell: ({ row }) => row.getValue("owner_name") || "-",
		},
		{
			accessorKey: "owner_contact",
			header: "Kontak",
			cell: ({ row }) => row.getValue("owner_contact") || "-",
		},
		{
			accessorKey: "created_at",
			header: () => (
				<SortableHeader
					label="Dibuat"
					column="created_at"
					currentSort={sortBy}
					sortDir={sortDir}
					onSort={onSort}
				/>
			),
			cell: ({ row }) => formatDateTime(row.getValue("created_at")),
		},
		{
			accessorKey: "updated_at",
			header: () => (
				<SortableHeader
					label="Diperbarui"
					column="updated_at"
					currentSort={sortBy}
					sortDir={sortDir}
					onSort={onSort}
				/>
			),
			cell: ({ row }) => formatDateTime(row.getValue("updated_at")),
		},
	];

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		manualPagination: true,
		manualSorting: true,
	});

	return (
		<div className="rounded-md border">
			<Table>
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map((header) => (
								<TableHead key={header.id}>
									{header.isPlaceholder
										? null
										: flexRender(
												header.column.columnDef.header,
												header.getContext(),
											)}
								</TableHead>
							))}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{table.getRowModel().rows?.length ? (
						table.getRowModel().rows.map((row) => (
							<TableRow key={row.id}>
								{row.getVisibleCells().map((cell) => (
									<TableCell key={cell.id}>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCell>
								))}
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={columns.length} className="h-24 text-center">
								Tidak ada data marker.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
}
