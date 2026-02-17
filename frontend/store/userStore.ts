import { create } from 'zustand'
import api from '@/lib/api'
import { Profile, ProfileFormData, MatchFilters, User } from '@/types'

interface UserState {
  profile: Profile | null
  matches: User[]
  isLoading: boolean
  error: string | null
  filters: MatchFilters

  loadProfile: () => Promise<void>
  createProfile: (data: ProfileFormData) => Promise<void>
  updateProfile: (data: ProfileFormData) => Promise<void>
  uploadProfileImage: (file: File) => Promise<string>
  uploadRoomImages: (files: File[]) => Promise<string[]>
  loadMatches: (filters?: MatchFilters) => Promise<void>
  setFilters: (filters: MatchFilters) => void
  clearError: () => void
}

export const useUserStore = create<UserState>((set, get) => ({
  profile: null,
  matches: [],
  isLoading: false,
  error: null,
  filters: {},

  loadProfile: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await api.get<Profile>('/profiles/me')
      const profile = (response.data as any).data || response.data
      set({ profile, isLoading: false })
    } catch (error: any) {
      if (error.response?.status === 404) {
        set({ profile: null, isLoading: false })
      } else {
        set({ error: error.response?.data?.message || 'Failed to load profile', isLoading: false })
      }
    }
  },

  createProfile: async (data: ProfileFormData) => {
    set({ isLoading: true, error: null })
    try {
      const response = await api.post<Profile>('/profiles', data)
      const profile = (response.data as any).data || response.data
      set({ profile, isLoading: false })
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to create profile', isLoading: false })
      throw error
    }
  },

  updateProfile: async (data: ProfileFormData) => {
    set({ isLoading: true, error: null })
    try {
      const response = await api.put<Profile>('/profiles/me', data)
      const profile = (response.data as any).data || response.data
      set({ profile, isLoading: false })
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to update profile', isLoading: false })
      throw error
    }
  },

  uploadProfileImage: async (file: File) => {
    try {
      const { data: signData } = await api.get('/uploads/signature/profile')
      const signature = (signData as any).data || signData

      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', signature.uploadPreset)
      formData.append('api_key', signature.apiKey)
      formData.append('timestamp', signature.timestamp)
      formData.append('signature', signature.signature)

      const uploadResponse = await fetch(signature.cloudinaryUrl, {
        method: 'POST',
        body: formData,
      })

      const uploadData = await uploadResponse.json()
      return uploadData.secure_url
    } catch (error: any) {
      set({ error: 'Failed to upload image' })
      throw error
    }
  },

  uploadRoomImages: async (files: File[]) => {
    try {
      const uploadPromises = files.map(async (file) => {
        const { data: signData } = await api.get('/uploads/signature/room')
        const signature = (signData as any).data || signData

        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', signature.uploadPreset)
        formData.append('api_key', signature.apiKey)
        formData.append('timestamp', signature.timestamp)
        formData.append('signature', signature.signature)

        const uploadResponse = await fetch(signature.cloudinaryUrl, {
          method: 'POST',
          body: formData,
        })

        const uploadData = await uploadResponse.json()
        return uploadData.secure_url
      })

      return await Promise.all(uploadPromises)
    } catch (error: any) {
      set({ error: 'Failed to upload images' })
      throw error
    }
  },

  loadMatches: async (filters?: MatchFilters) => {
    set({ isLoading: true, error: null })
    try {
      const params = filters || get().filters
      const response = await api.get<User[]>('/matches', { params })
      const matches = (response.data as any).data || response.data
      set({ matches, isLoading: false })
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to load matches', isLoading: false })
    }
  },

  setFilters: (filters: MatchFilters) => {
    set({ filters })
    get().loadMatches(filters)
  },

  clearError: () => {
    set({ error: null })
  },
}))