import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { LeadForm } from "@/components/leads/lead-form"

export default function CreateLeadPage() {
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
      <div className="flex flex-col items-start gap-4 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Create New Lead</h1>
        <p className="text-muted-foreground">Add a new potential customer to your CRM system</p>
      </div>
      <LeadForm />
    </div>
  )
}
