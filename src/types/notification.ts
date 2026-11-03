export type NotificationType =
  | 'homework'
  | 'quiz'
  | 'lesson'
  | 'payment'
  | 'subscription'
  | 'trial'
  | 'announcement'
  | 'system'

export interface Notification {
  id: number
  user_id?: number
  type: NotificationType
  title: string
  message: string
  link?: string
  is_read: boolean
  created_at: string
}

export type BroadcastAudience =
  | { kind: 'all' }
  | { kind: 'role'; role: 'learner' | 'teacher' | 'admin' | 'external' }
  | { kind: 'class'; class_id: number }
  | { kind: 'users'; user_ids: number[] }

export interface SendBroadcastPayload {
  title: string
  message: string
  link?: string
  type?: NotificationType
  audience?: BroadcastAudience
}

export interface SendBroadcastResponse {
  sent: number
  audience: string
  recipients: number
}