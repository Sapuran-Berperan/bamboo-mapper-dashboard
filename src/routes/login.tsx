import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { AlertCircle, Loader2 } from "lucide-react";
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
import { useLogin } from "@/hooks/use-auth";
import { useAuthStore } from "@/stores/auth-store";

export const Route = createFileRoute("/login")({
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
	const emailId = useId();
	const passwordId = useId();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const loginMutation = useLogin();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		loginMutation.mutate({ email, password });
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
				<form onSubmit={handleSubmit}>
					<CardContent className="space-y-4">
						{loginMutation.isError && (
							<div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
								<AlertCircle className="h-4 w-4 shrink-0" />
								<span>
									{loginMutation.error?.message ||
										"Login gagal. Silakan coba lagi."}
								</span>
							</div>
						)}

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
								disabled={loginMutation.isPending}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor={passwordId}>Password</Label>
							<Input
								id={passwordId}
								type="password"
								placeholder="Masukkan password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								autoComplete="current-password"
								disabled={loginMutation.isPending}
							/>
						</div>
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
