import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useDeleteMarker } from "@/hooks/use-delete-marker";
import { useMarkerQR } from "@/hooks/use-marker-qr";
import type { MarkersSearch } from "@/routes/markers";
import type { MarkerDetail } from "@/types/marker";
import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import {
	ArrowDown,
	ArrowUp,
	ArrowUpDown,
	ImageIcon,
	Pencil,
	QrCode,
	Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { MarkerFormDialog } from "./MarkerFormDialog";

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

function getGoogleDriveImageUrl(url: string, size: number): string {
	// Convert uc?id= to thumbnail?id= with size param
	// Google Drive blocks direct uc?id= embedding due to CORS
	// The thumbnail endpoint works for embedding
	// From: https://drive.google.com/uc?id=XXX
	// To: https://drive.google.com/thumbnail?id=XXX&sz=wXXX
	return `${url.replace("/uc?id=", "/thumbnail?id=")}&sz=w${size}`;
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
	const [editingMarker, setEditingMarker] = useState<MarkerDetail | null>(null);
	const [deletingMarker, setDeletingMarker] = useState<MarkerDetail | null>(
		null,
	);
	const [previewImage, setPreviewImage] = useState<string | null>(null);
	const [previewingQR, setPreviewingQR] = useState<string | null>(null);

	const {
		data: qrBlob,
		isLoading: isQRLoading,
		error: qrError,
		refetch: refetchQR,
	} = useMarkerQR(previewingQR);

	const deleteMarker = useDeleteMarker({
		onSuccess: () => {
			setDeletingMarker(null);
		},
	});

	// Create blob URL from QR blob data
	const qrBlobUrl = useMemo(() => {
		if (!qrBlob) return null;
		return URL.createObjectURL(qrBlob);
	}, [qrBlob]);

	// Cleanup blob URL when dialog closes or component unmounts
	useEffect(() => {
		return () => {
			if (qrBlobUrl) {
				URL.revokeObjectURL(qrBlobUrl);
			}
		};
	}, [qrBlobUrl]);

	// Get marker being previewed for dialog title and download filename
	const previewingMarker = useMemo(
		() => data.find((m) => m.id === previewingQR),
		[data, previewingQR],
	);

	const handleDownloadQR = () => {
		if (!qrBlobUrl || !previewingMarker) return;

		const a = document.createElement("a");
		a.href = qrBlobUrl;
		a.download = `${previewingMarker.short_code}.png`;
		a.click();
	};

	const columns: ColumnDef<MarkerDetail>[] = [
		{
			accessorKey: "short_code",
			header: "Kode",
			cell: ({ row }) => (
				<span className="font-mono text-sm">{row.getValue("short_code")}</span>
			),
		},
		{
			accessorKey: "image_url",
			header: "Gambar",
			cell: ({ row }) => {
				const imageUrl = row.getValue("image_url") as string;
				if (!imageUrl) {
					return (
						<div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
							<ImageIcon className="h-4 w-4 text-muted-foreground" />
						</div>
					);
				}
				return (
					<button
						type="button"
						onClick={() => setPreviewImage(imageUrl)}
						className="cursor-pointer hover:opacity-80 transition-opacity"
					>
						<img
							src={getGoogleDriveImageUrl(imageUrl, 100)}
							alt={row.original.name}
							className="h-10 w-10 rounded object-cover"
							referrerPolicy="no-referrer"
						/>
					</button>
				);
			},
		},
		{
			id: "qr",
			header: "QR Code",
			cell: ({ row }) => (
				<Button
					variant="ghost"
					size="icon"
					onClick={() => setPreviewingQR(row.original.id)}
					aria-label="Lihat QR Code"
				>
					<QrCode className="h-4 w-4" />
				</Button>
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
		{
			id: "actions",
			header: "Aksi",
			cell: ({ row }) => (
				<div className="flex items-center gap-1">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setEditingMarker(row.original)}
						title="Edit marker"
					>
						<Pencil className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setDeletingMarker(row.original)}
						title="Hapus marker"
					>
						<Trash2 className="h-4 w-4 text-destructive" />
					</Button>
				</div>
			),
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
		<>
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
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									Tidak ada data marker.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{/* Edit Marker Dialog */}
			<MarkerFormDialog
				marker={editingMarker ?? undefined}
				open={!!editingMarker}
				onOpenChange={(open) => {
					if (!open) setEditingMarker(null);
				}}
			/>

			{/* Image Preview Dialog */}
			<Dialog
				open={!!previewImage}
				onOpenChange={(open) => {
					if (!open) setPreviewImage(null);
				}}
			>
				<DialogContent className="max-w-[90vw] max-h-[90vh] p-0">
					<DialogHeader className="p-4 pb-0">
						<DialogTitle>Preview Gambar</DialogTitle>
					</DialogHeader>
					<div className="flex items-center justify-center p-4">
						{previewImage && (
							<img
								src={getGoogleDriveImageUrl(previewImage, 1200)}
								alt="Preview"
								className="max-w-full max-h-[calc(90vh-100px)] object-contain rounded"
								referrerPolicy="no-referrer"
							/>
						)}
					</div>
				</DialogContent>
			</Dialog>

			{/* QR Code Preview Dialog */}
			<Dialog
				open={!!previewingQR}
				onOpenChange={(open) => {
					if (!open) setPreviewingQR(null);
				}}
			>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>
							QR Code - {previewingMarker?.name || "Loading..."}
						</DialogTitle>
					</DialogHeader>
					<div className="flex flex-col items-center justify-center gap-4 py-4">
						{isQRLoading && (
							<div className="flex flex-col items-center gap-2">
								<div className="h-64 w-64 animate-pulse rounded bg-muted" />
								<p className="text-sm text-muted-foreground">
									Memuat QR code...
								</p>
							</div>
						)}
						{qrError && (
							<div className="flex flex-col items-center gap-4">
								<p className="text-sm text-destructive">
									{qrError.message || "Gagal memuat QR code"}
								</p>
								<Button variant="outline" onClick={() => refetchQR()}>
									Coba Lagi
								</Button>
							</div>
						)}
						{qrBlobUrl && !isQRLoading && !qrError && (
							<>
								<img
									src={qrBlobUrl}
									alt={`QR Code ${previewingMarker?.short_code}`}
									className="h-64 w-64 rounded border"
								/>
								<div className="flex w-full gap-2">
									<Button
										variant="outline"
										className="flex-1"
										onClick={() => setPreviewingQR(null)}
									>
										Tutup
									</Button>
									<Button className="flex-1" onClick={handleDownloadQR}>
										Download
									</Button>
								</div>
							</>
						)}
					</div>
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<AlertDialog
				open={!!deletingMarker}
				onOpenChange={(open) => {
					if (!open) setDeletingMarker(null);
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Hapus Marker</AlertDialogTitle>
						<AlertDialogDescription>
							Apakah Anda yakin ingin menghapus marker &quot;
							{deletingMarker?.name}
							&quot;? Tindakan ini tidak dapat dibatalkan.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Batal</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => {
								if (deletingMarker) {
									deleteMarker.mutate(deletingMarker.id);
								}
							}}
							className="bg-destructive text-white hover:bg-destructive/90"
						>
							Hapus
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
