import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
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
import { useRegister } from "@/hooks/use-auth";
import { type RegisterFormData, registerSchema } from "@/lib/validations/auth";
import { useAuthStore } from "@/stores/auth-store";

export const Route = createFileRoute("/register")({
	beforeLoad: () => {
		// Redirect to home if already authenticated
		const { isAuthenticated, isTokenExpired } = useAuthStore.getState();
		if (isAuthenticated && !isTokenExpired()) {
			throw redirect({ to: "/" });
		}
	},
	component: RegisterPage,
});

function RegisterPage() {
	const registerMutation = useRegister();
	const nameId = useId();
	const emailId = useId();
	const passwordId = useId();

	const form = useForm<RegisterFormData>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			name: "",
			email: "",
			password: "",
		},
	});

	const onSubmit = (data: RegisterFormData) => {
		registerMutation.mutate(data);
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-muted px-4">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl font-bold text-center">
						Daftar Akun
					</CardTitle>
					<CardDescription className="text-center">
						Buat akun baru untuk mengakses dashboard Bamboo Mapper
					</CardDescription>
				</CardHeader>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<CardContent className="space-y-4">
						<Controller
							control={form.control}
							name="name"
							render={({ field, fieldState }) => (
								<Field data-invalid={!!fieldState.error}>
									<FieldLabel htmlFor={nameId}>Nama</FieldLabel>
									<Input
										id={nameId}
										type="text"
										placeholder="Nama lengkap"
										autoComplete="name"
										aria-invalid={!!fieldState.error}
										disabled={registerMutation.isPending}
										{...field}
									/>
									<FieldError>{fieldState.error?.message}</FieldError>
								</Field>
							)}
						/>

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
										disabled={registerMutation.isPending}
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
										placeholder="Minimal 8 karakter"
										autoComplete="new-password"
										aria-invalid={!!fieldState.error}
										disabled={registerMutation.isPending}
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
							disabled={registerMutation.isPending}
						>
							{registerMutation.isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Memproses...
								</>
							) : (
								"Daftar"
							)}
						</Button>

						<p className="text-sm text-center text-muted-foreground">
							Sudah punya akun?{" "}
							<Link
								to="/login"
								className="text-primary hover:underline font-medium"
							>
								Masuk di sini
							</Link>
						</p>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
}
