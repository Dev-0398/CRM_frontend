"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, FileQuestion } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md p-6 sm:p-8 space-y-6 bg-white rounded-xl shadow-lg border border-gray-100 text-center">
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="relative h-20 w-20 overflow-hidden">
            <Image 
              src="/LOGO.png" 
              alt="CRM Logo" 
              fill
              className="object-contain"
              priority
            />
          </div>
          
          <div className="flex justify-center">
            <FileQuestion className="h-16 w-16 text-[#d32525]" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800">Page Not Found</h1>
          
          <p className="text-gray-500 text-sm">
            The page you are looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="space-y-4">
          <Button 
            asChild
            className="w-full bg-[#d32525] hover:bg-[#d32525]/90 text-white h-10 font-medium shadow-sm transition-colors"
          >
            <Link href="/">
              Go to Dashboard
            </Link>
          </Button>
          
          <Button 
            asChild
            variant="outline"
            className="w-full h-10 font-medium shadow-sm transition-colors"
          >
            <Link href="/" className="flex items-center justify-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="mt-8 text-center text-xs text-gray-500">
        CRM System v1.0 © {new Date().getFullYear()}
      </div>
    </div>
  )
}