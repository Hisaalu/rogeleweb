import type { Metadata } from 'next'
import { SettingsView } from '@/components/settings/settings-view'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = { title: 'Settings' }

export default function LearnerSettingsPage() {
  return <SettingsView role="learner" />
}