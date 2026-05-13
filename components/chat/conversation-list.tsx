"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { translations } from "@/lib/translations"
import { subscribeToConversations } from "@/lib/services/chat"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { Conversation } from "@/types"

interface ConversationListProps {
  onSelectConversation: (conversation: Conversation) => void
  selectedId?: string
}

export function ConversationList({ onSelectConversation, selectedId }: ConversationListProps) {
  const { userProfile } = useAuth()
  const { language } = useLanguage()
  const t = translations[language]
  const [conversations, setConversations] = useState<Conversation[]>([])

  useEffect(() => {
    if (!userProfile?.id) return

    const unsubscribe = subscribeToConversations(userProfile.id, (convs) => {
      setConversations(convs)
    })

    return () => unsubscribe()
  }, [userProfile?.id])

  const getOtherParticipant = (conversation: Conversation) => {
    if (!userProfile) return { name: "", photo: "", id: "" }
    
    const isParticipant1 = conversation.participant1Id === userProfile.id
    return {
      id: isParticipant1 ? conversation.participant2Id : conversation.participant1Id,
      name: isParticipant1 ? conversation.participant2Name : conversation.participant1Name,
      photo: isParticipant1 ? conversation.participant2Photo : conversation.participant1Photo,
    }
  }

  const getUnreadCount = (conversation: Conversation) => {
    if (!userProfile) return 0
    return conversation.participant1Id === userProfile.id
      ? conversation.unreadCount1
      : conversation.unreadCount2
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Card className="h-[600px]">
      <CardHeader className="border-b bg-muted/30 px-4 py-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="h-5 w-5" />
          {t.messages}
        </CardTitle>
      </CardHeader>

      <ScrollArea className="h-[calc(600px-60px)]">
        {conversations.length === 0 ? (
          <div className="flex h-full items-center justify-center p-8 text-center text-muted-foreground">
            {t.noConversations}
          </div>
        ) : (
          <div className="divide-y">
            {conversations.map((conversation) => {
              const other = getOtherParticipant(conversation)
              const unread = getUnreadCount(conversation)
              const isSelected = selectedId === conversation.id

              return (
                <button
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation)}
                  className={`flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-muted/50 ${
                    isSelected ? "bg-muted" : ""
                  }`}
                >
                  <Avatar className="h-12 w-12 shrink-0">
                    <AvatarImage src={other.photo} alt={other.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(other.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate font-medium">{other.name}</p>
                      {conversation.lastMessageTime && (
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {formatDistanceToNow(conversation.lastMessageTime.toDate(), {
                            addSuffix: true,
                          })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm text-muted-foreground">
                        {conversation.lastMessage || t.noMessages}
                      </p>
                      {unread > 0 && (
                        <Badge variant="default" className="shrink-0">
                          {unread}
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </ScrollArea>
    </Card>
  )
}
