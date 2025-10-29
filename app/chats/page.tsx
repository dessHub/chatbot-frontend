"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store/auth"
import { useChatsStore } from "@/lib/store/chats"
import { initializeAxios } from "@/lib/api/client"
import { fetchChatHistory } from "@/lib/api/chat"
import { ChatHeader } from "@/components/chat-header"
import { ChatSidebar } from "@/components/chat-sidebar"
import { ChatMessages } from "@/components/chat-messages"
import { ChatComposer } from "@/components/chat-composer"
import { ReportMenu } from "@/components/report-menu"

export default function ChatsPage() {
  const router = useRouter()
  const authStore = useAuthStore()
  const activeSession = useChatsStore((state) => state.getActiveSession())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if authenticated
    if (!authStore.isAuthenticated()) {
      router.push("/")
      return
    }

    const apiBaseUrl = process.env.NEXT_PUBLIC_CHAT_API_BASE_URL
    if (authStore.token && authStore.user_id && apiBaseUrl) {
      try {
        initializeAxios(apiBaseUrl, authStore.token, authStore.user_id)

        const loadChatHistory = async () => {
          try {
            const resp = await fetchChatHistory()
            const history = resp.history || []
            const setSessions = useChatsStore.getState().setSessions
            setSessions(history || [])

            // Set active session to first one if available
            if (history.length > 0) {
              useChatsStore.getState().setActiveSession(history[0].id)
            }
          } catch (error) {
            console.error("Failed to fetch chat history:", error)
          } finally {
            setIsLoading(false)
          }
        }

        loadChatHistory()
      } catch (error) {
        console.error("Failed to initialize API client:", error)
        setIsLoading(false)
      }
    }
  }, [authStore, router])

  if (!authStore.isAuthenticated()) {
    return null
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading chats...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-white">
      <ChatSidebar />
      <div className="h-screen flex-1 flex flex-col">
        <ChatHeader />
        <div className="flex-1 flex flex-col h-48">
          <div className="flex items-center justify-between px-6 py-3 border-b bg-gray-50">
            <h2 className="font-semibold text-gray-900">{activeSession?.title || "Select a chat"}</h2>
            {activeSession && <ReportMenu sessionId={activeSession.id} />}
          </div>
          <ChatMessages />
          <ChatComposer />
        </div>
      </div>
    </div>
  )
}
