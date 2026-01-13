import { apiClient } from "@/lib/api-client";
import type {
	LoginCredentials,
	LoginResponse,
	RefreshResponse,
	RegisterCredentials,
	RegisterResponse,
	User,
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

export async function register(
	credentials: RegisterCredentials,
): Promise<RegisterResponse> {
	return apiClient<RegisterResponse>("/auth/register", {
		method: "POST",
		body: JSON.stringify(credentials),
	});
}

export async function getMe(accessToken: string): Promise<User> {
	return apiClient<User>("/auth/me", {
		method: "GET",
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});
}
