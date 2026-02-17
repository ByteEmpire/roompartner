'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { useChatStore } from '@/store/chatStore'
import { useAuthStore } from '@/store/authStore'
import { socketService } from '@/lib/socket'
import Navbar from '@/components/layout/Navbar'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import { Card } from '@/components/ui/Card'
import Loading from '@/components/ui/Loading'
import { Send, Search } from 'lucide-react'
import { formatRelativeTime, getInitials } from '@/lib/utils'
import Image from 'next/image'
import api from '@/lib/api'

function ChatContent() {
  const searchParams = useSearchParams()
  const initialUserId = searchParams.get('userId')
  
  const { user, accessToken } = useAuthStore()
  const {
    conversations,
    messages,
    activeConversation,
    setActiveConversation,
    loadConversations,
    sendMessage,
    handleIncomingMessage,
    handleTyping,
    handleOnlineStatus,
    emitTyping,
    isLoading,
  } = useChatStore()

  const [messageInput, setMessageInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [otherUserInfo, setOtherUserInfo] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()
  const inputRef = useRef<HTMLInputElement>(null)

  // ✅ CONNECT SOCKET
  useEffect(() => {
    if (accessToken) {
      console.log('🔌 Connecting socket with token')
      socketService.connect(accessToken)
    }
    return () => socketService.disconnect()
  }, [accessToken])

  // ✅ LOAD CONVERSATIONS
  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  // ✅ HANDLE URL PARAMETER - Load user info if coming from matches
  useEffect(() => {
    const loadUserInfo = async () => {
      if (initialUserId) {
        console.log('👤 Loading user info for:', initialUserId)
        try {
          const response = await api.get(`/users/${initialUserId}`)
          const userData = response.data.data || response.data
          setOtherUserInfo(userData)
          setActiveConversation(initialUserId)
        } catch (error) {
          console.error('Failed to load user info:', error)
        }
      }
    }
    loadUserInfo()
  }, [initialUserId, setActiveConversation])

  // ✅ SOCKET LISTENERS
  useEffect(() => {
    const socket = socketService.getSocket()
    if (!socket) return

    const { handleIncomingMessage, handleTyping, handleOnlineStatus, handleOnlineUsers } = useChatStore.getState()

    socket.on('receiveMessage', handleIncomingMessage)
    socket.on('userTyping', handleTyping)
    socket.on('userOnline', (data) => handleOnlineStatus({ ...data, isOnline: true }))
    socket.on('userOffline', (data) => handleOnlineStatus({ ...data, isOnline: false }))
    socket.on('onlineUsers', (data) => handleOnlineUsers(data.userIds)) 

    return () => {
      socket.off('receiveMessage')
      socket.off('userTyping')
      socket.off('userOnline')
      socket.off('userOffline')
      socket.off('onlineUsers')
    }
  }, [handleIncomingMessage, handleTyping, handleOnlineStatus])

  // ✅ AUTO-SCROLL
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, activeConversation])

  // ✅ FOCUS INPUT
  useEffect(() => {
    if (activeConversation && inputRef.current) {
      inputRef.current.focus()
    }
  }, [activeConversation])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const trimmedMessage = messageInput.trim()
    if (!trimmedMessage || !activeConversation || isSending) return

    console.log('📤 Sending:', trimmedMessage, 'to:', activeConversation)

    setIsSending(true)
    const messageToSend = trimmedMessage
    setMessageInput('')

    try {
      await sendMessage(activeConversation, messageToSend)
      emitTyping(activeConversation, false)
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    } catch (error) {
      console.error('Send failed:', error)
      setMessageInput(messageToSend)
    } finally {
      setIsSending(false)
      inputRef.current?.focus()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value)

    if (activeConversation && e.target.value.trim()) {
      emitTyping(activeConversation, true)
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = setTimeout(() => {
        emitTyping(activeConversation, false)
      }, 2000)
    } else if (activeConversation) {
      emitTyping(activeConversation, false)
    }
  }

  const filteredConversations = Array.from(conversations.values()).filter((conv) =>
    conv.userName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activeMessages = activeConversation ? messages.get(activeConversation) || [] : []
  const activeConv = activeConversation ? conversations.get(activeConversation) : null
  
  // ✅ USE otherUserInfo if no conversation exists yet
  const displayUser = activeConv || (otherUserInfo ? {
    userId: otherUserInfo.id,
    userName: otherUserInfo.profile?.fullName || otherUserInfo.email,
    userImage: otherUserInfo.profile?.profileImage,
    isOnline: false,
    isTyping: false,
  } : null)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
          {/* Conversations List */}
          <Card variant="bordered" className="lg:col-span-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Messages</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-900"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <Loading className="py-8" />
              ) : filteredConversations.length === 0 ? (
                <div className="p-4 text-center text-gray-600">
                  No conversations yet
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <button
                    key={conv.userId}
                    onClick={() => setActiveConversation(conv.userId)}
                    className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b ${
                      activeConversation === conv.userId ? 'bg-primary-50' : ''
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      {conv.userImage ? (
                        <Image src={conv.userImage} alt={conv.userName} width={48} height={48} className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-semibold">{getInitials(conv.userName)}</span>
                        </div>
                      )}
                      {conv.isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">{conv.userName}</h3>
                        {conv.lastMessage && (
                          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                            {formatRelativeTime(conv.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 truncate">
                          {conv.isTyping ? <span className="italic text-primary-600">Typing...</span> : conv.lastMessage?.content || 'Start chatting'}
                        </p>
                        {conv.unreadCount > 0 && (
                          <span className="bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full flex-shrink-0 ml-2">{conv.unreadCount}</span>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </Card>

          {/* Chat Window */}
          <Card variant="bordered" className="lg:col-span-2 flex flex-col overflow-hidden">
            {activeConversation && displayUser ? (
              <>
                {/* Header */}
                <div className="p-4 border-b flex items-center gap-3 bg-white">
                  {displayUser.userImage ? (
                    <Image src={displayUser.userImage} alt={displayUser.userName} width={40} height={40} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-semibold">{getInitials(displayUser.userName)}</span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">{displayUser.userName}</h3>
                    <p className="text-sm text-gray-600">
                      {displayUser.isOnline ? <span className="text-green-600">● Online</span> : <span>Offline</span>}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {activeMessages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">No messages yet. Say hi! 👋</p>
                    </div>
                  ) : (
                    activeMessages.map((message) => {
                      const isSent = message.senderId === user?.id
                      return (
                        <div key={message.id} className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isSent ? 'bg-purple-600 text-white' : 'bg-white text-gray-900 border border-gray-200'}`}>
                            <p className="break-words">{message.content}</p>
                            <p className={`text-xs mt-1 ${isSent ? 'text-purple-100' : 'text-gray-500'}`}>
                              {formatRelativeTime(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      )
                    })
                  )}
                  {displayUser.isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t bg-white">
                  <div className="flex gap-3">
                    <input
                      ref={inputRef}
                      type="text"
                      value={messageInput}
                      onChange={handleInputChange}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900"
                      disabled={isSending}
                    />
                    <button
                      type="submit"
                      disabled={!messageInput.trim() || isSending}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white font-semibold rounded-lg flex items-center gap-2"
                    >
                      {isSending ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          <span>Send</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <p className="text-lg mb-2">💬</p>
                  <p>Select a conversation to start chatting</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <ChatContent />
    </ProtectedRoute>
  )
}