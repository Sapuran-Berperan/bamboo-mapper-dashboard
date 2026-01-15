import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { MarkersPage } from "@/components/markers/MarkersPage";

const markersSearchSchema = z.object({
	page: z.coerce.number().min(1).optional().default(1),
	per_page: z.coerce.number().min(1).max(100).optional().default(10),
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
	creator_id: z.string().uuid().optional(),
});

export type MarkersSearch = z.infer<typeof markersSearchSchema>;

export const Route = createFileRoute("/markers")({
	component: MarkersPage,
	validateSearch: markersSearchSchema,
});
