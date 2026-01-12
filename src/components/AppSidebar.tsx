import { Link } from "@tanstack/react-router";
import { Home, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarSeparator,
} from "@/components/ui/sidebar";
import { useLogout } from "@/hooks/use-auth";
import { useAuthStore } from "@/stores/auth-store";

const menuItems = [
	{
		title: "Beranda",
		url: "/",
		icon: Home,
	},
];

export function AppSidebar() {
	const user = useAuthStore((state) => state.user);
	const logoutMutation = useLogout();

	const handleLogout = () => {
		logoutMutation.mutate();
	};

	return (
		<Sidebar>
			<SidebarHeader className="p-4">
				<Link to="/" className="flex items-center gap-3">
					<img
						src="/Logo_Sapuran.png"
						alt="Logo Sapuran"
						className="h-10 w-10 rounded-lg"
					/>
					<span className="font-semibold text-lg">Bamboo Mapper</span>
				</Link>
			</SidebarHeader>

			<SidebarSeparator />

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Menu</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{menuItems.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton asChild>
										<Link to={item.url}>
											<item.icon />
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter className="p-4">
				<SidebarSeparator className="mb-4" />
				<div className="flex flex-col gap-3">
					<div className="flex items-center gap-3">
						<div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
							{user?.name?.charAt(0).toUpperCase() ?? "U"}
						</div>
						<div className="flex flex-col">
							<span className="text-sm font-medium">{user?.name ?? "User"}</span>
							<span className="text-xs text-muted-foreground">
								{user?.email ?? ""}
							</span>
						</div>
					</div>
					<Button
						variant="outline"
						size="sm"
						onClick={handleLogout}
						disabled={logoutMutation.isPending}
						className="w-full"
					>
						<LogOut className="h-4 w-4 mr-2" />
						{logoutMutation.isPending ? "Keluar..." : "Keluar"}
					</Button>
				</div>
			</SidebarFooter>
		</Sidebar>
	);
}
