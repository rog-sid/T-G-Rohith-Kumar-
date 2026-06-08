import { useMemo, useState } from 'react'
import { TrendingUp, TrendingDown, Minus, Gauge } from 'lucide-react'
import { PageHeading, ChartCard } from '@/components/common'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ForecastChart } from '@/components/charts'
import { useDataStore } from '@/store/useDataStore'
import { buildForecast, type ForecastConfidence } from '@/lib/forecast'

const CONFIDENCE_VARIANT: Record<ForecastConfidence, 'success' | 'warning' | 'danger'> = {
  High: 'success',
  Medium: 'warning',
  Low: 'danger',
}

export default function Forecast() {
  const jobs = useDataStore((s) => s.jobs)
  const [role, setRole] = useState('all')

  const roleOptions = useMemo(() => {
    const roles = Array.from(new Set(jobs.map((j) => j.title))).sort()
    return [{ value: 'all', label: 'All roles combined' }, ...roles.map((r) => ({ value: r, label: r }))]
  }, [jobs])

  const subset = useMemo(() => (role === 'all' ? jobs : jobs.filter((j) => j.title === role)), [jobs, role])
  const forecast = useMemo(() => buildForecast(subset), [subset])

  const roleLabel = role === 'all' ? 'data roles' : role
  const DirIcon = forecast.direction === 'increase' ? TrendingUp : forecast.direction === 'decrease' ? TrendingDown : Minus
  const dirColor =
    forecast.direction === 'increase'
      ? 'text-emerald-500'
      : forecast.direction === 'decrease'
        ? 'text-rose-500'
        : 'text-muted-foreground'

  return (
    <div className="space-y-6">
      <PageHeading
        title="Demand Forecast (Next 4 Weeks)"
        subtitle="A 3-week simple moving average projection of posting volume."
      >
        <div className="w-full sm:w-64">
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger data-testid="forecast-role-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {roleOptions.map((o) => (
                <SelectItem key={o.value} value={o.value} data-testid={`forecast-role-${o.value}`}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </PageHeading>

      {/* Summary + confidence */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardContent className="flex items-start gap-4 p-5">
            <span className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted ${dirColor}`}>
              <DirIcon className="h-6 w-6" />
            </span>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Forecast Summary</p>
              <p className="mt-1 text-base font-medium text-foreground" data-testid="forecast-summary">
                Based on current trends, demand for <span className="font-semibold">{roleLabel}</span> is expected to{' '}
                <span className={`font-semibold ${dirColor}`}>{forecast.direction}</span> over the next 4 weeks
                {forecast.changePct !== 0 && (
                  <span className="text-muted-foreground"> ({forecast.changePct > 0 ? '+' : ''}{forecast.changePct}% vs recent average)</span>
                )}
                .
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted text-primary">
              <Gauge className="h-6 w-6" />
            </span>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Confidence</p>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant={CONFIDENCE_VARIANT[forecast.confidence]} className="text-sm" data-testid="forecast-confidence">
                  {forecast.confidence}
                </Badge>
                <span className="text-xs text-muted-foreground">{forecast.recordCount} records</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ChartCard
        title="Historical vs Forecast"
        description="Solid line = last 8 weeks actual · Dashed line = next 4 weeks projected"
        icon={<TrendingUp className="h-5 w-5" />}
      >
        <ForecastChart data={forecast.rows} />
      </ChartCard>

      <Card className="overflow-hidden">
        <div className="border-b border-border p-4">
          <h3 className="text-sm font-semibold text-foreground">Week-by-week breakdown</h3>
        </div>
        <Table data-testid="forecast-table">
          <TableHeader>
            <TableRow>
              <TableHead>Week of</TableHead>
              <TableHead className="text-right">Actual Count</TableHead>
              <TableHead className="text-right">Forecast Count</TableHead>
              <TableHead>Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {forecast.rows.map((row, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{row.label}</TableCell>
                <TableCell className="text-right tabular-nums">{row.actual ?? '—'}</TableCell>
                <TableCell className="text-right tabular-nums">{row.forecast ?? '—'}</TableCell>
                <TableCell>
                  <Badge variant={row.type === 'forecast' ? 'warning' : 'muted'}>
                    {row.type === 'forecast' ? 'Forecast' : 'Actual'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
