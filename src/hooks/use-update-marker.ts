import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { updateMarker } from "@/api/markers";
import type { UpdateMarkerPayload } from "@/types/marker";
import { MARKERS_QUERY_KEY } from "./use-markers";
import { PAGINATED_MARKERS_QUERY_KEY } from "./use-paginated-markers";

interface UpdateMarkerInput {
	id: string;
	data: UpdateMarkerPayload;
	image?: File;
}

interface UseUpdateMarkerOptions {
	onSuccess?: () => void;
}

export function useUpdateMarker(options: UseUpdateMarkerOptions = {}) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data, image }: UpdateMarkerInput) =>
			toast.promise(updateMarker(id, data, image), {
				loading: "Memperbarui marker...",
				success: "Marker berhasil diperbarui!",
				error: (err) => err.message || "Gagal memperbarui marker.",
			}),
		onSuccess: () => {
			// Invalidate both marker queries to refetch fresh data
			queryClient.invalidateQueries({ queryKey: MARKERS_QUERY_KEY });
			queryClient.invalidateQueries({ queryKey: PAGINATED_MARKERS_QUERY_KEY });
			options.onSuccess?.();
		},
	});
}
