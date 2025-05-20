import { Skeleton } from "@/components/ui/skeleton"

export default function EditLeadLoading() {
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
