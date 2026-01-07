import { apiClient } from "@/lib/api-client";
import type {
	LoginCredentials,
	LoginResponse,
	RefreshResponse,
} from "@/types/auth";

export async function login(
	credentials: LoginCredentials,
): Promise<LoginResponse> {
	return apiClient<LoginResponse>("/auth/login", {
		method: "POST",
		body: JSON.stringify(credentials),
	});
}

export async function refreshToken(
	refreshToken: string,
): Promise<RefreshResponse> {
	return apiClient<RefreshResponse>("/auth/refresh", {
		method: "POST",
		body: JSON.stringify({ refresh_token: refreshToken }),
	});
}

export async function logout(accessToken: string): Promise<void> {
	await apiClient<null>("/auth/logout", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});
}
