import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { UserForm } from "@/components/users/user-form"

export default function CreateUserPage() {
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
        <h1 className="text-3xl font-bold tracking-tight">Create New User</h1>
        <p className="text-muted-foreground">Add a new user to the CRM system</p>
      </div>
      <UserForm />
    </div>
  )
}
