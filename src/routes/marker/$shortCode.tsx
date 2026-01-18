import { createFileRoute } from "@tanstack/react-router";
import { MarkerDetailPage } from "@/components/markers/MarkerDetailPage";

export const Route = createFileRoute("/marker/$shortCode")({
	component: MarkerDetailPage,
});
