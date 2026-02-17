import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/lib/api'
import { socketService } from '@/lib/socket'
import { User, AuthResponse, LoginFormData, SignupFormData } from '@/types'

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  setAccessToken: (token: string) => void
  setUser: (user: User) => void
  login: (data: LoginFormData) => Promise<void>
  signup: (data: SignupFormData) => Promise<void>
  logout: () => Promise<void>
  refreshAuth: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setAccessToken: (token: string) => {
        sessionStorage.setItem('accessToken', token)
        set({ accessToken: token, isAuthenticated: true })
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true })
      },

      login: async (data: LoginFormData) => {
        set({ isLoading: true, error: null })
        try {
          const response = await api.post('/auth/login', data)
          
          // Handle wrapped response { data: { user, accessToken } }
          const result = response.data.data || response.data
          const { user, accessToken } = result

          sessionStorage.setItem('accessToken', accessToken)

          set({
            user,
            accessToken,
            isAuthenticated: true,
            isLoading: false,
          })

          socketService.connect(accessToken)
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Login failed'
          set({ error: errorMessage, isLoading: false })
          throw error
        }
      },

      signup: async (data: SignupFormData) => {
        set({ isLoading: true, error: null })
        try {
          const response = await api.post('/auth/signup', data)
          
          // Handle wrapped response { data: { user, accessToken } }
          const result = response.data.data || response.data
          const { user, accessToken } = result

          console.log('Signup response:', result) // Debug log
          console.log('Access token:', accessToken) // Debug log
          
          sessionStorage.setItem('accessToken', accessToken)

          set({
            user,
            accessToken,
            isAuthenticated: true,
            isLoading: false,
          })

          socketService.connect(accessToken)
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Signup failed'
          set({ error: errorMessage, isLoading: false })
          throw error
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout')
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          socketService.disconnect()
          sessionStorage.removeItem('accessToken')

          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            error: null,
          })
        }
      },

      refreshAuth: async () => {
        try {
          const response = await api.post('/auth/refresh')
          const result = response.data.data || response.data
          const { user, accessToken } = result

          sessionStorage.setItem('accessToken', accessToken)

          set({
            user,
            accessToken,
            isAuthenticated: true,
          })

          socketService.connect(accessToken)
        } catch (error) {
          get().logout()
        }
      },

      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
)