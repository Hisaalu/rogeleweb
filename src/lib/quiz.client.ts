import type {
  AnswerInput,
  CreateQuestionPayload,
  CreateQuizPayload,
  Quiz,
  QuizAttempt,
  QuizAttemptAnswer,
  QuizQuestion,
  UpdateQuizPayload,
} from '@/types/quiz'

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

export async function listQuizzesClient(params: {
  page?: number
  per_page?: number
  class_id?: number
  subject_id?: number
} = {}): Promise<Quiz[]> {
  const search = new URLSearchParams()
  if (params.page) search.set('page', String(params.page))
  if (params.per_page) search.set('per_page', String(params.per_page))
  if (params.class_id) search.set('class_id', String(params.class_id))
  if (params.subject_id) search.set('subject_id', String(params.subject_id))
  const query = search.toString()
  const path = query ? `/quizzes?${query}` : '/quizzes'
  const res = await proxy<unknown>(path)
  return unwrap<Quiz>(res)
}

export async function createQuizClient(payload: CreateQuizPayload): Promise<Quiz> {
  return proxy<Quiz>('/quizzes', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateQuizClient(id: number, payload: UpdateQuizPayload): Promise<Quiz> {
  return proxy<Quiz>(`/quizzes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function deleteQuizClient(id: number): Promise<void> {
  await proxy<void>(`/quizzes/${id}`, { method: 'DELETE' })
}

export async function setQuizApprovedClient(id: number, approved: boolean): Promise<Quiz> {
  return proxy<Quiz>(`/quizzes/${id}/approve`, {
    method: 'POST',
    body: JSON.stringify({ approved }),
  })
}

export async function listQuestionsClient(quizId: number): Promise<QuizQuestion[]> {
  const res = await proxy<unknown>(`/quizzes/${quizId}/questions`)
  return unwrap<QuizQuestion>(res)
}

export async function addQuestionClient(
  quizId: number,
  payload: CreateQuestionPayload,
): Promise<QuizQuestion> {
  return proxy<QuizQuestion>(`/quizzes/${quizId}/questions`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function deleteQuestionClient(
  quizId: number,
  questionId: number,
): Promise<void> {
  await proxy<void>(`/quizzes/${quizId}/questions/${questionId}`, {
    method: 'DELETE',
  })
}

export async function startQuizAttemptClient(quizId: number): Promise<QuizAttempt> {
  return proxy<QuizAttempt>(`/quizzes/${quizId}/attempts`, { method: 'POST' })
}

export async function submitQuizAttemptClient(
  attemptId: number,
  answers: AnswerInput[],
): Promise<QuizAttempt> {
  return proxy<QuizAttempt>(`/quizzes/attempts/${attemptId}/submit`, {
    method: 'POST',
    body: JSON.stringify({ answers }),
  })
}

export async function getQuizAttemptClient(attemptId: number): Promise<QuizAttempt> {
  return proxy<QuizAttempt>(`/quizzes/attempts/${attemptId}`)
}

export async function listMyAttemptsClient(): Promise<QuizAttempt[]> {
  const res = await proxy<unknown>('/quizzes/my-attempts')
  return unwrap<QuizAttempt>(res)
}

export async function listQuizAttemptsClient(quizId: number): Promise<QuizAttempt[]> {
  const res = await proxy<unknown>(`/quizzes/${quizId}/attempts`)
  return unwrap<QuizAttempt>(res)
}

export async function deleteAllQuizAttemptsClient(quizId: number): Promise<void> {
  await proxy<void>(`/quizzes/${quizId}/attempts`, { method: 'DELETE' })
}