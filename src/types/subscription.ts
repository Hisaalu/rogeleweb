export interface SubscriptionPlan {
  id: number
  name: string
  description?: string | null
  price: number
  duration_days: number
  is_active: boolean
  created_at?: string | null
}

export interface Subscription {
  id: number
  user_id?: number | null
  plan_id?: number | null
  plan_type: string
  status: string
  amount?: number | null
  start_date: string
  end_date: string
  payment_method?: string | null
  transaction_id?: string | null
  created_at?: string | null
}

export interface Payment {
  id: number
  user_id?: number | null
  subscription_id?: number | null
  amount?: number | null
  plan_type?: string | null
  payment_method?: string | null
  phone_number?: string | null
  transaction_id?: string | null
  status: string
  payment_date?: string | null
  created_at?: string | null
}

export interface InitiatePaymentResponse {
  payment: Payment
  provider_reference: string
  status: string
}

export type PaymentMethod = 'mtn' | 'airtel'