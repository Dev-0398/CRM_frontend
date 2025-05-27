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
import type { User } from "@/lib/types"
import { createUser, updateUser } from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"

const initialUserState: Omit<User, "id" | "created_at"> = {
  full_name: "",
  email: "",
  role: "User",
  is_active: true,
}

const roleOptions = [
  { value: "Admin", label: "Admin", description: "Full access to all features" },
  { value: "Manager", label: "Manager", description: "Can manage leads and users" },
  { value: "User", label: "User", description: "Basic access to leads only" },
]

export function UserForm({ user }: { user?: User }) {
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState<Omit<User, "id" | "created_at"> & { password?: string }>(
    user
      ? {
          full_name: user.full_name,
          email: user.email,
          role: user.role,
          is_active: user.is_active,
        }
      : { ...initialUserState, password: "" },
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
    setFormData((prev) => ({ ...prev, is_active: checked }))
    setTouchedFields((prev) => ({ ...prev, is_active: true }))

    // Check if form is complete
    checkFormCompletion()
  }

  const checkFormCompletion = () => {
    const requiredFields = ["full_name", "email", "role"]
    const isComplete = requiredFields.every((field) => formData[field as keyof typeof formData] && !errors[field])
    setFormComplete(isComplete)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.full_name.trim()) {
      newErrors.full_name = "Name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (!formData.role) {
      newErrors.role = "Role is required"
    }

    // Only require password for new user creation
    if (!user && (!formData.password || formData.password.length < 6)) {
      newErrors.password = "Password must be at least 6 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      // Mark all fields as touched to show errors
      const allFields = { full_name: true, email: true, role: true, is_active: true }
      if (!user) allFields["password"] = true
      setTouchedFields(allFields)
      return
    }

    setIsSubmitting(true)

    try {
      if (user) {
        // Update existing user (exclude password)
        const { password, ...editPayload } = formData;
        const response = await updateUser(user.id, editPayload);
        toast({
          title: "Success",
          description: response.msg || "User updated successfully",
          variant: "default",
        })
        router.push("/users")
      } else {
        // Create new user (include password)
        const { password, ...userPayload } = formData
        const response = await createUser({ ...userPayload, password: password || "" })
        toast({
          title: "Success",
          description: response.msg || "User created successfully",
          variant: "default",
        })
        router.push("/users")
      }
    } catch (error: any) {
      console.error("Failed to save user:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save user",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getInitials = (name: string) => {
    if (!name.trim()) return "";

    const words = name.trim().split(/\s+/);
    if (words.length > 1) {
      return (
        words[0][0].toUpperCase() + words[words.length - 1][0].toUpperCase()
      );
    }
    return words[0][0].toUpperCase();
  };
  
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
              <AvatarFallback>{formData.full_name ? getInitials(formData.full_name) : "U"}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-medium">{formData.full_name || "New User"}</h3>
              <p className="text-sm text-muted-foreground">{formData.email || "Enter user details below"}</p>
            </div>
          </div>

          <div className="space-y-4">
            {renderFormField(
              "full_name",
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

            {/* Password field only for new user creation */}
            {!user && renderFormField(
              "password",
              "Password",
              "Enter password",
              true,
              "password",
              <ShieldCheck className="h-4 w-4" />,
              "Password must be at least 6 characters",
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
                  <Label htmlFor="is_active" className="text-base">
                    User Status
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {formData.is_active ? "User can access the system" : "User access is disabled"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="is_active" checked={formData.is_active} onCheckedChange={handleStatusChange} />
                <Badge variant={formData.is_active ? "success" : "destructive"}>
                  {formData.is_active ? "Active" : "Inactive"}
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
          {!formComplete && touchedFields.full_name && (
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
