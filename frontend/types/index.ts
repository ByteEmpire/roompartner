// ============ USER & AUTH ============
export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export enum GenderPreference {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  ANY = 'ANY',
}

export enum OccupationType {
  STUDENT = 'STUDENT',
  WORKING_PROFESSIONAL = 'WORKING_PROFESSIONAL',
  FREELANCER = 'FREELANCER',
  OTHER = 'OTHER',
}

export enum FoodPreference {
  VEGETARIAN = 'VEGETARIAN',
  NON_VEGETARIAN = 'NON_VEGETARIAN',
  VEGAN = 'VEGAN',
  JAIN = 'JAIN',
}

export enum SubscriptionPlan {
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM',
  ELITE = 'ELITE',
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export interface User {
  id: string
  email: string
  role: Role
  isVerified: boolean
  createdAt: string
  updatedAt: string
  profile?: Profile
  subscription?: Subscription
}

export interface Profile {
  id: string
  userId: string
  fullName: string
  age: number
  gender: Gender
  phoneNumber?: string
  bio?: string
  profileImage?: string
  city: string
  locality?: string
  budget: number
  moveInDate?: string
  preferredGender: GenderPreference
  occupationType: OccupationType
  foodPreference?: FoodPreference
  drinking: boolean
  smoking: boolean
  pets: boolean
  roomImages: string[]
  isActive: boolean
  lastActive: string
  createdAt: string
  updatedAt: string
}

export interface Message {
  id: string
  content: string
  senderId: string
  receiverId: string
  isRead: boolean
  createdAt: string
  sender?: User
  receiver?: User
}

export interface Subscription {
  id: string
  userId: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  startDate: string
  endDate: string
  createdAt: string
  updatedAt: string
}

// ============ API RESPONSES ============
export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export interface ApiError {
  message: string
  statusCode: number
  error?: string
}

// ============ FORM TYPES ============
export interface SignupFormData {
  email: string
  password: string
  confirmPassword: string
}

export interface LoginFormData {
  email: string
  password: string
}

export interface ProfileFormData {
  fullName: string
  age: number
  gender: Gender
  phoneNumber: string
  bio: string
  profileImage?: string  // ✅ ADDED THIS
  city: string
  locality: string
  budget: number
  moveInDate: string
  preferredGender: GenderPreference
  occupationType: OccupationType
  foodPreference: FoodPreference
  drinking: boolean
  smoking: boolean
  pets: boolean
  roomImages?: string[]  // ✅ ADDED THIS TOO
}

export interface MatchFilters {
  city?: string
  minBudget?: number
  maxBudget?: number
  gender?: Gender
  occupationType?: OccupationType
  foodPreference?: FoodPreference
}

// ============ SOCKET EVENTS ============
export interface SocketMessage {
  id: string
  content: string
  senderId: string
  receiverId: string
  createdAt: string
}

export interface TypingEvent {
  userId: string
  receiverId: string
  isTyping: boolean
}

export interface OnlineStatusEvent {
  userId: string
  isOnline: boolean
}