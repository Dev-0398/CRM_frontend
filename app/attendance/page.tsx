"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format, parseISO, isSameDay, startOfWeek, addDays, isAfter, isBefore, isToday } from "date-fns"
import { MoreVertical, Edit2, Trash2 } from "lucide-react"

interface ClockEntry {
  in: string // ISO string
  out?: string // ISO string
}

interface AttendanceDay {
  date: string // yyyy-MM-dd
  entries: ClockEntry[]
}

function getTodayKey() {
  return format(new Date(), "yyyy-MM-dd")
}

function loadAttendance(): AttendanceDay[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem("attendance-records")
  return data ? JSON.parse(data) : []
}

function saveAttendance(records: AttendanceDay[]) {
  localStorage.setItem("attendance-records", JSON.stringify(records))
}

function getWeekDays(date: Date) {
  const start = startOfWeek(date, { weekStartsOn: 0 })
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<AttendanceDay[]>([])
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [timerStart, setTimerStart] = useState<Date | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [actionMenuIdx, setActionMenuIdx] = useState<number | null>(null)

  // Load attendance from localStorage
  useEffect(() => {
    setAttendance(loadAttendance())
  }, [])

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerRunning && timerStart) {
      interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - timerStart.getTime()) / 1000))
      }, 1000)
    }
    return () => interval && clearInterval(interval)
  }, [isTimerRunning, timerStart])

  // Resume timer if last entry is open for today
  useEffect(() => {
    const todayKey = getTodayKey()
    const todayRecord = attendance.find((d) => d.date === todayKey)
    if (todayRecord && todayRecord.entries.length > 0) {
      const last = todayRecord.entries[0]
      if (last && last.in && !last.out) {
        setIsTimerRunning(true)
        setTimerStart(new Date(last.in))
        setElapsed(Math.floor((Date.now() - new Date(last.in).getTime()) / 1000))
      } else {
        setIsTimerRunning(false)
        setTimerStart(null)
        setElapsed(0)
      }
    } else {
      setIsTimerRunning(false)
      setTimerStart(null)
      setElapsed(0)
    }
  }, [attendance])

  // Format seconds to HH:mm:ss
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  // Clock in/out logic (for today only)
  const handleTimer = () => {
    const todayKey = getTodayKey()
    let updated = [...attendance]
    let todayRecord = updated.find((d) => d.date === todayKey)
    if (!isTimerRunning) {
      // Clock in
      const now = new Date().toISOString()
      if (!todayRecord) {
        todayRecord = { date: todayKey, entries: [] }
        updated = [todayRecord, ...updated]
      }
      todayRecord.entries.unshift({ in: now })
      setTimerStart(new Date(now))
      setElapsed(0)
      setIsTimerRunning(true)
    } else {
      // Clock out
      const now = new Date().toISOString()
      if (todayRecord && todayRecord.entries.length > 0) {
        todayRecord.entries[0].out = now
      }
      setIsTimerRunning(false)
      setTimerStart(null)
      setElapsed(0)
    }
    setAttendance(updated)
    saveAttendance(updated)
  }

  // Week navigation
  const weekDays = getWeekDays(selectedDate)
  const today = new Date()

  const goToPrevWeek = () => setSelectedDate(addDays(weekDays[0], -7))
  const goToNextWeek = () => {
    const nextWeekStart = addDays(weekDays[0], 7)
    if (isAfter(nextWeekStart, today)) return
    setSelectedDate(nextWeekStart)
  }

  // Table summary for a day
  function getSummary(dateObj: Date) {
    const dateStr = format(dateObj, "yyyy-MM-dd")
    const dayRecord = attendance.find((d) => d.date === dateStr)
    const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6
    let firstIn = "-", lastOut = "-", total = "-", status = "Absent", statusColor = "bg-red-100 text-red-700", payable = "", shift = "General"
    let totalSeconds = 0
    if (dayRecord && dayRecord.entries.length > 0) {
      firstIn = dayRecord.entries[dayRecord.entries.length - 1].in ? format(parseISO(dayRecord.entries[dayRecord.entries.length - 1].in), "hh:mm a") : "-"
      lastOut = dayRecord.entries[0].out ? format(parseISO(dayRecord.entries[0].out!), "hh:mm a") : "-"
      dayRecord.entries.forEach((e) => {
        if (e.in && e.out) {
          totalSeconds += (new Date(e.out).getTime() - new Date(e.in).getTime()) / 1000
        } else if (e.in && !e.out && isSameDay(parseISO(e.in), dateObj) && isToday(dateObj)) {
          totalSeconds += (Date.now() - new Date(e.in).getTime()) / 1000
        }
      })
      total = totalSeconds > 0 ? formatTime(Math.floor(totalSeconds)) : "-"
      status = "Present"
      statusColor = "bg-green-100 text-green-700"
    }
    if (isWeekend) {
      status = "Weekend"
      statusColor = "bg-yellow-100 text-yellow-700"
      payable = "08:00"
    }
    if (!isWeekend && status === "Absent") {
      payable = ""
    }
    // No future dates
    if (isAfter(dateObj, today)) {
      firstIn = lastOut = total = status = payable = shift = "-"
      statusColor = "bg-gray-100 text-gray-400"
    }
    return { firstIn, lastOut, total, payable, status, statusColor, shift, regularization: "" }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Timer for today only */}
      {weekDays.some(d => isToday(d)) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Attendance Timer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-4">
              <span className="text-gray-500 text-sm mb-2">Current Session</span>
              <div className="bg-gray-100 rounded-xl shadow-inner px-8 py-4 mb-4 flex items-center justify-center">
                <span className="text-5xl md:text-6xl font-mono font-extrabold tracking-widest text-gray-800 drop-shadow timer-digits">
                  {isTimerRunning ? formatTime(elapsed) : "00:00:00"}
                </span>
              </div>
              <Button
                onClick={handleTimer}
                variant={isTimerRunning ? "destructive" : "default"}
                size="lg"
                className="rounded-full px-8 text-lg shadow-md transition-all duration-200"
              >
                {isTimerRunning ? "Clock Out" : "Clock In"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Week Navigation & Calendar */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" onClick={goToPrevWeek}>&lt;</Button>
            <span className="font-medium text-gray-700">
              {format(weekDays[0], "dd-MMM-yyyy")} - {format(weekDays[6], "dd-MMM-yyyy")}
            </span>
            <Button variant="outline" onClick={goToNextWeek} disabled={isAfter(addDays(weekDays[0], 7), today)}>&gt;</Button>
            <input
              type="date"
              value={format(selectedDate, "yyyy-MM-dd")}
              max={getTodayKey()}
              onChange={e => setSelectedDate(new Date(e.target.value))}
              className="border rounded px-2 py-1 ml-4"
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>First In</TableHead>
                <TableHead>Last Out</TableHead>
                <TableHead>Total Hours</TableHead>
                <TableHead>Payable Hours</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Shift(s)</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {weekDays.map((dateObj, idx) => {
                const summary = getSummary(dateObj)
                return (
                  <TableRow key={format(dateObj, "yyyy-MM-dd")}
                    className={isAfter(dateObj, today) ? "bg-gray-50" : ""}
                  >
                    <TableCell>{format(dateObj, "EEE, dd-MMM-yyyy")}</TableCell>
                    <TableCell>{summary.firstIn}</TableCell>
                    <TableCell>{summary.lastOut}</TableCell>
                    <TableCell>{summary.total}</TableCell>
                    <TableCell>{summary.payable}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${summary.statusColor}`}>{summary.status}</span>
                    </TableCell>
                    <TableCell>{summary.shift}</TableCell>
                    <TableCell className="text-right relative">
                      <button
                        className="p-2 rounded-full hover:bg-gray-100"
                        onClick={() => setActionMenuIdx(actionMenuIdx === idx ? null : idx)}
                        aria-label="Actions"
                      >
                        <MoreVertical size={20} />
                      </button>
                      {actionMenuIdx === idx && (
                        <div className="absolute right-0 mt-2 w-32 bg-white border rounded-lg shadow-lg z-10">
                          <button
                            className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-50"
                            onClick={() => { setActionMenuIdx(null); /* handle edit here */ }}
                          >
                            <Edit2 size={16} className="mr-2" /> Edit
                          </button>
                          <button
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                            onClick={() => { setActionMenuIdx(null); /* handle delete here */ }}
                          >
                            <Trash2 size={16} className="mr-2" /> Delete
                          </button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 