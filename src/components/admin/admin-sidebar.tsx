
"use client"
// This component is not used in the new PWA structure for simplicity.
// Navigation is handled by the AppHeader.
// If a dedicated admin sidebar is needed later, this can be adapted.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building, LayoutDashboard, BarChart3, Settings, Users, Bed } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar"; 

interface AdminSidebarProps {}

const menuItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/rooms", label: "Room Status", icon: Bed },
  { href: "/admin/bookings", label: "Bookings", icon: Users },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar({}: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="border-r hidden md:flex"> {/* Hide on mobile, use AppHeader */}
      <SidebarHeader className="p-4 flex items-center gap-2 justify-center group-data-[collapsible=icon]:justify-center">
         <Link href="/admin" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
            <Building className="h-8 w-8 text-sidebar-primary-foreground" />
            <span className="text-2xl font-bold text-sidebar-primary-foreground group-data-[collapsible=icon]:hidden">Admin</span>
        </Link>
      </SidebarHeader>
      
      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))}
                  className="justify-start"
                  tooltip={{ children: item.label, className: "bg-sidebar-accent text-sidebar-accent-foreground" }}
                >
                  <a>
                    <item.icon className="h-5 w-5" />
                    <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 mt-auto group-data-[collapsible=icon]:p-2">
         <p className="text-xs text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden text-center">
          Hotel PWA Admin
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}

