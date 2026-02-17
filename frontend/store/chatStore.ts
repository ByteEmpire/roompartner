import { create } from 'zustand'
import api from '@/lib/api'
import { socketService } from '@/lib/socket'
import { Message, SocketMessage, TypingEvent, OnlineStatusEvent } from '@/types'

interface Conversation {
  userId: string
  userName: string
  userImage?: string
  lastMessage?: Message
  unreadCount: number
  isOnline: boolean
  isTyping: boolean
}

interface ChatState {
  conversations: Map<string, Conversation>
  messages: Map<string, Message[]>
  activeConversation: string | null
  isLoading: boolean
  error: string | null

  setActiveConversation: (userId: string) => void
  loadConversations: () => Promise<void>
  loadMessages: (userId: string) => Promise<void>
  sendMessage: (receiverId: string, content: string) => Promise<void>
  handleIncomingMessage: (message: SocketMessage) => void
  handleTyping: (data: TypingEvent) => void
  handleOnlineStatus: (data: OnlineStatusEvent) => void
  handleOnlineUsers: (userIds: string[]) => void
  emitTyping: (receiverId: string, isTyping: boolean) => void
  clearError: () => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: new Map(),
  messages: new Map(),
  activeConversation: null,
  isLoading: false,
  error: null,

  setActiveConversation: (userId: string) => {
    console.log('📌 Setting active conversation:', userId)
    set({ activeConversation: userId })
    get().loadMessages(userId)
  },

  loadConversations: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await api.get('/chat/conversations')
      const data = response.data.data || response.data

      const conversationsMap = new Map<string, Conversation>()
      data.forEach((conv: any) => {
        conversationsMap.set(conv.userId, {
          userId: conv.userId,
          userName: conv.userName,
          userImage: conv.userImage,
          lastMessage: conv.lastMessage,
          unreadCount: conv.unreadCount,
          isOnline: false, // Will be updated by socket
          isTyping: false,
        })
      })

      set({ conversations: conversationsMap, isLoading: false })

      // ✅ Request online status update from socket
      const socket = socketService.getSocket()
      if (socket?.connected) {
        socket.emit('getAllOnlineUsers')
      }
    } catch (error: any) {
      console.error('❌ Failed to load conversations:', error)
      set({ error: 'Failed to load conversations', isLoading: false })
    }
  },

  loadMessages: async (userId: string) => {
    try {
      const response = await api.get(`/chat/messages/${userId}`)
      const data = response.data.data || response.data

      set((state) => {
        const newMessages = new Map(state.messages)
        newMessages.set(userId, data)
        return { messages: newMessages }
      })

      await api.put(`/chat/messages/read/${userId}`)
    } catch (error: any) {
      console.error('❌ Failed to load messages:', error)
    }
  },

  sendMessage: async (receiverId: string, content: string) => {
    try {
      const response = await api.post('/chat/messages', {
        receiverId,
        content,
      })
      
      const newMessage = response.data.data || response.data
      console.log('✅ Message sent:', newMessage)

      set((state) => {
        const newMessages = new Map(state.messages)
        const userMessages = newMessages.get(receiverId) || []
        newMessages.set(receiverId, [...userMessages, newMessage])
        return { messages: newMessages }
      })

      get().loadConversations()
    } catch (error: any) {
      console.error('❌ Failed to send message:', error)
      throw error
    }
  },

  handleIncomingMessage: (message: SocketMessage) => {
    console.log('📥 Incoming message:', message)
    
    set((state) => {
      const newMessages = new Map(state.messages)
      const conversationId = message.senderId

      const userMessages = newMessages.get(conversationId) || []
      
      const exists = userMessages.some(m => m.id === message.id)
      if (!exists) {
        newMessages.set(conversationId, [...userMessages, message as Message])
      }

      return { messages: newMessages }
    })

    get().loadConversations()
  },

  handleTyping: (data: TypingEvent) => {
    set((state) => {
      const newConversations = new Map(state.conversations)
      const conv = newConversations.get(data.userId)
      
      if (conv) {
        newConversations.set(data.userId, {
          ...conv,
          isTyping: data.isTyping,
        })
      }

      return { conversations: newConversations }
    })
  },

  handleOnlineStatus: (data: OnlineStatusEvent) => {
    console.log('🟢 Online status update:', data)
    
    set((state) => {
      const newConversations = new Map(state.conversations)
      const conv = newConversations.get(data.userId)
      
      if (conv) {
        newConversations.set(data.userId, {
          ...conv,
          isOnline: data.isOnline,
        })
      }

      return { conversations: newConversations }
    })
  },

  // ✅ NEW: Handle bulk online users update
  handleOnlineUsers: (userIds: string[]) => {
    console.log('👥 Online users:', userIds)
    
    set((state) => {
      const newConversations = new Map(state.conversations)
      
      // Mark all as offline first
      newConversations.forEach((conv, userId) => {
        newConversations.set(userId, { ...conv, isOnline: false })
      })
      
      // Mark online users
      userIds.forEach((userId) => {
        const conv = newConversations.get(userId)
        if (conv) {
          newConversations.set(userId, { ...conv, isOnline: true })
        }
      })

      return { conversations: newConversations }
    })
  },

  emitTyping: (receiverId: string, isTyping: boolean) => {
    const socket = socketService.getSocket()
    if (socket?.connected) {
      socket.emit('typing', { receiverId, isTyping })
    }
  },

  clearError: () => {
    set({ error: null })
  },
}))