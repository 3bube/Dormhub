"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  Bed,
  Utensils,
  FileText,
  DollarSign,
  ShoppingCart,
  BarChart3,
  Bell,
  Settings,
  User,
  LogOut,
} from "lucide-react";

import { useAuth } from "@/app/context/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroupLabel,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar";

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  // Define menu items based on user role
  const studentMenuItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      title: "Room Management",
      href: "/dashboard/room",
      icon: Bed,
    },
    {
      title: "Meal Management",
      href: "/dashboard/meal",
      icon: Utensils,
    },
    {
      title: "Complaints",
      href: "/dashboard/complaints",
      icon: FileText,
    },
    // {
    //   title: "Payments",
    //   href: "/dashboard/payments",
    //   icon: DollarSign,
    // },
    // {
    //   title: "Resource Requests",
    //   href: "/dashboard/resources",
    //   icon: ShoppingCart,
    // },
    // {
    //   title: "Notifications",
    //   href: "/dashboard/notifications",
    //   icon: Bell,
    // },
  ];

  const staffMenuItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      title: "Room Management",
      href: "/dashboard/room",
      icon: Bed,
    },
    {
      title: "Meal Management",
      href: "/dashboard/meal",
      icon: Utensils,
    },
    {
      title: "Complaints",
      href: "/dashboard/complaints",
      icon: FileText,
    },
    // {
    //   title: "Payment Management",
    //   href: "/dashboard/payments",
    //   icon: DollarSign,
    // },
    // {
    //   title: "Resource Management",
    //   href: "/dashboard/resources",
    //   icon: ShoppingCart,
    // },
    // {
    //   title: "Reports",
    //   href: "/dashboard/reports",
    //   icon: BarChart3,
    // },
    // {
    //   title: "Notifications",
    //   href: "/dashboard/notifications",
    //   icon: Bell,
    // },
  ];

  const menuItems = user?.role === "staff" ? staffMenuItems : studentMenuItems;

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center p-2">
          <div className="ml-2 font-semibold">Hostel Management</div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.title}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/dashboard/profile"}
                  tooltip="Profile"
                >
                  <Link href="/dashboard/profile">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {/* <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/dashboard/settings"}
                  tooltip="Settings"
                >
                  <Link href="/dashboard/settings">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem> */}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={signOut} tooltip="Log out">
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
