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
import { CheckCircle2, HelpCircle, AlertCircle, Mail, ShieldCheck, Users } from "lucide-react"
import type { User } from "@/lib/types"
import { createUser, updateUser, getUsers } from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"

const initialUserState: Omit<User, "id" | "created_at"> = {
  full_name: "",
  name: "",
  email: "",
  role: "User",
  is_active: true,
  reporting_to: "",
}

const roleOptions = [
  { value: "Admin", label: "Admin", description: "Full access to all features" },
  { value: "Manager", label: "Manager", description: "Can manage leads and users" },
  { value: "User", label: "User", description: "Basic access to leads only" },
]

interface FormData extends Omit<User, "id" | "created_at" | "token" | "tokenType"> {
  full_name: string;
  name: string;
  password?: string;
}

interface UserFormProps {
  user?: User;
  onSuccess?: () => void;
}

export default function UserForm({ user, onSuccess }: UserFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { getAuthHeaders, isLoading: authLoading } = useAuth();
  const [formData, setFormData] = useState<FormData>(
    user
      ? {
          full_name: user.full_name,
          name: user.full_name,
          email: user.email,
          role: user.role,
          is_active: user.is_active,
          reporting_to: user.reporting_to || "",
        }
      : { ...initialUserState, password: "" },
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({})
  const [formComplete, setFormComplete] = useState(false)
  const [reportingToOptions, setReportingToOptions] = useState<
    { value: string; label: string; role: string;}[]
  >([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (authLoading) return; // Wait for auth to load
    const fetchUsers = async () => {
      try {
        const authHeaders = getAuthHeaders();
        if (!authHeaders) {
          throw new Error("Authentication required. Please login again.");
        }
        const users = await getUsers(authHeaders.token, authHeaders.tokenType);
        // Filter users based on selected role
        let filteredUsers = users;
        if (formData.role === "Manager") {
          filteredUsers = users.filter(user => user.role === "Admin");
        } else if (formData.role === "User") {
          filteredUsers = users.filter(user => user.role === "Admin" || user.role === "Manager");
        }
        const options = filteredUsers.map((user) => ({
          value: user.id.toString(),
          label: user.full_name,
          role: user.role
        }));
        setReportingToOptions(options);
        setUsers(filteredUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Error",
          description: "Failed to fetch users for reporting to",
          variant: "destructive",
        });
      }
    };
    if (formData.role !== "Admin") {
      fetchUsers();
    }
  }, [formData.role, authLoading]);
  useEffect(() => {
    // Check if form is complete on initial load (for edit mode)
    if (user) {
      checkFormCompletion()
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => {
      if (name === "full_name") {
        return { ...prev, full_name: value, name: value };
      }
      return { ...prev, [name]: value };
    })
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

    // Clear reporting_to field if role is Admin
    if (name === "role" && value === "Admin") {
      setFormData((prev) => ({ ...prev, reporting_to: "" }))
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.reporting_to
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
    
    // Add reporting_to as required field if role is not Admin
    if (formData.role !== "Admin") {
      requiredFields.push("reporting_to")
    }
    
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

    // Reporting to is required for non-Admin roles
    if (formData.role !== "Admin" && !formData.reporting_to?.trim()) {
      newErrors.reporting_to = "Reporting to is required for this role"
    }

    // Only require password for new user creation
    if (!user && (!formData.password || formData.password.length < 6)) {
      newErrors.password = "Password must be at least 6 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key as keyof FormData] = true;
      return acc;
    }, {} as Record<keyof FormData, boolean>);
    setTouchedFields(allTouched);

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const userData = {
        ...formData,
        full_name: formData.full_name,
        name: formData.full_name,
        reporting_to: formData.role === "Admin" ? "0" : String(formData.reporting_to),
        password: formData.password || undefined,
      };
      console.log("Creating user with data:", userData);

      const authHeaders = getAuthHeaders();
      if (!authHeaders) {
        setErrors((prev) => ({
          ...prev,
          submit: "Authentication required. Please login again.",
        }));
        setIsSubmitting(false);
        return;
      }

      if (user) {
        await updateUser(user.id, userData, authHeaders.token, authHeaders.tokenType);
      } else {
        await createUser(userData, authHeaders.token, authHeaders.tokenType);
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/users");
      }
    } catch (error) {
      console.error("Error saving user:", error);
      setErrors((prev) => ({
        ...prev,
        submit: "Failed to save user. Please try again.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

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

            {/* Reporting To field - only show if role is not Admin */}
            {formData.role !== "Admin" && (
              <div className="space-y-2">
                <Label htmlFor="reporting_to" className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Reporting To <span className="text-red-500 ml-1">*</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="w-60">Select the person this user reports to</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  {touchedFields.reporting_to && !errors.reporting_to && formData.reporting_to && (
                    <CheckCircle2 className="h-4 w-4 ml-auto text-green-500" />
                  )}
                </Label>
                <Select 
                  value={formData.reporting_to} 
                  onValueChange={(value) => handleSelectChange("reporting_to", value)}
                >
                  <SelectTrigger
                    id="reporting_to"
                    className={`${
                      errors.reporting_to 
                        ? "border-red-500" 
                        : touchedFields.reporting_to && formData.reporting_to 
                          ? "border-green-500" 
                          : ""
                    }`}
                  >
                    <SelectValue placeholder="Select supervisor/manager" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportingToOptions.map((person) => (
                      <SelectItem key={person.value} value={person.value}>
                        <div className="flex flex-col">
                          <span>{person.label}</span>
                          <span className="text-xs text-muted-foreground">
                            {person.role}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.reporting_to && (
                  <div className="flex items-center text-red-500 text-sm mt-1">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span>{errors.reporting_to}</span>
                  </div>
                )}
              </div>
            )}

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