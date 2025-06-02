"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { LeadForm } from "@/components/leads/lead-form"
import { getLeadById } from "@/lib/actions"
import type { Lead } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"

export default function EditLeadPage() {
  const params = useParams()
  const router = useRouter()
  const [lead, setLead] = useState<Lead | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLead = async () => {
      try {
        if (typeof params.id === "string") {
          const fetchedLead = await getLeadById(params.id)
          if (fetchedLead) {
            setLead(fetchedLead)
          } else {
            setError("Lead not found")
          }
        }
      } catch (error) {
        console.error("Failed to fetch lead:", error)
        setError("Failed to load lead data. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchLead()
  }, [params.id])

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-24 mb-6" />
        <div className="flex flex-col items-start gap-4 mb-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-10 w-full" />
          <div className="space-y-4">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
          <div className="flex justify-end gap-4">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !lead) {
    return (
      <div className="p-6 space-y-6">
        <div className="mb-6">
          <Link href="/leads">
            <Button variant="ghost" className="pl-0 hover:bg-black hover:text-white">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Leads 
            </Button>
          </Link>
        </div>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">Error</h3>
          <p className="text-muted-foreground mt-1">{error || "Lead not found"}</p>
          <Link href="/leads" className="mt-4 inline-block">
            <Button>Return to Leads</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <Link href={`/leads/${lead.id}`}>
          <Button variant="ghost" className="pl-0 hover:bg-black hover:text-white">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Lead Details
          </Button>
        </Link>
      </div>
      <div className="flex flex-col items-start gap-4 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Edit Lead</h1>
        <p className="text-muted-foreground">
          Update information for {lead.first_name} {lead.last_name}
        </p>
      </div>
      <LeadForm lead={lead} />
    </div>
  )
}
