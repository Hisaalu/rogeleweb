'use client'

import React from 'react'
import { Award, AlertTriangle, Lightbulb, type LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import type { LearnerRecommendation, RecommendationTone } from '@/lib/learner-analytics.server'

const TONE = {
  success: { bg: 'bg-success-bg', fg: 'text-success-fg', icon: Award },
  danger: { bg: 'bg-danger-bg', fg: 'text-danger-fg', icon: AlertTriangle },
  info: { bg: 'bg-brand-primary/10', fg: 'text-brand-primary', icon: Lightbulb },
} as const

function mapTone(tone: RecommendationTone): keyof typeof TONE {
  if (tone === 'success') return 'success'
  if (tone === 'warning') return 'danger'
  return 'info'
}

export const RecommendationsPanel = React.memo(function RecommendationsPanel({
  recommendations,
}: {
  recommendations: LearnerRecommendation[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
          <Lightbulb size={18} className="shrink-0 text-brand-accent" />
          Personalized recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recommendations.length === 0 ? (
          <EmptyState
            icon={Lightbulb}
            title="Not enough data yet"
            description="Recommendations appear once you've submitted homework and completed quizzes."
          />
        ) : (
          <div className="space-y-3">
            {recommendations.map((r, i) => {
              const t = TONE[mapTone(r.tone)]
              const Icon: LucideIcon = t.icon
              return (
                <div key={i} className={`flex items-start gap-3 rounded-sm p-4 ${t.bg}`}>
                  <Icon size={18} className={`mt-0.5 shrink-0 ${t.fg}`} />
                  <div>
                    <p className={`text-sm font-semibold ${t.fg}`}>{r.title}</p>
                    <p className={`mt-0.5 text-xs sm:text-sm ${t.fg} opacity-90`}>
                      {r.body}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
})