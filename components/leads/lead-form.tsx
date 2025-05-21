"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, HelpCircle, AlertCircle } from "lucide-react"
import type { Lead } from "@/lib/types"
import { createLead, updateLead } from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const initialLeadState: Omit<Lead, "id"> = {
  lead_owner: "",
  first_name: "",
  last_name: "",
  title: "",
  email: "",
  mobile: "",
  lead_source: "",
  lead_status: "New",
  street: "",
  city: "",
  state: "",
  zipcode: "",
  country: "",
  descri: "",
}

const leadSources = [
  { value: "Website", label: "Website" },
  { value: "Phone Inquiry", label: "Phone Inquiry" },
  { value: "Partner Referral", label: "Partner Referral" },
  { value: "Purchased List", label: "Purchased List" },
  { value: "Social Media", label: "Social Media" },
  { value: "Trade Show", label: "Trade Show" },
  { value: "Word of Mouth", label: "Word of Mouth" },
  { value: "Email Campaign", label: "Email Campaign" },
  { value: "Other", label: "Other" },
]

const leadStatuses = [
  { value: "New", label: "New", color: "bg-blue-100 text-blue-800" },
  { value: "Contacted", label: "Contacted", color: "bg-yellow-100 text-yellow-800" },
  { value: "Qualified", label: "Qualified", color: "bg-green-100 text-green-800" },
  { value: "Unqualified", label: "Unqualified", color: "bg-red-100 text-red-800" },
  { value: "Converted", label: "Converted", color: "bg-purple-100 text-purple-800" },
]

