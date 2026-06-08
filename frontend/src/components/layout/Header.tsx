import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Menu, Moon, Sun, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Brand, NavLinks } from '@/components/layout/Sidebar'
import { ROUTE_LABELS } from '@/lib/nav'
import { useThemeStore } from '@/store/useThemeStore'

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const { theme, toggle } = useThemeStore()
  const currentLabel = ROUTE_LABELS[location.pathname] ?? 'Dashboard'

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md transition-theme lg:px-8">
      {/* Mobile menu */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden"
            data-testid="mobile-menu-btn"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <div className="flex h-16 items-center border-b border-border px-4">
            <Brand />
          </div>
          <div className="p-3">
            <NavLinks onNavigate={() => setMobileOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm" data-testid="breadcrumb" aria-label="Breadcrumb">
        <span className="font-semibold text-foreground lg:hidden">JobScope</span>
        <span className="hidden font-medium text-muted-foreground lg:inline">JobScope Analytics</span>
        <ChevronRight className="hidden h-4 w-4 text-muted-foreground lg:inline" />
        <span className="font-semibold text-foreground" data-testid="breadcrumb-current">
          {currentLabel}
        </span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <span className="hidden text-xs font-medium text-muted-foreground sm:inline">
          Bengaluru · Data Roles
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={toggle}
          data-testid="theme-toggle"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            <Sun className="h-[18px] w-[18px]" />
          ) : (
            <Moon className="h-[18px] w-[18px]" />
          )}
        </Button>
      </div>
    </header>
  )
}
