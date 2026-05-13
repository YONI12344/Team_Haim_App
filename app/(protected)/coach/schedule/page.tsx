"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { WorkoutDetailDialog } from "@/components/workout/detail-dialog"
import { getAllAthletes } from "@/lib/services/users"
import { getAllWorkouts, getWorkoutsForAthlete, getLogsForAthlete } from "@/lib/services/workouts"
import type { User, Workout, WorkoutLog } from "@/types"
import { WORKOUT_COLORS_LIGHT } from "@/types"
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  addWeeks, 
  subWeeks, 
  addDays,
  isToday
} from "date-fns"
import { he, enUS } from "date-fns/locale"
import { Loader2, ChevronLeft, ChevronRight, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default function CoachSchedulePage() {
  const { user } = useAuth()
  const { t, language, isRTL } = useLanguage()
  const locale = language === "he" ? he : enUS
  
  const [athletes, setAthletes] = useState<User[]>([])
  const [selectedAthlete, setSelectedAthlete] = useState<string>("all")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [logs, setLogs] = useState<WorkoutLog[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  useEffect(() => {
    loadAthletes()
  }, [])

  useEffect(() => {
    loadSchedule()
  }, [selectedAthlete, currentDate])

  async function loadAthletes() {
    try {
      const athletesList = await getAllAthletes()
      setAthletes(athletesList)
    } catch (error) {
      console.error("Error loading athletes:", error)
    }
  }

  async function loadSchedule() {
    setLoading(true)
    try {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 })
      const startStr = format(weekStart, "yyyy-MM-dd")
      const endStr = format(weekEnd, "yyyy-MM-dd")

      if (selectedAthlete === "all") {
        const workoutsData = await getAllWorkouts(startStr, endStr)
        setWorkouts(workoutsData)
        setLogs([])
      } else {
        const [workoutsData, logsData] = await Promise.all([
          getWorkoutsForAthlete(selectedAthlete, startStr, endStr),
          getLogsForAthlete(selectedAthlete, startStr, endStr),
        ])
        setWorkouts(workoutsData)
        setLogs(logsData)
      }
    } catch (error) {
      console.error("Error loading schedule:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrev = () => setCurrentDate(subWeeks(currentDate, 1))
  const handleNext = () => setCurrentDate(addWeeks(currentDate, 1))
  const handleToday = () => setCurrentDate(new Date())

  const handleWorkoutClick = (workout: Workout) => {
    setSelectedWorkout(workout)
    setDetailOpen(true)
  }

  // Get week days
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const dayNames = [
    t("sunday"), t("monday"), t("tuesday"), t("wednesday"),
    t("thursday"), t("friday"), t("saturday")
  ]

  // Get workouts for a specific date
  const getWorkoutsForDate = (date: Date): Workout[] => {
    const dateStr = format(date, "yyyy-MM-dd")
    return workouts.filter(w => w.date === dateStr)
  }

  // Check if workout is logged
  const isWorkoutLogged = (workout: Workout): boolean => {
    return logs.some(log => log.workoutId === workout.id)
  }

  // Get assignment label
  const getAssignmentLabel = (workout: Workout): string => {
    if (workout.assignedTo.includes("team")) {
      return t("entireTeam")
    }
    const count = workout.assignedTo.length
    return `${count} ${language === "he" ? "ספורטאים" : "athletes"}`
  }

  const headerText = `${format(weekStart, "MMM d", { locale })} - ${format(endOfWeek(currentDate, { weekStartsOn: 0 }), "MMM d, yyyy", { locale })}`

  return (
    <div className="space-y-4 max-w-6xl">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-xl">{t("schedule")}</CardTitle>
            
            {/* Athlete filter */}
            <Select value={selectedAthlete} onValueChange={setSelectedAthlete}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {language === "he" ? "כל האימונים" : "All Workouts"}
                </SelectItem>
                {athletes.map(athlete => (
                  <SelectItem key={athlete.id} value={athlete.id}>
                    {athlete.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <h2 className="text-lg font-semibold">{headerText}</h2>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-2">
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-2">
                {dayNames.map((day, i) => (
                  <div 
                    key={i} 
                    className="text-center text-sm font-medium text-muted-foreground py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-2">
                {days.map((day, i) => {
                  const dayWorkouts = getWorkoutsForDate(day)
                  const today = isToday(day)

                  return (
                    <div
                      key={i}
                      className={cn(
                        "min-h-[150px] p-2 rounded-lg border",
                        today ? "border-primary ring-2 ring-primary/20" : "border-border"
                      )}
                    >
                      {/* Date number */}
                      <div className={cn(
                        "text-sm mb-2",
                        today && "text-primary font-bold"
                      )}>
                        {format(day, "d")}
                      </div>

                      {/* Workouts */}
                      <div className="space-y-1.5">
                        {dayWorkouts.map(workout => {
                          const logged = selectedAthlete !== "all" && isWorkoutLogged(workout)
                          
                          return (
                            <div
                              key={workout.id}
                              onClick={() => handleWorkoutClick(workout)}
                              className={cn(
                                "p-2 rounded text-xs border-s-2 cursor-pointer hover:shadow-sm transition-shadow",
                                WORKOUT_COLORS_LIGHT[workout.type]
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <p className="font-medium truncate">{workout.title}</p>
                                {logged && (
                                  <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center shrink-0 ms-1">
                                    <Check className="h-2.5 w-2.5 text-white" />
                                  </div>
                                )}
                              </div>
                              {selectedAthlete === "all" && (
                                <p className="text-muted-foreground truncate mt-0.5">
                                  {getAssignmentLabel(workout)}
                                </p>
                              )}
                              {(workout.morningSession?.distance || workout.eveningSession?.distance) && (
                                <p className="text-muted-foreground mt-0.5">
                                  {((workout.morningSession?.distance || 0) + (workout.eveningSession?.distance || 0)).toFixed(1)} km
                                </p>
                              )}
                            </div>
                          )
                        })}

                        {dayWorkouts.length === 0 && (
                          <p className="text-xs text-muted-foreground text-center py-2">-</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick link to create workout */}
      <div className="text-center">
        <Link href="/coach/workouts">
          <Button variant="outline">
            {t("createWorkout")}
          </Button>
        </Link>
      </div>

      {/* Workout Detail Dialog */}
      <WorkoutDetailDialog
        workout={selectedWorkout}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        showLogButton={false}
      />
    </div>
  )
}
