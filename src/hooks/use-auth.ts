import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import * as authApi from "@/api/auth";
import { ApiError } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import type { LoginCredentials, RegisterCredentials } from "@/types/auth";

export function useLogin() {
	const setAuth = useAuthStore((state) => state.setAuth);
	const navigate = useNavigate();

	return useMutation({
		mutationFn: (credentials: LoginCredentials) =>
			toast.promise(authApi.login(credentials), {
				loading: "Memproses login...",
				success: "Login berhasil!",
				error: (err) => err.message || "Login gagal. Silakan coba lagi.",
			}),
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
			const logoutPromise = accessToken
				? authApi.logout(accessToken)
				: Promise.resolve();

			return toast.promise(logoutPromise, {
				loading: "Keluar dari akun...",
				success: "Berhasil keluar!",
				error: "Gagal keluar. Silakan coba lagi.",
			});
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

export function useRegister() {
	const navigate = useNavigate();

	return useMutation({
		mutationFn: (credentials: RegisterCredentials) =>
			toast.promise(authApi.register(credentials), {
				loading: "Mendaftarkan akun...",
				success: "Registrasi berhasil! Silakan login.",
				error: (err) => err.message || "Registrasi gagal. Silakan coba lagi.",
			}),
		onSuccess: () => {
			navigate({ to: "/login" });
		},
	});
}

const DEFAULT_VALIDATION_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function useAuthValidation(intervalMs = DEFAULT_VALIDATION_INTERVAL) {
	const { isAuthenticated, accessToken, logout, updateUser } = useAuthStore();
	const isValidatingRef = useRef(false);

	useEffect(() => {
		if (!isAuthenticated || !accessToken) return;

		const validate = async () => {
			// Prevent concurrent validation calls
			if (isValidatingRef.current) return;
			isValidatingRef.current = true;

			try {
				const user = await authApi.getMe(accessToken);
				updateUser(user);
			} catch (error) {
				if (error instanceof ApiError && error.status === 401) {
					logout();
				}
				// Silently ignore other errors (network issues, etc.)
			} finally {
				isValidatingRef.current = false;
			}
		};

		// Validate immediately on mount
		validate();

		// Set up periodic revalidation
		const interval = setInterval(validate, intervalMs);
		return () => clearInterval(interval);
	}, [isAuthenticated, accessToken, logout, updateUser, intervalMs]);
}
