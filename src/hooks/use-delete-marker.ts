import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { deleteMarker } from "@/api/markers";
import { MARKERS_QUERY_KEY } from "./use-markers";
import { PAGINATED_MARKERS_QUERY_KEY } from "./use-paginated-markers";

interface UseDeleteMarkerOptions {
	onSuccess?: () => void;
}

export function useDeleteMarker(options: UseDeleteMarkerOptions = {}) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) =>
			toast.promise(deleteMarker(id), {
				loading: "Menghapus marker...",
				success: "Marker berhasil dihapus!",
				error: (err) => err.message || "Gagal menghapus marker.",
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: MARKERS_QUERY_KEY });
			queryClient.invalidateQueries({ queryKey: PAGINATED_MARKERS_QUERY_KEY });
			options.onSuccess?.();
		},
	});
}
