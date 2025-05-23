"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, Edit, Trash2, Mail, Phone } from "lucide-react"
import type { Lead } from "@/lib/types"
import { getLeadById, deleteLeadById } from "@/lib/actions"
import Swal from "sweetalert2"

export default function LeadDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [lead, setLead] = useState<Lead | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchLead = async () => {
      try {
        if (typeof params.id === "string") {
          const fetchedLead = await getLeadById(params.id)
          setLead(fetchedLead)
        }
      } catch (error) {
        console.error("Failed to fetch lead:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLead()
  }, [params.id])

  const handleDelete = async () => {
    if (!lead) return

    const result = await Swal.fire({
      title: "Are you sure you want to delete this lead?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel"
    })

    if (result.isConfirmed) {
      try {
        await deleteLeadById(lead.id)
        Swal.fire("Deleted!", "Lead has been deleted.", "success")
        router.push("/leads")
      } catch (error) {
        console.error("Failed to delete lead:", error)
        Swal.fire("Error", "Failed to delete lead", "error")
      }
    }
  }

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

  if (!lead) {
    return (
      <div className="p-6 space-y-6">
        <div className="mb-6">
          <Link href="/leads">
            <Button variant="ghost" className="pl-0">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Leads
            </Button>
          </Link>
        </div>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">Lead not found</h3>
          <p className="text-muted-foreground mt-1">The lead you are looking for does not exist or has been deleted</p>
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
        <Link href="/leads">
          <Button variant="ghost" className="pl-0">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Leads
          </Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {lead.first_name} {lead.last_name}
          </h1>
          <p className="text-muted-foreground mt-1">{lead.title}</p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Link href={`/leads/${lead.id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Tabs defaultValue="details">
            <TabsList className="mb-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="address">Address</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Lead Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Lead Owner</dt>
                      <dd className="mt-1">{lead.lead_owner}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Lead Source</dt>
                      <dd className="mt-1">{lead.lead_source}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Lead Status</dt>
                      <dd className="mt-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {lead.lead_status}
                        </span>
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground flex items-center">
                        <Mail className="mr-2 h-4 w-4" />
                        Email
                      </dt>
                      <dd className="mt-1">
                        <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">
                          {lead.email}
                        </a>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground flex items-center">
                        <Phone className="mr-2 h-4 w-4" />
                        Mobile
                      </dt>
                      <dd className="mt-1">
                        <a href={`tel:${lead.mobile}`} className="text-blue-600 hover:underline">
                          {lead.mobile}
                        </a>
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              {lead.descr && (
                <Card>
                  <CardHeader>
                    <CardTitle>Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-line">{lead.descr}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="address" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Address Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-4">
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Street</dt>
                      <dd className="mt-1">{lead.street || "—"}</dd>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">City</dt>
                        <dd className="mt-1">{lead.city || "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">State</dt>
                        <dd className="mt-1">{lead.state || "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Zip Code</dt>
                        <dd className="mt-1">{lead.zipcode || "—"}</dd>
                      </div>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Country</dt>
                      <dd className="mt-1">{lead.country || "—"}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline">
                <Mail className="mr-2 h-4 w-4" />
                Send Email
              </Button>
              <Button className="w-full" variant="outline">
                <Phone className="mr-2 h-4 w-4" />
                Call Lead
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
