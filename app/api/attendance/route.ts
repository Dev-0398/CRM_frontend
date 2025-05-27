import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// In-memory storage for attendance records (replace with database in production)
let attendanceRecords: any[] = []

export async function GET() {
  return NextResponse.json({ records: attendanceRecords })
}

export async function POST(request: NextRequest) {
  try {
    const record = await request.json()
    attendanceRecords = [record, ...attendanceRecords]
    return NextResponse.json({ success: true, record })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save attendance record" },
      { status: 500 }
    )
  }
} 