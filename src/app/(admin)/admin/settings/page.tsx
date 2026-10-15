import type { Metadata } from 'next'
import { listSettingsServer } from '@/lib/settings.server'
import type { Setting } from '@/types/admin'
import { SettingsView } from './settings-view'

export const metadata: Metadata = {
  title: 'Settings',
}

export default async function AdminSettingsPage() {
  let settings: Setting[] = []
  try {
    settings = await listSettingsServer()
  } catch {
    settings = []
  }

  return <SettingsView initialSettings={settings} />
}