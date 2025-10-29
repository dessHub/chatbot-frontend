import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { ChatSession, RespChatSession, Message } from "@/lib/types"
import { generateUUID } from "@/lib/utils/uuid"
import { title } from "process"
import { generateChatTitle } from "../utils/generate-title"

interface ChatsStore {
  sessions: Record<string, ChatSession>
  activeSessionId: string | null
  requestLocks: Set<string> // Prevent duplicate sends

  createSession: () => string
  renameSession: (sessionId: string, newTitle: string) => void
  deleteSession: (sessionId: string) => void
  setActiveSession: (sessionId: string) => void
  appendMessage: (sessionId: string, message: Message) => void
  setSessions: (sessions: (ChatSession | RespChatSession)[]) => void
  getSessions: () => ChatSession[]
  getActiveSession: () => ChatSession | null
  lockRequest: (sessionId: string) => boolean
  unlockRequest: (sessionId: string) => void
  clearAll: () => void
}

export const useChatsStore = create<ChatsStore>()(
  persist(
    (set, get) => ({
      sessions: {},
      activeSessionId: null,
      requestLocks: new Set(),

      createSession: () => {
        // session id to include date and uuid
        const sessionId = new Date().getDate() + generateUUID();
        const newSession: ChatSession = {
          id: sessionId,
          title: "New Chat",
          messages: [],
          createdAt: new Date().toISOString(),
        }

        set((state) => ({
          sessions: {
            ...state.sessions,
            [sessionId]: newSession,
          },
          activeSessionId: sessionId,
        }))

        return sessionId
      },

      renameSession: (sessionId: string, newTitle: string) => {
        set((state) => ({
          sessions: {
            ...state.sessions,
            [sessionId]: {
              ...state.sessions[sessionId],
              title: newTitle,
            },
          },
        }))
      },

      deleteSession: (sessionId: string) => {
        set((state) => {
          const newSessions = { ...state.sessions }
          delete newSessions[sessionId]

          return {
            sessions: newSessions,
            activeSessionId:
              state.activeSessionId === sessionId ? Object.keys(newSessions)[0] || null : state.activeSessionId,
          }
        })
      },

      setActiveSession: (sessionId: string) => {
        set({ activeSessionId: sessionId })
      },

      appendMessage: (sessionId: string, message: Message) => {
        set((state) => ({
          sessions: {
            ...state.sessions,
            [sessionId]: {
              ...state.sessions[sessionId],
              messages: [...(state.sessions[sessionId]?.messages || []), message],
            },
          },
        }))
      },

      setSessions: async (sessions: (ChatSession | RespChatSession)[]) => {
        console.log("Setting sessions in store:", sessions)
        const sessionsMap: Record<string, ChatSession> = {}
        for (const session of sessions) {
          const isResp = "session_id" in session
          const id = "id" in session && session.id ? session.id : isResp ? session.session_id : generateUUID()
          
          const messages: Message[] =
            ("messages" in session && session.messages) ? session.messages :
            ("chats" in session && session.chats) ? (session.chats as Message[]) :
            []
          // pick the first to messages to generate title
          let titleMessages = messages.slice(0, 3).map(msg => msg.message)
          // if no messages, use default title
          if (titleMessages.length === 0) {
            titleMessages = ["New Chat"]
          }
          const title = generateChatTitle(titleMessages)
          const createdAt =
            messages.length > 0 && (messages[0] as any).timestamp
              ? (messages[0] as any).timestamp
              : new Date().toISOString()
          sessionsMap[id] = {
            title,
            messages,
            id,
            createdAt,
          }
        }
        console.log("Transformed sessions map:", sessionsMap)
        set({ sessions: sessionsMap })
      },

      getSessions: () => {
        const state = get()
        return Object.values(state.sessions).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
      },

      getActiveSession: () => {
        const state = get()
        return state.activeSessionId ? state.sessions[state.activeSessionId] : null
      },

      lockRequest: (sessionId: string): boolean => {
        const state = get()
        // normalize persisted requestLocks to a Set (rehydration may have turned it into an array/object)
        const currentLocks: any = state.requestLocks
        const locks = currentLocks instanceof Set ? currentLocks : new Set(Array.isArray(currentLocks) ? currentLocks : [])
        if (locks.has(sessionId)) {
          return false
        }
        const newLocks = new Set(locks)
        newLocks.add(sessionId)
        set({ requestLocks: newLocks })
        return true
      },

      unlockRequest: (sessionId: string) => {
        const state = get()
        const currentLocks: any = state.requestLocks
        const locks = currentLocks instanceof Set ? currentLocks : new Set(Array.isArray(currentLocks) ? currentLocks : [])
        if (!locks.has(sessionId)) return
        const newLocks = new Set(locks)
        newLocks.delete(sessionId)
        set({ requestLocks: newLocks })
      },

      clearAll: () => {
        set({
          sessions: {},
          activeSessionId: null,
          requestLocks: new Set(),
        })
      },
    }),
    {
      name: "chats-store",
      storage: typeof window !== "undefined" ? createJSONStorage(() => localStorage) : undefined,
    },
  ),
)
