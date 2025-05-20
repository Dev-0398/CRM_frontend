import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface KanbanColumnProps {
  title: string
  count: number
  children: React.ReactNode
  onDrop: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
}

export function KanbanColumn({ title, count, children, onDrop, onDragOver }: KanbanColumnProps) {
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
    <Card className="h-[calc(100vh-12rem)] flex flex-col">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center">
            <span>{title}</span>
            <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${getStatusColor(title)}`}>{count}</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-2 space-y-2" onDrop={onDrop} onDragOver={onDragOver}>
        {children}
      </CardContent>
    </Card>
  )
}
