import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import * as authApi from "@/api/auth";
import { useAuthStore } from "@/stores/auth-store";
import type { LoginCredentials } from "@/types/auth";

export function useLogin() {
	const setAuth = useAuthStore((state) => state.setAuth);
	const navigate = useNavigate();

	return useMutation({
		mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
		onSuccess: (data) => {
			setAuth(data);
			// Navigate to the page user was trying to access, or home
			const redirectTo = sessionStorage.getItem("redirectAfterLogin") || "/";
			sessionStorage.removeItem("redirectAfterLogin");
			navigate({ to: redirectTo });
		},
	});
}

export function useLogout() {
	const { accessToken, logout: clearAuth } = useAuthStore();
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	return useMutation({
		mutationFn: () => {
			if (accessToken) {
				return authApi.logout(accessToken);
			}
			return Promise.resolve();
		},
		onSettled: () => {
			// Clear auth state regardless of API success
			clearAuth();
			queryClient.clear();
			navigate({ to: "/login" });
		},
	});
}

export function useRefreshToken() {
	const { refreshToken, updateTokens, logout } = useAuthStore();

	return useMutation({
		mutationFn: () => {
			if (!refreshToken) {
				throw new Error("No refresh token available");
			}
			return authApi.refreshToken(refreshToken);
		},
		onSuccess: (data) => {
			updateTokens(data);
		},
		onError: () => {
			logout();
		},
	});
}
