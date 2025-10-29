import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { AuthState } from "@/lib/types"

interface AuthStore extends AuthState {
  login: (token: string, user_id: string) => void
  logout: () => void
  isAuthenticated: () => boolean
  hydrate: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      token: null,
      user_id: null,

      login: (token: string, user_id: string) => {
        set({ token, user_id })
        // Set auth cookie for middleware
        document.cookie = `auth=true; path=/; max-age=86400`
      },

      logout: () => {
        set({ token: null, user_id: null })
        // Clear auth cookie
        document.cookie = `auth=; path=/; max-age=0`
      },

      isAuthenticated: () => {
        const state = get()
        return !!(state.token && state.user_id)
      },

      hydrate: () => {
        // This is called on app initialization to restore state from localStorage
      },
    }),
    {
      name: "auth-store",
      storage: typeof window !== "undefined" ? createJSONStorage(() => localStorage) : undefined,
    },
  ),
)
