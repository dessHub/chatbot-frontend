"use client"

import { useAuthStore } from "@/lib/store/auth"
import { useChatsStore } from "@/lib/store/chats"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function ChatHeader() {
  const router = useRouter()
  const { user, org, logout } = useAuthStore()
  const { clearAll } = useChatsStore()

  const handleLogout = () => {
    logout()
    clearAll()
    router.push("/")
  }

  return (
    <header className="border-b bg-white sticky top-0 z-10">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">Chatbot</h1>
          <div className="text-sm text-gray-600">
            {user && org && (
              <span>
                {user} @ {org}
              </span>
            )}
          </div>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          Sign Out
        </Button>
      </div>
    </header>
  )
}
