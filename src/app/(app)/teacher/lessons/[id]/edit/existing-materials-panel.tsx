'use client'

import { useEffect, useState } from 'react'
import { FileText, Loader2, X } from 'lucide-react'
import {
  deleteMaterial,
  listMaterials,
} from '@/lib/lessons.mutations'
import { formatFileSize, materialDownloadUrl } from '@/lib/materials'
import type { LessonMaterial } from '@/types/lesson'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

export function ExistingMaterialsPanel({ lessonId }: { lessonId: number }) {
  const [materials, setMaterials] = useState<LessonMaterial[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<number | null>(null)
  
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)

  useEffect(() => {
    let mounted = true
    listMaterials(lessonId).then((list) => {
      if (mounted) {
        setMaterials(list)
        setLoading(false)
      }
    })
    return () => {
      mounted = false
    }
  }, [lessonId])

  async function confirmDelete() {
    if (!deleteTarget) return
    setBusyId(deleteTarget)
    try {
      await deleteMaterial(lessonId, deleteTarget)
      setMaterials((prev) => prev.filter((m) => m.id !== deleteTarget))
      setDeleteTarget(null)
    } finally {
      setBusyId(null)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card px-4 py-6 text-sm text-muted-foreground">
        Loading materials...
      </div>
    )
  }

  if (materials.length === 0) return null

  return (
    <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-6">
      <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground">
        <FileText size={18} style={{ color: 'var(--brand-accent)' }} />
        Existing Materials
      </h2>
      <ul className="space-y-2">
        {materials.map((m) => (
          <li
            key={m.id}
            className="flex flex-wrap items-center gap-3 rounded-lg bg-muted px-3 py-2 text-sm"
          >
            <FileText size={15} style={{ color: 'var(--brand-accent)' }} />
            <a
              href={materialDownloadUrl(m.file_path)}
              target="_blank"
              rel="noopener noreferrer"
              className="min-w-0 flex-1 truncate font-medium text-foreground underline-offset-2 hover:underline"
            >
              {m.file_name ?? 'Unnamed file'}
            </a>
            <span className="text-xs text-muted-foreground">
              {formatFileSize(m.file_size)}
            </span>
            <button
              type="button"
              onClick={() => setDeleteTarget(m.id)}
              disabled={busyId === m.id}
              className="text-xs transition hover:opacity-70"
              style={{ color: 'var(--danger-fg)' }}
            >
              {busyId === m.id ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <X size={14} />
              )}
            </button>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Material"
        description="Are you sure you want to delete this file? Students will no longer be able to download it."
        confirmLabel="Delete"
        destructive
        loading={busyId !== null}
        onConfirm={confirmDelete}
      />
    </div>
  )
}