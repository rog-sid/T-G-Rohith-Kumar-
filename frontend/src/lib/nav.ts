import {
  LayoutDashboard,
  Table2,
  Upload,
  Lightbulb,
  TrendingUp,
  Target,
  Info,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  testId: string
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, testId: 'nav-dashboard' },
  { to: '/jobs', label: 'Jobs Explorer', icon: Table2, testId: 'nav-jobs' },
  { to: '/import', label: 'Import Data', icon: Upload, testId: 'nav-import' },
  { to: '/insights', label: 'Insights', icon: Lightbulb, testId: 'nav-insights' },
  { to: '/forecast', label: 'Forecast', icon: TrendingUp, testId: 'nav-forecast' },
  { to: '/skill-gap', label: 'Skill Gap', icon: Target, testId: 'nav-skill-gap' },
  { to: '/about', label: 'About', icon: Info, testId: 'nav-about' },
]

export const ROUTE_LABELS: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/jobs': 'Jobs Explorer',
  '/import': 'Import Data',
  '/insights': 'Insights',
  '/forecast': 'Forecast',
  '/skill-gap': 'Skill Gap',
  '/about': 'About',
}
