import { Link } from 'react-router-dom'
import { ArrowRight, BadgeIndianRupee, BookOpen, GitCompareArrows, Search, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { InfoTip } from '@/components/common/InfoTip'
import { CONCEPTS, GLOSSARY } from '@/lib/glossary'

const STEPS = [
  {
    icon: <Search className="size-5" />,
    title: '1. Find candidates',
    body: 'Use Browse and filter by budget, engine size, body type and braking. Or answer three questions in Find a bike and let BikeLelo rank the catalogue for you.',
    link: { to: '/find', label: 'Find a bike' },
  },
  {
    icon: <BookOpen className="size-5" />,
    title: '2. Read the spec sheet',
    body: 'Every figure on a bike page has a small question mark next to it. Tap it for a plain-English explanation, no jargon assumed.',
    link: { to: '/bikes', label: 'Open a bike' },
  },
  {
    icon: <GitCompareArrows className="size-5" />,
    title: '3. Compare them',
    body: 'Add up to four bikes to Compare. The best value in each row is highlighted, and lighter or cheaper figures win where lower is better.',
    link: { to: '/compare', label: 'Compare' },
  },
  {
    icon: <BadgeIndianRupee className="size-5" />,
    title: '4. Work out the real price',
    body: 'Switch the on-road calculator to your state to add road tax, registration and insurance. The EMI sliders show what different down payments cost per month.',
    link: { to: '/bikes', label: 'See pricing' },
  },
  {
    icon: <Wrench className="size-5" />,
    title: '5. Build and buy',
    body: 'Pick a bike in the configurator and add accessories. Fitment is checked for your exact model and year, then follow an offer link to buy from the retailer.',
    link: { to: '/build', label: 'Open configurator' },
  },
]

export default function Guide() {
  return (
    <div className="container py-10">
      <header className="max-w-2xl">
        <Badge variant="secondary" className="mb-4">
          Guide
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">How BikeLelo works</h1>
        <p className="mt-3 text-pretty text-muted-foreground">
          A short walkthrough of the whole site, plus the money and safety terms you will meet along the way. Nothing
          here assumes you already know bikes.
        </p>
      </header>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_260px]">
        <div className="space-y-14">
          <section>
            <h2 className="text-xl font-semibold tracking-tight">The five-step flow</h2>
            <ol className="mt-6 space-y-4">
              {STEPS.map((step) => (
                <li key={step.title} className="flex gap-4 rounded-xl border border-border bg-card p-5">
                  <div className="grid size-10 shrink-0 place-items-center rounded-lg border border-border bg-background text-brand">
                    {step.icon}
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-semibold">{step.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                    <Link
                      to={step.link.to}
                      className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
                    >
                      {step.link.label} <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section id="money" className="scroll-mt-24">
            <h2 className="text-xl font-semibold tracking-tight">Money, explained</h2>
            <div className="mt-6 divide-y divide-border rounded-xl border border-border bg-card">
              {CONCEPTS.map((c) => (
                <article key={c.id} id={c.id} className="scroll-mt-24 p-5">
                  <h3 className="font-semibold">{c.term}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{c.short}</p>
                  {c.detail && <p className="mt-2 text-sm leading-relaxed text-muted-foreground/90">{c.detail}</p>}
                </article>
              ))}
            </div>
          </section>

          <section id="glossary" className="scroll-mt-24">
            <h2 className="text-xl font-semibold tracking-tight">Spec sheet glossary</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Every term you will meet on a bike page, in the order it appears.
            </p>
            <dl className="mt-6 grid gap-3 sm:grid-cols-2">
              {Object.entries(GLOSSARY).map(([key, entry]) => (
                <div key={key} className="rounded-lg border border-border bg-card p-4">
                  <dt className="flex items-center gap-1.5 text-sm font-medium">
                    {entry.term}
                    <InfoTip termKey={key} />
                  </dt>
                  <dd className="mt-1 text-xs leading-relaxed text-muted-foreground">{entry.short}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        <aside className="hidden lg:block">
          <nav className="sticky top-24 space-y-1">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">On this page</p>
            {[
              { href: '#money', label: 'Money, explained' },
              { href: '#glossary', label: 'Spec glossary' },
            ].map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="block rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
            <div className="pt-4">
              <Button size="sm" className="w-full" asChild>
                <Link to="/find">Find my bike</Link>
              </Button>
            </div>
          </nav>
        </aside>
      </div>
    </div>
  )
}
