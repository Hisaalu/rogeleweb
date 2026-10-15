export type RecipientType =
  | 'all_users'
  | 'teachers'
  | 'learners'
  | 'external'
  | 'admins'
  | 'specific_users'
  | 'custom_emails'

export type CampaignStatus = 'draft' | 'sending' | 'completed' | 'failed'

export interface EmailCampaign {
  id: number
  subject: string
  body: string
  recipient_type: RecipientType
  total_recipients: number
  sent_count: number
  failed_count: number
  status: CampaignStatus
  created_by?: number
  created_at: string
  sent_at?: string
}

export interface EmailLog {
  id: number
  campaign_id?: number
  recipient_email: string
  recipient_name?: string
  subject: string
  status: 'pending' | 'sent' | 'failed'
  error_message?: string
  sent_at?: string
  created_at: string
}

export interface CreateCampaignPayload {
  subject: string
  body: string
  recipient_type: RecipientType
  recipient_ids?: number[]
  custom_emails?: string[]
}

export interface PreviewPayload {
  sample_email?: string
  sample_name?: string
}

export interface PreviewResponse {
  subject: string
  html: string
  recipient_count: number
}

export interface SendResponse {
  campaign_id: number
  queued_count: number
  status: string
}