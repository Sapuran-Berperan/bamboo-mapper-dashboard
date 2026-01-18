import { z } from "zod";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_IMAGE_TYPES = [
	"image/jpeg",
	"image/png",
	"image/webp",
	"image/gif",
];

export const createMarkerSchema = z.object({
	name: z
		.string()
		.min(1, "Nama marker wajib diisi")
		.max(255, "Nama maksimal 255 karakter"),
	latitude: z
		.string()
		.min(1, "Latitude wajib diisi")
		.refine(
			(val) => {
				const num = Number.parseFloat(val);
				return !Number.isNaN(num) && num >= -90 && num <= 90;
			},
			{ message: "Latitude harus antara -90 dan 90" },
		),
	longitude: z
		.string()
		.min(1, "Longitude wajib diisi")
		.refine(
			(val) => {
				const num = Number.parseFloat(val);
				return !Number.isNaN(num) && num >= -180 && num <= 180;
			},
			{ message: "Longitude harus antara -180 dan 180" },
		),
	description: z
		.string()
		.max(1000, "Deskripsi maksimal 1000 karakter")
		.optional(),
	strain: z.string().max(255, "Jenis bambu maksimal 255 karakter").optional(),
	quantity: z
		.union([z.number(), z.nan()])
		.optional()
		.transform((val) => (Number.isNaN(val) ? undefined : val))
		.pipe(
			z
				.number()
				.int("Jumlah harus bilangan bulat")
				.min(0, "Jumlah tidak boleh negatif")
				.optional(),
		),
	owner_name: z
		.string()
		.max(255, "Nama pemilik maksimal 255 karakter")
		.optional(),
	owner_contact: z
		.string()
		.max(255, "Kontak pemilik maksimal 255 karakter")
		.optional(),
	image: z
		.instanceof(File)
		.optional()
		.refine(
			(file) => !file || file.size <= MAX_IMAGE_SIZE,
			"Ukuran gambar maksimal 10MB",
		)
		.refine(
			(file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
			"Format gambar harus JPEG, PNG, WebP, atau GIF",
		),
});

export type CreateMarkerFormData = z.infer<typeof createMarkerSchema>;
