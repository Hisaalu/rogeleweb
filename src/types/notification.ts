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

export interface SendBroadcastPayload {
  title: string
  message: string
  link?: string
  type?: NotificationType
}

export interface SendBroadcastResponse {
  sent: number
}