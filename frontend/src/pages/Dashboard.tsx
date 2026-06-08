import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Briefcase,
  Activity,
  IndianRupee,
  Sparkles,
  Building2,
  TrendingUp,
  ListOrdered,
  Wrench,
  Coins,
  PieChart as PieIcon,
  Users,
} from 'lucide-react'
import { FilterBar } from '@/components/FilterBar'
import { KpiCard } from '@/components/KpiCard'
import { ChartCard, EmptyState, PageHeading } from '@/components/common'
import {
  TrendAreaChart,
  HBarChart,
  SalaryBarChart,
  DonutChart,
  SplitPieChart,
} from '@/components/charts'
import { Button } from '@/components/ui/button'
import { useFilteredJobs } from '@/hooks/useFilteredJobs'
import { useFilterStore } from '@/store/useFilterStore'
import {
  computeKpis,
  weeklyTrend,
  topRoles,
  topSkills,
  salaryByRole,
  workModeSplit,
  experienceSplit,
} from '@/lib/analytics'
import { formatINR, formatNumber } from '@/lib/utils'

export default function Dashboard() {
  const jobs = useFilteredJobs()
  const reset = useFilterStore((s) => s.reset)
  const navigate = useNavigate()

  const kpis = useMemo(() => computeKpis(jobs), [jobs])
  const trend = useMemo(() => weeklyTrend(jobs, 8), [jobs])
  const roles = useMemo(() => topRoles(jobs, 8), [jobs])
  const skills = useMemo(() => topSkills(jobs, 10), [jobs])
  const salaries = useMemo(() => salaryByRole(jobs, 5), [jobs])
  const modes = useMemo(() => workModeSplit(jobs), [jobs])
  const experience = useMemo(() => experienceSplit(jobs), [jobs])

  return (
    <div className="space-y-6">
      <PageHeading
        title="Market Dashboard"
        subtitle="Live view of data analyst & related roles in Bengaluru, India."
      >
        <Button variant="outline" size="sm" onClick={() => navigate('/import')} data-testid="dashboard-import-btn">
          Import data
        </Button>
      </PageHeading>

      <FilterBar />

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        <KpiCard
          testId="kpi-total-jobs"
          label="Total Jobs"
          icon={<Briefcase className="h-5 w-5" />}
          numericValue={kpis.total}
          format={formatNumber}
          sub="in current view"
          colorIndex={0}
        />
        <KpiCard
          testId="kpi-active-jobs"
          label="Active Jobs"
          icon={<Activity className="h-5 w-5" />}
          numericValue={kpis.active}
          format={formatNumber}
          sub={`${kpis.total - kpis.active} closed`}
          colorIndex={1}
        />
        <KpiCard
          testId="kpi-median-salary"
          label="Median Salary"
          icon={<IndianRupee className="h-5 w-5" />}
          numericValue={kpis.medianSalary}
          format={formatINR}
          sub="per month"
          colorIndex={2}
        />
        <KpiCard
          testId="kpi-top-skill"
          label="Top Skill"
          icon={<Sparkles className="h-5 w-5" />}
          text={kpis.topSkill}
          sub={kpis.topSkillCount ? `${kpis.topSkillCount} mentions` : undefined}
          colorIndex={3}
        />
        <KpiCard
          testId="kpi-top-company"
          label="Top Company"
          icon={<Building2 className="h-5 w-5" />}
          text={kpis.topCompany}
          sub={kpis.topCompanyCount ? `${kpis.topCompanyCount} postings` : undefined}
          colorIndex={4}
        />
      </div>

      {jobs.length === 0 ? (
        <EmptyState
          title="No jobs match these filters"
          message="No postings fit your current filter combination. Reset to see the full market."
          action={
            <Button variant="default" size="sm" onClick={reset} data-testid="empty-reset-btn">
              Reset filters
            </Button>
          }
        />
      ) : (
        <>
          <ChartCard
            title="Jobs Trend"
            description="Weekly posting volume over the last 8 weeks"
            icon={<TrendingUp className="h-5 w-5" />}
          >
            <TrendAreaChart data={trend} />
          </ChartCard>

          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard
              title="Top Roles"
              description="Most posted job titles"
              icon={<ListOrdered className="h-5 w-5" />}
            >
              <HBarChart data={roles} colorIndex={1} height={Math.max(220, roles.length * 36)} />
            </ChartCard>
            <ChartCard
              title="Top Skills"
              description="Most requested skills across postings"
              icon={<Wrench className="h-5 w-5" />}
            >
              <HBarChart data={skills} colorIndex={0} height={Math.max(220, skills.length * 32)} />
            </ChartCard>
          </div>

          <ChartCard
            title="Salary by Role"
            description="Median monthly salary (INR) for the top 5 roles by volume"
            icon={<Coins className="h-5 w-5" />}
          >
            <SalaryBarChart data={salaries} />
          </ChartCard>

          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard
              title="Work Mode Split"
              description="Remote / Hybrid / Onsite distribution"
              icon={<PieIcon className="h-5 w-5" />}
            >
              <DonutChart data={modes} />
            </ChartCard>
            <ChartCard
              title="Experience Level Split"
              description="Entry / Associate / Mid / Senior distribution"
              icon={<Users className="h-5 w-5" />}
            >
              <SplitPieChart data={experience} />
            </ChartCard>
          </div>
        </>
      )}
    </div>
  )
}
