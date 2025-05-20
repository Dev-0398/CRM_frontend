"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, List, LayoutGrid } from "lucide-react"
import { getLeads, updateLead } from "@/lib/actions"
import type { Lead } from "@/lib/types"
import { KanbanColumn } from "@/components/leads/kanban-column"
import { KanbanCard } from "@/components/leads/kanban-card"

export default function LeadsKanbanPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const fetchedLeads = await getLeads()
        setLeads(fetchedLeads)
      } catch (error) {
        console.error("Failed to fetch leads:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeads()
  }, [])

  const handleDragStart = (e: React.DragEvent, lead: Lead) => {
    e.dataTransfer.setData("application/json", JSON.stringify(lead))
  }

  const handleDrop = async (e: React.DragEvent, status: string) => {
    e.preventDefault()
    try {
      const leadData = JSON.parse(e.dataTransfer.getData("application/json")) as Lead
      if (leadData.lead_status !== status) {
        const updatedLead = await updateLead(leadData.id, { lead_status: status })
        if (updatedLead) {
          setLeads(leads.map((lead) => (lead.id === updatedLead.id ? updatedLead : lead)))
        }
      }
    } catch (error) {
      console.error("Failed to update lead status:", error)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const getLeadsByStatus = (status: string) => {
    return leads.filter((lead) => lead.lead_status === status)
  }

  const statuses = ["New", "Contacted", "Qualified", "Unqualified", "Converted"]

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground mt-1">Manage and track your potential customers</p>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <Tabs defaultValue="kanban" className="w-[200px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="kanban" asChild>
                <Link href="/leads/kanban">
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  Kanban
                </Link>
              </TabsTrigger>
              <TabsTrigger value="list" asChild>
                <Link href="/leads">
                  <List className="h-4 w-4 mr-2" />
                  List
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

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  <div className="h-5 bg-gray-200 rounded w-20"></div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-24 bg-gray-200 rounded"></div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto">
          {statuses.map((status) => (
            <KanbanColumn
              key={status}
              title={status}
              count={getLeadsByStatus(status).length}
              onDrop={(e) => handleDrop(e, status)}
              onDragOver={handleDragOver}
            >
              {getLeadsByStatus(status).map((lead) => (
                <KanbanCard key={lead.id} lead={lead} onDragStart={(e) => handleDragStart(e, lead)} />
              ))}
            </KanbanColumn>
          ))}
        </div>
      )}
    </div>
  )
}
