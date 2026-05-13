"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { translations } from "@/lib/translations"
import { subscribeToMessages, sendMessage, markMessagesAsRead } from "@/lib/services/chat"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, ImageIcon } from "lucide-react"
import { format } from "date-fns"
import type { ChatMessage } from "@/types"

interface ChatWindowProps {
  recipientId: string
  recipientName: string
  recipientPhoto?: string
  conversationId: string
}

export function ChatWindow({ recipientId, recipientName, recipientPhoto, conversationId }: ChatWindowProps) {
  const { userProfile } = useAuth()
  const { language } = useLanguage()
  const t = translations[language]
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!conversationId) return

    const unsubscribe = subscribeToMessages(conversationId, (msgs) => {
      setMessages(msgs)
      // Mark messages as read
      if (userProfile?.id) {
        markMessagesAsRead(conversationId, userProfile.id)
      }
    })

    return () => unsubscribe()
  }, [conversationId, userProfile?.id])

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!newMessage.trim() || !userProfile) return

    setSending(true)
    try {
      await sendMessage(conversationId, {
        senderId: userProfile.id,
        senderName: userProfile.displayName,
        senderPhoto: userProfile.photoURL,
        recipientId,
        content: newMessage.trim(),
        type: "text",
      })
      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
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
    <Card className="flex h-[600px] flex-col">
      <CardHeader className="border-b bg-muted/30 px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={recipientPhoto} alt={recipientName} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(recipientName)}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-lg font-semibold">{recipientName}</CardTitle>
        </div>
      </CardHeader>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="flex flex-col gap-3">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center py-20 text-muted-foreground">
              {t.noMessages}
            </div>
          ) : (
            messages.map((message) => {
              const isOwn = message.senderId === userProfile?.id
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      isOwn
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {message.type === "image" && message.imageUrl ? (
                      <img
                        src={message.imageUrl}
                        alt="Shared image"
                        className="max-h-60 rounded-lg"
                      />
                    ) : (
                      <p className="text-sm">{message.content}</p>
                    )}
                    <p
                      className={`mt-1 text-xs ${
                        isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}
                    >
                      {format(message.timestamp.toDate(), "HH:mm")}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={() => {
              // Image upload handling would go here
            }}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0"
          >
            <ImageIcon className="h-5 w-5" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t.typeMessage}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            size="icon"
            className="shrink-0"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
