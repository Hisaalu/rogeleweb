'use client'

import React, { useState, useCallback } from 'react'
import { useRouter } from 'nextjs-toploader/app'
import { Loader2, Save, Settings as SettingsIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast-provider'
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

const BrandingField = React.memo(function BrandingField({
  field,
  value,
  onChange,
  disabled,
}: {
  field: typeof BRANDING_FIELDS[number]
  value: string
  onChange: (val: string) => void
  disabled: boolean
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={field.key}>{field.label}</Label>
      {field.type === 'color' ? (
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="color"
            id={field.key}
            value={value || '#000000'}
            onChange={(e) => onChange(e.target.value)}
            className="h-10 w-14 shrink-0 cursor-pointer rounded-sm border border-input bg-background"
          />
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#7f2677"
            disabled={disabled}
            className="min-w-0 flex-1"
          />
        </div>
      ) : (
        <Input
          id={field.key}
          type={field.type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      )}
    </div>
  )
})

export function SettingsView({ initialSettings }: { initialSettings: Setting[] }) {
  const router = useRouter()
  const { showToast } = useToast()
  const [settings, setSettings] = useState<Setting[]>(initialSettings)
  const [saving, setSaving] = useState(false)

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

  const setBranding = useCallback((key: BrandingKey, value: string) => {
    setBrandingValues((v) => ({ ...v, [key]: value }))
  }, [])

  const findExisting = useCallback((key: string) => {
    return settings.find((s) => s.setting_key === key)
  }, [settings])

  const saveBranding = useCallback(async () => {
    setSaving(true)
    try {
      for (const f of BRANDING_FIELDS) {
        const value = brandingValues[f.key]
        const existing = findExisting(f.key)

        if (existing) {
          if ((existing.setting_value ?? '') !== value) {
            const updated = await updateSettingClient(existing.id, value)
            setSettings((list) => list.map((s) => (s.id === updated.id ? updated : s)))
          }
        } else if (value) {
          const created = await createSettingClient({
            setting_key: f.key,
            setting_value: value,
          })
          setSettings((list) => [created, ...list])
        }
      }
      showToast('Branding saved. Reload the page to see it everywhere.', 'success')
      router.refresh()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save settings', 'error')
    } finally {
      setSaving(false)
    }
  }, [brandingValues, findExisting, showToast, router])

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center">
        <h1 className="text-2xl font-bold sm:text-3xl">Settings</h1>
        <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
          Branding, colors, contact details, and other platform settings.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>Branding</CardTitle>
          <Button onClick={saveBranding} disabled={saving} className="w-full sm:w-auto">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          {BRANDING_FIELDS.map((f) => (
            <BrandingField
              key={f.key}
              field={f}
              value={brandingValues[f.key]}
              onChange={(val) => setBranding(f.key, val)}
              disabled={saving}
            />
          ))}
        </CardContent>
      </Card>

      <AdvancedSettings
        settings={settings}
        onChange={setSettings}
        onDelete={deleteSettingClient}
      />

      <div className="flex items-start gap-2 rounded-sm border border-border bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
        <SettingsIcon size={14} className="mt-0.5 shrink-0" />
        <span className="min-w-0">
          The public config endpoint caches settings for 60 seconds. Changes appear everywhere after a short delay or a hard refresh.
        </span>
      </div>
    </div>
  )
}