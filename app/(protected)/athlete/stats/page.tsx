"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getLogsForAthlete, getWorkoutsForAthlete } from "@/lib/services/workouts"
import type { WorkoutLog, Workout, WorkoutType } from "@/types"
import { format, subWeeks, startOfWeek, endOfWeek, eachWeekOfInterval, subMonths } from "date-fns"
import { he, enUS } from "date-fns/locale"
import { Loader2, TrendingUp, Target, Calendar, Flame } from "lucide-react"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts"

const WORKOUT_COLORS_HEX: Record<WorkoutType, string> = {
  easy: "#22c55e",
  tempo: "#f97316",
  intervals: "#ef4444",
  long_run: "#3b82f6",
  rest: "#9ca3af",
  gym: "#a855f7",
  race: "#eab308",
  recovery: "#14b8a6",
}

export default function StatsPage() {
  const { user } = useAuth()
  const { t, language } = useLanguage()
  const locale = language === "he" ? he : enUS
  
  const [logs, setLogs] = useState<WorkoutLog[]>([])
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [user])

  async function loadData() {
    if (!user) return

    try {
      const today = new Date()
      const threeMonthsAgo = subMonths(today, 3)
      const startStr = format(threeMonthsAgo, "yyyy-MM-dd")
      const endStr = format(today, "yyyy-MM-dd")

      const [logsData, workoutsData] = await Promise.all([
        getLogsForAthlete(user.id, startStr, endStr),
        getWorkoutsForAthlete(user.id, startStr, endStr),
      ])

      setLogs(logsData)
      setWorkouts(workoutsData)
    } catch (error) {
      console.error("Error loading stats:", error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate weekly mileage for the last 8 weeks
  const getWeeklyMileage = () => {
    const today = new Date()
    const eightWeeksAgo = subWeeks(today, 8)
    
    const weeks = eachWeekOfInterval({
      start: eightWeeksAgo,
      end: today,
    }, { weekStartsOn: 0 })

    return weeks.map(weekStart => {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 })
      const weekLogs = logs.filter(log => {
        const logDate = new Date(log.date)
        return logDate >= weekStart && logDate <= weekEnd
      })

      const totalKm = weekLogs.reduce((sum, log) => sum + (log.actualDistance || 0), 0)

      return {
        week: format(weekStart, "MMM d", { locale }),
        km: parseFloat(totalKm.toFixed(1)),
      }
    })
  }

  // Calculate workout type breakdown
  const getWorkoutBreakdown = () => {
    const counts: Record<string, number> = {}
    
    workouts.forEach(workout => {
      const type = workout.type
      counts[type] = (counts[type] || 0) + 1
    })

    return Object.entries(counts).map(([type, count]) => ({
      name: t(type as keyof typeof t),
      value: count,
      color: WORKOUT_COLORS_HEX[type as WorkoutType] || "#666",
    }))
  }

  // Calculate totals
  const totalKm = logs.reduce((sum, log) => sum + (log.actualDistance || 0), 0)
  const totalWorkouts = logs.length
  const avgEffort = logs.length > 0 
    ? logs.reduce((sum, log) => sum + (log.effort || 0), 0) / logs.length 
    : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const weeklyData = getWeeklyMileage()
  const breakdownData = getWorkoutBreakdown()

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="text-2xl font-bold">{t("statistics")}</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("totalKm")}</p>
                <p className="text-2xl font-bold">{totalKm.toFixed(1)}</p>
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
                <p className="text-2xl font-bold">{totalWorkouts}</p>
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
                <p className="text-sm text-muted-foreground">
                  {language === "he" ? "מאמץ ממוצע" : "Avg Effort"}
                </p>
                <p className="text-2xl font-bold">{avgEffort.toFixed(1)}/10</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === "he" ? "ממוצע שבועי" : "Weekly Avg"}
                </p>
                <p className="text-2xl font-bold">
                  {(totalKm / Math.max(weeklyData.length, 1)).toFixed(1)} km
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Mileage Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{t("weeklyMileage")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis 
                  dataKey="week" 
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis 
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={{ stroke: 'hsl(var(--border))' }}
                  unit=" km"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Bar 
                  dataKey="km" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Workout Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>{t("workoutBreakdown")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {breakdownData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={breakdownData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {breakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                {language === "he" ? "אין נתונים להצגה" : "No data to display"}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
