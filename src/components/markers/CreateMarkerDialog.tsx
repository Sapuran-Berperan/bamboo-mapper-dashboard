import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Upload, X } from "lucide-react";
import { useCallback, useId, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateMarker } from "@/hooks/use-create-marker";
import {
	type CreateMarkerFormData,
	createMarkerSchema,
} from "@/lib/validations/marker";
import { LocationPicker } from "./LocationPicker";

export function CreateMarkerDialog() {
	const [open, setOpen] = useState(false);
	const [imagePreview, setImagePreview] = useState<string | null>(null);

	const formId = useId();
	const nameId = `${formId}-name`;
	const descriptionId = `${formId}-description`;
	const strainId = `${formId}-strain`;
	const quantityId = `${formId}-quantity`;
	const ownerNameId = `${formId}-owner_name`;
	const ownerContactId = `${formId}-owner_contact`;
	const imageUploadId = `${formId}-image-upload`;

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		reset,
		formState: { errors },
	} = useForm<CreateMarkerFormData>({
		resolver: zodResolver(createMarkerSchema),
		defaultValues: {
			name: "",
			latitude: "",
			longitude: "",
			description: "",
			strain: "",
			quantity: undefined,
			owner_name: "",
			owner_contact: "",
			image: undefined,
		},
	});

	const latitude = watch("latitude");
	const longitude = watch("longitude");

	const createMarker = useCreateMarker({
		onSuccess: () => {
			setOpen(false);
			reset();
			setImagePreview(null);
		},
	});

	const onSubmit = useCallback(
		(data: CreateMarkerFormData) => {
			const { image, ...payload } = data;
			createMarker.mutate({
				data: {
					...payload,
					quantity: payload.quantity ?? undefined,
				},
				image: image ?? undefined,
			});
		},
		[createMarker],
	);

	const handleImageChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (file) {
				setValue("image", file, { shouldValidate: true });
				const reader = new FileReader();
				reader.onloadend = () => {
					setImagePreview(reader.result as string);
				};
				reader.readAsDataURL(file);
			}
		},
		[setValue],
	);

	const handleRemoveImage = useCallback(() => {
		setValue("image", undefined, { shouldValidate: true });
		setImagePreview(null);
	}, [setValue]);

	const handleOpenChange = useCallback(
		(newOpen: boolean) => {
			setOpen(newOpen);
			if (!newOpen) {
				reset();
				setImagePreview(null);
			}
		},
		[reset],
	);

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button>
					<Plus className="h-4 w-4 mr-2" />
					Tambah Marker
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Tambah Marker Baru</DialogTitle>
					<DialogDescription>
						Masukkan informasi lokasi bambu yang akan dipetakan.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					{/* Name Field */}
					<div className="space-y-1.5">
						<Label htmlFor={nameId}>
							Nama Marker <span className="text-destructive">*</span>
						</Label>
						<Input
							id={nameId}
							placeholder="Masukkan nama marker"
							{...register("name")}
							className={errors.name ? "border-destructive" : ""}
						/>
						{errors.name && (
							<p className="text-xs text-destructive">{errors.name.message}</p>
						)}
					</div>

					{/* Location Picker */}
					<LocationPicker
						latitude={latitude}
						longitude={longitude}
						onLatitudeChange={(value) =>
							setValue("latitude", value, { shouldValidate: true })
						}
						onLongitudeChange={(value) =>
							setValue("longitude", value, { shouldValidate: true })
						}
						error={{
							latitude: errors.latitude?.message,
							longitude: errors.longitude?.message,
						}}
					/>

					{/* Description */}
					<div className="space-y-1.5">
						<Label htmlFor={descriptionId}>Deskripsi</Label>
						<Textarea
							id={descriptionId}
							placeholder="Deskripsi lokasi bambu (opsional)"
							{...register("description")}
							className={errors.description ? "border-destructive" : ""}
						/>
						{errors.description && (
							<p className="text-xs text-destructive">
								{errors.description.message}
							</p>
						)}
					</div>

					{/* Strain and Quantity */}
					<div className="grid grid-cols-2 gap-3">
						<div className="space-y-1.5">
							<Label htmlFor={strainId}>Jenis Bambu</Label>
							<Input
								id={strainId}
								placeholder="Contoh: Bambu Petung"
								{...register("strain")}
								className={errors.strain ? "border-destructive" : ""}
							/>
							{errors.strain && (
								<p className="text-xs text-destructive">
									{errors.strain.message}
								</p>
							)}
						</div>
						<div className="space-y-1.5">
							<Label htmlFor={quantityId}>Jumlah</Label>
							<Input
								id={quantityId}
								type="number"
								min={0}
								placeholder="0"
								{...register("quantity", { valueAsNumber: true })}
								className={errors.quantity ? "border-destructive" : ""}
							/>
							{errors.quantity && (
								<p className="text-xs text-destructive">
									{errors.quantity.message}
								</p>
							)}
						</div>
					</div>

					{/* Owner Info */}
					<div className="grid grid-cols-2 gap-3">
						<div className="space-y-1.5">
							<Label htmlFor={ownerNameId}>Nama Pemilik</Label>
							<Input
								id={ownerNameId}
								placeholder="Nama pemilik lahan"
								{...register("owner_name")}
								className={errors.owner_name ? "border-destructive" : ""}
							/>
							{errors.owner_name && (
								<p className="text-xs text-destructive">
									{errors.owner_name.message}
								</p>
							)}
						</div>
						<div className="space-y-1.5">
							<Label htmlFor={ownerContactId}>Kontak Pemilik</Label>
							<Input
								id={ownerContactId}
								placeholder="Nomor telepon/email"
								{...register("owner_contact")}
								className={errors.owner_contact ? "border-destructive" : ""}
							/>
							{errors.owner_contact && (
								<p className="text-xs text-destructive">
									{errors.owner_contact.message}
								</p>
							)}
						</div>
					</div>

					{/* Image Upload */}
					<div className="space-y-1.5">
						<Label>Gambar</Label>
						{imagePreview ? (
							<div className="relative">
								<img
									src={imagePreview}
									alt="Preview"
									className="w-full h-48 object-cover rounded-md border"
								/>
								<Button
									type="button"
									variant="destructive"
									size="icon"
									className="absolute top-2 right-2 h-8 w-8"
									onClick={handleRemoveImage}
								>
									<X className="h-4 w-4" />
								</Button>
							</div>
						) : (
							<label
								htmlFor={imageUploadId}
								className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-md cursor-pointer hover:border-primary transition-colors"
							>
								<Upload className="h-8 w-8 text-muted-foreground mb-2" />
								<span className="text-sm text-muted-foreground">
									Klik untuk upload gambar
								</span>
								<span className="text-xs text-muted-foreground mt-1">
									Maks. 10MB (JPEG, PNG, WebP, GIF)
								</span>
								<input
									id={imageUploadId}
									type="file"
									accept="image/jpeg,image/png,image/webp,image/gif"
									className="hidden"
									onChange={handleImageChange}
								/>
							</label>
						)}
						{errors.image && (
							<p className="text-xs text-destructive">{errors.image.message}</p>
						)}
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
						>
							Batal
						</Button>
						<Button type="submit" disabled={createMarker.isPending}>
							{createMarker.isPending ? "Menyimpan..." : "Simpan Marker"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
