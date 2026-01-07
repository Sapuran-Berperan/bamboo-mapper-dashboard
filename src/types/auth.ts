// API Response wrapper from backend
export interface ApiResponse<T> {
	meta: {
		success: boolean;
		message: string;
		details?: Record<string, string>;
	};
	data: T | null;
}

// User entity from backend
export interface User {
	id: string;
	email: string;
	name: string;
	role: string;
	created_at: string;
	updated_at: string;
}

// Login request payload
export interface LoginCredentials {
	email: string;
	password: string;
}

// Login response data
export interface LoginResponse {
	access_token: string;
	refresh_token: string;
	token_type: string;
	expires_in: number;
	user: User;
}

// Refresh response data
export interface RefreshResponse {
	access_token: string;
	refresh_token: string;
	token_type: string;
	expires_in: number;
}

// Auth store state
export interface AuthState {
	accessToken: string | null;
	refreshToken: string | null;
	user: User | null;
	expiresAt: number | null;
	isAuthenticated: boolean;
}

// Auth store actions
export interface AuthActions {
	setAuth: (data: LoginResponse) => void;
	updateTokens: (data: RefreshResponse) => void;
	logout: () => void;
	isTokenExpired: () => boolean;
}
