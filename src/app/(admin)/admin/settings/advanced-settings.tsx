'use client'

import React, { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast-provider'
import { createSettingClient, updateSettingClient } from '@/lib/settings.client'
import type { Setting } from '@/types/admin'

const BRANDING_PREFIX = 'branding.'

const AdvancedSettingRow = React.memo(function AdvancedSettingRow({
  setting,
  isEditing,
  isSaving,
  onEditValue,
  onSave,
  onCancel,
  onDelete,
  editingValue,
}: {
  setting: Setting
  isEditing: boolean
  isSaving: boolean
  editingValue: string
  onEditValue: (val: string) => void
  onSave: () => void
  onCancel: () => void
  onDelete: () => void
}) {
  return (
    <div className="grid gap-3 px-5 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-center hover:bg-muted/20 transition-colors">
      <code className="truncate text-sm font-medium text-foreground">{setting.setting_key}</code>
      {isEditing ? (
        <Input
          value={editingValue}
          onChange={(e) => onEditValue(e.target.value)}
          disabled={isSaving}
          autoFocus
        />
      ) : (
        <span className="truncate text-sm text-muted-foreground">
          {setting.setting_value ?? '—'}
        </span>
      )}
      <div className="flex gap-2">
        {isEditing ? (
          <>
            <Button size="sm" onClick={onSave} disabled={isSaving}>
              {isSaving && <Loader2 size={12} className="animate-spin" />}
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={onCancel} disabled={isSaving}>
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button size="sm" variant="outline" onClick={() => onEditValue(setting.setting_value ?? '')}>
              Edit
            </Button>
            <button
              type="button"
              onClick={onDelete}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-danger-bg hover:text-danger-fg"
              aria-label="Delete setting"
            >
              <Trash2 size={14} />
            </button>
          </>
        )}
      </div>
    </div>
  )
})

export function AdvancedSettings({
  settings,
  onChange,
  onDelete,
}: {
  settings: Setting[]
  onChange: (settings: Setting[]) => void
  onDelete: (id: number) => Promise<void>
}) {
  const router = useRouter()
  const { showToast } = useToast()
  const [editing, setEditing] = useState<Record<number, string>>({})
  const [savingId, setSavingId] = useState<number | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Setting | null>(null)
  const [adding, setAdding] = useState(false)
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')
  const [busy, setBusy] = useState(false)

  const nonBranding = settings.filter((s) => !s.setting_key.startsWith(BRANDING_PREFIX))

  const startEdit = useCallback((s: Setting) => {
    setEditing((e) => ({ ...e, [s.id]: s.setting_value ?? '' }))
  }, [])

  const cancelEdit = useCallback((id: number) => {
    setEditing((e) => {
      const next = { ...e }
      delete next[id]
      return next
    })
  }, [])

  const save = useCallback(async (id: number) => {
    const value = editing[id] ?? ''
    setSavingId(id)
    try {
      const updated = await updateSettingClient(id, value)
      onChange(settings.map((s) => (s.id === updated.id ? updated : s)))
      cancelEdit(id)
      showToast('Setting saved.', 'success')
      router.refresh()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save', 'error')
    } finally {
      setSavingId(null)
    }
  }, [editing, settings, onChange, cancelEdit, showToast, router])

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return
    try {
      await onDelete(deleteTarget.id)
      onChange(settings.filter((s) => s.id !== deleteTarget.id))
      showToast('Setting deleted.', 'success')
      router.refresh()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Delete failed', 'error')
    } finally {
      setDeleteTarget(null)
    }
  }, [deleteTarget, onDelete, settings, onChange, showToast, router])

  const handleAdd = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newKey.trim()) return
    setBusy(true)
    try {
      const created = await createSettingClient({
        setting_key: newKey.trim(),
        setting_value: newValue,
      })
      onChange([created, ...settings])
      setNewKey('')
      setNewValue('')
      setAdding(false)
      showToast('Setting added.', 'success')
      router.refresh()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to add', 'error')
    } finally {
      setBusy(false)
    }
  }, [newKey, newValue, onChange, settings, showToast, router])

  return (
    <>
      <section className="rounded-xl border border-border bg-card shadow-sm">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold">Advanced</h2>
            <p className="text-xs text-muted-foreground">
              Raw key-value settings. Anything not under <code>branding.*</code>
            </p>
          </div>
          <Button variant="outline" onClick={() => setAdding((a) => !a)}>
            <Plus size={14} /> Add setting
          </Button>
        </header>

        {adding && (
          <form onSubmit={handleAdd} className="grid gap-3 border-b border-border bg-muted/20 p-5 sm:grid-cols-[1fr_1fr_auto]">
            <Input placeholder="site.browser_title" value={newKey} onChange={(e) => setNewKey(e.target.value)} disabled={busy} autoFocus />
            <Input placeholder="NexaT" value={newValue} onChange={(e) => setNewValue(e.target.value)} disabled={busy} />
            <div className="flex gap-2">
              <Button type="submit" disabled={busy || !newKey.trim()}>
                {busy && <Loader2 size={14} className="animate-spin" />} Add
              </Button>
              <Button type="button" variant="outline" onClick={() => setAdding(false)} disabled={busy}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        <div className="divide-y divide-border">
          {nonBranding.length === 0 && !adding ? (
            <div className="px-5 py-6 text-sm text-muted-foreground">
              No extra settings yet. Add one if you need to store configuration values.
            </div>
          ) : (
            nonBranding.map((s) => (
              <AdvancedSettingRow
                key={s.id}
                setting={s}
                isEditing={s.id in editing}
                isSaving={savingId === s.id}
                editingValue={editing[s.id] ?? ''}
                onEditValue={(val) => {
                  if (!(s.id in editing)) startEdit(s)
                  setEditing((e) => ({ ...e, [s.id]: val }))
                }}
                onSave={() => save(s.id)}
                onCancel={() => cancelEdit(s.id)}
                onDelete={() => setDeleteTarget(s)}
              />
            ))
          )}
        </div>
      </section>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete setting"
        description={deleteTarget ? `Remove "${deleteTarget.setting_key}"?` : ''}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </>
  )
}