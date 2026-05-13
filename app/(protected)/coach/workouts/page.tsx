"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getAllAthletes } from "@/lib/services/users"
import { createWorkout, getAllWorkouts, deleteWorkout } from "@/lib/services/workouts"
import type { User, Workout, WorkoutType, WorkoutSession } from "@/types"
import { WORKOUT_COLORS_LIGHT } from "@/types"
import { format, addDays } from "date-fns"
import { Loader2, Plus, Trash2, Calendar, Users } from "lucide-react"
import { cn } from "@/lib/utils"

const WORKOUT_TYPES: WorkoutType[] = [
  "easy", "tempo", "intervals", "long_run", "rest", "gym", "race", "recovery"
]

export default function WorkoutsPage() {
  const { user } = useAuth()
  const { t, language } = useLanguage()
  
  const [athletes, setAthletes] = useState<User[]>([])
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form state
  const [title, setTitle] = useState("")
  const [workoutType, setWorkoutType] = useState<WorkoutType>("easy")
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [description, setDescription] = useState("")
  const [assignToTeam, setAssignToTeam] = useState(true)
  const [selectedAthletes, setSelectedAthletes] = useState<string[]>([])

  // Session toggles
  const [hasMorning, setHasMorning] = useState(true)
  const [hasEvening, setHasEvening] = useState(false)

  // Morning session
  const [morningDistance, setMorningDistance] = useState("")
  const [morningPace, setMorningPace] = useState("")
  const [morningWarmup, setMorningWarmup] = useState("")
  const [morningMainSet, setMorningMainSet] = useState("")
  const [morningCooldown, setMorningCooldown] = useState("")
  const [morningNotes, setMorningNotes] = useState("")

  // Evening session
  const [eveningDistance, setEveningDistance] = useState("")
  const [eveningPace, setEveningPace] = useState("")
  const [eveningWarmup, setEveningWarmup] = useState("")
  const [eveningMainSet, setEveningMainSet] = useState("")
  const [eveningCooldown, setEveningCooldown] = useState("")
  const [eveningNotes, setEveningNotes] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const today = new Date()
      const startStr = format(today, "yyyy-MM-dd")
      const endStr = format(addDays(today, 30), "yyyy-MM-dd")

      const [athletesList, workoutsList] = await Promise.all([
        getAllAthletes(),
        getAllWorkouts(startStr, endStr),
      ])

      setAthletes(athletesList)
      setRecentWorkouts(workoutsList.slice(0, 10))
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setTitle("")
    setWorkoutType("easy")
    setDate(format(new Date(), "yyyy-MM-dd"))
    setDescription("")
    setAssignToTeam(true)
    setSelectedAthletes([])
    setHasMorning(true)
    setHasEvening(false)
    setMorningDistance("")
    setMorningPace("")
    setMorningWarmup("")
    setMorningMainSet("")
    setMorningCooldown("")
    setMorningNotes("")
    setEveningDistance("")
    setEveningPace("")
    setEveningWarmup("")
    setEveningMainSet("")
    setEveningCooldown("")
    setEveningNotes("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !title || !date) return

    setSaving(true)
    try {
      const morningSession: WorkoutSession | undefined = hasMorning ? {
        title: t("morningSession"),
        distance: morningDistance ? parseFloat(morningDistance) : undefined,
        targetPace: morningPace || undefined,
        warmup: morningWarmup || undefined,
        mainSet: morningMainSet || undefined,
        cooldown: morningCooldown || undefined,
        notes: morningNotes || undefined,
      } : undefined

      const eveningSession: WorkoutSession | undefined = hasEvening ? {
        title: t("eveningSession"),
        distance: eveningDistance ? parseFloat(eveningDistance) : undefined,
        targetPace: eveningPace || undefined,
        warmup: eveningWarmup || undefined,
        mainSet: eveningMainSet || undefined,
        cooldown: eveningCooldown || undefined,
        notes: eveningNotes || undefined,
      } : undefined

      await createWorkout({
        title,
        type: workoutType,
        date,
        description: description || undefined,
        assignedTo: assignToTeam ? ["team"] : selectedAthletes,
        morningSession,
        eveningSession,
        createdBy: user.id,
      })

      resetForm()
      await loadData()
    } catch (error) {
      console.error("Error creating workout:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteWorkout = async (workoutId: string) => {
    try {
      await deleteWorkout(workoutId)
      await loadData()
    } catch (error) {
      console.error("Error deleting workout:", error)
    }
  }

  const toggleAthlete = (athleteId: string) => {
    setSelectedAthletes(prev =>
      prev.includes(athleteId)
        ? prev.filter(id => id !== athleteId)
        : [...prev, athleteId]
    )
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
      <h1 className="text-2xl font-bold">{t("createWorkout")}</h1>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="pt-6 space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("workoutTitle")}</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={language === "he" ? 'לדוגמה: "ריצה קלה"' : 'e.g., "Easy Run"'}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>{t("workoutType")}</Label>
                <Select value={workoutType} onValueChange={(v) => setWorkoutType(v as WorkoutType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WORKOUT_TYPES.map(type => (
                      <SelectItem key={type} value={type}>
                        <span className={cn("px-2 py-0.5 rounded text-sm", WORKOUT_COLORS_LIGHT[type])}>
                          {t(type as keyof typeof t)}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{language === "he" ? "תאריך" : "Date"}</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>{language === "he" ? "תיאור כללי" : "Description"}</Label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={language === "he" ? "תיאור קצר..." : "Brief description..."}
                />
              </div>
            </div>

            {/* Assignment */}
            <div className="space-y-3">
              <Label>{t("assignTo")}</Label>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={assignToTeam}
                    onCheckedChange={setAssignToTeam}
                  />
                  <span className="text-sm">{t("entireTeam")}</span>
                </div>
              </div>

              {!assignToTeam && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-secondary/30 rounded-lg">
                  {athletes.map(athlete => (
                    <div key={athlete.id} className="flex items-center gap-2">
                      <Checkbox
                        id={athlete.id}
                        checked={selectedAthletes.includes(athlete.id)}
                        onCheckedChange={() => toggleAthlete(athlete.id)}
                      />
                      <label htmlFor={athlete.id} className="text-sm cursor-pointer">
                        {athlete.name}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sessions */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={hasMorning}
                    onCheckedChange={(c) => setHasMorning(!!c)}
                  />
                  <Label>{t("morningSession")}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={hasEvening}
                    onCheckedChange={(c) => setHasEvening(!!c)}
                  />
                  <Label>{t("eveningSession")}</Label>
                </div>
              </div>

              <Tabs defaultValue="morning" className="space-y-4">
                <TabsList>
                  {hasMorning && <TabsTrigger value="morning">{t("morningSession")}</TabsTrigger>}
                  {hasEvening && <TabsTrigger value="evening">{t("eveningSession")}</TabsTrigger>}
                </TabsList>

                {/* Morning Session */}
                {hasMorning && (
                  <TabsContent value="morning" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t("distance")}</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={morningDistance}
                          onChange={(e) => setMorningDistance(e.target.value)}
                          placeholder="km"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t("targetPace")}</Label>
                        <Input
                          value={morningPace}
                          onChange={(e) => setMorningPace(e.target.value)}
                          placeholder="5:30/km"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("warmup")}</Label>
                      <Textarea
                        value={morningWarmup}
                        onChange={(e) => setMorningWarmup(e.target.value)}
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("mainSet")}</Label>
                      <Textarea
                        value={morningMainSet}
                        onChange={(e) => setMorningMainSet(e.target.value)}
                        rows={3}
                        placeholder={language === "he" ? "לדוגמה: 6x1000m @4:00/km, 90s rest" : "e.g., 6x1000m @4:00/km, 90s rest"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("cooldown")}</Label>
                      <Textarea
                        value={morningCooldown}
                        onChange={(e) => setMorningCooldown(e.target.value)}
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("notes")}</Label>
                      <Textarea
                        value={morningNotes}
                        onChange={(e) => setMorningNotes(e.target.value)}
                        rows={2}
                      />
                    </div>
                  </TabsContent>
                )}

                {/* Evening Session */}
                {hasEvening && (
                  <TabsContent value="evening" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t("distance")}</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={eveningDistance}
                          onChange={(e) => setEveningDistance(e.target.value)}
                          placeholder="km"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t("targetPace")}</Label>
                        <Input
                          value={eveningPace}
                          onChange={(e) => setEveningPace(e.target.value)}
                          placeholder="5:30/km"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("warmup")}</Label>
                      <Textarea
                        value={eveningWarmup}
                        onChange={(e) => setEveningWarmup(e.target.value)}
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("mainSet")}</Label>
                      <Textarea
                        value={eveningMainSet}
                        onChange={(e) => setEveningMainSet(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("cooldown")}</Label>
                      <Textarea
                        value={eveningCooldown}
                        onChange={(e) => setEveningCooldown(e.target.value)}
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("notes")}</Label>
                      <Textarea
                        value={eveningNotes}
                        onChange={(e) => setEveningNotes(e.target.value)}
                        rows={2}
                      />
                    </div>
                  </TabsContent>
                )}
              </Tabs>
            </div>

            {/* Submit */}
            <div className="flex justify-end">
              <Button type="submit" disabled={saving || !title}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                {t("createWorkout")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Recent Workouts */}
      <Card>
        <CardHeader>
          <CardTitle>{language === "he" ? "אימונים קרובים" : "Upcoming Workouts"}</CardTitle>
        </CardHeader>
        <CardContent>
          {recentWorkouts.length > 0 ? (
            <div className="space-y-2">
              {recentWorkouts.map(workout => (
                <div 
                  key={workout.id} 
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border-s-4",
                    WORKOUT_COLORS_LIGHT[workout.type]
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium">{workout.title}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{workout.date}</span>
                        <Users className="h-3.5 w-3.5 ms-2" />
                        <span>
                          {workout.assignedTo.includes("team") 
                            ? t("entireTeam")
                            : `${workout.assignedTo.length} ${language === "he" ? "ספורטאים" : "athletes"}`
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteWorkout(workout.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">
              {language === "he" ? "אין אימונים קרובים" : "No upcoming workouts"}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
