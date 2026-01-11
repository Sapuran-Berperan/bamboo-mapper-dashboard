import { zodResolver } from "@hookform/resolvers/zod";
import {
	createFileRoute,
	Link,
	redirect,
	useSearch,
} from "@tanstack/react-router";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useId } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/hooks/use-auth";
import { type LoginFormData, loginSchema } from "@/lib/validations/auth";
import { useAuthStore } from "@/stores/auth-store";

interface LoginSearch {
	registered?: boolean;
}

export const Route = createFileRoute("/login")({
	validateSearch: (search: Record<string, unknown>): LoginSearch => ({
		registered: search.registered === true || search.registered === "true",
	}),
	beforeLoad: () => {
		// Redirect to home if already authenticated
		const { isAuthenticated, isTokenExpired } = useAuthStore.getState();
		if (isAuthenticated && !isTokenExpired()) {
			throw redirect({ to: "/" });
		}
	},
	component: LoginPage,
});

function LoginPage() {
	const { registered } = useSearch({ from: "/login" });
	const loginMutation = useLogin();
	const emailId = useId();
	const passwordId = useId();

	const form = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const onSubmit = (data: LoginFormData) => {
		loginMutation.mutate(data);
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-muted px-4">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl font-bold text-center">
						Bamboo Mapper
					</CardTitle>
					<CardDescription className="text-center">
						Masuk ke dashboard untuk mengelola data bambu
					</CardDescription>
				</CardHeader>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<CardContent className="space-y-4">
						{registered && (
							<div className="flex items-center gap-2 p-3 text-sm text-green-600 bg-green-50 rounded-md">
								<CheckCircle2 className="h-4 w-4 shrink-0" />
								<span>
									Registrasi berhasil! Silakan login dengan akun baru Anda.
								</span>
							</div>
						)}

						{loginMutation.isError && (
							<div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
								<AlertCircle className="h-4 w-4 shrink-0" />
								<span>
									{loginMutation.error?.message ||
										"Login gagal. Silakan coba lagi."}
								</span>
							</div>
						)}

						<Controller
							control={form.control}
							name="email"
							render={({ field, fieldState }) => (
								<Field data-invalid={!!fieldState.error}>
									<FieldLabel htmlFor={emailId}>Email</FieldLabel>
									<Input
										id={emailId}
										type="email"
										placeholder="nama@example.com"
										autoComplete="email"
										aria-invalid={!!fieldState.error}
										disabled={loginMutation.isPending}
										{...field}
									/>
									<FieldError>{fieldState.error?.message}</FieldError>
								</Field>
							)}
						/>

						<Controller
							control={form.control}
							name="password"
							render={({ field, fieldState }) => (
								<Field data-invalid={!!fieldState.error}>
									<FieldLabel htmlFor={passwordId}>Password</FieldLabel>
									<Input
										id={passwordId}
										type="password"
										placeholder="Masukkan password"
										autoComplete="current-password"
										aria-invalid={!!fieldState.error}
										disabled={loginMutation.isPending}
										{...field}
									/>
									<FieldError>{fieldState.error?.message}</FieldError>
								</Field>
							)}
						/>
					</CardContent>

					<CardFooter className="flex flex-col mt-6 space-y-4">
						<Button
							type="submit"
							className="w-full"
							disabled={loginMutation.isPending}
						>
							{loginMutation.isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Memproses...
								</>
							) : (
								"Masuk"
							)}
						</Button>

						<p className="text-sm text-center text-muted-foreground">
							Belum punya akun?{" "}
							<Link
								to="/register"
								className="text-primary hover:underline font-medium"
							>
								Daftar di sini
							</Link>
						</p>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
}
