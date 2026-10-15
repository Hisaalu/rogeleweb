'use client'

import { useState } from 'react'
import { Save, Settings as SettingsIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useBranding } from '@/components/brand/brand-provider'
import {
  createSettingClient,
  deleteSettingClient,
  updateSettingClient,
} from '@/lib/settings.client'
import type { Setting } from '@/types/admin'
import { AdvancedSettings } from './advanced-settings'

const BRANDING_FIELDS = [
  { key: 'branding.school_name', label: 'School name', type: 'text' },
  { key: 'branding.tagline', label: 'Tagline', type: 'text' },
  { key: 'branding.logo_url', label: 'Logo URL', type: 'url' },
  { key: 'branding.favicon_url', label: 'Favicon URL', type: 'url' },
  { key: 'branding.color_primary', label: 'Primary color', type: 'color' },
  { key: 'branding.color_accent', label: 'Accent color', type: 'color' },
  { key: 'branding.support_email', label: 'Support email', type: 'email' },
  { key: 'branding.website_url', label: 'Website URL', type: 'url' },
] as const

type BrandingKey = (typeof BRANDING_FIELDS)[number]['key']

export function SettingsView({ initialSettings }: { initialSettings: Setting[] }) {
  const branding = useBranding()
  const [settings, setSettings] = useState<Setting[]>(initialSettings)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [brandingValues, setBrandingValues] = useState<Record<BrandingKey, string>>(
    () => {
      const initial: Record<string, string> = {}
      for (const f of BRANDING_FIELDS) {
        const found = initialSettings.find((s) => s.setting_key === f.key)
        initial[f.key] = found?.setting_value ?? ''
      }
      return initial as Record<BrandingKey, string>
    },
  )

  function setBranding(key: BrandingKey, value: string) {
    setBrandingValues((v) => ({ ...v, [key]: value }))
  }

  function findExisting(key: string): Setting | undefined {
    return settings.find((s) => s.setting_key === key)
  }

  async function saveBranding() {
    setSaving(true)
    setError(null)
    setMessage(null)

    try {
      for (const f of BRANDING_FIELDS) {
        const value = brandingValues[f.key]
        const existing = findExisting(f.key)

        if (existing) {
          if ((existing.setting_value ?? '') !== value) {
            const updated = await updateSettingClient(existing.id, value)
            setSettings((list) =>
              list.map((s) => (s.id === updated.id ? updated : s)),
            )
          }
        } else if (value) {
          const created = await createSettingClient({
            setting_key: f.key,
            setting_value: value,
          })
          setSettings((list) => [created, ...list])
        }
      }
      setMessage('Branding saved. Reload the page to see it everywhere.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Branding, colors, contact details, and other platform settings.
        </p>
      </div>

      {message && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {message}
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <section className="rounded-xl border border-border bg-card">
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold">Branding</h2>
            <p className="text-xs text-muted-foreground">
              Controls the platform's name, logo, and colors.
            </p>
          </div>
          <Button
            onClick={saveBranding}
            disabled={saving}
            style={{ backgroundColor: branding.colorPrimary }}
          >
            <Save size={14} />
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </header>

        <div className="grid gap-5 p-5 sm:grid-cols-2">
          {BRANDING_FIELDS.map((f) => (
            <div key={f.key} className="space-y-1.5">
              <Label htmlFor={f.key}>{f.label}</Label>
              {f.type === 'color' ? (
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    id={f.key}
                    value={brandingValues[f.key] || '#000000'}
                    onChange={(e) => setBranding(f.key, e.target.value)}
                    className="h-10 w-14 cursor-pointer rounded-lg border border-input"
                  />
                  <Input
                    value={brandingValues[f.key]}
                    onChange={(e) => setBranding(f.key, e.target.value)}
                    placeholder="#7f2677"
                    disabled={saving}
                  />
                </div>
              ) : (
                <Input
                  id={f.key}
                  type={f.type}
                  value={brandingValues[f.key]}
                  onChange={(e) => setBranding(f.key, e.target.value)}
                  disabled={saving}
                />
              )}
              <p className="text-xs text-muted-foreground">
                Key: <code>{f.key}</code>
              </p>
            </div>
          ))}
        </div>
      </section>

      <AdvancedSettings
        settings={settings}
        onChange={setSettings}
        onDelete={deleteSettingClient}
      />

      <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
        <SettingsIcon size={14} />
        The public config endpoint caches branding for 60 seconds. Changes appear
        everywhere after a short delay or a hard refresh.
      </div>
    </div>
  )
}