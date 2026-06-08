import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  LabelList,
} from 'recharts'
import { useChartTheme } from '@/hooks/useChartTheme'
import { formatINR, formatINRCompact } from '@/lib/utils'

function useTooltipStyle() {
  const t = useChartTheme()
  return {
    contentStyle: {
      backgroundColor: t.tooltipBg,
      border: `1px solid ${t.tooltipBorder}`,
      borderRadius: 12,
      color: t.text,
      fontSize: 12,
      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    },
    labelStyle: { color: t.mutedText, fontWeight: 600, marginBottom: 4 },
    itemStyle: { color: t.text },
    cursor: { fill: t.grid, opacity: 0.35 },
  }
}

export interface NameValue {
  name: string
  count: number
}

export function TrendAreaChart({ data }: { data: { label: string; count: number }[] }) {
  const t = useChartTheme()
  const tip = useTooltipStyle()
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={t.palette[0]} stopOpacity={0.5} />
            <stop offset="100%" stopColor={t.palette[0]} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={t.grid} vertical={false} />
        <XAxis dataKey="label" stroke={t.mutedText} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
        <YAxis stroke={t.mutedText} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip {...tip} cursor={{ stroke: t.palette[0], strokeWidth: 1, strokeDasharray: '4 4' }} />
        <Area
          type="monotone"
          dataKey="count"
          stroke={t.palette[0]}
          strokeWidth={2.5}
          fill="url(#trendFill)"
          dot={{ r: 3, fill: t.palette[0] }}
          activeDot={{ r: 5 }}
          name="Postings"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function HBarChart({
  data,
  height = 320,
  colorIndex = 0,
  valueSuffix = '',
}: {
  data: NameValue[]
  height?: number
  colorIndex?: number
  valueSuffix?: string
}) {
  const t = useChartTheme()
  const tip = useTooltipStyle()
  const color = t.palette[colorIndex % t.palette.length]
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart layout="vertical" data={data} margin={{ top: 4, right: 28, left: 8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={t.grid} horizontal={false} />
        <XAxis type="number" stroke={t.mutedText} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="name"
          stroke={t.mutedText}
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          width={130}
        />
        <Tooltip {...tip} formatter={(v: number) => [`${v}${valueSuffix}`, 'Count']} />
        <Bar dataKey="count" fill={color} radius={[0, 6, 6, 0]} barSize={18}>
          <LabelList dataKey="count" position="right" fill={t.mutedText} fontSize={11} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function SalaryBarChart({ data }: { data: { name: string; salary: number }[] }) {
  const t = useChartTheme()
  const tip = useTooltipStyle()
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 16, right: 10, left: -6, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={t.grid} vertical={false} />
        <XAxis dataKey="name" stroke={t.mutedText} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} interval={0} angle={-12} textAnchor="end" height={50} />
        <YAxis stroke={t.mutedText} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(v) => formatINRCompact(v)} />
        <Tooltip {...tip} formatter={(v: number) => [formatINR(v), 'Median salary']} />
        <Bar dataKey="salary" fill={t.palette[2]} radius={[6, 6, 0, 0]} barSize={44}>
          <LabelList dataKey="salary" position="top" fill={t.mutedText} fontSize={11} formatter={(v: number) => formatINRCompact(v)} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function DonutChart({ data }: { data: NameValue[] }) {
  const t = useChartTheme()
  const tip = useTooltipStyle()
  const total = data.reduce((a, b) => a + b.count, 0)
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Tooltip {...tip} formatter={(v: number, n) => [`${v} jobs`, n as string]} />
          <Pie data={data} dataKey="count" nameKey="name" cx="50%" cy="50%" innerRadius={62} outerRadius={92} paddingAngle={3} stroke="none">
            {data.map((_, i) => (
              <Cell key={i} fill={t.palette[i % t.palette.length]} />
            ))}
          </Pie>
          <Legend verticalAlign="bottom" height={28} iconType="circle" wrapperStyle={{ fontSize: 12, color: t.mutedText }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center" style={{ top: '-14px' }}>
        <span className="text-2xl font-bold text-foreground">{total}</span>
        <span className="text-xs text-muted-foreground">total jobs</span>
      </div>
    </div>
  )
}

export function SplitPieChart({ data }: { data: NameValue[] }) {
  const t = useChartTheme()
  const tip = useTooltipStyle()
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Tooltip {...tip} formatter={(v: number, n) => [`${v} jobs`, n as string]} />
        <Pie data={data} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={92} label={{ fontSize: 11, fill: t.mutedText }} stroke="none">
          {data.map((_, i) => (
            <Cell key={i} fill={t.palette[(i + 3) % t.palette.length]} />
          ))}
        </Pie>
        <Legend verticalAlign="bottom" height={28} iconType="circle" wrapperStyle={{ fontSize: 12, color: t.mutedText }} />
      </PieChart>
    </ResponsiveContainer>
  )
}

export interface ForecastRowChart {
  label: string
  actual: number | null
  forecast: number | null
}

export function ForecastChart({ data }: { data: ForecastRowChart[] }) {
  const t = useChartTheme()
  const tip = useTooltipStyle()
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data} margin={{ top: 10, right: 16, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={t.grid} vertical={false} />
        <XAxis dataKey="label" stroke={t.mutedText} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis stroke={t.mutedText} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip {...tip} />
        <Legend verticalAlign="top" height={30} iconType="plainline" wrapperStyle={{ fontSize: 12, color: t.mutedText }} />
        <Line type="monotone" dataKey="actual" name="Actual" stroke={t.palette[0]} strokeWidth={2.5} dot={{ r: 3 }} connectNulls={false} />
        <Line type="monotone" dataKey="forecast" name="Forecast" stroke={t.palette[3]} strokeWidth={2.5} strokeDasharray="6 5" dot={{ r: 3 }} connectNulls={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function Sparkline({
  data,
  colorIndex = 0,
  height = 40,
}: {
  data: number[]
  colorIndex?: number
  height?: number
}) {
  const t = useChartTheme()
  const color = t.palette[colorIndex % t.palette.length]
  const chartData = data.map((v, i) => ({ i, v }))
  if (chartData.length < 2) return null
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`spark-${colorIndex}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={`url(#spark-${colorIndex})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
