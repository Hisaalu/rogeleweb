import type { Metadata } from 'next'
import { PageHeader } from '@/components/layout/page-header'
import { TermsContent } from '@/components/legal/terms-content'
import { PublicFooter } from '@/components/layout/public-footer'

export const metadata: Metadata = { title: 'ROGELE Terms of Service' }

export default function LearnerTermsPage() {
  return (
    <>
      <PageHeader title="ROGELE Terms of Service" fallbackHref="/learner/settings" />
      <TermsContent />
      <PublicFooter />
    </>
  )
}