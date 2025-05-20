"use client"

import type React from "react"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, Phone } from "lucide-react"
import type { Lead } from "@/lib/types"

interface KanbanCardProps {
  lead: Lead
  onDragStart: (e: React.DragEvent) => void
}

export function KanbanCard({ lead, onDragStart }: KanbanCardProps) {
  return (
    <Link href={`/leads/${lead.id}`}>
      <Card
        className="cursor-grab active:cursor-grabbing hover:shadow-md transition-all"
        draggable
        onDragStart={onDragStart}
      >
        <CardContent className="p-3 space-y-2">
          <div className="font-medium">
            {lead.first_name} {lead.last_name}
          </div>

          {lead.title && <div className="text-xs text-muted-foreground">{lead.title}</div>}

          <div className="text-xs flex items-center">
            <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
            <span className="truncate">{lead.email}</span>
          </div>

          {lead.mobile && (
            <div className="text-xs flex items-center">
              <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
              <span>{lead.mobile}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
