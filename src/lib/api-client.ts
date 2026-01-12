import { useAuthStore } from "@/stores/auth-store";
import type { ApiResponse, RefreshResponse } from "@/types/auth";

const API_BASE_URL =
	import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";

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

// Track refresh state to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

/**
 * Attempt to refresh the access token using the refresh token.
 * Returns true if refresh succeeded, false otherwise.
 * Uses a singleton pattern to prevent multiple simultaneous refresh requests.
 */
async function attemptRefresh(): Promise<boolean> {
	// If already refreshing, wait for the existing refresh to complete
	if (isRefreshing && refreshPromise) {
		return refreshPromise;
	}

	const { refreshToken, updateTokens, logout } = useAuthStore.getState();
	if (!refreshToken) {
		return false;
	}

	isRefreshing = true;
	refreshPromise = (async () => {
		try {
			// Make refresh request directly (not through apiClient to avoid circular issues)
			const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ refresh_token: refreshToken }),
			});

			const json: ApiResponse<RefreshResponse> = await response.json();

			if (!response.ok || !json.meta?.success) {
				logout();
				return false;
			}

			updateTokens(json.data as RefreshResponse);
			return true;
		} catch {
			logout();
			return false;
		} finally {
			isRefreshing = false;
			refreshPromise = null;
		}
	})();

	return refreshPromise;
}

interface ApiClientOptions extends RequestInit {
	_isRetry?: boolean;
}

export async function apiClient<T>(
	endpoint: string,
	options: ApiClientOptions = {},
): Promise<T> {
	const { _isRetry, ...fetchOptions } = options;
	const url = `${API_BASE_URL}${endpoint}`;

	const config: RequestInit = {
		...fetchOptions,
		headers: {
			"Content-Type": "application/json",
			...fetchOptions.headers,
		},
	};

	const response = await fetch(url, config);

	// Handle 401 Unauthorized - attempt token refresh
	if (response.status === 401 && !_isRetry) {
		const refreshed = await attemptRefresh();

		if (refreshed) {
			// Get the new access token and retry the request
			const newAccessToken = useAuthStore.getState().accessToken;

			// Update Authorization header with new token
			const retryHeaders = new Headers(config.headers);
			if (retryHeaders.has("Authorization")) {
				retryHeaders.set("Authorization", `Bearer ${newAccessToken}`);
			}

			return apiClient<T>(endpoint, {
				...fetchOptions,
				headers: Object.fromEntries(retryHeaders.entries()),
				_isRetry: true,
			});
		}

		// Refresh failed - throw the original error
		const json: ApiResponse<T> = await response.clone().json();
		throw new ApiError(
			response.status,
			json.meta?.message || "Session expired. Please login again.",
			json.meta?.details,
		);
	}

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
