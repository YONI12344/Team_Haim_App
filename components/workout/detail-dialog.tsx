"use client"

import { useLanguage } from "@/contexts/language-context"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { Workout } from "@/types"
import { WORKOUT_COLORS_LIGHT } from "@/types"
import { cn } from "@/lib/utils"
import { Clock, MapPin, Zap, FileText } from "lucide-react"

interface WorkoutDetailDialogProps {
  workout: Workout | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onLogWorkout?: () => void
  showLogButton?: boolean
}

export function WorkoutDetailDialog({ 
  workout, 
  open, 
  onOpenChange, 
  onLogWorkout,
  showLogButton = true 
}: WorkoutDetailDialogProps) {
  const { t, language } = useLanguage()

  if (!workout) return null

  const workoutTypeLabel = t(workout.type as keyof typeof t)
  const colorClass = WORKOUT_COLORS_LIGHT[workout.type]

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString(language === "he" ? "he-IL" : "en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const SessionDisplay = ({ 
    session, 
    title 
  }: { 
    session: NonNullable<Workout["morningSession"]>
    title: string 
  }) => (
    <div className="space-y-3 p-4 bg-secondary/30 rounded-lg">
      <h4 className="font-semibold flex items-center gap-2">
        <Clock className="h-4 w-4" />
        {title}
      </h4>
      
      <div className="grid grid-cols-2 gap-3 text-sm">
        {session.distance && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{session.distance} km</span>
          </div>
        )}
        {session.targetPace && (
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-muted-foreground" />
            <span>{session.targetPace}</span>
          </div>
        )}
      </div>

      {session.warmup && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">
            {t("warmup")}
          </p>
          <p className="text-sm">{session.warmup}</p>
        </div>
      )}

      {session.mainSet && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">
            {t("mainSet")}
          </p>
          <p className="text-sm">{session.mainSet}</p>
        </div>
      )}

      {session.cooldown && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">
            {t("cooldown")}
          </p>
          <p className="text-sm">{session.cooldown}</p>
        </div>
      )}

      {session.notes && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">
            {t("notes")}
          </p>
          <p className="text-sm text-muted-foreground">{session.notes}</p>
        </div>
      )}
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">{workout.title}</DialogTitle>
            <Badge className={cn("capitalize", colorClass)}>
              {workoutTypeLabel}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{formatDate(workout.date)}</p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Description */}
          {workout.description && (
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <p className="text-sm">{workout.description}</p>
            </div>
          )}

          <Separator />

          {/* Sessions */}
          {workout.morningSession && (
            <SessionDisplay 
              session={workout.morningSession} 
              title={t("morningSession")} 
            />
          )}

          {workout.eveningSession && (
            <SessionDisplay 
              session={workout.eveningSession} 
              title={t("eveningSession")} 
            />
          )}

          {/* No sessions */}
          {!workout.morningSession && !workout.eveningSession && (
            <div className="text-center py-6 text-muted-foreground">
              {workout.type === "rest" ? t("restDay") : (
                language === "he" ? "אין פרטים נוספים" : "No additional details"
              )}
            </div>
          )}

          {/* Actions */}
          {showLogButton && onLogWorkout && (
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                {t("close")}
              </Button>
              <Button onClick={onLogWorkout} className="flex-1">
                {t("logWorkout")}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
