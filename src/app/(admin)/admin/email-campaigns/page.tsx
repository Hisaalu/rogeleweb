import type { Metadata } from 'next'
import { listCampaignsServer } from '@/lib/email-campaigns.server'
import type { EmailCampaign } from '@/types/email-campaign'
import { CampaignsView } from './campaigns-view'

export const metadata: Metadata = {
  title: 'Email campaigns',
}

export default async function AdminEmailCampaignsPage() {
  let campaigns: EmailCampaign[] = []
  try {
    campaigns = await listCampaignsServer({ per_page: 100 })
  } catch {
    campaigns = []
  }

  return <CampaignsView initialCampaigns={campaigns} />
}