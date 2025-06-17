"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { PlusCircle, Search, MoreVertical, Edit, Trash2 } from "lucide-react"
import { getUsers, deleteUserById } from "@/lib/actions"
import type { User } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import Swal from "sweetalert2"
import { useAuth } from "@/lib/auth-context"

export default function UsersPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const { user, isLoading: authLoading, getAuthHeaders } = useAuth()

  useEffect(() => {
    const fetchUsers = async () => {
      const authHeaders = getAuthHeaders()
      if (!authHeaders) {
        toast({
          title: "Authentication Error",
          description: "Please login to access leads",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }
      try {
        const fetchedUsers = await getUsers(authHeaders.token, authHeaders.tokenType)
        setUsers(fetchedUsers)
      } catch (error: any) {
        console.error("Failed to fetch users:", error)
        toast({
          title: "Error",
          description: error.message || "Failed to fetch users",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [toast])

  const filteredUsers = users.filter(
    (user) =>
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleDeleteUser = async (id: number) => {
    const result = await Swal.fire({
      title: "Are you sure you want to delete this user?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel"
    })

    if (result.isConfirmed) {
      try {
        const success = await deleteUserById(id)
        if (success) {
        setUsers(users.filter((user) => user.id !== id))
          toast({
            title: "Success",
            description: "User deleted successfully",
            variant: "default",
          })
          Swal.fire("Deleted!", "User has been deleted.", "success")
        }
      } catch (error: any) {
        console.error("Failed to delete user:", error)
        toast({
          title: "Error",
          description: error.message || "Failed to delete user",
          variant: "destructive",
        })
      }
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="p-6 space-y-6">
      {/* user header start */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground mt-1">Manage system users and permissions</p>
        </div>
        <div className="flex flex-row gap-2 mt-4 md:mt-0">
          <Link href="/users/org-chart">
            <Button variant="outline">
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              View Org Chart
            </Button>
          </Link>
          <Link href="/users/create">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create User
            </Button>
          </Link>
        </div>
      </div>
      {/* user header end */}
      {/* search box start */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
      {/* search box end */}
      {/* users render page start */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-gray-200"></div>
                    <div className="space-y-2">
                      <div className="h-5 bg-gray-200 rounded w-32"></div>
                      <div className="h-4 bg-gray-200 rounded w-48"></div>
                    </div>
                  </div>
                  <div className="h-9 w-9 bg-gray-200 rounded-md"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{getInitials(user.full_name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{user.full_name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                      <div className="flex items-center mt-1 space-x-2">
                        <Badge variant={user.role === "Admin" ? "default" : "outline"}>{user.role}</Badge>
                        <Badge variant={user.is_active ? "success" : "destructive"}>
                          {user.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/users/${user.id}/edit`)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteUser(user.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // user not found start
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No users found</h3>
          <p className="text-muted-foreground mt-1">
            {searchQuery ? "Try adjusting your search query" : "Create your first user to get started"}
          </p>
          {!searchQuery && (
            <Link href="/users/create" className="mt-4 inline-block">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create User
              </Button>
            </Link>
          )}
        </div>
        // user not found end
      )}
      {/* users render page end */}
    </div>
  )
}
