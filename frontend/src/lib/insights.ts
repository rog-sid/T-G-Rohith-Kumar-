import type { Job } from './types'
import {
  countBy,
  median,
  medianSalaryByWorkMode,
  salaryWithSkill,
  topSkills,
  weeklyTrend,
} from './analytics'
import { percent } from './utils'

export interface Insight {
  id: string
  title: string
  finding: string
  value: string
  trend: number[] // small sparkline series
  tone: 'primary' | 'positive' | 'warning' | 'neutral'
}

function pctChange(from: number, to: number): number {
  if (from === 0) return to === 0 ? 0 : 100
  return Math.round(((to - from) / from) * 100)
}

/** Generate at least 8 data-driven insight cards from the current job set. */
export function generateInsights(jobs: Job[]): Insight[] {
  const insights: Insight[] = []
  const total = jobs.length
  if (total === 0) return insights

  const skills = topSkills(jobs, 15)
  const trend = weeklyTrend(jobs, 8).map((p) => p.count)

  // 1. Most demanded skill
  if (skills[0]) {
    const top = skills[0]
    insights.push({
      id: 'top-skill',
      title: 'Most In-Demand Skill',
      finding: `${top.name} is the most demanded skill across all listed jobs.`,
      value: `${percent(top.count, total)}% of jobs`,
      trend: skills.slice(0, 6).map((s) => s.count),
      tone: 'primary',
    })
  }

  // 2. Power BI salary premium
  const pbi = salaryWithSkill(jobs, 'Power BI')
  if (pbi.withSkill > 0 && pbi.without > 0) {
    const diff = pbi.withSkill - pbi.without
    insights.push({
      id: 'powerbi-premium',
      title: 'Power BI Salary Premium',
      finding:
        diff >= 0
          ? `Jobs requiring Power BI offer a higher median monthly salary than those without it.`
          : `Power BI roles trend slightly below the overall median in this dataset.`,
      value: `${diff >= 0 ? '+' : '−'}₹${Math.abs(diff).toLocaleString('en-IN')}/mo`,
      trend: [pbi.without, pbi.withSkill],
      tone: diff >= 0 ? 'positive' : 'neutral',
    })
  }

  // 3. Remote vs onsite pay
  const remotePay = medianSalaryByWorkMode(jobs, 'Remote')
  const onsitePay = medianSalaryByWorkMode(jobs, 'Onsite')
  if (remotePay > 0 && onsitePay > 0) {
    const diff = remotePay - onsitePay
    insights.push({
      id: 'remote-pay',
      title: 'Remote vs Onsite Pay',
      finding:
        diff >= 0
          ? `Remote roles pay more per month than onsite roles at the median.`
          : `Onsite roles currently edge out remote roles on median pay.`,
      value: `${diff >= 0 ? '+' : '−'}₹${Math.abs(diff).toLocaleString('en-IN')}/mo`,
      trend: [onsitePay, remotePay],
      tone: diff >= 0 ? 'positive' : 'neutral',
    })
  }

  // 4. Entry level share
  const entry = jobs.filter((j) => j.experience === 'Entry').length
  insights.push({
    id: 'entry-share',
    title: 'Fresher-Friendly Market',
    finding: `Entry-level postings make up a meaningful share of the market — good news for freshers.`,
    value: `${percent(entry, total)}% entry-level`,
    trend: [
      jobs.filter((j) => j.experience === 'Entry').length,
      jobs.filter((j) => j.experience === 'Associate').length,
      jobs.filter((j) => j.experience === 'Mid').length,
      jobs.filter((j) => j.experience === 'Senior').length,
    ],
    tone: 'primary',
  })

  // 5. Top company
  const companies = countBy(jobs, (j) => j.company)
  if (companies[0]) {
    insights.push({
      id: 'top-company',
      title: 'Top Hiring Company',
      finding: `${companies[0].name} is leading the hiring charts by number of open postings.`,
      value: `${companies[0].count} jobs`,
      trend: companies.slice(0, 6).map((c) => c.count),
      tone: 'neutral',
    })
  }

  // 6. Bengaluru concentration
  const blr = jobs.filter((j) => j.city.startsWith('Bengaluru')).length
  insights.push({
    id: 'blr-share',
    title: 'Bengaluru Dominance',
    finding: `Bengaluru (incl. remote-from-Bengaluru) accounts for the bulk of all listed jobs.`,
    value: `${percent(blr, total)}% in Bengaluru`,
    trend: countBy(jobs, (j) => j.city).map((c) => c.count),
    tone: 'primary',
  })

  // 7. Python premium
  const py = salaryWithSkill(jobs, 'Python')
  if (py.withSkill > 0 && py.without > 0) {
    const pct = pctChange(py.without, py.withSkill)
    insights.push({
      id: 'python-premium',
      title: 'Python Pays Off',
      finding:
        pct >= 0
          ? `Jobs requiring Python pay more than non-Python roles at the median.`
          : `Python roles sit close to the overall median in this dataset.`,
      value: `${pct >= 0 ? '+' : ''}${pct}% pay`,
      trend: [py.without, py.withSkill],
      tone: pct >= 0 ? 'positive' : 'neutral',
    })
  }

  // 8. Hybrid growth over last 4 weeks
  const hybridTrend = weeklyTrend(
    jobs.filter((j) => j.workMode === 'Hybrid'),
    8,
  ).map((p) => p.count)
  const firstHalf = hybridTrend.slice(0, 4).reduce((a, b) => a + b, 0)
  const secondHalf = hybridTrend.slice(4).reduce((a, b) => a + b, 0)
  const hybridGrowth = pctChange(firstHalf, secondHalf)
  insights.push({
    id: 'hybrid-growth',
    title: 'Hybrid Momentum',
    finding:
      hybridGrowth >= 0
        ? `Hybrid roles have grown over the last 4 weeks versus the prior 4 weeks.`
        : `Hybrid roles cooled off slightly over the last 4 weeks.`,
    value: `${hybridGrowth >= 0 ? '+' : ''}${hybridGrowth}% (4w)`,
    trend: hybridTrend,
    tone: hybridGrowth >= 0 ? 'positive' : 'warning',
  })

  // 9. Median salary overall
  const med = median(jobs.map((j) => j.salary))
  insights.push({
    id: 'median-salary',
    title: 'Median Monthly Pay',
    finding: `Across the current view, the typical (median) monthly salary lands here.`,
    value: `₹${med.toLocaleString('en-IN')}/mo`,
    trend: trend,
    tone: 'neutral',
  })

  // 10. SQL ubiquity
  const sql = jobs.filter((j) => j.skills.includes('SQL')).length
  insights.push({
    id: 'sql-ubiquity',
    title: 'SQL Is Table Stakes',
    finding: `SQL shows up in a large majority of postings — a must-have for analysts.`,
    value: `${percent(sql, total)}% need SQL`,
    trend: skills.filter((s) => ['SQL', 'Excel', 'Python', 'Power BI'].includes(s.name)).map((s) => s.count),
    tone: 'primary',
  })

  return insights
}

export function insightsToPlainText(insights: Insight[]): string {
  const lines = insights.map((i, idx) => `${idx + 1}. ${i.title}: ${i.finding} (${i.value})`)
  return ['JobScope Analytics — Key Insights', '', ...lines].join('\n')
}
