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
import configs from "@/config"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

interface ClockEntry {
  in_time: string
  out_time: string | null
}

interface AttendanceRecord {
  id: number
  date: string
  clock_in: string
  clock_out: string | null
  entries: ClockEntry[]
  total_time?: string
}

function getTodayKey() {
  return format(new Date(), "yyyy-MM-dd")
}

async function fetchAttendance(date: string): Promise<AttendanceRecord | null> {
  try {
    const response = await fetch(`${configs.API_BASE_URL}/attendance/api/attendance/${date}`)
    if (!response.ok) return null
    return await response.json()
  } catch (error) {
    console.error("Error fetching attendance:", error)
    return null
  }
}

async function clockIn() {
  const now = new Date();
  const date = format(now, "yyyy-MM-dd");
  const in_time = now.toISOString();
  try {
    const response = await fetch(`${configs.API_BASE_URL}/attendance/api/attendance/clock-in`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        date,
        in_time,
      }),
    });
    if (!response.ok) throw new Error("Failed to clock in");
    return await response.json();
  } catch (error) {
    console.error("Error clocking in:", error);
    throw error;
  }
}

async function clockOut(date: string) {
  const out_time = new Date().toISOString();
  try {
    const response = await fetch(`${configs.API_BASE_URL}/attendance/api/attendance/clock-out/${date}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        out_time,
      }),
    });
    if (!response.ok) throw new Error("Failed to clock out");
    return await response.json();
  } catch (error) {
    console.error("Error clocking out:", error);
    throw error;
  }
}

function getWeekDays(date: Date) {
  const start = startOfWeek(date, { weekStartsOn: 0 })
  const today = new Date()
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
    .filter(date => !isAfter(date, today))
    .sort((a, b) => b.getTime() - a.getTime())
}

// Helper to calculate total worked seconds for today
function getAccumulatedSeconds(entries: { in_time: string; out_time: string | null }[]): number {
  let total = 0;
  entries.forEach((e) => {
    if (e.in_time && e.out_time) {
      total += (new Date(e.out_time).getTime() - new Date(e.in_time).getTime()) / 1000;
    }
  });
  return total;
}

// Helper to convert datetime-local value to ISO string
function toISOStringFromLocal(val: string) {
  if (!val) return "";
  const date = new Date(val);
  return date.toISOString();
}

// API helpers for edit and delete
async function updateAttendance(id: number, data: Partial<AttendanceRecord>) {
  try {
    const response = await fetch(`${configs.API_BASE_URL}/attendance/api/attendance/id/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update attendance");
    return await response.json();
  } catch (error) {
    console.error("Error updating attendance:", error);
    throw error;
  }
}

async function deleteAttendance(id: number) {
  try {
    const response = await fetch(`${configs.API_BASE_URL}/attendance/api/attendance/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete attendance");
    return true;
  } catch (error) {
    console.error("Error deleting attendance:", error);
    throw error;
  }
}

// Helper to format ISO string for datetime-local input
function toLocalDatetimeInputValue(dateStr: string | null) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<Record<string, AttendanceRecord>>({})
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [timerStart, setTimerStart] = useState<Date | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [accumulatedSeconds, setAccumulatedSeconds] = useState(0)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [actionMenuIdx, setActionMenuIdx] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [lastClockOut, setLastClockOut] = useState<Date | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [currentDay, setCurrentDay] = useState(format(new Date(), "yyyy-MM-dd"));
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<AttendanceRecord | null>(null);
  const [editClockIn, setEditClockIn] = useState("");
  const [editClockOut, setEditClockOut] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // Load attendance for the week
  useEffect(() => {
    const loadWeekAttendance = async () => {
      setLoading(true)
      try {
        const weekDays = getWeekDays(selectedDate)
        const attendancePromises = weekDays.map(date => 
          fetchAttendance(format(date, "yyyy-MM-dd"))
        )
        const results = await Promise.all(attendancePromises)
        const attendanceMap: Record<string, AttendanceRecord> = {}
        results.forEach((record, index) => {
          if (record) {
            attendanceMap[format(weekDays[index], "yyyy-MM-dd")] = record
          }
        })
        setAttendance(attendanceMap)
      } catch (error) {
        console.error("Error loading attendance:", error)
      } finally {
        setLoading(false)
      }
    }
    loadWeekAttendance()
  }, [selectedDate])

  // Update accumulatedSeconds whenever attendance changes
  useEffect(() => {
    const todayKey = getTodayKey();
    const todayRecord = attendance[todayKey];
    if (todayRecord?.entries?.length > 0) {
      setAccumulatedSeconds(getAccumulatedSeconds(todayRecord.entries));
    } else {
      setAccumulatedSeconds(0);
    }
  }, [attendance]);

  // Timer effect: update elapsed time only when running
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isTimerRunning && timerStart) {
      interval = setInterval(() => {
        setElapsed(accumulatedSeconds + Math.floor((Date.now() - timerStart.getTime()) / 1000));
      }, 1000);
    } else {
      setElapsed(accumulatedSeconds);
    }
    return () => interval && clearInterval(interval);
  }, [isTimerRunning, timerStart, accumulatedSeconds]);

  // Only reset timer if the day changes
  useEffect(() => {
    if (timerStart && !isSameDay(timerStart, new Date())) {
      setIsTimerRunning(false);
      setTimerStart(null);
      setElapsed(0);
      setLastClockOut(null);
      setAccumulatedSeconds(0);
    }
  }, [timerStart]);

  // Effect to detect day change and reset timer
  useEffect(() => {
    const interval = setInterval(() => {
      const todayStr = format(new Date(), "yyyy-MM-dd");
      if (todayStr !== currentDay) {
        // Day has changed, reset timer and accumulated time
        setCurrentDay(todayStr);
        setIsTimerRunning(false);
        setTimerStart(null);
        setElapsed(0);
        setAccumulatedSeconds(0);
        setLastClockOut(null);
      }
    }, 60 * 1000); // Check every minute
    return () => clearInterval(interval);
  }, [currentDay]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  const todayKey = getTodayKey();
  const todayRecord = attendance[todayKey];
  const lastEntry = todayRecord?.entries?.[0];
  const canClockIn = !lastEntry || (lastEntry.in_time && lastEntry.out_time); // Only allow if no open session

  const handleTimer = async () => {
    setErrorMsg(null);
    const todayKey = getTodayKey();
    try {
      let updatedRecord: AttendanceRecord | undefined;
      if (!isTimerRunning) {
        // Clock in: call API
        await clockIn();
        // Fetch updated attendance for today
        const record = await fetchAttendance(todayKey);
        if (record) {
          updatedRecord = record;
        }
      } else {
        // Clock out: call API
        await clockOut(todayKey);
        // Fetch updated attendance for today
        const record = await fetchAttendance(todayKey);
        if (record) {
          updatedRecord = record;
        }
      }
      if (updatedRecord) {
        setAttendance(prev => ({
          ...prev,
          [todayKey]: updatedRecord as AttendanceRecord
        }));
        // Find the latest open entry (out_time: null)
        const openEntry = updatedRecord.entries.find(e => e.in_time && !e.out_time);
        const accSecs = getAccumulatedSeconds(updatedRecord.entries);
        setAccumulatedSeconds(accSecs);
        if (openEntry) {
          // There is an open session, resume timer from in_time
          setTimerStart(new Date(openEntry.in_time));
          setIsTimerRunning(true);
          setElapsed(accSecs + Math.floor((Date.now() - new Date(openEntry.in_time).getTime()) / 1000));
          setLastClockOut(null);
        } else {
          // No open session, pause timer
          setIsTimerRunning(false);
          setTimerStart(null);
          setElapsed(accSecs);
          // Set lastClockOut to the most recent out_time if available
          const lastEntryWithOut = updatedRecord.entries.find(e => e.out_time);
          setLastClockOut(lastEntryWithOut ? new Date(lastEntryWithOut.out_time as string) : null);
        }
      }
    } catch (error: any) {
      let msg = "An error occurred.";
      if (error?.message) {
        msg = error.message;
      }
      setErrorMsg(msg);
    }
  };

  // Week navigation
  const weekDays = getWeekDays(selectedDate)
  const today = new Date()

  const goToPrevWeek = () => setSelectedDate(addDays(weekDays[weekDays.length - 1], -7))
  const goToNextWeek = () => {
    const nextWeekStart = addDays(weekDays[0], 7)
    if (isAfter(nextWeekStart, today)) return
    setSelectedDate(nextWeekStart)
  }

  function getSummary(dateObj: Date): {
    firstIn: string;
    lastOut: string;
    total: string;
    payable: string;
    status: string;
    statusColor: string;
    shift: string;
    regularization: string;
  } {
    const dateStr = format(dateObj, "yyyy-MM-dd")
    const dayRecord = attendance[dateStr]
    const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6
    let firstIn = "-", lastOut = "-", total = "-", status = "Absent", statusColor = "bg-red-100 text-red-700", payable = "", shift = "General"
    let totalSeconds = 0

    if (dayRecord?.entries?.length > 0) {
      // Sort entries by in_time ascending
      const sortedEntries = [...dayRecord.entries].sort(
        (a, b) => new Date(a.in_time).getTime() - new Date(b.in_time).getTime()
      );
      const firstEntry = sortedEntries[0];
      const lastEntry = sortedEntries[sortedEntries.length - 1];

      firstIn = firstEntry.in_time ? format(parseISO(firstEntry.in_time), "hh:mm a") : "-";
      lastOut = lastEntry.out_time ? format(parseISO(lastEntry.out_time), "hh:mm a") : "-";

      // Use total_time from API if available
      if (dayRecord.total_time) {
        total = dayRecord.total_time
      } else {
        sortedEntries.forEach((e) => {
          if (e.in_time && e.out_time) {
            totalSeconds += (new Date(e.out_time).getTime() - new Date(e.in_time).getTime()) / 1000
          } else if (e.in_time && !e.out_time && isSameDay(parseISO(e.in_time), dateObj) && isToday(dateObj)) {
            totalSeconds += (Date.now() - new Date(e.in_time).getTime()) / 1000
          }
        })
        total = totalSeconds > 0 ? formatTime(Math.floor(totalSeconds)) : "-"
      }
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

    return { firstIn, lastOut, total, payable, status, statusColor, shift, regularization: "" }
  }

  const handleEditAttendance = (record: AttendanceRecord) => {
    setEditRecord(record);
    setEditClockIn(record.clock_in || "");
    setEditClockOut(record.clock_out || "");
    setEditModalOpen(true);
  };

  const handleEditModalSubmit = async () => {
    if (!editRecord) return;
    setEditLoading(true);
    try {
      // Only send clock_in and clock_out in PATCH
      const updated = await updateAttendance(editRecord.id, {
        clock_in: toISOStringFromLocal(editClockIn),
        clock_out: toISOStringFromLocal(editClockOut),
      });
      // Use the response to update the table
      setAttendance(prev => ({ ...prev, [updated.date]: updated }));
      setEditModalOpen(false);
      setEditRecord(null);
    } catch (error: any) {
      setErrorMsg(error.message || "Failed to update attendance");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteAttendance = async (record: AttendanceRecord) => {
    if (confirm("Are you sure you want to delete this attendance record?")) {
      try {
        await deleteAttendance(record.id);
        // Remove from state
        setAttendance(prev => {
          const newState = { ...prev };
          delete newState[record.date];
          return newState;
        });
      } catch (error: any) {
        setErrorMsg(error.message || "Failed to delete attendance");
      }
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Edit Attendance Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Attendance</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <label className="block text-sm font-medium">
              Clock In
              <span className="ml-2 text-xs text-gray-500">
                (Current: {editRecord?.clock_in ? format(new Date(editRecord.clock_in), "hh:mm a") : "-"})
              </span>
            </label>
            <input
              type="datetime-local"
              className="border rounded px-2 py-1 w-full"
              value={toLocalDatetimeInputValue(editClockIn)}
              onChange={e => setEditClockIn(e.target.value)}
            />
            <label className="block text-sm font-medium">
              Clock Out
              <span className="ml-2 text-xs text-gray-500">
                (Current: {editRecord?.clock_out ? format(new Date(editRecord.clock_out), "hh:mm a") : "-"})
              </span>
            </label>
            <input
              type="datetime-local"
              className="border rounded px-2 py-1 w-full"
              value={toLocalDatetimeInputValue(editClockOut)}
              onChange={e => setEditClockOut(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)} disabled={editLoading}>Cancel</Button>
            <Button onClick={handleEditModalSubmit} disabled={editLoading}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
                  {formatTime(Math.floor(elapsed))}
                </span>
              </div>
              {errorMsg && (
                <div className="text-red-600 text-sm mb-2">{errorMsg}</div>
              )}
              <Button
                onClick={handleTimer}
                variant={isTimerRunning ? "destructive" : "default"}
                size="lg"
                className="rounded-full px-8 text-lg shadow-md transition-all duration-200"
                disabled={loading || (!isTimerRunning && !canClockIn)}
              >
                {loading
                  ? "Loading..."
                  : isTimerRunning
                  ? "Clock Out"
                  : "Clock In"}
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
            <Button variant="outline" onClick={goToPrevWeek} disabled={loading}>&lt;</Button>
            <span className="font-medium text-gray-700">
              {format(weekDays[weekDays.length - 1], "dd-MMM-yyyy")} - {format(weekDays[0], "dd-MMM-yyyy")}
            </span>
            <Button variant="outline" onClick={goToNextWeek} disabled={isAfter(addDays(weekDays[0], 7), today) || loading}>&gt;</Button>
            <input
              type="date"
              value={format(selectedDate, "yyyy-MM-dd")}
              max={getTodayKey()}
              onChange={e => setSelectedDate(new Date(e.target.value))}
              className="border rounded px-2 py-1 ml-4"
              disabled={loading}
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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    Loading attendance records...
                  </TableCell>
                </TableRow>
              ) : (
                weekDays.map((dateObj, idx) => {
                  const summary = getSummary(dateObj)
                  return (
                    <TableRow key={format(dateObj, "yyyy-MM-dd")}>
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
                              onClick={() => { setActionMenuIdx(null); handleEditAttendance(attendance[format(dateObj, "yyyy-MM-dd")]); }}
                            >
                              <Edit2 size={16} className="mr-2" /> Edit
                            </button>
                            <button
                              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                              onClick={() => { setActionMenuIdx(null); handleDeleteAttendance(attendance[format(dateObj, "yyyy-MM-dd")]); }}
                            >
                              <Trash2 size={16} className="mr-2" /> Delete
                            </button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 