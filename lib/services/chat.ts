import { 
  ref, 
  push, 
  onValue, 
  query as rtQuery, 
  orderByChild,
  set,
  update,
  off,
  serverTimestamp as rtServerTimestamp,
  limitToLast
} from "firebase/database"
import { realtimeDb } from "@/lib/firebase"
import type { Message, Conversation } from "@/types"

const MESSAGES_PATH = "messages"
const CONVERSATIONS_PATH = "conversations"

// Create a conversation ID from two user IDs
export function getConversationId(coachId: string, athleteId: string): string {
  return `${coachId}_${athleteId}`
}

// Send a message
export async function sendMessage(
  conversationId: string,
  senderId: string,
  senderName: string,
  receiverId: string,
  text: string
): Promise<void> {
  const messagesRef = ref(realtimeDb, `${MESSAGES_PATH}/${conversationId}`)
  const newMessageRef = push(messagesRef)
  
  await set(newMessageRef, {
    senderId,
    senderName,
    receiverId,
    text,
    timestamp: Date.now(),
    read: false,
  })
  
  // Update conversation metadata
  const conversationRef = ref(realtimeDb, `${CONVERSATIONS_PATH}/${conversationId}`)
  await update(conversationRef, {
    lastMessage: text,
    lastMessageTime: Date.now(),
  })
}

// Subscribe to messages in a conversation
export function subscribeToMessages(
  conversationId: string,
  callback: (messages: Message[]) => void
): () => void {
  const messagesRef = ref(realtimeDb, `${MESSAGES_PATH}/${conversationId}`)
  const messagesQuery = rtQuery(messagesRef, orderByChild("timestamp"), limitToLast(100))
  
  onValue(messagesQuery, (snapshot) => {
    const messages: Message[] = []
    snapshot.forEach((childSnapshot) => {
      messages.push({
        id: childSnapshot.key!,
        ...childSnapshot.val(),
      })
    })
    callback(messages)
  })
  
  // Return unsubscribe function
  return () => off(messagesRef)
}

// Mark messages as read
export async function markMessagesAsRead(
  conversationId: string,
  userId: string
): Promise<void> {
  const messagesRef = ref(realtimeDb, `${MESSAGES_PATH}/${conversationId}`)
  
  return new Promise((resolve) => {
    onValue(messagesRef, async (snapshot) => {
      const updates: Record<string, boolean> = {}
      
      snapshot.forEach((childSnapshot) => {
        const message = childSnapshot.val()
        if (message.receiverId === userId && !message.read) {
          updates[`${MESSAGES_PATH}/${conversationId}/${childSnapshot.key}/read`] = true
        }
      })
      
      if (Object.keys(updates).length > 0) {
        await update(ref(realtimeDb), updates)
      }
      
      resolve()
    }, { onlyOnce: true })
  })
}

// Create or update conversation metadata
export async function createOrUpdateConversation(
  conversationId: string,
  coachId: string,
  athleteId: string,
  athleteName: string,
  athletePhoto?: string
): Promise<void> {
  const conversationRef = ref(realtimeDb, `${CONVERSATIONS_PATH}/${conversationId}`)
  await update(conversationRef, {
    coachId,
    athleteId,
    athleteName,
    athletePhoto: athletePhoto || null,
  })
}

// Get or create a conversation between athlete and coach
export async function getOrCreateConversation(
  athleteId: string,
  athleteName: string,
  athletePhoto: string | undefined,
  coachId: string,
  coachName: string,
  coachPhoto: string | undefined
): Promise<Conversation> {
  const conversationId = getConversationId(coachId, athleteId)
  const conversationRef = ref(realtimeDb, `${CONVERSATIONS_PATH}/${conversationId}`)
  
  await update(conversationRef, {
    coachId,
    athleteId,
    athleteName,
    athletePhoto: athletePhoto || null,
    coachName,
    coachPhoto: coachPhoto || null,
  })
  
  return {
    id: conversationId,
    coachId,
    athleteId,
    athleteName,
    athletePhoto,
    lastMessage: "",
    lastMessageTime: Date.now(),
    unreadCount: 0,
  }
}

// Get all conversations for coach
export function subscribeToConversations(
  callback: (conversations: Conversation[]) => void
): () => void {
  const conversationsRef = ref(realtimeDb, CONVERSATIONS_PATH)
  
  onValue(conversationsRef, (snapshot) => {
    const conversations: Conversation[] = []
    snapshot.forEach((childSnapshot) => {
      conversations.push({
        id: childSnapshot.key!,
        ...childSnapshot.val(),
        unreadCount: 0, // Will be calculated separately
      })
    })
    // Sort by last message time
    conversations.sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0))
    callback(conversations)
  })
  
  return () => off(conversationsRef)
}

// Get unread count for a conversation
export function subscribeToUnreadCount(
  conversationId: string,
  userId: string,
  callback: (count: number) => void
): () => void {
  const messagesRef = ref(realtimeDb, `${MESSAGES_PATH}/${conversationId}`)
  
  onValue(messagesRef, (snapshot) => {
    let count = 0
    snapshot.forEach((childSnapshot) => {
      const message = childSnapshot.val()
      if (message.receiverId === userId && !message.read) {
        count++
      }
    })
    callback(count)
  })
  
  return () => off(messagesRef)
}
