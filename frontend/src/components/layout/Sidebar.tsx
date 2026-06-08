import { NavLink } from 'react-router-dom'
import { BarChart3 } from 'lucide-react'
import { NAV_ITEMS } from '@/lib/nav'
import { cn } from '@/lib/utils'

export function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <BarChart3 className="h-5 w-5" />
      </div>
      <div className="leading-tight">
        <p className="text-sm font-bold tracking-tight text-foreground">JobScope</p>
        <p className="text-[11px] font-medium text-muted-foreground">Analytics</p>
      </div>
    </div>
  )
}

export function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1" aria-label="Primary">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon
        return (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            data-testid={item.testId}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring',
                isActive
                  ? 'bg-primary/10 text-primary shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={cn(
                    'h-[18px] w-[18px] transition-transform duration-200 group-hover:scale-110',
                    isActive ? 'text-primary' : '',
                  )}
                />
                {item.label}
                {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
              </>
            )}
          </NavLink>
        )
      })}
    </nav>
  )
}

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-border bg-sidebar transition-theme lg:flex">
      <div className="flex h-16 items-center border-b border-border px-4">
        <Brand />
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <NavLinks />
      </div>
      <div className="border-t border-border p-4">
        <div className="rounded-lg bg-accent/60 p-3 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground">100 jobs preloaded</p>
          <p className="mt-0.5">Synthetic Bengaluru market data. Import your own anytime.</p>
        </div>
      </div>
    </aside>
  )
}
