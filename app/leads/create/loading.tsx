import { Skeleton } from "@/components/ui/skeleton"

export default function CreateLeadLoading() {
  return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-10 w-24 mb-6" />

      <div className="flex flex-col items-start gap-4 mb-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />

          <div className="border rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    </div>
  )
}
