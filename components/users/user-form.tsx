"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CheckCircle2, HelpCircle, AlertCircle, Mail, ShieldCheck } from "lucide-react"
import type { User as UserType } from "@/lib/types"
import { createUser, updateUser } from "@/lib/actions"

const initialUserState: Omit<UserType, "id" | "createdAt"> = {
  name: "",
  email: "",
  role: "User",
  avatar: "/placeholder.svg?height=40&width=40",
  status: "active",
}

const roleOptions = [
  { value: "Admin", label: "Admin", description: "Full access to all features" },
  { value: "Manager", label: "Manager", description: "Can manage leads and users" },
  { value: "User", label: "User", description: "Basic access to leads only" },
]

export function UserForm({ user }: { user?: UserType }) {
  const router = useRouter()
  const [formData, setFormData] = useState<Omit<UserType, "id" | "createdAt">>(
    user
      ? {
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          status: user.status,
        }
      : initialUserState,
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({})
  const [formComplete, setFormComplete] = useState(false)

  useEffect(() => {
    // Check if form is complete on initial load (for edit mode)
    if (user) {
      checkFormCompletion()
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setTouchedFields((prev) => ({ ...prev, [name]: true }))

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }

    // Check if form is complete
    checkFormCompletion()
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    setTouchedFields((prev) => ({ ...prev, [name]: true }))

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }

    // Check if form is complete
    checkFormCompletion()
  }

  const handleStatusChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, status: checked ? "active" : "inactive" }))
    setTouchedFields((prev) => ({ ...prev, status: true }))

    // Check if form is complete
    checkFormCompletion()
  }

  const checkFormCompletion = () => {
    const requiredFields = ["name", "email", "role"]
    const isComplete = requiredFields.every((field) => formData[field as keyof typeof formData] && !errors[field])
    setFormComplete(isComplete)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (!formData.role) {
      newErrors.role = "Role is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      // Mark all fields as touched to show errors
      const allFields = { name: true, email: true, role: true, status: true }
      setTouchedFields(allFields)
      return
    }

    setIsSubmitting(true)

    try {
      if (user) {
        // Update existing user
        await updateUser(user.id, formData)
      } else {
        // Create new user
        await createUser(formData)
      }
      router.push("/users")
    } catch (error) {
      console.error("Failed to save user:", error)
      setIsSubmitting(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }

  const renderFormField = (
    name: string,
    label: string,
    placeholder: string,
    required = false,
    type = "text",
    icon: React.ReactNode,
    helpText?: string,
  ) => {
    const isError = touchedFields[name] && errors[name]
    const isValid = touchedFields[name] && !errors[name] && formData[name as keyof typeof formData]

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor={name} className="flex items-center">
            {label} {required && <span className="text-red-500 ml-1">*</span>}
            {helpText && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-60">{helpText}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </Label>
          {isValid && <CheckCircle2 className="h-4 w-4 text-green-500" />}
        </div>
        <div className="relative">
          <div className="absolute left-3 top-2.5 text-muted-foreground">{icon}</div>
          <Input
            id={name}
            name={name}
            type={type}
            value={formData[name as keyof typeof formData] as string}
            onChange={handleChange}
            placeholder={placeholder}
            className={`pl-10 transition-all ${isError ? "border-red-500 focus-visible:ring-red-500" : isValid ? "border-green-500 focus-visible:ring-green-500" : ""}`}
          />
        </div>
        {isError && (
          <div className="flex items-center text-red-500 text-sm mt-1">
            <AlertCircle className="h-4 w-4 mr-1" />
            <span>{errors[name]}</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
      <Card className="border-none shadow-lg overflow-hidden">
        <CardHeader className="bg-primary/5 pb-4">
          <CardTitle className="text-xl">User Information</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center space-x-4 p-4 bg-muted/30 rounded-lg">
            <Avatar className="h-16 w-16 border-2 border-primary/20">
              <AvatarImage src={formData.avatar || "/placeholder.svg"} alt={formData.name || "User"} />
              <AvatarFallback>{formData.name ? getInitials(formData.name) : "U"}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-medium">{formData.name || "New User"}</h3>
              <p className="text-sm text-muted-foreground">{formData.email || "Enter user details below"}</p>
            </div>
          </div>

          <div className="space-y-4">
            {renderFormField(
              "name",
              "Full Name",
              "Enter full name",
              true,
              "text",
              <Mail className="h-4 w-4" />,
              "User's full name as it will appear in the system",
            )}

            {renderFormField(
              "email",
              "Email Address",
              "Enter email address",
              true,
              "email",
              <Mail className="h-4 w-4" />,
              "Email address used for login and notifications",
            )}

            <div className="space-y-2">
              <Label htmlFor="role" className="flex items-center">
                Role <span className="text-red-500 ml-1">*</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-60">Determines what permissions the user will have in the system</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-2.5 text-muted-foreground">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <Select value={formData.role} onValueChange={(value) => handleSelectChange("role", value)}>
                  <SelectTrigger
                    id="role"
                    className={`pl-10 ${errors.role ? "border-red-500" : touchedFields.role && formData.role ? "border-green-500" : ""}`}
                  >
                    <SelectValue placeholder="Select user role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        <div className="flex flex-col">
                          <span>{role.label}</span>
                          <span className="text-xs text-muted-foreground">{role.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {errors.role && (
                <div className="flex items-center text-red-500 text-sm mt-1">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  <span>{errors.role}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between space-x-2 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="status" className="text-base">
                    User Status
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {formData.status === "active" ? "User can access the system" : "User access is disabled"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="status" checked={formData.status === "active"} onCheckedChange={handleStatusChange} />
                <Badge variant={formData.status === "active" ? "success" : "destructive"}>
                  {formData.status === "active" ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 flex justify-between items-center">
        <Button type="button" variant="outline" onClick={() => router.push("/users")}>
          Cancel
        </Button>

        <div className="flex items-center gap-4">
          {!formComplete && touchedFields.name && (
            <span className="text-amber-600 text-sm flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              Complete required fields
            </span>
          )}
          <Button
            type="submit"
            disabled={isSubmitting || !formComplete}
            className={`${!formComplete ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {isSubmitting ? "Saving..." : user ? "Update User" : "Create User"}
          </Button>
        </div>
      </div>
    </form>
  )
}
