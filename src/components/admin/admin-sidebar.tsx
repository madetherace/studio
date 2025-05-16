
"use client"

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
  SidebarTrigger
} from "@/components/ui/sidebar"; // Assuming the path is correct

interface AdminSidebarProps {
  // Props if needed, e.g. for mobile toggle
}

const menuItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/rooms", label: "Room Status", icon: Bed },
  { href: "/admin/bookings", label: "Bookings", icon: Users },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar({}: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="p-4 flex items-center gap-2 justify-center group-data-[collapsible=icon]:justify-center">
         <Link href="/admin/dashboard" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
            <Building className="h-8 w-8 text-sidebar-primary-foreground" />
            <span className="text-2xl font-bold text-sidebar-primary-foreground group-data-[collapsible=icon]:hidden">Eleon</span>
        </Link>
        {/* <SidebarTrigger className="ml-auto group-data-[collapsible=icon]:hidden" /> */}
      </SidebarHeader>
      
      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith(item.href)}
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
        {/* Could add a user profile button or settings shortcut here */}
         <p className="text-xs text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden text-center">
          Eleon Admin Panel
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
