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
import { useAuth } from "@/lib/auth-context"
import { getLeads } from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"

export default function LeadsPage() {
  const { toast } = useToast()
  const [leads, setLeads] = useState<Lead[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const { user, isLoading: authLoading, getAuthHeaders } = useAuth()

  useEffect(() => {
    const fetchLeads = async () => {
      // Wait for auth to load and ensure we have valid auth headers
      if (authLoading) return
      
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
        console.log("user from lads",user?.token, user?.tokenType);
        
        const fetchedLeads = await getLeads(user?.token, user?.tokenType)
        setLeads(fetchedLeads)
      } catch (error: any) {
        console.error("Failed to fetch leads:", error)
        
        // Handle 401 specifically
        if (error.message?.includes('401') || error.message?.includes('Authentication')) {
          toast({
            title: "Authentication Error",
            description: "Your session has expired. Please login again.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Error",
            description: error.message || "Failed to fetch leads",
            variant: "destructive",
          })
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeads()
  }, [toast, authLoading, getAuthHeaders])

  const filteredLeads = leads.filter((lead) =>
    (lead.full_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (lead.email?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (lead.role?.toLowerCase() || "").includes(searchQuery.toLowerCase())
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
            <LeadCard key={lead.id} lead={lead} />
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
