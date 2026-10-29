import 'server-only'
import { serverApiRequest } from './server-api'
import type { Quiz, QuizQuestion, QuizAttempt, QuizResultDetails, QuizListMeta } from '@/types/quiz'

function parseList<T>(res: unknown): T[] {
  if (Array.isArray(res)) return res as T[]
  const r = (res ?? {}) as { data?: T[]; value?: T[] }
  if (Array.isArray(r.data)) return r.data
  if (Array.isArray(r.value)) return r.value
  return []
}

function normalizeQuestion(q: Record<string, unknown>): QuizQuestion {
  let opts: string[] = []
  if (Array.isArray(q.options)) {
    opts = q.options as string[]
  } else {
    if (q.option_a) opts.push(q.option_a as string)
    if (q.option_b) opts.push(q.option_b as string)
    if (q.option_c) opts.push(q.option_c as string)
    if (q.option_d) opts.push(q.option_d as string)
  }

  let correctIdx = 0
  if (typeof q.correct_option === 'number') {
    correctIdx = q.correct_option
  } else if (typeof q.correct_answer === 'string') {
    const map: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 }
    correctIdx = map[q.correct_answer.toUpperCase()] ?? 0
  }

  return {
    id: Number(q.id),
    quiz_id: Number(q.quiz_id ?? 0),
    question_text: String(q.question_text ?? q.question ?? ''),
    options: opts,
    correct_option: correctIdx,
    points: Number(q.points ?? 1),
    explanation: (q.explanation as string | null | undefined) ?? null,
  }
}

export async function listAllQuizzesServer(params: {
  q?: string
  class_id?: number
  page?: number
}): Promise<{ quizzes: Quiz[]; meta: QuizListMeta }> {
  const page = params.page ?? 1
  const per_page = 10
  
  const sp = new URLSearchParams()
  // Fetch a large amount so we have the full list to paginate locally
  sp.set('per_page', '1000') 
  if (params.q) sp.set('q', params.q)
  if (params.class_id) sp.set('class_id', String(params.class_id))

  try {
    const res = await serverApiRequest<unknown>(`/api/v1/quizzes?${sp.toString()}`)
    const all = parseList<Quiz>(res)
    
    // Calculate accurate pagination locally
    const total = all.length
    const last_page = Math.max(1, Math.ceil(total / per_page))
    const startIndex = (page - 1) * per_page
    const paginatedQuizzes = all.slice(startIndex, startIndex + per_page)

    return { 
      quizzes: paginatedQuizzes, 
      meta: { page, per_page, total, last_page } 
    }
  } catch {
    return {
      quizzes: [],
      meta: { page, per_page, total: 0, last_page: 1 }
    }
  }
}

export async function listQuizzesServer(params: {
  q?: string
  class_id?: number
  page?: number
}): Promise<{ quizzes: Quiz[]; meta: QuizListMeta }> {
  const { quizzes, meta } = await listAllQuizzesServer(params)
  const filtered = quizzes.filter((q) => (q.question_count ?? 0) > 0)
  return { quizzes: filtered, meta }
}

export async function getQuizServer(id: number): Promise<Quiz | null> {
  try {
    return await serverApiRequest<Quiz>(`/api/v1/quizzes/${id}`)
  } catch {
    return null
  }
}

export async function listQuestionsServer(quizId: number): Promise<QuizQuestion[]> {
  try {
    const res = await serverApiRequest<unknown>(`/api/v1/quizzes/${quizId}/questions`)
    return parseList<Record<string, unknown>>(res).map(normalizeQuestion)
  } catch {
    return []
  }
}

export async function getAttemptBasicServer(attemptId: number): Promise<QuizAttempt | null> {
  try {
    return await serverApiRequest<QuizAttempt>(`/api/v1/quizzes/attempts/${attemptId}`)
  } catch {
    return null
  }
}

export async function getAttemptServer(attemptId: number): Promise<QuizResultDetails | null> {
  try {
    const res = await serverApiRequest<Record<string, unknown>>(
      `/api/v1/quizzes/attempts/${attemptId}`,
    )
    if (!res) return null

    const rawQuestions = Array.isArray(res.questions) ? res.questions : []
    const questions = rawQuestions.map((q) => normalizeQuestion(q as Record<string, unknown>))

    return {
      id: Number(res.id),
      quiz_id: Number(res.quiz_id ?? 0),
      user_id: Number(res.user_id ?? 0),
      score: res.score != null ? Number(res.score) : null,
      total_questions: res.total_questions != null ? Number(res.total_questions) : null,
      correct_answers: res.correct_answers != null ? Number(res.correct_answers) : null,
      time_taken: res.time_taken != null ? Number(res.time_taken) : null,
      status: (res.status as QuizAttempt['status']) ?? 'in_progress',
      started_at: String(res.started_at ?? ''),
      completed_at: (res.completed_at as string | null | undefined) ?? null,
      passing_score: res.passing_score != null ? Number(res.passing_score) : 70,
      questions,
      user_answers: (res.user_answers as Record<string, number> | undefined) ?? {},
    }
  } catch {
    return null
  }
}

export async function listMyAttemptsServer(): Promise<QuizAttempt[]> {
  try {
    const res = await serverApiRequest<unknown>('/api/v1/quizzes/my-attempts')
    return parseList<QuizAttempt>(res)
  } catch {
    return []
  }
}