"use client"

import { useLanguage } from "@/contexts/language-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Workout, WorkoutType } from "@/types"
import { WORKOUT_COLORS_LIGHT } from "@/types"
import { Clock, MapPin, Zap } from "lucide-react"

interface WorkoutCardProps {
  workout: Workout
  showDate?: boolean
  onClick?: () => void
  className?: string
}

export function WorkoutCard({ workout, showDate, onClick, className }: WorkoutCardProps) {
  const { t, language } = useLanguage()
  
  const workoutTypeLabel = t(workout.type as keyof typeof t)
  const colorClass = WORKOUT_COLORS_LIGHT[workout.type]

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString(language === "he" ? "he-IL" : "en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Card 
      className={cn(
        "cursor-pointer hover:shadow-md transition-shadow border-l-4",
        colorClass,
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{workout.title}</CardTitle>
          <Badge variant="secondary" className={cn("capitalize", colorClass)}>
            {workoutTypeLabel}
          </Badge>
        </div>
        {showDate && (
          <p className="text-sm text-muted-foreground">{formatDate(workout.date)}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {workout.description && (
          <p className="text-sm text-muted-foreground">{workout.description}</p>
        )}

        {/* Morning Session */}
        {workout.morningSession && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4 text-orange-500" />
              {t("morningSession")}
            </div>
            <div className="ps-6 text-sm space-y-1">
              {workout.morningSession.distance && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{workout.morningSession.distance} km</span>
                </div>
              )}
              {workout.morningSession.targetPace && (
                <div className="flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{workout.morningSession.targetPace}</span>
                </div>
              )}
              {workout.morningSession.mainSet && (
                <p className="text-muted-foreground">{workout.morningSession.mainSet}</p>
              )}
            </div>
          </div>
        )}

        {/* Evening Session */}
        {workout.eveningSession && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4 text-blue-500" />
              {t("eveningSession")}
            </div>
            <div className="ps-6 text-sm space-y-1">
              {workout.eveningSession.distance && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{workout.eveningSession.distance} km</span>
                </div>
              )}
              {workout.eveningSession.targetPace && (
                <div className="flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{workout.eveningSession.targetPace}</span>
                </div>
              )}
              {workout.eveningSession.mainSet && (
                <p className="text-muted-foreground">{workout.eveningSession.mainSet}</p>
              )}
            </div>
          </div>
        )}

        {/* Single session (no morning/evening split) */}
        {!workout.morningSession && !workout.eveningSession && (
          <div className="text-sm text-muted-foreground">
            {workout.type === "rest" ? t("restDay") : t("noWorkoutToday")}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
