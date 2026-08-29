'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthResponse } from '@/types'

interface AuthState {
  user: Omit<AuthResponse, 'token'> | null
  token: string | null
  setSession: (session: AuthResponse) => void
  logout: () => void
  isAuthenticated: () => boolean
  isAdmin: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      setSession: ({ token, ...user }) => {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('borel-token', token)
        }
        set({ user, token })
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('borel-token')
        }
        set({ user: null, token: null })
      },

      isAuthenticated: () => Boolean(get().token),
      isAdmin: () => get().user?.role === 'admin',
    }),
    { name: 'borel-auth' },
  ),
)
