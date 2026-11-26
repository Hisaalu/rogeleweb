import type { Metadata } from 'next'
import { PageHeader } from '@/components/layout/page-header'
import { PrivacyContent } from '@/components/legal/privacy-content'
import { PublicFooter } from '@/components/layout/public-footer'

export const metadata: Metadata = { title: 'Privacy Center' }

export default function TeacherPrivacyPage() {
  return (
    <>
      <PageHeader title="Privacy Center" fallbackHref="/teacher/settings" />
      <PrivacyContent />
      <PublicFooter />
    </>
  )
}