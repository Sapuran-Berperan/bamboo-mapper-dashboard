import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { type ReactNode, useState } from "react";
import toast from "react-hot-toast";
import { BambooMap } from "@/components/BambooMap";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeleteMarker } from "@/hooks/use-delete-marker";
import { useMarkerByCode } from "@/hooks/use-marker-by-code";
import type { ApiError } from "@/lib/api-client";
import { Route } from "@/routes/marker/$shortCode";
import { useAuthStore } from "@/stores/auth-store";
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

function getGoogleDriveImageUrl(url: string, size: number): string {
	return `${url.replace("/uc?id=", "/thumbnail?id=")}&sz=w${size}`;
}

interface DetailItemProps {
	label: string;
	value: ReactNode;
	fullWidth?: boolean;
}

function DetailItem({ label, value, fullWidth = false }: DetailItemProps) {
	return (
		<div className={fullWidth ? "col-span-full" : ""}>
			<dt className="text-sm font-medium text-muted-foreground mb-1">
				{label}
			</dt>
			<dd className="text-base">{value || "-"}</dd>
		</div>
	);
}

export function MarkerDetailPage() {
	const { shortCode } = Route.useParams();
	const { isAuthenticated } = useAuthStore();
	const navigate = useNavigate();

	const {
		data: marker,
		isLoading,
		error,
		refetch,
	} = useMarkerByCode(shortCode);

	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	const deleteMutation = useDeleteMarker();

	const handleDelete = async () => {
		if (!marker) return;

		try {
			await deleteMutation.mutateAsync(marker.id);
			toast.success("Marker berhasil dihapus");
			navigate({ to: "/markers" });
		} catch (err) {
			toast.error((err as ApiError).message || "Gagal menghapus marker");
		}
	};

	// Loading state
	if (isLoading) {
		return (
			<div className="container mx-auto p-4 max-w-4xl space-y-4">
				<Skeleton className="h-10 w-24" />
				<Skeleton className="h-32 w-full" />
				<Skeleton className="h-64 w-full" />
				<Skeleton className="h-48 w-full" />
				<Skeleton className="h-64 w-full" />
			</div>
		);
	}

	// Error states
	if (error) {
		const apiError = error as ApiError;

		if (apiError.status === 404) {
			return (
				<div className="container mx-auto p-4 max-w-4xl">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => navigate({ to: "/" })}
						className="mb-4"
					>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Kembali
					</Button>
					<Card>
						<CardContent className="text-center py-12">
							<h2 className="text-xl font-semibold mb-2">
								Marker tidak ditemukan
							</h2>
							<p className="text-muted-foreground mb-4">
								Kode marker "{shortCode}" tidak valid atau telah dihapus.
							</p>
							<Button onClick={() => navigate({ to: "/" })}>
								Kembali ke Beranda
							</Button>
						</CardContent>
					</Card>
				</div>
			);
		}

		return (
			<div className="container mx-auto p-4 max-w-4xl">
				<Button
					variant="ghost"
					size="sm"
					onClick={() => navigate({ to: "/" })}
					className="mb-4"
				>
					<ArrowLeft className="h-4 w-4 mr-2" />
					Kembali
				</Button>
				<Card>
					<CardContent className="text-center py-12">
						<p className="text-destructive mb-4">
							{apiError.message || "Gagal memuat data marker"}
						</p>
						<Button variant="outline" onClick={() => refetch()}>
							Coba Lagi
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Success state
	if (!marker) {
		return null;
	}

	return (
		<div className="container mx-auto p-4 max-w-4xl">
			{/* Header Card */}
			<Card className="mb-4">
				<CardHeader>
					<div className="flex flex-col sm:flex-row justify-between items-start gap-4">
						<div>
							<CardTitle className="text-2xl mb-2">{marker.name}</CardTitle>
							<Badge variant="secondary" className="font-mono">
								{marker.short_code}
							</Badge>
						</div>
						<div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
							{!isAuthenticated ? (
								<Button
									variant="outline"
									onClick={() => {
										sessionStorage.setItem(
											"redirectAfterLogin",
											window.location.href,
										);
										navigate({ to: "/login" });
									}}
								>
									Login untuk Edit
								</Button>
							) : (
								<>
									<Button
										variant="outline"
										onClick={() => setIsEditDialogOpen(true)}
									>
										<Pencil className="h-4 w-4 mr-2" />
										Edit
									</Button>
									<Button
										variant="destructive"
										onClick={() => setIsDeleteDialogOpen(true)}
									>
										<Trash2 className="h-4 w-4 mr-2" />
										Hapus
									</Button>
								</>
							)}
						</div>
					</div>
				</CardHeader>
			</Card>

			{/* Image Section */}
			{marker.image_url && (
				<Card className="mb-4">
					<CardContent className="p-4">
						<img
							src={getGoogleDriveImageUrl(marker.image_url, 800)}
							alt={marker.name}
							className="w-full max-w-full h-auto rounded-lg"
							referrerPolicy="no-referrer"
						/>
					</CardContent>
				</Card>
			)}

			{/* Details Grid */}
			<Card className="mb-4">
				<CardHeader>
					<CardTitle className="text-lg">Detail Marker</CardTitle>
				</CardHeader>
				<CardContent>
					<dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<DetailItem
							label="Deskripsi"
							value={marker.description}
							fullWidth
						/>
						<DetailItem label="Jenis Bambu" value={marker.strain} />
						<DetailItem label="Jumlah" value={marker.quantity} />
						<DetailItem label="Pemilik" value={marker.owner_name} />
						<DetailItem label="Kontak Pemilik" value={marker.owner_contact} />
						<DetailItem
							label="Koordinat"
							value={
								<span className="font-mono text-sm">
									{marker.latitude}, {marker.longitude}
								</span>
							}
							fullWidth
						/>
					</dl>
				</CardContent>
			</Card>

			{/* Map Section */}
			<Card className="mb-4">
				<CardHeader>
					<CardTitle className="text-lg">Lokasi</CardTitle>
				</CardHeader>
				<CardContent className="p-4">
					<div className="h-75 rounded-lg overflow-hidden border">
						<BambooMap
							markers={[
								{
									...marker,
									latitude: Number.parseFloat(marker.latitude),
									longitude: Number.parseFloat(marker.longitude),
								},
							]}
						/>
					</div>
				</CardContent>
			</Card>

			{/* Timestamps */}
			<Card>
				<CardContent className="p-4">
					<div className="flex flex-col sm:flex-row gap-4 text-sm text-muted-foreground">
						<div>
							<span className="font-medium">Dibuat:</span>{" "}
							{formatDateTime(marker.created_at)}
						</div>
						<div>
							<span className="font-medium">Diperbarui:</span>{" "}
							{formatDateTime(marker.updated_at)}
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Edit Dialog */}
			{isAuthenticated && (
				<MarkerFormDialog
					marker={marker}
					open={isEditDialogOpen}
					onOpenChange={setIsEditDialogOpen}
				/>
			)}

			{/* Delete Confirmation Dialog */}
			{isAuthenticated && (
				<AlertDialog
					open={isDeleteDialogOpen}
					onOpenChange={setIsDeleteDialogOpen}
				>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Hapus Marker?</AlertDialogTitle>
							<AlertDialogDescription>
								Apakah Anda yakin ingin menghapus marker "{marker.name}"? Aksi
								ini tidak dapat dibatalkan.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Batal</AlertDialogCancel>
							<AlertDialogAction
								onClick={handleDelete}
								className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							>
								Hapus
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			)}
		</div>
	);
}
