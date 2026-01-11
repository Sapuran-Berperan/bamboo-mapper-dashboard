import { z } from "zod";

export const loginSchema = z.object({
	email: z.email("Email tidak valid"),
	password: z.string().min(8, "Password wajib diisi"),
});

export const registerSchema = z.object({
	name: z
		.string()
		.min(1, "Nama wajib diisi")
		.max(100, "Nama maksimal 100 karakter"),
	email: z.email("Email tidak valid"),
	password: z.string().min(8, "Password minimal 8 karakter"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
