export type UserRole = 'admin' | 'teacher' | 'learner' | 'external'

export interface User {
  id: number
  registration_number?: string
  email: string
  first_name?: string
  last_name?: string
  phone?: string
  bio?: string
  qualification?: string
  specialization?: string
  role: UserRole
  class_id?: number
  profile_photo?: string
  is_active: boolean
  is_suspended: boolean
  email_verified: boolean
  last_login?: string
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  user: User
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

export interface ApiError {
  error: {
    code: string
    message: string
  }
}

export interface Subscription {
  id: number
  user_id?: number
  plan_type: 'monthly' | 'termly' | 'yearly'
  amount?: number
  start_date: string
  end_date: string
  payment_method?: string
  transaction_id?: string
  status: 'active' | 'expired' | 'cancelled' | 'pending'
  auto_renew: boolean
  created_at: string
}

export interface FreeTrial {
  start_date: string
  end_date: string
  days: number
}

export interface Setting {
  id: number
  setting_key: string
  setting_value: string | null
  created_at: string
  updated_at?: string
}