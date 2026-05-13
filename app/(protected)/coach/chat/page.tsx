"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { translations } from "@/lib/translations"
import { ConversationList } from "@/components/chat/conversation-list"
import { ChatWindow } from "@/components/chat/chat-window"
import { Card, CardContent } from "@/components/ui/card"
import { MessageSquare } from "lucide-react"
import type { Conversation } from "@/types"

export default function CoachChatPage() {
  const { userProfile } = useAuth()
  const { language } = useLanguage()
  const t = translations[language]
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)

  const getOtherParticipant = (conversation: Conversation) => {
    if (!userProfile) return { name: "", photo: "", id: "" }
    
    const isParticipant1 = conversation.participant1Id === userProfile.id
    return {
      id: isParticipant1 ? conversation.participant2Id : conversation.participant1Id,
      name: isParticipant1 ? conversation.participant2Name : conversation.participant1Name,
      photo: isParticipant1 ? conversation.participant2Photo : conversation.participant1Photo,
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t.messages}</h1>
        <p className="text-muted-foreground">{t.manageConversations}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
        <ConversationList
          onSelectConversation={setSelectedConversation}
          selectedId={selectedConversation?.id}
        />

        {selectedConversation ? (
          <ChatWindow
            recipientId={getOtherParticipant(selectedConversation).id}
            recipientName={getOtherParticipant(selectedConversation).name}
            recipientPhoto={getOtherParticipant(selectedConversation).photo}
            conversationId={selectedConversation.id}
          />
        ) : (
          <Card className="flex h-[600px] items-center justify-center">
            <CardContent className="text-center">
              <MessageSquare className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
              <h3 className="text-lg font-semibold">{t.selectConversation}</h3>
              <p className="text-muted-foreground">{t.selectConversationDesc}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
