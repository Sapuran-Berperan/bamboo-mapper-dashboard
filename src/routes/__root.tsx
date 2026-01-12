import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	Outlet,
	redirect,
	useLocation,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Toaster } from "react-hot-toast";
import { AppSidebar } from "@/components/AppSidebar";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/stores/auth-store";

// Routes that don't require authentication
const PUBLIC_ROUTES = ["/login", "/register"];

interface RouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
	beforeLoad: ({ location }) => {
		// Skip auth check for public routes
		if (PUBLIC_ROUTES.some((route) => location.pathname.startsWith(route))) {
			return;
		}

		// Check authentication
		const { isAuthenticated, isTokenExpired } = useAuthStore.getState();

		if (!isAuthenticated || isTokenExpired()) {
			// Store the intended destination for redirect after login
			sessionStorage.setItem("redirectAfterLogin", location.href);

			throw redirect({
				to: "/login",
			});
		}
	},
	component: RootComponent,
});

function RootComponent() {
	const location = useLocation();
	const isPublicRoute = PUBLIC_ROUTES.some((route) =>
		location.pathname.startsWith(route),
	);

	if (isPublicRoute) {
		return (
			<>
				<Outlet />
				<Toaster position="top-center" />
				<TanStackDevtools
					config={{
						position: "bottom-right",
					}}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
					]}
				/>
			</>
		);
	}

	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<header className="flex h-14 items-center gap-2 border-b px-4">
					<SidebarTrigger />
				</header>
				<main className="flex-1">
					<Outlet />
				</main>
			</SidebarInset>
			<Toaster position="top-center" />
			<TanStackDevtools
				config={{
					position: "bottom-right",
				}}
				plugins={[
					{
						name: "Tanstack Router",
						render: <TanStackRouterDevtoolsPanel />,
					},
				]}
			/>
		</SidebarProvider>
	);
}
