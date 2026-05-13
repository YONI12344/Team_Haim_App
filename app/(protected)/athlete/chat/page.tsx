"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { translations } from "@/lib/translations"
import { getOrCreateConversation } from "@/lib/services/chat"
import { getCoachProfile } from "@/lib/services/users"
import { ChatWindow } from "@/components/chat/chat-window"
import { Card, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { MessageSquare } from "lucide-react"
import type { UserProfile, Conversation } from "@/types"

const COACH_EMAIL = "info.teamhaim@gmail.com"

export default function AthleteChatPage() {
  const { userProfile } = useAuth()
  const { language } = useLanguage()
  const t = translations[language]
  const [coach, setCoach] = useState<UserProfile | null>(null)
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initChat = async () => {
      if (!userProfile) return

      try {
        // Get coach profile
        const coachProfile = await getCoachProfile()
        if (coachProfile) {
          setCoach(coachProfile)

          // Get or create conversation with coach
          const conv = await getOrCreateConversation(
            userProfile.id,
            userProfile.displayName,
            userProfile.photoURL,
            coachProfile.id,
            coachProfile.displayName,
            coachProfile.photoURL
          )
          setConversation(conv)
        }
      } catch (error) {
        console.error("Error initializing chat:", error)
      } finally {
        setLoading(false)
      }
    }

    initChat()
  }, [userProfile])

  if (loading) {
    return (
      <div className="flex h-[600px] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!coach || !conversation) {
    return (
      <Card className="h-[600px]">
        <CardContent className="flex h-full flex-col items-center justify-center gap-4 text-center">
          <MessageSquare className="h-16 w-16 text-muted-foreground" />
          <div>
            <h3 className="text-lg font-semibold">{t.coachNotAvailable}</h3>
            <p className="text-muted-foreground">{t.coachNotAvailableDesc}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t.chatWithCoach}</h1>
        <p className="text-muted-foreground">{t.chatWithCoachDesc}</p>
      </div>

      <ChatWindow
        recipientId={coach.id}
        recipientName={coach.displayName}
        recipientPhoto={coach.photoURL}
        conversationId={conversation.id}
      />
    </div>
  )
}
