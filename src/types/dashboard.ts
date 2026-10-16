export interface TrialStatus {
  is_in_trial: boolean
  days_remaining: number
  end_date: string | null
  total_days: number
  percentage_used: number
}

export interface SubscriptionSummary {
  id: number
  plan_type: string
  status: string
  amount?: number
  start_date: string
  end_date: string
  payment_method?: string
  transaction_id?: string
}

export interface CalendarEvent {
  id: string | number
  date: string
  time: string
  title: string
  subject?: string
  url: string
}

export interface DashboardData {
  trial: TrialStatus | null
  subscription: SubscriptionSummary | null
  events: CalendarEvent[]
}