import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, Search, GitCompareArrows, Heart, X } from 'lucide-react'
import { Logo } from '@/components/common/Logo'
import { SearchDialog } from '@/components/common/SearchDialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const NAV = [
  { to: '/bikes', label: 'Bikes' },
  { to: '/find', label: 'Find a bike' },
  { to: '/parts', label: 'Parts' },
  { to: '/build', label: 'Build' },
  { to: '/guide', label: 'Guide' },
]

export function SiteHeader() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { compare, garage, wishlist } = useStore()
  const location = useLocation()

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center gap-4">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <div className="flex items-center justify-between border-b border-border px-4 py-4">
                <Logo />
                <Button variant="ghost" size="icon" onClick={() => setMenuOpen(false)} aria-label="Close menu">
                  <X className="size-4" />
                </Button>
              </div>
              <nav className="flex flex-col p-2">
                {NAV.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'rounded-md px-3 py-3 text-sm font-medium transition-colors hover:bg-accent',
                        isActive && 'bg-accent text-foreground',
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
                <NavLink
                  to="/garage"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-md px-3 py-3 text-sm font-medium transition-colors hover:bg-accent"
                >
                  My Garage
                </NavLink>
              </nav>
            </SheetContent>
          </Sheet>

          <Logo className="mr-2" />

          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
                    isActive && 'text-foreground',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            <button
              onClick={() => setSearchOpen(true)}
              className={cn(
                'hidden h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm text-muted-foreground',
                'transition-colors hover:border-ring/40 hover:text-foreground sm:flex',
              )}
              aria-label="Search bikes"
            >
              <Search className="size-4" />
              <span className="w-28 text-left lg:w-40">Search bikes…</span>
            </button>
            <Button variant="ghost" size="icon" className="sm:hidden" onClick={() => setSearchOpen(true)} aria-label="Search">
              <Search className="size-5" />
            </Button>

            <Button variant="ghost" size="icon" asChild aria-label="Compare bikes" className="relative">
              <Link to="/compare">
                <GitCompareArrows className="size-5" />
                {compare.length > 0 && (
                  <Badge className="absolute -right-0.5 -top-0.5 size-4 justify-center rounded-full p-0 text-[10px]">
                    {compare.length}
                  </Badge>
                )}
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild aria-label="My garage" className="relative">
              <Link to="/garage">
                <Heart className="size-5" />
                {garage.length + wishlist.length > 0 && (
                  <Badge className="absolute -right-0.5 -top-0.5 size-4 justify-center rounded-full p-0 text-[10px]">
                    {garage.length + wishlist.length}
                  </Badge>
                )}
              </Link>
            </Button>
          </div>
        </div>
      </header>
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      {/* Reset scroll on route change for a snappy feel */}
      <ScrollReset key={location.pathname} />
    </>
  )
}

function ScrollReset() {
  if (typeof window !== 'undefined') window.scrollTo({ top: 0 })
  return null
}
