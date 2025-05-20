"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  UserCircle,
  Settings,
  FileSpreadsheet,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar"

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
  },
  {
    title: "Leads",
    icon: FileSpreadsheet,
    href: "/leads",
  },
  {
    title: "Users",
    icon: Users,
    href: "/users",
  },
  {
    title: "Profile",
    icon: UserCircle,
    href: "/profile",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/settings",
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar className="border-r bg-white">
      {/* Sidebar Header */}
      <SidebarHeader className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-xl text-center tracking-tight">CRM</span>
          <SidebarTrigger className="md:hidden" />
        </div>
      </SidebarHeader>

      {/* Sidebar Content */}
      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href))

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  className={`group flex items-center gap-3 rounded-lg px-4 py-6 text-base font-medium transition-colors ${
                    isActive
                      ? "bg-muted text-primary"
                      : "hover:bg-muted hover:text-primary"
                  }`}
                >
                  <Link href={item.href} className="flex items-center gap-4 w-full">
                    <item.icon className="h-5 w-5 group-hover:text-primary" />
                    <span className="text-[16px]">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* Sidebar Footer */}
      <SidebarFooter className="border-t p-4">
        <div className="text-xs text-muted-foreground text-center w-full">
          CRM System v1.0
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}