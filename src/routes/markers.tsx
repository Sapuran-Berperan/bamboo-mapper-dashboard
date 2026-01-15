import { createFileRoute } from "@tanstack/react-router";
import { MarkersPage } from "@/components/markers/MarkersPage";

export const Route = createFileRoute("/markers")({
	component: MarkersPage,
});
