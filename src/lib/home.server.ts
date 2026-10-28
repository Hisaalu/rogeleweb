import 'server-only'
import { serverApiRequest } from './server-api'
import type { SubscriptionPlan } from '@/types/subscription'

const STAT_FLOORS = { students: 500, teachers: 30, lessons: 200 } as const
const CLASS_RANGE_FLOOR = {
  first: 'Primary One',
  last: 'Primary Seven',
} as const

function normalizeCount(v: unknown): number {
  const n = typeof v === 'string' ? Number(v) : typeof v === 'number' ? v : NaN
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0
}

function withFloor(actual: number, floor: number): number {
  return Math.max(actual, floor)
}

export async function getHomePageData() {
  try {
    const [plansRes, statsRes, classesRes] = await Promise.all([
      serverApiRequest<any>('/api/v1/subscription-plans?per_page=100').catch(() => []),
      serverApiRequest<any>('/api/v1/admin/stats').catch(() => null),
      serverApiRequest<any>('/api/v1/classes?per_page=100').catch(() => []),
    ])

    const rawPlans = Array.isArray(plansRes) ? plansRes : (plansRes?.data || [])

    const plans: SubscriptionPlan[] = rawPlans
      .filter((p: any) => p.is_active !== false && p.price > 0)
      .sort((a: any, b: any) => a.price - b.price)

    const rawClasses = Array.isArray(classesRes) ? classesRes : (classesRes?.data || [])
    const classes = rawClasses.filter((c: any) => c.is_active !== false)

    const stats = statsRes || {}
    const roles = stats.users_by_role || {}

    const actualStudents = normalizeCount(roles.learner) + normalizeCount(roles.external)
    const actualTeachers = normalizeCount(roles.teacher)
    const actualLessons = normalizeCount(stats.total_lessons)

    const actualFirstClass = classes[0]?.name?.trim() || ''
    const actualLastClass = classes[classes.length - 1]?.name?.trim() || ''

    return {
      plans,
      classes,
      classRange: {
        first: actualFirstClass || CLASS_RANGE_FLOOR.first,
        last: actualLastClass || CLASS_RANGE_FLOOR.last,
      },
      stats: {
        students: withFloor(actualStudents, STAT_FLOORS.students),
        teachers: withFloor(actualTeachers, STAT_FLOORS.teachers),
        lessons: withFloor(actualLessons, STAT_FLOORS.lessons),
      },
    }
  } catch (error) {
    console.error('Failed to load homepage data:', error)
    return {
      plans: [] as SubscriptionPlan[],
      classes: [],
      classRange: {
        first: CLASS_RANGE_FLOOR.first,
        last: CLASS_RANGE_FLOOR.last,
      },
      stats: {
        students: STAT_FLOORS.students,
        teachers: STAT_FLOORS.teachers,
        lessons: STAT_FLOORS.lessons,
      },
    }
  }
}