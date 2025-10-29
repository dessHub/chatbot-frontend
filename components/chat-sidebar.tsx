"use client"

import { useState } from "react"
import { useChatsStore } from "@/lib/store/chats"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Plus } from "lucide-react"

export function ChatSidebar() {
  const {
    sessions: allSessions,
    activeSessionId,
    createSession,
    setActiveSession,
    deleteSession,
    renameSession,
  } = useChatsStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState("")

  const sessions = (Object.values(allSessions) || [])
    .filter((s) => s.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const handleNewChat = () => {
    createSession()
  }

  const handleRename = (sessionId: string, currentTitle: string) => {
    setEditingId(sessionId)
    setEditingTitle(currentTitle)
  }

  const handleSaveRename = (sessionId: string) => {
    if (editingTitle.trim()) {
      renameSession(sessionId, editingTitle)
    }
    setEditingId(null)
  }

  const handleDelete = (sessionId: string) => {
    deleteSession(sessionId)
  }

  return (
    <aside className="w-64 border-r bg-gray-50 flex flex-col h-screen">
      <div className="p-4 border-b">
        <Button onClick={handleNewChat} className="w-full gap-2">
          <Plus size={18} />
          New Chat
        </Button>
      </div>

      <div className="p-4 border-b">
        <Input
          placeholder="Search chats..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="text-sm"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {sessions.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">
            {searchQuery ? "No chats found" : "Create your first chat"}
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`group flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors ${
                  activeSessionId === session.id ? "bg-white border border-blue-200" : "hover:bg-white"
                }`}
              >
                {editingId === session.id ? (
                  <input
                    autoFocus
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onBlur={() => handleSaveRename(session.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveRename(session.id)
                      if (e.key === "Escape") setEditingId(null)
                    }}
                    className="flex-1 px-2 py-1 border rounded text-sm"
                  />
                ) : (
                  <div
                    onClick={() => setActiveSession(session.id)}
                    className="flex-1 min-w-0"
                    onDoubleClick={() => handleRename(session.id, session.title)}
                  >
                    <p className="text-sm font-medium truncate">{session.title}</p>
                    <p className="text-xs text-gray-500">
                      {session.messages.length} message{session.messages.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                )}
                <button
                  onClick={() => handleDelete(session.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded"
                  aria-label="Delete chat"
                >
                  <Trash2 size={16} className="text-red-600" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}
