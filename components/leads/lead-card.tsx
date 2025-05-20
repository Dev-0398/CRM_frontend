import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone } from "lucide-react"
import type { Lead } from "@/lib/types"

export function LeadCard({ lead }: { lead: Lead }) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
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

  return (
    <Link href={`/leads/${lead.id}`}>
      <Card className="h-full transition-all hover:shadow-md">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg truncate">
              {lead.first_name} {lead.last_name}
            </h3>
            <Badge className={`ml-2 ${getStatusColor(lead.lead_status)}`}>{lead.lead_status}</Badge>
          </div>

          {lead.title && <p className="text-muted-foreground text-sm mb-4 truncate">{lead.title}</p>}

          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="truncate">{lead.email}</span>
            </div>

            {lead.mobile && (
              <div className="flex items-center text-sm">
                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{lead.mobile}</span>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="bg-muted/50 px-6 py-3">
          <div className="text-xs text-muted-foreground">Source: {lead.lead_source || "Not specified"}</div>
        </CardFooter>
      </Card>
    </Link>
  )
}
