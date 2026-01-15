import {
	useReactTable,
	getCoreRowModel,
	flexRender,
	type ColumnDef,
} from "@tanstack/react-table";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { MarkerDetail } from "@/types/marker";

function formatDate(dateString: string): string {
	const date = new Date(dateString);
	return date.toLocaleDateString("id-ID", {
		day: "numeric",
		month: "short",
		year: "numeric",
	});
}

function truncateText(text: string, maxLength: number): string {
	if (!text) return "-";
	if (text.length <= maxLength) return text;
	return `${text.slice(0, maxLength)}...`;
}

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
		header: "Nama",
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
		header: "Jenis Bambu",
		cell: ({ row }) => row.getValue("strain") || "-",
	},
	{
		accessorKey: "quantity",
		header: "Jumlah",
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
		header: "Dibuat",
		cell: ({ row }) => formatDate(row.getValue("created_at")),
	},
	{
		accessorKey: "updated_at",
		header: "Diperbarui",
		cell: ({ row }) => formatDate(row.getValue("updated_at")),
	},
];

interface MarkersTableProps {
	data: MarkerDetail[];
}

export function MarkersTable({ data }: MarkersTableProps) {
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		manualPagination: true,
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
