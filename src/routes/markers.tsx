import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { MarkersPage } from "@/components/markers/MarkersPage";

// Helper to handle empty string -> undefined for optional numbers
const optionalNumber = z
	.union([z.string(), z.number()])
	.optional()
	.transform((val) => {
		if (val === "" || val === undefined) return undefined;
		const num = typeof val === "number" ? val : Number(val);
		return Number.isNaN(num) ? undefined : num;
	});

const markersSearchSchema = z.object({
	page: optionalNumber.pipe(z.number().min(1).optional()).default(1),
	per_page: optionalNumber
		.pipe(z.number().min(1).max(100).optional())
		.default(10),
	sort_by: z
		.enum(["name", "created_at", "updated_at", "strain", "quantity"])
		.optional(),
	sort_dir: z.enum(["asc", "desc"]).optional(),
	search: z.string().optional(),
	date_from: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/)
		.optional(),
	date_to: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/)
		.optional(),
	creator_id: z.uuid().optional(),
});

export type MarkersSearch = z.infer<typeof markersSearchSchema>;

export const Route = createFileRoute("/markers")({
	component: MarkersPage,
	validateSearch: markersSearchSchema,
});
