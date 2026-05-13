"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { WeekView } from "@/components/calendar/week-view"
import { MonthView } from "@/components/calendar/month-view"
import { WorkoutLogDialog } from "@/components/workout/log-dialog"
import { WorkoutDetailDialog } from "@/components/workout/detail-dialog"
import { getWorkoutsForAthlete, getLogsForAthlete } from "@/lib/services/workouts"
import type { Workout, WorkoutLog } from "@/types"
import { format, addWeeks, subWeeks, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns"
import { he, enUS } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"

type ViewMode = "week" | "month"

export default function SchedulePage() {
  const { user } = useAuth()
  const { t, language, isRTL } = useLanguage()
  const locale = language === "he" ? he : enUS

  const [viewMode, setViewMode] = useState<ViewMode>("week")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [logs, setLogs] = useState<WorkoutLog[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [logOpen, setLogOpen] = useState(false)

  useEffect(() => {
    loadData()
  }, [user, currentDate, viewMode])

  async function loadData() {
    if (!user) return

    setLoading(true)
    try {
      let startDate: Date, endDate: Date

      if (viewMode === "week") {
        startDate = startOfWeek(currentDate, { weekStartsOn: 0 })
        endDate = endOfWeek(currentDate, { weekStartsOn: 0 })
      } else {
        startDate = startOfMonth(currentDate)
        endDate = endOfMonth(currentDate)
      }

      const startStr = format(startDate, "yyyy-MM-dd")
      const endStr = format(endDate, "yyyy-MM-dd")

      const [workoutsData, logsData] = await Promise.all([
        getWorkoutsForAthlete(user.id, startStr, endStr),
        getLogsForAthlete(user.id, startStr, endStr),
      ])

      setWorkouts(workoutsData)
      setLogs(logsData)
    } catch (error) {
      console.error("Error loading schedule:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrev = () => {
    if (viewMode === "week") {
      setCurrentDate(subWeeks(currentDate, 1))
    } else {
      setCurrentDate(subMonths(currentDate, 1))
    }
  }

  const handleNext = () => {
    if (viewMode === "week") {
      setCurrentDate(addWeeks(currentDate, 1))
    } else {
      setCurrentDate(addMonths(currentDate, 1))
    }
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const handleWorkoutClick = (workout: Workout) => {
    setSelectedWorkout(workout)
    setDetailOpen(true)
  }

  const handleDayClick = (date: Date) => {
    // Just navigate or show empty state
    console.log("Day clicked:", date)
  }

  const handleLogWorkout = () => {
    setDetailOpen(false)
    setLogOpen(true)
  }

  const getHeaderText = () => {
    if (viewMode === "week") {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 })
      return `${format(weekStart, "MMM d", { locale })} - ${format(weekEnd, "MMM d, yyyy", { locale })}`
    } else {
      return format(currentDate, "MMMM yyyy", { locale })
    }
  }

  return (
    <div className="space-y-4 max-w-5xl">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-xl">{t("schedule")}</CardTitle>
            
            {/* View toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "week" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("week")}
              >
                {t("weekView")}
              </Button>
              <Button
                variant={viewMode === "month" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("month")}
              >
                {t("monthView")}
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={handlePrev}>
                {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="icon" onClick={handleNext}>
                {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="sm" onClick={handleToday}>
                {t("today")}
              </Button>
            </div>
            <h2 className="text-lg font-semibold">{getHeaderText()}</h2>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : viewMode === "week" ? (
            <WeekView
              currentDate={currentDate}
              workouts={workouts}
              logs={logs}
              onDayClick={handleDayClick}
              onWorkoutClick={handleWorkoutClick}
            />
          ) : (
            <MonthView
              currentDate={currentDate}
              workouts={workouts}
              logs={logs}
              onDayClick={handleDayClick}
              onWorkoutClick={handleWorkoutClick}
            />
          )}
        </CardContent>
      </Card>

      {/* Workout Detail Dialog */}
      <WorkoutDetailDialog
        workout={selectedWorkout}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onLogWorkout={handleLogWorkout}
      />

      {/* Log Dialog */}
      <WorkoutLogDialog
        workout={selectedWorkout}
        open={logOpen}
        onOpenChange={setLogOpen}
        onSuccess={loadData}
      />
    </div>
  )
}
