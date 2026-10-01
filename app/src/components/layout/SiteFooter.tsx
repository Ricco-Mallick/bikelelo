import { Link } from 'react-router-dom'
import { Logo } from '@/components/common/Logo'

const COLUMNS = [
  {
    title: 'Discover',
    links: [
      { to: '/bikes', label: 'All bikes' },
      { to: '/bikes?body=scooter', label: 'Scooters' },
      { to: '/bikes?fuel=electric', label: 'Electric' },
      { to: '/parts', label: 'Parts & accessories' },
    ],
  },
  {
    title: 'Tools',
    links: [
      { to: '/compare', label: 'Compare bikes' },
      { to: '/build', label: 'Configurator' },
      { to: '/garage', label: 'My garage' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="container grid gap-10 py-12 md:grid-cols-[1.4fr_repeat(2,1fr)]">
        <div className="max-w-xs space-y-4">
          <Logo />
          <p className="text-sm leading-relaxed text-muted-foreground">
            Build, compare and price India&apos;s motorcycles and scooters across retailers — one clean spec sheet at a
            time.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title} className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{col.title}</h3>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-foreground/80 transition-colors hover:text-brand">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="container flex flex-col gap-2 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} BikeLelo. Prices are indicative and sourced from public listings.</p>
          <p>Made for Indian riders · Ex-showroom prices include GST</p>
        </div>
      </div>
    </footer>
  )
}
