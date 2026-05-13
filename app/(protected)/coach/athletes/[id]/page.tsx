"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useLanguage } from "@/contexts/language-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WeekView } from "@/components/calendar/week-view"
import { WorkoutDetailDialog } from "@/components/workout/detail-dialog"
import { getUser, getAthleteProfile } from "@/lib/services/users"
import { getWorkoutsForAthlete, getLogsForAthlete } from "@/lib/services/workouts"
import type { User, AthleteProfile, Workout, WorkoutLog } from "@/types"
import { format, startOfWeek, endOfWeek, subMonths } from "date-fns"
import { Loader2, ArrowRight, TrendingUp, Calendar, Target, MessageCircle } from "lucide-react"
import Link from "next/link"
import { safeInitial } from "@/lib/utils"

export default function AthleteDetailPage() {
  const params = useParams()
  const athleteId = params.id as string
  const { t, language, isRTL } = useLanguage()
  
  const [athlete, setAthlete] = useState<User | null>(null)
  const [profile, setProfile] = useState<AthleteProfile | null>(null)
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [logs, setLogs] = useState<WorkoutLog[]>([])
  const [loading, setLoading] = useState(true)
  
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const today = new Date()

  useEffect(() => {
    loadData()
  }, [athleteId])

  async function loadData() {
    try {
      const weekStart = startOfWeek(today, { weekStartsOn: 0 })
      const weekEnd = endOfWeek(today, { weekStartsOn: 0 })
      const startStr = format(weekStart, "yyyy-MM-dd")
      const endStr = format(weekEnd, "yyyy-MM-dd")

      const [athleteData, profileData, workoutsData, logsData] = await Promise.all([
        getUser(athleteId),
        getAthleteProfile(athleteId),
        getWorkoutsForAthlete(athleteId, startStr, endStr),
        getLogsForAthlete(athleteId, startStr, endStr),
      ])

      setAthlete(athleteData)
      setProfile(profileData)
      setWorkouts(workoutsData)
      setLogs(logsData)
    } catch (error) {
      console.error("Error loading athlete:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleWorkoutClick = (workout: Workout) => {
    setSelectedWorkout(workout)
    setDetailOpen(true)
  }

  // Helper to format pace
  const formatPace = (seconds?: number): string => {
    if (!seconds) return "-"
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!athlete) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          {language === "he" ? "ספורטאי לא נמצא" : "Athlete not found"}
        </p>
      </div>
    )
  }

  // Stats
  const weeklyKm = logs.reduce((sum, log) => sum + (log.actualDistance || 0), 0)
  const completedWorkouts = logs.length
  const totalWorkouts = workouts.length

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back button */}
      <Link href="/coach/athletes">
        <Button variant="ghost" size="sm">
          {isRTL ? <ArrowRight className="h-4 w-4 ml-2" /> : <ArrowRight className="h-4 w-4 mr-2 rotate-180" />}
          {t("back")}
        </Button>
      </Link>

      {/* Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={athlete.photoURL} />
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                {safeInitial(athlete)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{athlete.name}</h1>
              <p className="text-muted-foreground">{athlete.email}</p>
            </div>
            <Link href={`/coach/chat/${athleteId}`}>
              <Button>
                <MessageCircle className="h-4 w-4 mr-2" />
                {t("chat")}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

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
                <p className="text-xl font-bold">{weeklyKm.toFixed(1)} km</p>
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
                <p className="text-xl font-bold">{completedWorkouts}/{totalWorkouts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Target className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === "he" ? "מאמץ ממוצע" : "Avg Effort"}
                </p>
                <p className="text-xl font-bold">
                  {logs.length > 0 
                    ? (logs.reduce((sum, l) => sum + (l.effort || 0), 0) / logs.length).toFixed(1)
                    : "-"
                  }/10
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="schedule" className="space-y-4">
        <TabsList>
          <TabsTrigger value="schedule">{t("schedule")}</TabsTrigger>
          <TabsTrigger value="profile">{t("profile")}</TabsTrigger>
        </TabsList>

        {/* Schedule Tab */}
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>{t("thisWeek")}</CardTitle>
            </CardHeader>
            <CardContent>
              <WeekView
                currentDate={today}
                workouts={workouts}
                logs={logs}
                onDayClick={() => {}}
                onWorkoutClick={handleWorkoutClick}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="space-y-4">
            {/* Personal Info */}
            {profile?.personal && Object.values(profile.personal).some(v => v) && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("personalInfo")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {profile.personal.age && (
                      <div>
                        <p className="text-sm text-muted-foreground">{t("age")}</p>
                        <p className="font-medium">{profile.personal.age}</p>
                      </div>
                    )}
                    {profile.personal.weight && (
                      <div>
                        <p className="text-sm text-muted-foreground">{t("weight")}</p>
                        <p className="font-medium">{profile.personal.weight} kg</p>
                      </div>
                    )}
                    {profile.personal.height && (
                      <div>
                        <p className="text-sm text-muted-foreground">{t("height")}</p>
                        <p className="font-medium">{profile.personal.height} cm</p>
                      </div>
                    )}
                    {profile.personal.yearsRunning && (
                      <div>
                        <p className="text-sm text-muted-foreground">{t("yearsRunning")}</p>
                        <p className="font-medium">{profile.personal.yearsRunning}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Race PRs */}
            {profile?.racePRs && Object.values(profile.racePRs).some(v => v) && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("racePRs")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {profile.racePRs.fiveK && (
                      <div className="text-center p-3 bg-secondary/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">{t("fiveK")}</p>
                        <p className="text-lg font-bold">{formatPace(profile.racePRs.fiveK)}</p>
                      </div>
                    )}
                    {profile.racePRs.tenK && (
                      <div className="text-center p-3 bg-secondary/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">{t("tenK")}</p>
                        <p className="text-lg font-bold">{formatPace(profile.racePRs.tenK)}</p>
                      </div>
                    )}
                    {profile.racePRs.halfMarathon && (
                      <div className="text-center p-3 bg-secondary/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">{t("halfMarathon")}</p>
                        <p className="text-lg font-bold">{formatPace(profile.racePRs.halfMarathon)}</p>
                      </div>
                    )}
                    {profile.racePRs.marathon && (
                      <div className="text-center p-3 bg-secondary/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">{t("marathon")}</p>
                        <p className="text-lg font-bold">{formatPace(profile.racePRs.marathon)}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Training Paces */}
            {profile?.trainingPaces && Object.values(profile.trainingPaces).some(v => v) && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("trainingPaces")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    {profile.trainingPaces.easy && (
                      <div>
                        <p className="text-sm text-muted-foreground">{t("easyPace")}</p>
                        <p className="font-medium">{formatPace(profile.trainingPaces.easy)}/km</p>
                      </div>
                    )}
                    {profile.trainingPaces.marathon && (
                      <div>
                        <p className="text-sm text-muted-foreground">{t("marathonPace")}</p>
                        <p className="font-medium">{formatPace(profile.trainingPaces.marathon)}/km</p>
                      </div>
                    )}
                    {profile.trainingPaces.threshold && (
                      <div>
                        <p className="text-sm text-muted-foreground">{t("thresholdPace")}</p>
                        <p className="font-medium">{formatPace(profile.trainingPaces.threshold)}/km</p>
                      </div>
                    )}
                    {profile.trainingPaces.interval && (
                      <div>
                        <p className="text-sm text-muted-foreground">{t("intervalPace")}</p>
                        <p className="font-medium">{formatPace(profile.trainingPaces.interval)}/km</p>
                      </div>
                    )}
                    {profile.trainingPaces.repetition && (
                      <div>
                        <p className="text-sm text-muted-foreground">{t("repetitionPace")}</p>
                        <p className="font-medium">{formatPace(profile.trainingPaces.repetition)}/km</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* No profile data */}
            {(!profile || !Object.values({ ...profile.personal, ...profile.racePRs, ...profile.trainingPaces }).some(v => v)) && (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <p>{language === "he" ? "הספורטאי עדיין לא מילא פרופיל" : "Athlete has not filled out their profile yet"}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

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
