import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { useThemeStore } from '@/store/useThemeStore'
import Dashboard from '@/pages/Dashboard'
import JobsExplorer from '@/pages/JobsExplorer'
import ImportData from '@/pages/ImportData'
import Insights from '@/pages/Insights'
import Forecast from '@/pages/Forecast'
import SkillGap from '@/pages/SkillGap'
import About from '@/pages/About'

export default function App() {
  const theme = useThemeStore((s) => s.theme)

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    root.style.colorScheme = theme
  }, [theme])

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/jobs" element={<JobsExplorer />} />
        <Route path="/import" element={<ImportData />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/forecast" element={<Forecast />} />
        <Route path="/skill-gap" element={<SkillGap />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}
