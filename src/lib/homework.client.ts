'use client'

import type { Homework, HomeworkAttachment } from '@/types/homework'

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

export async function createHomeworkClient(payload: Partial<Homework>): Promise<Homework> {
  return proxyJson<Homework>('/homework', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateHomeworkClient(id: number, payload: Partial<Homework>): Promise<Homework> {
  return proxyJson<Homework>(`/homework/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function deleteHomeworkClient(id: number): Promise<void> {
  await proxyJson(`/homework/${id}`, { method: 'DELETE' })
}

export async function toggleSubmissionsClient(id: number, is_active: boolean): Promise<void> {
  await proxyJson(`/homework/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ is_active }),
  })
}

export async function addHomeworkAttachmentClient(homeworkId: number, file: File): Promise<HomeworkAttachment> {
  const presign = await proxyJson<{ upload_url: string; public_url: string }>('/uploads/presign', {
    method: 'POST',
    body: JSON.stringify({
      file_name: file.name,
      content_type: file.type || 'application/octet-stream',
      size: file.size,
    }),
  })

  const uploadRes = await fetch(presign.upload_url, {
    method: 'PUT',
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
    body: file,
  })
  if (!uploadRes.ok) throw new Error('Upload failed')

  return proxyJson<HomeworkAttachment>(`/homework/${homeworkId}/attachments`, {
    method: 'POST',
    body: JSON.stringify({
      file_name: file.name,
      file_path: presign.public_url,
      file_size: file.size,
    }),
  })
}

export async function deleteHomeworkAttachmentClient(homeworkId: number, attachmentId: number): Promise<void> {
  await proxyJson(`/homework/${homeworkId}/attachments/${attachmentId}`, { method: 'DELETE' })
}

export async function gradeSubmissionClient(submissionId: number, grade: number, feedback: string): Promise<void> {
  await proxyJson(`/homework/submissions/${submissionId}/grade`, {
    method: 'POST',
    body: JSON.stringify({ grade, feedback }),
  })
}