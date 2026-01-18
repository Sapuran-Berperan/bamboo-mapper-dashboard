import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createMarker } from "@/api/markers";
import type { CreateMarkerPayload } from "@/types/marker";
import { MARKERS_QUERY_KEY } from "./use-markers";
import { PAGINATED_MARKERS_QUERY_KEY } from "./use-paginated-markers";

interface CreateMarkerInput {
	data: CreateMarkerPayload;
	image?: File;
}

interface UseCreateMarkerOptions {
	onSuccess?: () => void;
}

export function useCreateMarker(options: UseCreateMarkerOptions = {}) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ data, image }: CreateMarkerInput) =>
			toast.promise(createMarker(data, image), {
				loading: "Menyimpan marker...",
				success: "Marker berhasil ditambahkan!",
				error: (err) => err.message || "Gagal menambahkan marker.",
			}),
		onSuccess: () => {
			// Invalidate both marker queries to refetch fresh data
			queryClient.invalidateQueries({ queryKey: MARKERS_QUERY_KEY });
			queryClient.invalidateQueries({ queryKey: PAGINATED_MARKERS_QUERY_KEY });
			options.onSuccess?.();
		},
	});
}
