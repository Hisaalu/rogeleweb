'use client'

import { useState } from 'react'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Input } from '@/components/ui/input'
import { createSettingClient, updateSettingClient } from '@/lib/settings.client'
import type { Setting } from '@/types/admin'

const BRANDING_PREFIX = 'branding.'

export function AdvancedSettings({
  settings,
  onChange,
  onDelete,
}: {
  settings: Setting[]
  onChange: (settings: Setting[]) => void
  onDelete: (id: number) => Promise<void>
}) {
  const [editing, setEditing] = useState<Record<number, string>>({})
  const [savingId, setSavingId] = useState<number | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Setting | null>(null)
  const [adding, setAdding] = useState(false)
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')
  const [busy, setBusy] = useState(false)

  const nonBranding = settings.filter((s) => !s.setting_key.startsWith(BRANDING_PREFIX))

  function startEdit(s: Setting) {
    setEditing((e) => ({ ...e, [s.id]: s.setting_value ?? '' }))
  }

  function cancelEdit(id: number) {
    setEditing((e) => {
      const next = { ...e }
      delete next[id]
      return next
    })
  }

  async function save(id: number) {
    const value = editing[id] ?? ''
    setSavingId(id)
    try {
      const updated = await updateSettingClient(id, value)
      onChange(settings.map((s) => (s.id === updated.id ? updated : s)))
      cancelEdit(id)
    } finally {
      setSavingId(null)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await onDelete(deleteTarget.id)
      onChange(settings.filter((s) => s.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch {
      // ignore, shown by parent
    }
  }

  async function handleAdd(e: React.FormEvent) {
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
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <section className="rounded-xl border border-border bg-card">
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold">Advanced</h2>
            <p className="text-xs text-muted-foreground">
              Raw key-value settings. Anything not under <code>branding.*</code>
            </p>
          </div>
          <Button variant="outline" onClick={() => setAdding((a) => !a)}>
            <Plus size={14} />
            Add setting
          </Button>
        </header>

        {adding && (
          <form
            onSubmit={handleAdd}
            className="grid gap-3 border-b border-border bg-muted/20 p-5 sm:grid-cols-[1fr_1fr_auto]"
          >
            <Input
              placeholder="setting.key"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              disabled={busy}
              autoFocus
            />
            <Input
              placeholder="value"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              disabled={busy}
            />
            <div className="flex gap-2">
              <Button type="submit" disabled={busy || !newKey.trim()}>
                {busy && <Loader2 size={14} className="animate-spin" />}
                Add
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAdding(false)}
                disabled={busy}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        <div className="divide-y divide-border">
          {nonBranding.length === 0 && !adding ? (
            <div className="px-5 py-6 text-sm text-muted-foreground">
              No extra settings yet. Add one if you need to store configuration
              values.
            </div>
          ) : (
            nonBranding.map((s) => {
              const isEditing = s.id in editing
              const isSaving = savingId === s.id
              return (
                <div
                  key={s.id}
                  className="grid gap-3 px-5 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-center"
                >
                  <code className="truncate text-sm font-medium">{s.setting_key}</code>
                  {isEditing ? (
                    <Input
                      value={editing[s.id] ?? ''}
                      onChange={(e) =>
                        setEditing((prev) => ({ ...prev, [s.id]: e.target.value }))
                      }
                      disabled={isSaving}
                      autoFocus
                    />
                  ) : (
                    <span className="truncate text-sm text-muted-foreground">
                      {s.setting_value ?? '—'}
                    </span>
                  )}
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => save(s.id)}
                          disabled={isSaving}
                        >
                          {isSaving && <Loader2 size={12} className="animate-spin" />}
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => cancelEdit(s.id)}
                          disabled={isSaving}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant="outline" onClick={() => startEdit(s)}>
                          Edit
                        </Button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(s)}
                          className="rounded-lg p-2 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
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
          )}
        </div>
      </section>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete setting"
        description={
          deleteTarget ? `Remove "${deleteTarget.setting_key}"?` : ''
        }
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </>
  )
}