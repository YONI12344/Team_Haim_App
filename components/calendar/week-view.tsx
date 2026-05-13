"use client"

import { useLanguage } from "@/contexts/language-context"
import { cn } from "@/lib/utils"
import type { Workout, WorkoutLog } from "@/types"
import { WORKOUT_COLORS_LIGHT } from "@/types"
import { format, addDays, startOfWeek, isSameDay, isToday } from "date-fns"
import { he, enUS } from "date-fns/locale"
import { Check } from "lucide-react"

interface WeekViewProps {
  currentDate: Date
  workouts: Workout[]
  logs: WorkoutLog[]
  onDayClick: (date: Date) => void
  onWorkoutClick: (workout: Workout) => void
}

export function WeekView({ currentDate, workouts, logs, onDayClick, onWorkoutClick }: WeekViewProps) {
  const { t, language, isRTL } = useLanguage()
  const locale = language === "he" ? he : enUS

  // Get start of week (Sunday)
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  // Day names
  const dayNames = [
    t("sunday"), t("monday"), t("tuesday"), t("wednesday"),
    t("thursday"), t("friday"), t("saturday")
  ]

  // Get workout for a specific date
  const getWorkoutForDate = (date: Date): Workout | undefined => {
    const dateStr = format(date, "yyyy-MM-dd")
    return workouts.find(w => w.date === dateStr)
  }

  // Check if workout is logged
  const isWorkoutLogged = (workout: Workout): boolean => {
    return logs.some(log => log.workoutId === workout.id)
  }

  // Calculate total planned km for the week
  const totalPlannedKm = workouts.reduce((total, w) => {
    const morningKm = w.morningSession?.distance || 0
    const eveningKm = w.eveningSession?.distance || 0
    return total + morningKm + eveningKm
  }, 0)

  // Calculate completed km
  const completedKm = logs.reduce((total, log) => total + (log.actualDistance || 0), 0)

  return (
    <div className="space-y-4">
      {/* Week summary */}
      <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
        <div>
          <p className="text-sm text-muted-foreground">{t("totalKm")}</p>
          <p className="text-2xl font-bold">{totalPlannedKm.toFixed(1)} km</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">{t("completed")}</p>
          <p className="text-2xl font-bold text-green-600">{completedKm.toFixed(1)} km</p>
        </div>
        <div className="text-end">
          <p className="text-sm text-muted-foreground">{language === "he" ? "נותר" : "Remaining"}</p>
          <p className="text-2xl font-bold text-orange-600">
            {Math.max(0, totalPlannedKm - completedKm).toFixed(1)} km
          </p>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Day headers */}
        {dayNames.map((day, i) => (
          <div 
            key={i} 
            className="text-center text-sm font-medium text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}

        {/* Day cells */}
        {days.map((day, i) => {
          const workout = getWorkoutForDate(day)
          const isWorkoutDay = !!workout
          const logged = workout ? isWorkoutLogged(workout) : false
          const today = isToday(day)

          return (
            <div
              key={i}
              onClick={() => workout ? onWorkoutClick(workout) : onDayClick(day)}
              className={cn(
                "min-h-[120px] p-2 rounded-lg border cursor-pointer transition-colors",
                today ? "border-primary ring-2 ring-primary/20" : "border-border",
                isWorkoutDay ? "hover:shadow-md" : "hover:bg-secondary/50"
              )}
            >
              {/* Date number */}
              <div className={cn(
                "flex items-center justify-between mb-2",
                today && "text-primary font-bold"
              )}>
                <span className="text-sm">{format(day, "d")}</span>
                {logged && (
                  <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>

              {/* Workout block */}
              {workout && (
                <div className={cn(
                  "p-2 rounded text-xs border-s-2",
                  WORKOUT_COLORS_LIGHT[workout.type]
                )}>
                  <p className="font-medium truncate">{workout.title}</p>
                  {(workout.morningSession?.distance || workout.eveningSession?.distance) && (
                    <p className="text-muted-foreground mt-1">
                      {((workout.morningSession?.distance || 0) + (workout.eveningSession?.distance || 0)).toFixed(1)} km
                    </p>
                  )}
                  {workout.morningSession && workout.eveningSession && (
                    <p className="text-muted-foreground">
                      {language === "he" ? "אימון כפול" : "Double"}
                    </p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
