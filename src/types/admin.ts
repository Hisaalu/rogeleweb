export interface AdminOverview {
  total_users: number
  users_by_role: Record<string, number>
  new_users_last_30_days: number
  active_subscriptions: number
  active_trials: number
  total_classes: number
  total_subjects: number
  total_lessons: number
  total_homework: number
  total_quizzes: number
  revenue_this_month: number
  revenue_last_month: number
  total_payments: number
  payments_by_status: Record<string, number>
}

export interface AdminActivityItem {
  id: number
  action: string
  description?: string
  created_at: string
  user_id?: number
  user_email?: string
  user_first_name?: string
  user_last_name?: string
  user_role?: string
}

export interface AdminUserSummary {
  id: number
  email: string
  first_name?: string
  last_name?: string
  role: string
  is_active: boolean
  is_suspended: boolean
  created_at: string
  class_id?: number
  class_name?: string
}

export interface AdminPaymentSummary {
  id: number
  user_id?: number
  amount?: number
  plan_type?: string
  payment_method?: string
  transaction_id?: string
  status: string
  created_at: string
  payment_date?: string
  user_email?: string
  user_first_name?: string
  user_last_name?: string
}