"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { UserForm } from "@/components/users/user-form"
import { getUserById } from "@/lib/actions"
import type { User } from "@/lib/types"

export default function EditUserPage() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (typeof params.id === "string") {
          const fetchedUser = await getUserById(params.id)
          setUser(fetchedUser)
        }
      } catch (error) {
        console.error("Failed to fetch user:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [params.id])

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-10 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-6 space-y-6">
        <div className="mb-6">
          <Link href="/users">
            <Button variant="ghost" className="pl-0">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Users
            </Button>
          </Link>
        </div>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">User not found</h3>
          <p className="text-muted-foreground mt-1">The user you are looking for does not exist or has been deleted</p>
          <Link href="/users" className="mt-4 inline-block">
            <Button>Return to Users</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <Link href="/users">
          <Button variant="ghost" className="pl-0">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Button>
        </Link>
      </div>
      <div className="flex flex-col items-start gap-4 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
        <p className="text-muted-foreground">Update user information and permissions</p>
      </div>
      <UserForm user={user} />
    </div>
  )
}
