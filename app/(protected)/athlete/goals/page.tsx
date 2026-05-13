"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { getGoalsForAthlete, createGoal, markGoalComplete, deleteGoal } from "@/lib/services/goals"
import { getAthleteProfile } from "@/lib/services/users"
import type { Goal, AthleteProfile } from "@/types"
import { format } from "date-fns"
import { he, enUS } from "date-fns/locale"
import { Loader2, Plus, Target, Trophy, Check, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

export default function GoalsPage() {
  const { user } = useAuth()
  const { t, language } = useLanguage()
  const locale = language === "he" ? he : enUS
  
  const [goals, setGoals] = useState<Goal[]>([])
  const [profile, setProfile] = useState<AthleteProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [targetDate, setTargetDate] = useState("")
  const [targetValue, setTargetValue] = useState("")

  useEffect(() => {
    loadData()
  }, [user])

  async function loadData() {
    if (!user) return

    try {
      const [goalsData, profileData] = await Promise.all([
        getGoalsForAthlete(user.id),
        getAthleteProfile(user.id),
      ])
      setGoals(goalsData)
      setProfile(profileData)
    } catch (error) {
      console.error("Error loading goals:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateGoal = async () => {
    if (!user || !title) return

    setSaving(true)
    try {
      await createGoal({
        athleteId: user.id,
        title,
        description: description || undefined,
        targetDate: targetDate ? new Date(targetDate) : undefined,
        targetValue: targetValue || undefined,
        completed: false,
      })

      // Reset form
      setTitle("")
      setDescription("")
      setTargetDate("")
      setTargetValue("")
      setDialogOpen(false)
      
      // Reload goals
      const goalsData = await getGoalsForAthlete(user.id)
      setGoals(goalsData)
    } catch (error) {
      console.error("Error creating goal:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleMarkComplete = async (goalId: string) => {
    try {
      await markGoalComplete(goalId)
      const goalsData = await getGoalsForAthlete(user!.id)
      setGoals(goalsData)
    } catch (error) {
      console.error("Error marking goal complete:", error)
    }
  }

  const handleDeleteGoal = async (goalId: string) => {
    try {
      await deleteGoal(goalId)
      const goalsData = await getGoalsForAthlete(user!.id)
      setGoals(goalsData)
    } catch (error) {
      console.error("Error deleting goal:", error)
    }
  }

  // Helper to format pace from seconds to mm:ss
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

  const activeGoals = goals.filter(g => !g.completed)
  const completedGoals = goals.filter(g => g.completed)

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("goals")}</h1>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t("addGoal")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("addGoal")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t("goalTitle")}</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={language === "he" ? 'לדוגמה: "לרוץ מרתון מתחת ל-3 שעות"' : 'e.g., "Run sub-3 hour marathon"'}
                />
              </div>
              <div className="space-y-2">
                <Label>{language === "he" ? "תיאור" : "Description"}</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("targetDate")}</Label>
                  <Input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("targetValue")}</Label>
                  <Input
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    placeholder={language === "he" ? "2:59:59" : "2:59:59"}
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                  {t("cancel")}
                </Button>
                <Button onClick={handleCreateGoal} disabled={saving || !title} className="flex-1">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : t("save")}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Current PRs */}
      {profile?.racePRs && Object.values(profile.racePRs).some(v => v) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              {t("racePRs")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {profile.racePRs.fiveK && (
                <div className="text-center p-3 bg-secondary/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">{t("fiveK")}</p>
                  <p className="text-xl font-bold">{formatPace(profile.racePRs.fiveK)}</p>
                </div>
              )}
              {profile.racePRs.tenK && (
                <div className="text-center p-3 bg-secondary/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">{t("tenK")}</p>
                  <p className="text-xl font-bold">{formatPace(profile.racePRs.tenK)}</p>
                </div>
              )}
              {profile.racePRs.halfMarathon && (
                <div className="text-center p-3 bg-secondary/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">{t("halfMarathon")}</p>
                  <p className="text-xl font-bold">{formatPace(profile.racePRs.halfMarathon)}</p>
                </div>
              )}
              {profile.racePRs.marathon && (
                <div className="text-center p-3 bg-secondary/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">{t("marathon")}</p>
                  <p className="text-xl font-bold">{formatPace(profile.racePRs.marathon)}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Goals */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">
          {language === "he" ? "מטרות פעילות" : "Active Goals"}
        </h2>
        
        {activeGoals.length > 0 ? (
          <div className="grid gap-3">
            {activeGoals.map(goal => (
              <Card key={goal.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                        <Target className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{goal.title}</h3>
                        {goal.description && (
                          <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          {goal.targetValue && (
                            <span>{language === "he" ? "יעד:" : "Target:"} {goal.targetValue}</span>
                          )}
                          {goal.targetDate && (
                            <span>
                              {language === "he" ? "עד:" : "By:"} {format(new Date(goal.targetDate), "PP", { locale })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMarkComplete(goal.id)}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>{language === "he" ? "אין מטרות פעילות" : "No active goals"}</p>
              <p className="text-sm">{language === "he" ? "הוסף מטרה חדשה כדי להתחיל" : "Add a new goal to get started"}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">
            {language === "he" ? "מטרות שהושגו" : "Completed Goals"}
          </h2>
          
          <div className="grid gap-3">
            {completedGoals.map(goal => (
              <Card key={goal.id} className="opacity-75">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                        <Check className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold line-through text-muted-foreground">{goal.title}</h3>
                        {goal.targetValue && (
                          <p className="text-sm text-muted-foreground">{goal.targetValue}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
