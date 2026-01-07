import type { ApiResponse } from "@/types/auth";

const API_BASE_URL =
	import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export class ApiError extends Error {
	constructor(
		public status: number,
		message: string,
		public details?: Record<string, string>,
	) {
		super(message);
		this.name = "ApiError";
	}
}

export async function apiClient<T>(
	endpoint: string,
	options: RequestInit = {},
): Promise<T> {
	const url = `${API_BASE_URL}${endpoint}`;

	const config: RequestInit = {
		...options,
		headers: {
			"Content-Type": "application/json",
			...options.headers,
		},
	};

	const response = await fetch(url, config);
	const json: ApiResponse<T> = await response.json();

	if (!response.ok || !json.meta?.success) {
		throw new ApiError(
			response.status,
			json.meta?.message || "Request failed",
			json.meta?.details,
		);
	}

	return json.data as T;
}
