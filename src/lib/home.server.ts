import 'server-only'
import { serverApiRequest } from './server-api'

export async function getHomePageData() {
  try {
    const [plansRes, statsRes, classesRes] = await Promise.all([
      serverApiRequest<any>('/api/v1/subscription-plans?per_page=100').catch(() => []),
      serverApiRequest<any>('/api/v1/admin/stats').catch(() => null),
      serverApiRequest<any>('/api/v1/classes?per_page=100').catch(() => []),
    ])

    const rawPlans = Array.isArray(plansRes) ? plansRes : (plansRes?.data || [])
    const plans = rawPlans
      .filter((p: any) => p.is_active !== false && p.price > 0)
      .sort((a: any, b: any) => a.price - b.price)

    const rawClasses = Array.isArray(classesRes) ? classesRes : (classesRes?.data || [])
    const classes = rawClasses.filter((c: any) => c.is_active !== false)

    const stats = statsRes || {}
    const roles = stats.users_by_role || {}

    return {
      plans,
      classes,
      stats: {
        students: (roles.learner || 0) + (roles.external || 0),
        teachers: roles.teacher || 0,
        lessons: stats.total_lessons || 0,
      }
    }
  } catch (error) {
    console.error('Failed to load homepage data:', error)
    return {
      plans: [],
      classes: [],
      stats: { students: 0, teachers: 0, lessons: 0 }
    }
  }
}