import { useMemo, useState } from 'react'
import { Lightbulb, Copy, Check, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { FilterBar } from '@/components/FilterBar'
import { PageHeading, EmptyState } from '@/components/common'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkline } from '@/components/charts'
import { useFilteredJobs } from '@/hooks/useFilteredJobs'
import { generateInsights, insightsToPlainText, type Insight } from '@/lib/insights'
import { toast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

const TONE_STYLES: Record<Insight['tone'], { ring: string; badge: 'default' | 'success' | 'warning' | 'muted'; spark: number }> = {
  primary: { ring: 'before:bg-teal-500', badge: 'default', spark: 0 },
  positive: { ring: 'before:bg-emerald-500', badge: 'success', spark: 7 },
  warning: { ring: 'before:bg-amber-500', badge: 'warning', spark: 3 },
  neutral: { ring: 'before:bg-violet-500', badge: 'muted', spark: 2 },
}

function ToneIcon({ tone }: { tone: Insight['tone'] }) {
  if (tone === 'positive') return <TrendingUp className="h-4 w-4 text-emerald-500" />
  if (tone === 'warning') return <TrendingDown className="h-4 w-4 text-amber-500" />
  return <Minus className="h-4 w-4 text-muted-foreground" />
}

export default function Insights() {
  const jobs = useFilteredJobs()
  const insights = useMemo(() => generateInsights(jobs), [jobs])
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const text = insightsToPlainText(insights)
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    toast({ variant: 'success', title: 'Copied to clipboard', description: `${insights.length} insights copied as plain text.` })
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <PageHeading
        title="Insights"
        subtitle="Auto-generated takeaways computed live from your current data view."
      >
        <Button onClick={handleCopy} variant="outline" size="sm" data-testid="copy-insights-btn" disabled={insights.length === 0}>
          {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
          Copy Insights as Text
        </Button>
      </PageHeading>

      <FilterBar />

      {insights.length === 0 ? (
        <EmptyState title="No insights yet" message="No jobs match your filters, so there is nothing to analyze. Reset your filters." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" data-testid="insights-grid">
          {insights.map((insight, idx) => {
            const tone = TONE_STYLES[insight.tone]
            return (
              <Card
                key={insight.id}
                data-testid={`insight-card-${insight.id}`}
                className={cn(
                  'relative animate-slide-up overflow-hidden pl-1 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md',
                  "before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:content-['']",
                  tone.ring,
                )}
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Lightbulb className="h-4 w-4" />
                      </span>
                      <h3 className="text-sm font-semibold text-foreground">{insight.title}</h3>
                    </div>
                    <ToneIcon tone={insight.tone} />
                  </div>

                  <p className="text-sm text-muted-foreground">{insight.finding}</p>

                  <div className="flex items-end justify-between gap-3">
                    <Badge variant={tone.badge} className="text-sm" data-testid={`insight-value-${insight.id}`}>
                      {insight.value}
                    </Badge>
                    <div className="h-10 w-24">
                      {insight.trend.length >= 2 ? (
                        <Sparkline data={insight.trend} colorIndex={tone.spark} height={40} />
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
