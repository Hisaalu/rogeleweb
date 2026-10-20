const R2_PUBLIC_URL =
  process.env.NEXT_PUBLIC_R2_PUBLIC_URL ??
  'https://docs.raysofgrace.ac.ug/rogele-platform/uploads/lessons'

export function materialDownloadUrl(filePath?: string | null): string {
  if (!filePath) return '#'
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath
  }
  const name = filePath.split('/').pop() ?? filePath
  return `${R2_PUBLIC_URL.replace(/\/$/, '')}/${name}`
}

export function formatFileSize(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}