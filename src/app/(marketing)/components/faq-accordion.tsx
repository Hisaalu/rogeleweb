'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface FAQItem {
  q: string
  a: React.ReactNode
}

export function FaqAccordion({ faqs }: { faqs: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="mt-12 space-y-4 text-left">
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index

        return (
          <Card
            key={faq.q}
            className={`overflow-hidden transition-all duration-300 ${
              isOpen ? 'border-brand-accent shadow-md' : 'shadow-sm hover:border-brand-accent/50'
            }`}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="flex w-full items-center justify-between p-5 font-semibold text-foreground outline-none transition-colors hover:bg-muted/30 focus-visible:bg-muted/30"
              aria-expanded={isOpen}
            >
              <span className="pr-4">{faq.q}</span>
              <ChevronDown
                size={18}
                className={`shrink-0 transition-transform duration-300 ${
                  isOpen ? 'rotate-180 text-brand-accent' : 'text-muted-foreground'
                }`}
              />
            </button>
            
            {/* 
              The grid-rows trick: animating from 0fr to 1fr smoothly expands 
              the container to fit its content, regardless of how tall the text is.
            */}
            <div
              className={`grid transition-all duration-300 ease-in-out ${
                isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                  {faq.a}
                </p>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}