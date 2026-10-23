import type { Metadata } from 'next'
import { serverApiRequest } from '@/lib/server-api'
import type { Class } from '@/types/admin'
import { RegisterForm } from './register-form'

export const metadata: Metadata = {
  title: 'Create Account',
}

export default async function RegisterPage() {
  let classes: Class[] = []
  
  try {
    const res = await serverApiRequest<unknown>('/api/v1/config/classes')
    const r = (res ?? {}) as { data?: Class[]; value?: Class[] }
    if (Array.isArray(res)) classes = res
    else if (Array.isArray(r.data)) classes = r.data
    else if (Array.isArray(r.value)) classes = r.value
  } catch {
    classes = []
  }

  return <RegisterForm classes={classes} />
}