'use client'

import type { QuizAttempt } from '@/types/quiz'

export interface StartAttemptResponse extends QuizAttempt {
  saved_answers?: Record<string, number>
}

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
    const message =
      (data as { error?: { message?: string } })?.error?.message ??
      `Request failed with ${res.status}`
    const err = new Error(message) as Error & { code?: string; status?: number }
    err.status = res.status
    err.code = (data as { error?: { code?: string } })?.error?.code
    throw err
  }
  return data as T
}

export async function listMyAttemptsClient(): Promise<QuizAttempt[]> {
  try {
    const res = await proxyJson<unknown>('/quizzes/my-attempts')
    const r = (res ?? {}) as { data?: QuizAttempt[]; value?: QuizAttempt[] }
    if (Array.isArray(res)) return res as QuizAttempt[]
    if (Array.isArray(r.data)) return r.data
    if (Array.isArray(r.value)) return r.value
    return []
  } catch {
    return []
  }
}

export async function startAttemptClient(quizId: number): Promise<StartAttemptResponse> {
  return proxyJson<StartAttemptResponse>(`/quizzes/${quizId}/attempts`, { method: 'POST' })
}

export async function getAttemptClient(attemptId: number): Promise<QuizAttempt | null> {
  try {
    return await proxyJson<QuizAttempt>(`/quizzes/attempts/${attemptId}`)
  } catch {
    return null
  }
}

export async function submitAttemptClient(
  attemptId: number,
  answers: Record<string, number>,
): Promise<void> {
  const formattedAnswers = Object.entries(answers).map(([qId, ans]) => ({
    question_id: Number(qId),
    selected_answer: ans,
  }))
  await proxyJson(`/quizzes/attempts/${attemptId}/submit`, {
    method: 'POST',
    body: JSON.stringify({ answers: formattedAnswers }),
  })
}

export async function saveAnswerClient(
  attemptId: number,
  questionId: number,
  answerIndex: number,
): Promise<void> {
  await proxyJson(`/quizzes/attempts/${attemptId}/answers`, {
    method: 'POST',
    body: JSON.stringify({
      question_id: questionId,
      selected_answer: answerIndex,
    }),
  })
}

export async function deleteQuizClient(id: number): Promise<void> {
  await proxyJson(`/quizzes/${id}`, { method: 'DELETE' })
}