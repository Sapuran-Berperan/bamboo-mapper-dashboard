import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Daftar Akun
          </CardTitle>
          <CardDescription className="text-center">
            Halaman registrasi belum tersedia. Silakan hubungi administrator
            untuk membuat akun.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Sudah punya akun?{" "}
            <Link
              to="/login"
              className="text-primary hover:underline font-medium"
            >
              Masuk di sini
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
