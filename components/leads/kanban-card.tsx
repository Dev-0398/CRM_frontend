"use client"

import type React from "react"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, User } from "lucide-react"
import type { Lead } from "@/lib/types"

interface KanbanCardProps {
  lead: Lead
  onDragStart: (e: React.DragEvent) => void
}

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "new":
      return "bg-blue-100 text-blue-800"
    case "contacted":
      return "bg-yellow-100 text-yellow-800"
    case "qualified":
      return "bg-green-100 text-green-800"
    case "unqualified":
      return "bg-red-100 text-red-800"
    case "converted":
      return "bg-purple-100 text-purple-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export function KanbanCard({ lead, onDragStart }: KanbanCardProps) {
  return (
    <Link href={`/leads/${lead.id}`}>
      <Card
        className="cursor-grab active:cursor-grabbing hover:shadow-md transition-all"
        draggable
        onDragStart={onDragStart}
      >
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-base truncate">
              {lead.first_name} {lead.last_name}
            </h3>
            <Badge className={`ml-2 ${getStatusColor(lead.lead_status)}`}>
              {lead.lead_status}
            </Badge>
          </div>
          {lead.title && (
            <p className="text-muted-foreground text-xs mb-2 truncate">{lead.title}</p>
          )}
          <div className="space-y-1">
            <div className="flex items-center text-xs">
              <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
              <span className="truncate">{lead.email}</span>
            </div>
            {lead.mobile && (
              <div className="flex items-center text-xs">
                <User className="h-3 w-3 mr-1 text-muted-foreground" />
                <span>{lead.mobile}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
