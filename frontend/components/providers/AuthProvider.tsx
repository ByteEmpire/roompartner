'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Restore token from sessionStorage on mount
    const token = sessionStorage.getItem('accessToken')
    if (token) {
      useAuthStore.getState().setAccessToken(token)
    }
  }, [])

  return <>{children}</>
}