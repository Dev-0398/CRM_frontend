"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, Search, List, LayoutGrid } from "lucide-react"
import { LeadCard } from "@/components/leads/lead-card"
import type { Lead } from "@/lib/types"
import { getLeads, deleteLeadById } from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"
import Swal from "sweetalert2"

export default function LeadsPage() {
  const { toast } = useToast()
  const [leads, setLeads] = useState<Lead[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const fetchedLeads = await getLeads()
        setLeads(fetchedLeads)
      } catch (error: any) {
        console.error("Failed to fetch leads:", error)
        toast({
          title: "Error",
          description: error.message || "Failed to fetch leads",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeads()
  }, [toast])

  const handleDeleteLead = async (id: string) => {
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
        const success = await deleteLeadById(id)
        if (success) {
          setLeads(leads.filter((lead) => lead.id !== id))
          toast({
            title: "Success",
            description: "Lead deleted successfully",
            variant: "default",
          })
          Swal.fire("Deleted!", "Lead has been deleted.", "success")
        }
      } catch (error: any) {
        console.error("Failed to delete lead:", error)
        toast({
          title: "Error",
          description: error.message || "Failed to delete lead",
          variant: "destructive",
        })
      }
    }
  }

  const filteredLeads = leads.filter(
    (lead) =>
      lead.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground mt-1">Manage and track your potential customers</p>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <Tabs defaultValue="list" className="w-[200px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list" asChild>
                <Link href="/leads">
                  <List className="h-4 w-4 mr-2" />
                  List
                </Link>
              </TabsTrigger>
              <TabsTrigger value="kanban" asChild>
                <Link href="/leads/kanban">
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  Kanban
                </Link>
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Link href="/leads/create">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Lead
            </Button>
          </Link>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leads..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

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
      ) : filteredLeads.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLeads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} onDelete={() => handleDeleteLead(lead.id)} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No leads found</h3>
          <p className="text-muted-foreground mt-1">
            {searchQuery ? "Try adjusting your search query" : "Create your first lead to get started"}
          </p>
          {!searchQuery && (
            <Link href="/leads/create" className="mt-4 inline-block">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Lead
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
