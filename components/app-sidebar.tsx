"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import {
  LayoutDashboard,
  Users,
  UserCircle,
  Settings,
  FileSpreadsheet,
  Clock,
  ChevronDown,
  LogOut,
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
    title: "Attendance",
    icon: Clock,
    href: "/attendance",
  },
  {
    title: "Users",
    icon: Users,
    href: "/users",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/settings",
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [username, setUsername] = useState<string>("")

  useEffect(() => {
    // Get username from localStorage, cookies, or API
    const getUserData = async () => {
      try {
        // Option 1: From localStorage
        const userData = localStorage.getItem("user")
        if (userData) {
          const user = JSON.parse(userData)
          setUsername(user.username || user.name || "User")
          return
        }

        // Option 2: From API call to get current user
        const response = await fetch("/api/user/me")
        if (response.ok) {
          const user = await response.json()
          setUsername(user.username || user.name || "User")
        } else {
          setUsername("User")
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
        setUsername("User")
      }
    }

    getUserData()
  }, [])

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/logout", {
        method: "POST",
      });

      if (res.ok) {
        localStorage.removeItem("user") // Clear user data
        window.location.href = "/login";
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("An error occurred during logout:", error);
    }
  };

  const userMenuItems = [
    {
      title: "Profile",
      icon: UserCircle,
      href: "/profile",
    },
    {
      title: "Logout",
      icon: LogOut,
      onClick: handleLogout,
    },
  ]

  return (
    <Sidebar className="border-r bg-white">
      {/* Sidebar Header */}
      <SidebarHeader className="border-b px-6 py-5 bg-[#d32525]/5">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-9 w-9 overflow-hidden rounded-md shadow-sm">
              <Image 
                src="/LOGO.png" 
                alt="CRM Logo" 
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="font-bold text-xl tracking-tight text-[#d32525]">
              CRM
            </span>
          </Link>
          <SidebarTrigger className="md:hidden text-gray-600 hover:text-[#d32525] transition-colors" />
        </div>
      </SidebarHeader>

      {/* Sidebar Content */}
      <SidebarContent className="p-3">
        <SidebarMenu>
          {menuItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  className={`group flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-all ${
                    isActive
                      ? "bg-[#d32525]/10 text-[#d32525] shadow-sm"
                      : "text-gray-600 hover:bg-[#d32525]/5 hover:text-[#d32525]"
                  }`}
                >
                  <Link href={item.href} className="flex items-center gap-4 w-full">
                    <item.icon
                      className={`h-5 w-5 ${
                        isActive
                          ? "text-[#d32525]"
                          : "text-gray-500 group-hover:text-[#d32525]"
                      } transition-colors`}
                    />
                    <span className="text-[15px] font-medium">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
          
          {/* User Menu */}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className={`group flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-all cursor-pointer w-full ${
                pathname === "/profile"
                  ? "bg-[#d32525]/10 text-[#d32525] shadow-sm"
                  : "text-gray-600 hover:bg-[#d32525]/5 hover:text-[#d32525]"
              }`}
            >
              <UserCircle
                className={`h-5 w-5 ${
                  pathname === "/profile"
                    ? "text-[#d32525]"
                    : "text-gray-500 group-hover:text-[#d32525]"
                } transition-colors`}
              />
              <span className="text-[15px] font-medium flex-1 text-left">
                {username}
              </span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  isUserMenuOpen ? "rotate-180" : ""
                } ${
                  pathname === "/profile"
                    ? "text-[#d32525]"
                    : "text-gray-500 group-hover:text-[#d32525]"
                }`}
              />
            </SidebarMenuButton>
            
            {/* Submenu */}
            {isUserMenuOpen && (
              <div className="ml-4 mt-1 space-y-1">
                {userMenuItems.map((item) => {
                  const isActive = item.href && pathname === item.href;
                  
                  if (item.onClick) {
                    return (
                      <SidebarMenuButton
                        key={item.title}
                        onClick={item.onClick}
                        className="group flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-[#d32525]/5 hover:text-[#d32525] transition-all cursor-pointer w-full"
                      >
                        <item.icon className="h-4 w-4 text-gray-500 group-hover:text-[#d32525] transition-colors" />
                        <span className="text-[14px] font-medium">{item.title}</span>
                      </SidebarMenuButton>
                    );
                  }
                  
                  return (
                    <SidebarMenuButton
                      key={item.title}
                      asChild
                      isActive={isActive}
                      className={`group flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                        isActive
                          ? "bg-[#d32525]/10 text-[#d32525] shadow-sm"
                          : "text-gray-600 hover:bg-[#d32525]/5 hover:text-[#d32525]"
                      }`}
                    >
                      <Link href={item.href!} className="flex items-center gap-3 w-full">
                        <item.icon
                          className={`h-4 w-4 ${
                            isActive
                              ? "text-[#d32525]"
                              : "text-gray-500 group-hover:text-[#d32525]"
                          } transition-colors`}
                        />
                        <span className="text-[14px] font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  );
                })}
              </div>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      {/* Sidebar Footer */}
      <SidebarFooter className="border-t p-4 bg-[#d32525]/5">
        <div className="text-xs text-gray-600 text-center w-full">
          CRM System v1.0
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}