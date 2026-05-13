"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getAthleteProfile, createAthleteProfile, updateAthleteProfile } from "@/lib/services/users"
import type { AthleteProfile } from "@/types"
import { Loader2, User, Activity, Heart, Footprints, Trophy, Timer, AlertCircle } from "lucide-react"
import { safeInitial } from "@/lib/utils"

export default function ProfilePage() {
  const { user } = useAuth()
  const { t, language } = useLanguage()
  const [profile, setProfile] = useState<AthleteProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form states
  const [personal, setPersonal] = useState<AthleteProfile["personal"]>({})
  const [performance, setPerformance] = useState<AthleteProfile["performance"]>({})
  const [heartRate, setHeartRate] = useState<AthleteProfile["heartRate"]>({})
  const [mechanics, setMechanics] = useState<AthleteProfile["mechanics"]>({})
  const [racePRs, setRacePRs] = useState<AthleteProfile["racePRs"]>({})
  const [trainingPaces, setTrainingPaces] = useState<AthleteProfile["trainingPaces"]>({})

  useEffect(() => {
    loadProfile()
  }, [user])

  async function loadProfile() {
    if (!user) return
    
    try {
      const data = await getAthleteProfile(user.id)
      if (data) {
        setProfile(data)
        setPersonal(data.personal || {})
        setPerformance(data.performance || {})
        setHeartRate(data.heartRate || {})
        setMechanics(data.mechanics || {})
        setRacePRs(data.racePRs || {})
        setTrainingPaces(data.trainingPaces || {})
      } else {
        // Create empty profile
        await createAthleteProfile(user.id, { userId: user.id })
        setProfile({ 
          userId: user.id, 
          personal: {}, 
          performance: {}, 
          heartRate: {}, 
          mechanics: {}, 
          racePRs: {}, 
          trainingPaces: {},
          injuryHistory: []
        })
      }
    } catch (error) {
      console.error("Error loading profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user) return
    
    setSaving(true)
    try {
      await updateAthleteProfile(user.id, {
        personal,
        performance,
        heartRate,
        mechanics,
        racePRs,
        trainingPaces,
      })
    } catch (error) {
      console.error("Error saving profile:", error)
    } finally {
      setSaving(false)
    }
  }

  // Helper to format pace from seconds to mm:ss
  const formatPace = (seconds?: number): string => {
    if (!seconds) return ""
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Helper to parse pace from mm:ss to seconds
  const parsePace = (pace: string): number | undefined => {
    const parts = pace.split(":")
    if (parts.length !== 2) return undefined
    const mins = parseInt(parts[0])
    const secs = parseInt(parts[1])
    if (isNaN(mins) || isNaN(secs)) return undefined
    return mins * 60 + secs
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
      {/* Header with avatar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user?.photoURL} />
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                {safeInitial(user)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{user?.name}</h1>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Tabs */}
      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList className="grid grid-cols-3 lg:grid-cols-6 w-full">
          <TabsTrigger value="personal" className="gap-1">
            <User className="h-4 w-4 hidden sm:block" />
            {t("personalInfo").split(" ")[0]}
          </TabsTrigger>
          <TabsTrigger value="performance" className="gap-1">
            <Activity className="h-4 w-4 hidden sm:block" />
            {language === "he" ? "ביצוע" : "Performance"}
          </TabsTrigger>
          <TabsTrigger value="heartrate" className="gap-1">
            <Heart className="h-4 w-4 hidden sm:block" />
            {language === "he" ? "דופק" : "HR"}
          </TabsTrigger>
          <TabsTrigger value="mechanics" className="gap-1">
            <Footprints className="h-4 w-4 hidden sm:block" />
            {language === "he" ? "מכניקה" : "Mechanics"}
          </TabsTrigger>
          <TabsTrigger value="prs" className="gap-1">
            <Trophy className="h-4 w-4 hidden sm:block" />
            {language === "he" ? "שיאים" : "PRs"}
          </TabsTrigger>
          <TabsTrigger value="paces" className="gap-1">
            <Timer className="h-4 w-4 hidden sm:block" />
            {language === "he" ? "קצבים" : "Paces"}
          </TabsTrigger>
        </TabsList>

        {/* Personal Info */}
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>{t("personalInfo")}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("age")}</Label>
                <Input
                  type="number"
                  value={personal.age || ""}
                  onChange={(e) => setPersonal({ ...personal, age: parseInt(e.target.value) || undefined })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("gender")}</Label>
                <Select
                  value={personal.gender || ""}
                  onValueChange={(value) => setPersonal({ ...personal, gender: value as "male" | "female" | "other" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={language === "he" ? "בחר" : "Select"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">{t("male")}</SelectItem>
                    <SelectItem value="female">{t("female")}</SelectItem>
                    <SelectItem value="other">{t("other")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("weight")}</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={personal.weight || ""}
                  onChange={(e) => setPersonal({ ...personal, weight: parseFloat(e.target.value) || undefined })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("height")}</Label>
                <Input
                  type="number"
                  value={personal.height || ""}
                  onChange={(e) => setPersonal({ ...personal, height: parseInt(e.target.value) || undefined })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("yearsRunning")}</Label>
                <Input
                  type="number"
                  value={personal.yearsRunning || ""}
                  onChange={(e) => setPersonal({ ...personal, yearsRunning: parseInt(e.target.value) || undefined })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance */}
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>{t("performanceData")}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("vo2Max")}</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={performance.vo2Max || ""}
                  onChange={(e) => setPerformance({ ...performance, vo2Max: parseFloat(e.target.value) || undefined })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("lactateThreshold")}</Label>
                <Input
                  type="number"
                  value={performance.lactateThreshold || ""}
                  onChange={(e) => setPerformance({ ...performance, lactateThreshold: parseInt(e.target.value) || undefined })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("anaerobicThreshold")}</Label>
                <Input
                  type="number"
                  value={performance.anaerobicThreshold || ""}
                  onChange={(e) => setPerformance({ ...performance, anaerobicThreshold: parseInt(e.target.value) || undefined })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Heart Rate */}
        <TabsContent value="heartrate">
          <Card>
            <CardHeader>
              <CardTitle>{t("heartRateZones")}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("restingHR")}</Label>
                <Input
                  type="number"
                  value={heartRate.resting || ""}
                  onChange={(e) => setHeartRate({ ...heartRate, resting: parseInt(e.target.value) || undefined })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("maxHR")}</Label>
                <Input
                  type="number"
                  value={heartRate.max || ""}
                  onChange={(e) => setHeartRate({ ...heartRate, max: parseInt(e.target.value) || undefined })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mechanics */}
        <TabsContent value="mechanics">
          <Card>
            <CardHeader>
              <CardTitle>{t("runningMechanics")}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{t("strideLength")}</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={mechanics.strideLength || ""}
                  onChange={(e) => setMechanics({ ...mechanics, strideLength: parseFloat(e.target.value) || undefined })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("cadence")}</Label>
                <Input
                  type="number"
                  value={mechanics.cadence || ""}
                  onChange={(e) => setMechanics({ ...mechanics, cadence: parseInt(e.target.value) || undefined })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("groundContactTime")}</Label>
                <Input
                  type="number"
                  value={mechanics.groundContactTime || ""}
                  onChange={(e) => setMechanics({ ...mechanics, groundContactTime: parseInt(e.target.value) || undefined })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Race PRs */}
        <TabsContent value="prs">
          <Card>
            <CardHeader>
              <CardTitle>{t("racePRs")}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { key: "fiveK", label: t("fiveK") },
                { key: "tenK", label: t("tenK") },
                { key: "halfMarathon", label: t("halfMarathon") },
                { key: "marathon", label: t("marathon") },
                { key: "mile", label: t("mile") },
                { key: "threeK", label: t("threeK") },
                { key: "fifteenHundred", label: t("fifteenHundred") },
                { key: "eightHundred", label: t("eightHundred") },
              ].map(({ key, label }) => (
                <div key={key} className="space-y-2">
                  <Label>{label}</Label>
                  <Input
                    type="text"
                    placeholder="mm:ss"
                    value={formatPace(racePRs[key as keyof typeof racePRs])}
                    onChange={(e) => setRacePRs({ ...racePRs, [key]: parsePace(e.target.value) })}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Training Paces */}
        <TabsContent value="paces">
          <Card>
            <CardHeader>
              <CardTitle>{t("trainingPaces")}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { key: "easy", label: t("easyPace") },
                { key: "marathon", label: t("marathonPace") },
                { key: "threshold", label: t("thresholdPace") },
                { key: "interval", label: t("intervalPace") },
                { key: "repetition", label: t("repetitionPace") },
              ].map(({ key, label }) => (
                <div key={key} className="space-y-2">
                  <Label>{label}</Label>
                  <Input
                    type="text"
                    placeholder="mm:ss/km"
                    value={formatPace(trainingPaces[key as keyof typeof trainingPaces])}
                    onChange={(e) => setTrainingPaces({ ...trainingPaces, [key]: parsePace(e.target.value) })}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          {t("save")}
        </Button>
      </div>
    </div>
  )
}
