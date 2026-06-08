import { useMemo, useState } from 'react'
import {
  Target,
  CheckCircle2,
  Plus,
  GraduationCap,
  X,
  FileText,
  Search,
  TriangleAlert,
} from 'lucide-react'
import { FilterBar } from '@/components/FilterBar'
import { PageHeading, EmptyState } from '@/components/common'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { useFilteredJobs } from '@/hooks/useFilteredJobs'
import { useDataStore } from '@/store/useDataStore'
import { computeSkillGap, buildResumeBullets } from '@/lib/skillgap'
import { toast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

const PLACEHOLDER = 'e.g. SQL, Excel, Python, Power BI, Data Cleaning'

export default function SkillGap() {
  const jobs = useFilteredJobs()
  const { learningList, addToLearning, removeFromLearning, clearLearning } = useDataStore()
  const [input, setInput] = useState('')
  const [submitted, setSubmitted] = useState('')

  const result = useMemo(() => (submitted ? computeSkillGap(jobs, submitted, 15) : null), [jobs, submitted])
  const resumeBullets = useMemo(
    () => (result ? buildResumeBullets(result.matched.map((m) => m.name)) : []),
    [result],
  )

  const handleCompare = () => {
    if (!input.trim()) {
      toast({ variant: 'destructive', title: 'Add your skills', description: 'Enter a few comma-separated skills first.' })
      return
    }
    setSubmitted(input)
  }

  const handleAddLearning = (skill: string) => {
    addToLearning(skill)
    toast({ title: 'Added to learning list', description: `${skill} added. Keep building!` })
  }

  return (
    <div className="space-y-6">
      <PageHeading
        title="Skill Gap Checker"
        subtitle="How does your skill set compare to the job market?"
      />

      <FilterBar />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Input */}
          <Card>
            <CardContent className="space-y-3 p-5">
              <label htmlFor="skills-input" className="text-sm font-medium text-foreground">
                Paste your skills (comma separated)
              </label>
              <Textarea
                id="skills-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={PLACEHOLDER}
                className="min-h-[90px]"
                data-testid="skills-input"
              />
              <div className="flex justify-end">
                <Button onClick={handleCompare} data-testid="compare-btn">
                  <Search className="h-4 w-4" />
                  Compare to market
                </Button>
              </div>
            </CardContent>
          </Card>

          {!result ? (
            <EmptyState
              icon={<Target className="h-6 w-6" />}
              title="Ready when you are"
              message="Enter your skills above and hit compare to see how you stack up against the top demanded skills."
            />
          ) : (
            <>
              {/* Match score */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      <p className="text-sm font-semibold text-foreground">Market Match Score</p>
                    </div>
                    <span className="text-2xl font-bold text-primary" data-testid="match-score">
                      {result.matchScore}%
                    </span>
                  </div>
                  <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-700"
                      style={{ width: `${result.matchScore}%` }}
                    />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    You match <span className="font-semibold text-foreground">{result.matchScore}%</span> of the top{' '}
                    {result.demanded.length} demanded skills in the current job set.
                  </p>
                </CardContent>
              </Card>

              {/* Side by side */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Your Skills ({result.yourSkills.length})</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {result.yourSkills.length === 0 && (
                      <p className="text-sm text-muted-foreground">No skills detected.</p>
                    )}
                    {result.yourSkills.map((skill) => {
                      const inDemand = result.matched.some((m) => m.name.toLowerCase() === skill.toLowerCase())
                      return (
                        <div
                          key={skill}
                          data-testid={`your-skill-${skill}`}
                          className={cn(
                            'flex items-center justify-between rounded-lg border px-3 py-2 text-sm',
                            inDemand ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-border',
                          )}
                        >
                          <span className="font-medium text-foreground">{skill}</span>
                          {inDemand ? (
                            <Badge variant="success">
                              <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> In demand
                            </Badge>
                          ) : (
                            <Badge variant="muted">Niche</Badge>
                          )}
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Top {result.demanded.length} Demanded Skills</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {result.demanded.map((d) => (
                      <div
                        key={d.name}
                        data-testid={`demanded-skill-${d.name}`}
                        className={cn(
                          'flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm',
                          d.hasIt
                            ? 'border-emerald-500/30 bg-emerald-500/5'
                            : 'border-amber-500/30 bg-amber-500/5',
                        )}
                      >
                        <div className="flex items-center gap-2">
                          {d.hasIt ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <TriangleAlert className="h-4 w-4 text-amber-500" />
                          )}
                          <span className={cn('font-medium', d.hasIt ? 'text-foreground' : 'text-amber-700 dark:text-amber-400')}>
                            {d.name}
                          </span>
                          <span className="text-xs text-muted-foreground">· {d.count}</span>
                        </div>
                        {!d.hasIt && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs"
                            onClick={() => handleAddLearning(d.name)}
                            data-testid={`add-learning-${d.name}`}
                          >
                            <Plus className="h-3.5 w-3.5" /> Learn
                          </Button>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Resume tips */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-primary" />
                    Tailored Resume Bullets
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5" data-testid="resume-bullets">
                  {resumeBullets.map((bullet, i) => (
                    <div key={i} className="flex gap-2.5 rounded-lg bg-muted/50 p-3 text-sm text-foreground">
                      <span className="mt-0.5 text-primary">▸</span>
                      <p>{bullet}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Learning list sidebar */}
        <div className="lg:col-span-1">
          <Card className="lg:sticky lg:top-20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <GraduationCap className="h-4 w-4 text-primary" />
                Learning List ({learningList.length})
              </CardTitle>
              {learningList.length > 0 && (
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={clearLearning} data-testid="clear-learning-btn">
                  Clear
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {learningList.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Skills you choose to learn will accumulate here during your session.
                </p>
              ) : (
                <div className="space-y-2" data-testid="learning-list">
                  {learningList.map((skill) => (
                    <div
                      key={skill}
                      className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-sm"
                    >
                      <span className="font-medium text-foreground">{skill}</span>
                      <button
                        onClick={() => removeFromLearning(skill)}
                        className="text-muted-foreground transition-colors hover:text-destructive"
                        data-testid={`remove-learning-${skill}`}
                        aria-label={`Remove ${skill}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
