import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
	AuthActions,
	AuthState,
	LoginResponse,
	RefreshResponse,
} from "@/types/auth";

const STORAGE_KEY = "bamboo-mapper-auth";

export const useAuthStore = create<AuthState & AuthActions>()(
	persist(
		(set, get) => ({
			// State
			accessToken: null,
			refreshToken: null,
			user: null,
			expiresAt: null,
			isAuthenticated: false,

			// Actions
			setAuth: (data: LoginResponse) => {
				const expiresAt = Date.now() + data.expires_in * 1000;
				set({
					accessToken: data.access_token,
					refreshToken: data.refresh_token,
					user: data.user,
					expiresAt,
					isAuthenticated: true,
				});
			},

			updateTokens: (data: RefreshResponse) => {
				const expiresAt = Date.now() + data.expires_in * 1000;
				set({
					accessToken: data.access_token,
					refreshToken: data.refresh_token,
					expiresAt,
				});
			},

			logout: () => {
				set({
					accessToken: null,
					refreshToken: null,
					user: null,
					expiresAt: null,
					isAuthenticated: false,
				});
			},

			isTokenExpired: () => {
				const { expiresAt } = get();
				if (!expiresAt) return true;
				// Consider expired 30 seconds before actual expiry
				return Date.now() >= expiresAt - 30000;
			},
		}),
		{
			name: STORAGE_KEY,
			storage: createJSONStorage(() => sessionStorage),
			partialize: (state) => ({
				accessToken: state.accessToken,
				refreshToken: state.refreshToken,
				user: state.user,
				expiresAt: state.expiresAt,
				isAuthenticated: state.isAuthenticated,
			}),
		},
	),
);
