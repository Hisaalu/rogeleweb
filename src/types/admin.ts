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

export interface Class {
  id: number
  name: string
  level: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at?: string
}

export interface CreateClassPayload {
  name: string
  level: string
  description?: string
  is_active?: boolean
}

export interface UpdateClassPayload {
  name?: string
  level?: string
  description?: string
  is_active?: boolean
}

export interface Subject {
  id: number
  name: string
  code?: string
  description?: string
  class_id?: number
  teacher_id?: number
  is_active: boolean
  created_at: string
  updated_at?: string
}

export interface CreateSubjectPayload {
  name: string
  code?: string
  description?: string
  class_id?: number
  teacher_id?: number
  is_active?: boolean
}

export interface UpdateSubjectPayload {
  name?: string
  code?: string
  description?: string
  class_id?: number
  teacher_id?: number
  is_active?: boolean
}

export interface TeacherOption {
  id: number
  email: string
  first_name?: string
  last_name?: string
}

export interface SubscriptionPlan {
  id: number
  name: string
  description?: string
  price: number
  duration_days: number
  is_active: boolean
  created_at: string
  updated_at?: string
}

export interface CreatePlanPayload {
  name: string
  description?: string
  price: number
  duration_days: number
  is_active?: boolean
}

export interface UpdatePlanPayload {
  name?: string
  description?: string
  price?: number
  duration_days?: number
  is_active?: boolean
}

export type UserRole = 'admin' | 'teacher' | 'learner' | 'external'

export interface AdminUser {
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
  trial_start_date: string
}

export interface UpdateUserPayload {
  first_name?: string
  last_name?: string
  phone?: string
  bio?: string
  qualification?: string
  specialization?: string
  role?: UserRole
  class_id?: number
  is_active?: boolean
  is_suspended?: boolean
}

export interface UserListMeta {
  page: number
  per_page: number
  total: number
  last_page: number
}

export type QuizAttemptStatus = 'in_progress' | 'completed' | 'expired'

export interface QuizAttempt {
  id: number
  quiz_id?: number
  user_id?: number
  score?: number
  total_questions?: number
  correct_answers?: number
  time_taken?: number
  status: QuizAttemptStatus
  started_at: string
  completed_at?: string
  student_email?: string
  student_first_name?: string
  student_last_name?: string
  student_registration_number?: string
}

export type HomeworkStatus = 'pending' | 'submitted' | 'late' | 'graded'

export interface HomeworkSubmission {
  id: number
  homework_id: number
  student_id: number
  text_answer?: string
  grade?: number
  feedback?: string
  status: HomeworkStatus
  submitted_at?: string
  graded_at?: string
  created_at: string
  updated_at?: string
}

export interface Setting {
  id: number
  setting_key: string
  setting_value: string | null
  created_at: string
  updated_at?: string
}

export interface CreateSettingPayload {
  setting_key: string
  setting_value?: string
}

export interface AdminPayment {
  id: number
  user_id?: number
  subscription_id?: number
  amount?: number
  plan_type?: string
  payment_method?: string
  transaction_id?: string
  phone_number?: string
  status: string
  payment_date?: string
  created_at: string
  user_email?: string
  user_first_name?: string
  user_last_name?: string
}

export interface AdminSubscription {
  id: number
  user_id?: number
  plan_type: string
  amount?: number
  start_date: string
  end_date: string
  payment_method?: string
  transaction_id?: string
  status: string
  auto_renew: boolean
  created_at: string
  user_email?: string
  user_first_name?: string
  user_last_name?: string
}