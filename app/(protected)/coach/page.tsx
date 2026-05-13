"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getAllAthletes } from "@/lib/services/users"
import { getLogsForAthlete, getWorkoutsForAthlete } from "@/lib/services/workouts"
import type { User, Workout, WorkoutLog } from "@/types"
import { format, startOfWeek, endOfWeek } from "date-fns"
import { Users, TrendingUp, Calendar, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import Link from "next/link"
import { safeInitial } from "@/lib/utils"

interface AthleteWithStats extends User {
  weeklyKm: number
  todayWorkout?: Workout
  todayLogged: boolean
}

export default function CoachDashboard() {
  const { user } = useAuth()
  const { t, language, isRTL } = useLanguage()
  const [athletes, setAthletes] = useState<AthleteWithStats[]>([])
  const [loading, setLoading] = useState(true)

  const today = new Date()
  const todayStr = format(today, "yyyy-MM-dd")

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const athletesList = await getAllAthletes()
      
      // Load stats for each athlete
      const weekStart = startOfWeek(today, { weekStartsOn: 0 })
      const weekEnd = endOfWeek(today, { weekStartsOn: 0 })
      const startStr = format(weekStart, "yyyy-MM-dd")
      const endStr = format(weekEnd, "yyyy-MM-dd")

      const athletesWithStats = await Promise.all(
        athletesList.map(async (athlete) => {
          const [workouts, logs] = await Promise.all([
            getWorkoutsForAthlete(athlete.id, startStr, endStr),
            getLogsForAthlete(athlete.id, startStr, endStr),
          ])

          const weeklyKm = logs.reduce((sum, log) => sum + (log.actualDistance || 0), 0)
          const todayWorkout = workouts.find(w => w.date === todayStr)
          const todayLogged = logs.some(log => log.date === todayStr)

          return {
            ...athlete,
            weeklyKm,
            todayWorkout,
            todayLogged,
          }
        })
      )

      setAthletes(athletesWithStats)
    } catch (error) {
      console.error("Error loading coach dashboard:", error)
    } finally {
      setLoading(false)
    }
  }

  // Get greeting based on time
  const getGreeting = () => {
    const hour = today.getHours()
    if (hour < 12) return language === "he" ? "בוקר טוב" : "Good morning"
    if (hour < 18) return language === "he" ? "צהריים טובים" : "Good afternoon"
    return language === "he" ? "ערב טוב" : "Good evening"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Summary stats
  const totalAthletes = athletes.length
  const totalWeeklyKm = athletes.reduce((sum, a) => sum + a.weeklyKm, 0)
  const athletesWithTodayWorkout = athletes.filter(a => a.todayWorkout).length
  const athletesLoggedToday = athletes.filter(a => a.todayLogged).length

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {getGreeting()}, {language === "he" ? "מאמן" : "Coach"}!
        </h1>
        <p className="text-muted-foreground">
          {format(today, "EEEE, MMMM d, yyyy")}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("athletes")}</p>
                <p className="text-2xl font-bold">{totalAthletes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("totalKm")} {language === "he" ? "(שבועי)" : "(Weekly)"}</p>
                <p className="text-2xl font-bold">{totalWeeklyKm.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{language === "he" ? "אימון היום" : "Training Today"}</p>
                <p className="text-2xl font-bold">{athletesWithTodayWorkout}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{language === "he" ? "דיווחו היום" : "Logged Today"}</p>
                <p className="text-2xl font-bold">{athletesLoggedToday}/{athletesWithTodayWorkout}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Athletes Grid */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t("myAthletes")}</CardTitle>
          <Link href="/coach/athletes">
            <Button variant="outline" size="sm">
              {language === "he" ? "הצג הכל" : "View All"} {isRTL ? <ChevronLeft className="h-4 w-4 mr-1" /> : <ChevronRight className="h-4 w-4 ml-1" />}
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {athletes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {athletes.map(athlete => (
                <Link key={athlete.id} href={`/coach/athletes/${athlete.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={athlete.photoURL} />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {safeInitial(athlete)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{athlete.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {athlete.weeklyKm.toFixed(1)} km {language === "he" ? "השבוע" : "this week"}
                          </p>
                        </div>
                        {athlete.todayLogged ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            {language === "he" ? "דיווח" : "Logged"}
                          </Badge>
                        ) : athlete.todayWorkout ? (
                          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                            {language === "he" ? "ממתין" : "Pending"}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                            {language === "he" ? "מנוחה" : "Rest"}
                          </Badge>
                        )}
                      </div>
                      
                      {athlete.todayWorkout && (
                        <div className="mt-3 pt-3 border-t text-sm">
                          <p className="text-muted-foreground">{t("todaysWorkout")}:</p>
                          <p className="font-medium">{athlete.todayWorkout.title}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>{language === "he" ? "אין ספורטאים עדיין" : "No athletes yet"}</p>
              <Link href="/coach/athletes">
                <Button className="mt-4">
                  {t("addAthlete")}
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/coach/workouts">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="pt-6 text-center">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="font-medium">{t("createWorkout")}</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/coach/schedule">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="pt-6 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="font-medium">{t("schedule")}</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
