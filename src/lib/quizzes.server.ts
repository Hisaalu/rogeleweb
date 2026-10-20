import 'server-only'
import { serverApiRequest } from './server-api'
import type { Quiz, QuizQuestion, QuizAttempt, QuizResultDetails } from '@/types/quiz'

function parseList<T>(res: unknown): T[] {
  if (Array.isArray(res)) return res as T[]
  const r = (res ?? {}) as { data?: T[]; value?: T[] }
  if (Array.isArray(r.data)) return r.data
  if (Array.isArray(r.value)) return r.value
  return []
}

export async function listQuizzesServer(params: {
  q?: string
  class_id?: number
  page?: number
}): Promise<Quiz[]> {
  const sp = new URLSearchParams()
  sp.set('page', String(params.page ?? 1))
  sp.set('per_page', '50')
  if (params.q) sp.set('q', params.q)
  if (params.class_id) sp.set('class_id', String(params.class_id))

  try {
    const res = await serverApiRequest<unknown>(`/api/v1/quizzes?${sp.toString()}`)
    return parseList<Quiz>(res)
  } catch {
    return []
  }
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
    const raw = parseList<any>(res)
    
    return raw.map(q => {
      let opts: string[] = []
      if (Array.isArray(q.options)) {
        opts = q.options
      } else {
        if (q.option_a) opts.push(q.option_a)
        if (q.option_b) opts.push(q.option_b)
        if (q.option_c) opts.push(q.option_c)
        if (q.option_d) opts.push(q.option_d)
      }

      let correctIdx = 0
      if (typeof q.correct_option === 'number') {
        correctIdx = q.correct_option
      } else if (typeof q.correct_answer === 'string') {
        const map: Record<string, number> = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 }
        correctIdx = map[q.correct_answer.toUpperCase()] ?? 0
      }

      return {
        id: q.id,
        quiz_id: q.quiz_id,
        question_text: q.question_text || q.question,
        options: opts,
        correct_option: correctIdx,
        points: q.points || 1,
        explanation: q.explanation
      }
    })
  } catch {
    return []
  }
}

export async function getAttemptServer(attemptId: number): Promise<QuizResultDetails | null> {
  try {
    const res = await serverApiRequest<any>(`/api/v1/quizzes/attempts/${attemptId}`)
    if (!res) return null

    const parsedQuestions = (res.questions || []).map((q: any) => {
      let opts: string[] = []
      if (Array.isArray(q.options)) {
        opts = q.options
      } else {
        if (q.option_a) opts.push(q.option_a)
        if (q.option_b) opts.push(q.option_b)
        if (q.option_c) opts.push(q.option_c)
        if (q.option_d) opts.push(q.option_d)
      }

      let correctIdx = 0
      if (typeof q.correct_option === 'number') {
        correctIdx = q.correct_option
      } else if (typeof q.correct_answer === 'string') {
        const map: Record<string, number> = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 }
        correctIdx = map[q.correct_answer.toUpperCase()] ?? 0
      }

      return {
        id: q.id,
        quiz_id: q.quiz_id,
        question_text: q.question_text || q.question,
        options: opts,
        correct_option: correctIdx,
        points: q.points || 1,
        explanation: q.explanation
      }
    })

    return {
      ...res,
      passing_score: res.passing_score || 70,
      questions: parsedQuestions,
      user_answers: res.user_answers || {}
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