export function LeadForm({ lead }: { lead?: Lead }) {
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState<Omit<Lead, "id">>(lead ? { ...lead } : initialLeadState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [step, setStep] = useState(1)
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({})
  const [formComplete, setFormComplete] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const checkFormCompletion = () => {
    const requiredFields = ["first_name", "last_name", "email", "lead_status"]
    const isComplete = requiredFields.every((field) => formData[field as keyof typeof formData] && !errors[field])
    setFormComplete(isComplete)
  }

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {}

    if (currentStep === 1) {
      if (!formData.first_name.trim()) {
        newErrors.first_name = "First name is required"
      }

      if (!formData.last_name.trim()) {
        newErrors.last_name = "Last name is required"
      }

      if (!formData.email.trim()) {
        newErrors.email = "Email is required"
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Email is invalid"
      }
    }

    if (currentStep === 2) {
      if (!formData.lead_status) {
        newErrors.lead_status = "Lead status is required"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1)
      window.scrollTo(0, 0)
    }
  }

  const prevStep = () => {
    setStep(step - 1)
    window.scrollTo(0, 0)
  }

  const renderAlert = (type: "warning" | "success" | "error", title: string, description: string) => {
    const icons = {
      warning: <AlertCircle className="h-5 w-5" />,
      success: <CheckCircle2 className="h-5 w-5" />,
      error: <AlertCircle className="h-5 w-5" />,
    }

    const variants = {
      warning: "bg-amber-50 border-amber-200 text-amber-800",
      success: "bg-green-50 border-green-200 text-green-800",
      error: "bg-red-50 border-red-200 text-red-800",
    }

    return (
      <Alert className={`${variants[type]} mt-4`}>
        <div className="flex items-start">
          <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
          <div className="ml-3">
            <AlertTitle className="font-medium">{title}</AlertTitle>
            <AlertDescription className="mt-1">{description}</AlertDescription>
          </div>
        </div>
      </Alert>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation() // Prevent event bubbling

    if (!validateStep(step)) {
      return
    }

    setIsSubmitting(true)

    try {
      if (lead) {
        // Update existing lead
        const response = await updateLead(lead.id, formData)
        toast({
          title: "Success",
          description: response?.msg || "Lead updated successfully",
          variant: "default",
        })
        router.push("/leads")
      } else {
        // Create new lead
        const response = await createLead(formData)
        toast({
          title: "Success",
          description: response?.msg || "Lead created successfully",
          variant: "default",
        })
        router.push("/leads")
      }
    } catch (error: any) {
      console.error("Failed to save lead:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save lead",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepIndicator = () => {
    return (
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
          >
            1
          </div>
          <div className={`w-12 h-1 ${step >= 2 ? "bg-primary" : "bg-muted"}`}></div>
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
          >
            2
          </div>
          <div className={`w-12 h-1 ${step >= 3 ? "bg-primary" : "bg-muted"}`}></div>
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
          >
            3
          </div>
        </div>
      </div>
    )
  }

  const renderStepTitle = () => {
    const titles = ["Basic Information", "Lead Details", "Additional Information"]

    return (
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold">{titles[step - 1]}</h2>
        <p className="text-muted-foreground">Step {step} of 3</p>
      </div>
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  const renderFormField = (
    name: string,
    label: string,
    placeholder: string,
    required = false,
    type = "text",
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
        <Input
          id={name}
          name={name}
          type={type}
          value={formData[name as keyof typeof formData] as string}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`transition-all ${isError ? "border-red-500 focus-visible:ring-red-500" : isValid ? "border-green-500 focus-visible:ring-green-500" : ""}`}
        />
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
    <form 
      onSubmit={handleSubmit} 
      className="max-w-3xl mx-auto"
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          e.stopPropagation()
        }
      }}
    >
      {renderStepIndicator()}
      {renderStepTitle()}

      <Card className="border-none shadow-lg">
        <CardContent className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderFormField("first_name", "First Name", "Enter first name", true, "text", "The lead's first name")}

                {renderFormField("last_name", "Last Name", "Enter last name", true, "text", "The lead's last name")}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderFormField(
                  "email",
                  "Email Address",
                  "Enter email address",
                  true,
                  "email",
                  "Primary contact email for the lead",
                )}

                {renderFormField(
                  "mobile",
                  "Mobile Number",
                  "Enter mobile number",
                  false,
                  "tel",
                  "Mobile phone number with country code",
                )}
              </div>

              {renderFormField(
                "title",
                "Job Title",
                "Enter job title",
                false,
                "text",
                "The lead's position or job title",
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="lead_owner">Lead Owner</Label>
                  <Input
                    id="lead_owner"
                    name="lead_owner"
                    value={formData.lead_owner}
                    onChange={handleChange}
                    placeholder="Who is responsible for this lead"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lead_source">Lead Source</Label>
                  <Select
                    value={formData.lead_source}
                    onValueChange={(value) => handleSelectChange("lead_source", value)}
                  >
                    <SelectTrigger id="lead_source">
                      <SelectValue placeholder="How did you acquire this lead?" />
                    </SelectTrigger>
                    <SelectContent>
                      {leadSources.map((source) => (
                        <SelectItem key={source.value} value={source.value}>
                          {source.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lead_status" className="flex items-center">
                  Lead Status <span className="text-red-500 ml-1">*</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="w-60">Current status of the lead in your sales pipeline</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Select
                  value={formData.lead_status}
                  onValueChange={(value) => handleSelectChange("lead_status", value)}
                >
                  <SelectTrigger id="lead_status" className={errors.lead_status ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select lead status" />
                  </SelectTrigger>
                  <SelectContent>
                    {leadStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        <div className="flex items-center">
                          <Badge className={`mr-2 ${status.color}`}>{status.label}</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.lead_status && (
                  <div className="flex items-center text-red-500 text-sm mt-1">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span>{errors.lead_status}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="descri">Description</Label>
                <Textarea
                  id="descri"
                  name="descri"
                  value={formData.descri}
                  onChange={handleChange}
                  placeholder="Add any notes or additional information about this lead"
                  className="min-h-[100px]"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Street address"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input 
                    id="city" 
                    name="city" 
                    value={formData.city} 
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder="City" 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input 
                    id="state" 
                    name="state" 
                    value={formData.state} 
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder="State" 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipcode">Zip Code</Label>
                  <Input
                    id="zipcode"
                    name="zipcode"
                    value={formData.zipcode}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Zip code"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Country"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-8 flex justify-between">
        {step > 1 ? (
          <Button type="button" variant="outline" onClick={prevStep}>
            Previous
          </Button>
        ) : (
          <Button type="button" variant="outline" onClick={() => router.push("/leads")}>
            Cancel
          </Button>
        )}

        {step < 3 ? (
          <Button type="button" onClick={nextStep}>
            Next
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !formComplete}
            className={`${!formComplete ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {isSubmitting ? "Saving..." : lead ? "Update Lead" : "Save Lead"}
          </Button>
        )}
      </div>

      {step === 3 && !formComplete && renderAlert(
        "warning",
        "Please complete all required fields",
        "Make sure you've filled out all required fields marked with an asterisk (*) before submitting."
      )}
    </form>
  )
}
