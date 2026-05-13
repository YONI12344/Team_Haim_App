"use client"

import { useLanguage } from "@/contexts/language-context"
import { cn } from "@/lib/utils"
import type { Workout, WorkoutLog } from "@/types"
import { WORKOUT_COLORS } from "@/types"
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameMonth, 
  isSameDay,
  isToday 
} from "date-fns"
import { Check } from "lucide-react"

interface MonthViewProps {
  currentDate: Date
  workouts: Workout[]
  logs: WorkoutLog[]
  onDayClick: (date: Date) => void
  onWorkoutClick: (workout: Workout) => void
}

export function MonthView({ currentDate, workouts, logs, onDayClick, onWorkoutClick }: MonthViewProps) {
  const { t, language } = useLanguage()

  // Get all days to display (including overflow from prev/next months)
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

  // Generate all days
  const days: Date[] = []
  let day = calendarStart
  while (day <= calendarEnd) {
    days.push(day)
    day = addDays(day, 1)
  }

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

  return (
    <div className="space-y-2">
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1">
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
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          const workout = getWorkoutForDate(day)
          const inCurrentMonth = isSameMonth(day, currentDate)
          const logged = workout ? isWorkoutLogged(workout) : false
          const today = isToday(day)

          return (
            <div
              key={i}
              onClick={() => workout ? onWorkoutClick(workout) : onDayClick(day)}
              className={cn(
                "min-h-[80px] p-1.5 rounded border cursor-pointer transition-colors",
                !inCurrentMonth && "opacity-40",
                today ? "border-primary ring-1 ring-primary/20" : "border-border",
                workout ? "hover:shadow-md" : "hover:bg-secondary/30"
              )}
            >
              {/* Date number */}
              <div className={cn(
                "flex items-center justify-between text-xs mb-1",
                today && "text-primary font-bold"
              )}>
                <span>{format(day, "d")}</span>
                {logged && (
                  <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="h-2.5 w-2.5 text-white" />
                  </div>
                )}
              </div>

              {/* Workout indicator */}
              {workout && (
                <div className={cn(
                  "h-2 rounded-full",
                  WORKOUT_COLORS[workout.type]
                )} 
                title={workout.title}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
