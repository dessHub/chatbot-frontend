"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useChatsStore } from "@/lib/store/chats"
import { useAuthStore } from "@/lib/store/auth"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { postChat } from "@/lib/api/chat"
import { generateUUID } from "@/lib/utils/uuid"
import { Send } from "lucide-react"
import type { Message } from "@/lib/types"
import { generateChatTitle } from "@/lib/utils/generate-title"

export function ChatComposer() {
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const activeSession = useChatsStore((state) => state.getActiveSession())
  const appendMessage = useChatsStore((state) => state.appendMessage)
  const lockRequest = useChatsStore((state) => state.lockRequest)
  const unlockRequest = useChatsStore((state) => state.unlockRequest)
  const authStore = useAuthStore()

  const isDisabled = !activeSession || isLoading || !authStore.isAuthenticated()

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!message.trim() || !activeSession || isLoading) return

    // Prevent duplicate sends
    if (!lockRequest(activeSession.id)) {
      return
    }

    const userMessage: Message = {
      id: generateUUID(),
      role: "user",
      message: message,
      timestamp: new Date().toISOString(),
    }

    // Optimistic UI update
    appendMessage(activeSession.id, userMessage)
    setMessage("")
    setError(null)

    try {
      setIsLoading(true)

      // Call API
      const response = await postChat({
        session_id: activeSession.id,
        message: message,
      })

      // Append bot message
      const botMessage: Message = {
        id: generateUUID(),
        role: "bot",
        message: response.message,
        timestamp: new Date().toISOString(),
        agent: response.agent,
        intent: response.intent,
        tool_calls: response.tool_calls,
      }

      appendMessage(activeSession.id, botMessage)

      // Update session title if it's still "New Chat"
      if (activeSession.title === "New Chat" && activeSession.messages.length === 0) {
        const titlePreview = generateChatTitle([userMessage.message, botMessage.message])
        useChatsStore.setState((state) => ({
          sessions: {
            ...state.sessions,
            [activeSession.id]: {
              ...state.sessions[activeSession.id],
              title: titlePreview,
            },
          },
        }))
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to send message"
      setError(errorMessage)
      // Revert optimistic update by removing the user message
      useChatsStore.setState((state) => ({
        sessions: {
          ...state.sessions,
          [activeSession.id]: {
            ...state.sessions[activeSession.id],
            messages: state.sessions[activeSession.id].messages.filter((m) => m.id !== userMessage.id),
          },
        },
      }))
      // Restore message to textarea
      setMessage(userMessage.message)
    } finally {
      setIsLoading(false)
      unlockRequest(activeSession.id)
      textareaRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e as any)
    }
  }

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px"
    }
  }, [message])

  if (!activeSession) {
    return null
  }

  return (
    <form onSubmit={handleSendMessage} className="border-t bg-white p-4 space-y-2">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">{error}</div>}

      <div className="flex gap-2">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message... (Shift+Enter for newline)"
          disabled={isDisabled}
          className="resize-none"
          rows={1}
        />
        <Button type="submit" disabled={isDisabled} size="icon" className="self-end">
          <Send size={18} />
        </Button>
      </div>
    </form>
  )
}
