"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { WorkoutCard } from "@/components/workout/workout-card"
import { WorkoutLogDialog } from "@/components/workout/log-dialog"
import { getWorkoutsForAthlete, getLogsForAthlete } from "@/lib/services/workouts"
import type { Workout, WorkoutLog } from "@/types"
import { format, startOfWeek, endOfWeek, addDays } from "date-fns"
import { Calendar, TrendingUp, Flame, Loader2 } from "lucide-react"
import Link from "next/link"

export default function AthleteDashboard() {
  const { user } = useAuth()
  const { t, language } = useLanguage()
  const [todayWorkout, setTodayWorkout] = useState<Workout | null>(null)
  const [weekWorkouts, setWeekWorkouts] = useState<Workout[]>([])
  const [weekLogs, setWeekLogs] = useState<WorkoutLog[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null)
  const [logDialogOpen, setLogDialogOpen] = useState(false)

  const today = new Date()
  const todayStr = format(today, "yyyy-MM-dd")

  useEffect(() => {
    async function loadData() {
      if (!user) return

      try {
        const weekStart = startOfWeek(today, { weekStartsOn: 0 })
        const weekEnd = endOfWeek(today, { weekStartsOn: 0 })
        const startStr = format(weekStart, "yyyy-MM-dd")
        const endStr = format(weekEnd, "yyyy-MM-dd")

        const [workouts, logs] = await Promise.all([
          getWorkoutsForAthlete(user.id, startStr, endStr),
          getLogsForAthlete(user.id, startStr, endStr),
        ])

        setWeekWorkouts(workouts)
        setWeekLogs(logs)

        // Find today's workout
        const todayW = workouts.find(w => w.date === todayStr)
        setTodayWorkout(todayW || null)
      } catch (error) {
        console.error("Error loading dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user, todayStr])

  // Calculate stats
  const totalKmThisWeek = weekWorkouts.reduce((total, w) => {
    return total + (w.morningSession?.distance || 0) + (w.eveningSession?.distance || 0)
  }, 0)

  const completedKmThisWeek = weekLogs.reduce((total, log) => {
    return total + (log.actualDistance || 0)
  }, 0)

  const workoutsCompletedThisWeek = weekLogs.length

  // Format greeting based on time
  const getGreeting = () => {
    const hour = today.getHours()
    if (hour < 12) return language === "he" ? "בוקר טוב" : "Good morning"
    if (hour < 18) return language === "he" ? "צהריים טובים" : "Good afternoon"
    return language === "he" ? "ערב טוב" : "Good evening"
  }

  const handleLogWorkout = (workout: Workout) => {
    setSelectedWorkout(workout)
    setLogDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {getGreeting()}, {user?.name?.split(" ")[0]}!
        </h1>
        <p className="text-muted-foreground">
          {format(today, "EEEE, MMMM d, yyyy", { locale: language === "he" ? undefined : undefined })}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("thisWeek")}</p>
                <p className="text-xl font-bold">{completedKmThisWeek.toFixed(1)} km</p>
                <p className="text-xs text-muted-foreground">/ {totalKmThisWeek.toFixed(1)} km</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("workoutsCompleted")}</p>
                <p className="text-xl font-bold">{workoutsCompletedThisWeek}</p>
                <p className="text-xs text-muted-foreground">/ {weekWorkouts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Flame className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("currentStreak")}</p>
                <p className="text-xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">{t("days")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Workout */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">{t("todaysWorkout")}</CardTitle>
          <Link href="/athlete/schedule">
            <Button variant="ghost" size="sm">
              {t("schedule")} &rarr;
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {todayWorkout ? (
            <div className="space-y-4">
              <WorkoutCard 
                workout={todayWorkout} 
                onClick={() => handleLogWorkout(todayWorkout)}
              />
              <Button 
                className="w-full"
                onClick={() => handleLogWorkout(todayWorkout)}
              >
                {t("logWorkout")}
              </Button>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>{t("noWorkoutToday")}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Workouts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {language === "he" ? "אימונים קרובים" : "Upcoming Workouts"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {weekWorkouts
              .filter(w => w.date > todayStr)
              .slice(0, 3)
              .map(workout => (
                <WorkoutCard 
                  key={workout.id} 
                  workout={workout} 
                  showDate
                  onClick={() => handleLogWorkout(workout)}
                  className="shadow-none"
                />
              ))}
            {weekWorkouts.filter(w => w.date > todayStr).length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                {language === "he" ? "אין אימונים נוספים השבוע" : "No more workouts this week"}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Log Dialog */}
      <WorkoutLogDialog
        workout={selectedWorkout}
        open={logDialogOpen}
        onOpenChange={setLogDialogOpen}
        onSuccess={() => {
          // Refresh data
          window.location.reload()
        }}
      />
    </div>
  )
}
