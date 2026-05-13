"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { createWorkoutLog } from "@/lib/services/workouts"
import type { Workout } from "@/types"
import { Loader2 } from "lucide-react"

interface WorkoutLogDialogProps {
  workout: Workout | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function WorkoutLogDialog({ workout, open, onOpenChange, onSuccess }: WorkoutLogDialogProps) {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  
  const [actualDistance, setActualDistance] = useState("")
  const [actualPace, setActualPace] = useState("")
  const [effort, setEffort] = useState([5])
  const [notes, setNotes] = useState("")
  const [morningCompleted, setMorningCompleted] = useState(false)
  const [eveningCompleted, setEveningCompleted] = useState(false)

  const hasDoubleSessions = workout?.morningSession && workout?.eveningSession

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !workout) return

    setLoading(true)
    try {
      await createWorkoutLog({
        athleteId: user.id,
        workoutId: workout.id,
        date: workout.date,
        actualDistance: actualDistance ? parseFloat(actualDistance) : undefined,
        actualPace: actualPace || undefined,
        effort: effort[0],
        notes: notes || undefined,
        morningCompleted: hasDoubleSessions ? morningCompleted : true,
        eveningCompleted: hasDoubleSessions ? eveningCompleted : true,
      })

      // Reset form
      setActualDistance("")
      setActualPace("")
      setEffort([5])
      setNotes("")
      setMorningCompleted(false)
      setEveningCompleted(false)

      onOpenChange(false)
      onSuccess()
    } catch (error) {
      console.error("Error logging workout:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!workout) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("logWorkout")}: {workout.title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Double session checkboxes */}
          {hasDoubleSessions && (
            <div className="space-y-3 p-3 bg-secondary/50 rounded-lg">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="morning"
                  checked={morningCompleted}
                  onCheckedChange={(checked) => setMorningCompleted(!!checked)}
                />
                <Label htmlFor="morning" className="cursor-pointer">
                  {t("morningSession")} {t("completed")}
                </Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="evening"
                  checked={eveningCompleted}
                  onCheckedChange={(checked) => setEveningCompleted(!!checked)}
                />
                <Label htmlFor="evening" className="cursor-pointer">
                  {t("eveningSession")} {t("completed")}
                </Label>
              </div>
            </div>
          )}

          {/* Distance */}
          <div className="space-y-2">
            <Label htmlFor="distance">{t("actualDistance")}</Label>
            <Input
              id="distance"
              type="number"
              step="0.1"
              placeholder="0.0"
              value={actualDistance}
              onChange={(e) => setActualDistance(e.target.value)}
            />
          </div>

          {/* Pace */}
          <div className="space-y-2">
            <Label htmlFor="pace">{t("actualPace")}</Label>
            <Input
              id="pace"
              type="text"
              placeholder="5:30/km"
              value={actualPace}
              onChange={(e) => setActualPace(e.target.value)}
            />
          </div>

          {/* Effort */}
          <div className="space-y-2">
            <Label>{t("effortLevel")}: {effort[0]}</Label>
            <Slider
              value={effort}
              onValueChange={setEffort}
              min={1}
              max={10}
              step={1}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 - Easy</span>
              <span>10 - Max</span>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">{t("comments")}</Label>
            <Textarea
              id="notes"
              placeholder={t("comments")}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("submit")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
