import type {
  CreateHomeworkPayload,
  Homework,
  HomeworkAttachment,
  HomeworkSubmission,
  SubmissionFile,
  UpdateHomeworkPayload,
} from '@/types/homework'

function unwrap<T>(res: unknown): T[] {
  if (Array.isArray(res)) return res as T[]
  if (res && typeof res === 'object') {
    const obj = res as Record<string, unknown>
    if (Array.isArray(obj.data)) return obj.data as T[]
    if (Array.isArray(obj.value)) return obj.value as T[]
  }
  return []
}

async function proxy<T>(path: string, init: RequestInit = {}): Promise<T> {
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
    throw new Error(data?.error?.message ?? 'Request failed')
  }

  return data as T
}

export async function createHomeworkClient(
  payload: CreateHomeworkPayload,
): Promise<Homework> {
  return proxy<Homework>('/homework', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateHomeworkClient(
  id: number,
  payload: UpdateHomeworkPayload,
): Promise<Homework> {
  return proxy<Homework>(`/homework/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function deleteHomeworkClient(id: number): Promise<void> {
  await proxy<void>(`/homework/${id}`, { method: 'DELETE' })
}

export async function submitHomeworkClient(
  id: number,
  textAnswer: string,
): Promise<HomeworkSubmission> {
  return proxy<HomeworkSubmission>(`/homework/${id}/submit`, {
    method: 'POST',
    body: JSON.stringify({ text_answer: textAnswer || undefined }),
  })
}

export async function listSubmissionsClient(
  homeworkId: number,
): Promise<HomeworkSubmission[]> {
  const res = await proxy<unknown>(`/homework/${homeworkId}/submissions`)
  return unwrap<HomeworkSubmission>(res)
}

export async function listMySubmissionsClient(): Promise<HomeworkSubmission[]> {
  const res = await proxy<unknown>('/homework/my-submissions')
  return unwrap<HomeworkSubmission>(res)
}

export async function gradeSubmissionClient(
  submissionId: number,
  grade: number,
  feedback: string,
): Promise<HomeworkSubmission> {
  return proxy<HomeworkSubmission>(
    `/homework/submissions/${submissionId}/grade`,
    {
      method: 'POST',
      body: JSON.stringify({ grade, feedback: feedback || undefined }),
    },
  )
}

export async function listAttachmentsClient(
  homeworkId: number,
): Promise<HomeworkAttachment[]> {
  const res = await proxy<unknown>(`/homework/${homeworkId}/attachments`)
  return unwrap<HomeworkAttachment>(res)
}

export async function addAttachmentClient(
  homeworkId: number,
  payload: {
    file_name: string
    file_path: string
    file_type?: string
    file_size?: number
  },
): Promise<HomeworkAttachment> {
  return proxy<HomeworkAttachment>(`/homework/${homeworkId}/attachments`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function deleteAttachmentClient(
  homeworkId: number,
  attachmentId: number,
): Promise<void> {
  await proxy<void>(`/homework/${homeworkId}/attachments/${attachmentId}`, {
    method: 'DELETE',
  })
}

export async function listSubmissionFilesClient(
  submissionId: number,
): Promise<SubmissionFile[]> {
  const res = await proxy<unknown>(`/homework/submissions/${submissionId}/files`)
  return unwrap<SubmissionFile>(res)
}

export async function addSubmissionFileClient(
  submissionId: number,
  payload: {
    file_name: string
    file_path: string
    file_type?: string
    file_size?: number
  },
): Promise<SubmissionFile> {
  return proxy<SubmissionFile>(`/homework/submissions/${submissionId}/files`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function deleteSubmissionFileClient(
  submissionId: number,
  fileId: number,
): Promise<void> {
  await proxy<void>(`/homework/submissions/${submissionId}/files/${fileId}`, {
    method: 'DELETE',
  })
}