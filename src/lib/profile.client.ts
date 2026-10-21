'use client'

async function proxyJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api/proxy${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  })
  if (res.status === 204) return undefined as T
  const text = await res.text()
  const data = text ? JSON.parse(text) : null
  if (!res.ok) {
    throw new Error(data?.error?.message ?? `Request failed with ${res.status}`)
  }
  return data as T
}

export async function updateProfileClient(payload: {
  first_name: string
  last_name: string
  email: string
  phone?: string
  class_id?: number
}): Promise<void> {
  await proxyJson('/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function uploadAvatarClient(file: File): Promise<void> {
  const presign = await proxyJson<{ upload_url: string; public_url: string }>('/uploads/presign', {
    method: 'POST',
    body: JSON.stringify({
      file_name: file.name,
      content_type: file.type || 'image/jpeg',
      size: file.size,
    }),
  })

  const uploadRes = await fetch(presign.upload_url, {
    method: 'PUT',
    headers: { 'Content-Type': file.type || 'image/jpeg' },
    body: file,
  })
  if (!uploadRes.ok) throw new Error('Upload failed')

  await proxyJson('/auth/me', {
    method: 'PATCH',
    body: JSON.stringify({ profile_photo: presign.public_url }),
  })
}