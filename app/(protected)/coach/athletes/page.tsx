"use client"

import { useEffect, useState } from "react"
import { useLanguage } from "@/contexts/language-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  getAllAthletes, 
  getAuthorizedAthletes, 
  addAuthorizedAthlete, 
  removeAuthorizedAthlete 
} from "@/lib/services/users"
import type { User } from "@/types"
import { format } from "date-fns"
import { Loader2, Plus, Users, Mail, Trash2, UserPlus } from "lucide-react"
import Link from "next/link"

export default function AthletesPage() {
  const { t, language } = useLanguage()
  const [athletes, setAthletes] = useState<User[]>([])
  const [authorizedEmails, setAuthorizedEmails] = useState<{ email: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form state
  const [newEmail, setNewEmail] = useState("")
  const [newName, setNewName] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [athletesList, authorizedList] = await Promise.all([
        getAllAthletes(),
        getAuthorizedAthletes(),
      ])
      setAthletes(athletesList)
      setAuthorizedEmails(authorizedList)
    } catch (error) {
      console.error("Error loading athletes:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddAthlete = async () => {
    if (!newEmail) return

    setSaving(true)
    try {
      await addAuthorizedAthlete(newEmail, newName || undefined)
      setNewEmail("")
      setNewName("")
      setDialogOpen(false)
      await loadData()
    } catch (error) {
      console.error("Error adding athlete:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveAuthorized = async (email: string) => {
    try {
      await removeAuthorizedAthlete(email)
      await loadData()
    } catch (error) {
      console.error("Error removing authorized athlete:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Find pending invites (authorized but not registered)
  const registeredEmails = new Set(athletes.map(a => a.email))
  const pendingInvites = authorizedEmails.filter(a => !registeredEmails.has(a.email))

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("athletes")}</h1>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t("addAthlete")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("addAthlete")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {language === "he" 
                  ? "הוסף את כתובת האימייל של הספורטאי. הם יוכלו להתחבר לאפליקציה לאחר שתוסיף אותם."
                  : "Add the athlete's email address. They will be able to log in to the app once you add them."
                }
              </p>
              <div className="space-y-2">
                <Label>{t("athleteEmail")}</Label>
                <Input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="athlete@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label>{language === "he" ? "שם (אופציונלי)" : "Name (optional)"}</Label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={language === "he" ? "שם הספורטאי" : "Athlete name"}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                  {t("cancel")}
                </Button>
                <Button onClick={handleAddAthlete} disabled={saving || !newEmail} className="flex-1">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : t("add")}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Registered Athletes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {language === "he" ? "ספורטאים רשומים" : "Registered Athletes"}
            <Badge variant="secondary">{athletes.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {athletes.length > 0 ? (
            <div className="space-y-3">
              {athletes.map(athlete => (
                <Link key={athlete.id} href={`/coach/athletes/${athlete.id}`}>
                  <div className="flex items-center gap-4 p-3 rounded-lg border hover:bg-secondary/50 transition-colors cursor-pointer">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={athlete.photoURL} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {athlete.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{athlete.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{athlete.email}</p>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {language === "he" ? "פעיל" : "Active"}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>{language === "he" ? "אין ספורטאים רשומים עדיין" : "No registered athletes yet"}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Invites */}
      {pendingInvites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              {language === "he" ? "הזמנות ממתינות" : "Pending Invites"}
              <Badge variant="secondary">{pendingInvites.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingInvites.map(invite => (
                <div 
                  key={invite.email} 
                  className="flex items-center gap-4 p-3 rounded-lg border bg-secondary/30"
                >
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{invite.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{invite.email}</p>
                  </div>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    {language === "he" ? "ממתין" : "Pending"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveAuthorized(invite.email)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
