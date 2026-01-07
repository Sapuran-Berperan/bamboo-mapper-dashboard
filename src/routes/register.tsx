import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegister } from "@/hooks/use-auth";
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
	const nameId = useId();
	const emailId = useId();
	const passwordId = useId();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const registerMutation = useRegister();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		registerMutation.mutate({ name, email, password });
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
				<form onSubmit={handleSubmit}>
					<CardContent className="space-y-4">
						{registerMutation.isError && (
							<div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
								<AlertCircle className="h-4 w-4 shrink-0" />
								<span>
									{registerMutation.error?.message ||
										"Registrasi gagal. Silakan coba lagi."}
								</span>
							</div>
						)}

						{registerMutation.isSuccess && (
							<div className="flex items-center gap-2 p-3 text-sm text-green-600 bg-green-50 rounded-md">
								<CheckCircle2 className="h-4 w-4 shrink-0" />
								<span>
									Registrasi berhasil! Mengalihkan ke halaman login...
								</span>
							</div>
						)}

						<div className="space-y-2">
							<Label htmlFor={nameId}>Nama</Label>
							<Input
								id={nameId}
								type="text"
								placeholder="Nama lengkap"
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
								maxLength={100}
								autoComplete="name"
								disabled={registerMutation.isPending}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor={emailId}>Email</Label>
							<Input
								id={emailId}
								type="email"
								placeholder="nama@example.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								autoComplete="email"
								disabled={registerMutation.isPending}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor={passwordId}>Password</Label>
							<Input
								id={passwordId}
								type="password"
								placeholder="Minimal 8 karakter"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								minLength={8}
								autoComplete="new-password"
								disabled={registerMutation.isPending}
							/>
						</div>
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
