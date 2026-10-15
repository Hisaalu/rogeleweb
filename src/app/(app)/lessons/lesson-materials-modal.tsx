'use client'

import { useEffect, useRef, useState } from 'react'
import { File as FileIcon, Loader2, Trash2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { EmptyState } from '@/components/ui/empty-state'
import {
  addMaterialClient,
  deleteMaterialClient,
  listMaterialsClient,
} from '@/lib/lessons.client'
import { uploadFile } from '@/lib/uploads.client'
import type { Lesson, LessonMaterial } from '@/types/lesson'

export function LessonMaterialsModal({
  open,
  onOpenChange,
  lesson,
  canEdit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  lesson: Lesson | null
  canEdit: boolean
}) {
  const [materials, setMaterials] = useState<LessonMaterial[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open || !lesson) return
    setLoading(true)
    setError(null)
    listMaterialsClient(lesson.id)
      .then(setMaterials)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [open, lesson])

  async function handleFileSelected(file: File) {
    if (!lesson) return
    setUploading(true)
    setProgress(0)
    setError(null)

    try {
      const uploaded = await uploadFile(file, 'lesson-materials', setProgress)

      const material = await addMaterialClient(lesson.id, {
        file_name: uploaded.fileName,
        file_path: uploaded.publicUrl,
        file_type: uploaded.fileType,
        file_size: uploaded.fileSize,
      })

      setMaterials((m) => [material, ...m])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      setProgress(0)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleDelete(id: number) {
    if (!lesson) return
    try {
      await deleteMaterialClient(lesson.id, id)
      setMaterials((m) => m.filter((x) => x.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Materials</DialogTitle>
          <DialogDescription>
            {lesson ? `Files attached to "${lesson.title}"` : ''}
          </DialogDescription>
        </DialogHeader>

        {canEdit && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handleFileSelected(f)
              }}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              {uploading ? `Uploading ${progress}%` : 'Upload file'}
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">
              Max 5 MB. PDFs, documents, images, and short videos.
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 size={14} className="animate-spin" />
            Loading materials...
          </div>
        ) : materials.length === 0 ? (
          <EmptyState
            icon={FileIcon}
            title="No materials"
            description={
              canEdit
                ? 'Upload the first file for this lesson.'
                : 'No files have been attached yet.'
            }
          />
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {materials.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
                <a
                  href={m.file_path}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-w-0 flex-1 items-center gap-2 hover:underline"
                >
                  <FileIcon size={16} className="shrink-0 text-brand-accent" />
                  <span className="truncate text-sm">{m.file_name}</span>
                </a>
                {canEdit && (
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="rounded p-1 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Delete material"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}