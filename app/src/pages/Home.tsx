import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { ArrowRight, GitCompareArrows, IndianRupee, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BikeCard } from '@/components/catalog/BikeCard'
import { OnboardingHint } from '@/components/common/OnboardingHint'
import { FaqAccordion, LogoSlider, StatsCounter } from '@/components/vendor'
import { useCatalog, modelPriceRange } from '@/lib/catalog'
import { useStore } from '@/lib/store'
import { formatINRCompact } from '@/lib/format'

const FEATURED = [
  'hero-splendor-plus',
  'honda-activa-6g',
  'royal-enfield-classic-350',
  'bajaj-pulsar-150',
  'tvs-jupiter',
  'honda-shine-125',
  'ktm-390-duke',
  'ather-450x',
]

const FAQ_ITEMS = [
  {
    question: 'Are the prices ex-showroom or on-road?',
    answer:
      'Every listing shows the ex-showroom price, which already includes GST. Use the on-road calculator on any bike page to add state road tax, registration and insurance for your state.',
  },
  {
    question: 'Where do BikeLelo prices come from?',
    answer:
      'Ex-showroom prices come from manufacturer price lists and public listings. Retailer offers are refreshed by a scheduled scraper and shown with the time they were last checked.',
  },
  {
    question: 'Can I actually buy through BikeLelo?',
    answer:
      'For now BikeLelo is a research and comparison tool: we link you straight to the retailer or dealer to complete the purchase. Checkout is on the roadmap.',
  },
  {
    question: 'How does the configurator check fitment?',
    answer:
      'Each accessory carries a year/make/model fitment record. When you pick a bike, BikeLelo matches your exact model and year and flags parts that fit, are universal, or need modification.',
  },
  {
    question: 'Do you cover electric two-wheelers?',
    answer:
      'Yes. Electric scooters and motorcycles are included, with battery capacity, range and charging time alongside the usual specs.',
  },
]

/** Short display names so the marquee items fit their fixed-width slots. */
const BRAND_SHORT: Record<string, string> = {
  hero: 'Hero',
  vida: 'Vida',
  honda: 'Honda',
  tvs: 'TVS',
  bajaj: 'Bajaj',
  'royal-enfield': 'Royal Enfield',
  suzuki: 'Suzuki',
  yamaha: 'Yamaha',
  ktm: 'KTM',
  jawa: 'Jawa',
  yezdi: 'Yezdi',
  ather: 'Ather',
  'ola-electric': 'Ola',
  kawasaki: 'Kawasaki',
  triumph: 'Triumph',
}

export default function Home() {
  const { models, brands, variants, retailers, brandsBySlug, modelsBySlug, variantsByModel, source } = useCatalog()
  const { garage, wishlist, compare, recentlyViewed, toggleGarage, toggleCompare } = useStore()

  const featured = [
    ...FEATURED.map((slug) => models.find((m) => m.slug === slug)).filter((m): m is (typeof models)[number] => Boolean(m)),
    ...models.filter((m) => !FEATURED.includes(m.slug)),
  ].slice(0, 8)

  const saved = new Set([...garage, ...wishlist])
  const electric = models.filter((m) => m.fuel_type === 'electric').slice(0, 4)
  const cheapest = [...models]
    .map((m) => ({ m, range: modelPriceRange(variantsByModel.get(m.slug) ?? []) }))
    .filter((x) => x.range)
    .sort((a, b) => a.range![0] - b.range![0])[0]

  return (
    <div className="animate-fade-up">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              'linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent)',
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 size-[520px] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, hsl(var(--brand)), transparent 65%)' }}
        />
        <div className="container relative flex flex-col items-center py-20 text-center sm:py-28">
          <Badge variant="secondary" className="mb-6 gap-1.5">
            <span className="size-1.5 rounded-full bg-brand" />
            {models.length} models · {models.reduce((n, m) => n + (variantsByModel.get(m.slug)?.length ?? 0), 0)} variants
          </Badge>
          <h1 className="max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Build your bike. Price it everywhere.
          </h1>
          <p className="mt-5 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
            BikeLelo is the configurator for India&apos;s motorcycles and scooters — compare specs, check on-road prices
            and find the lowest offer across retailers.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link to="/bikes">
                Browse bikes <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/build">
                <Wrench className="size-4" /> Start a build
              </Link>
            </Button>
          </div>
          {cheapest && (
            <p className="mt-6 text-sm text-muted-foreground">
              Starting from{' '}
              <span className="font-medium text-foreground">{formatINRCompact(cheapest.range![0])}</span> ·{' '}
              <Link to={`/bikes/${cheapest.m.slug}`} className="text-brand hover:underline">
                {cheapest.m.name}
              </Link>
            </p>
          )}
        </div>
      </section>

      {/* Brand strip */}
      <section className="container pt-8">
        <OnboardingHint />
      </section>

      {/* Brand strip */}
      <section className="border-b border-border">
        <LogoSlider
          className="py-5"
          speed={48}
          showBlur={false}
          logos={[...brands, ...brands].map((b, i) => (
            <Link
              key={`${b.slug}-${i}`}
              to={`/bikes?brand=${b.slug}`}
              className="whitespace-nowrap px-4 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {BRAND_SHORT[b.slug] ?? b.name}
            </Link>
          ))}
        />
      </section>

      {/* Recently viewed */}
      {recentlyViewed.length > 0 && (
        <section className="container pt-14">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Pick up where you left off</h2>
              <p className="mt-1 text-sm text-muted-foreground">Bikes you looked at recently.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recentlyViewed
              .map((slug) => modelsBySlug.get(slug))
              .filter((m): m is NonNullable<typeof m> => Boolean(m))
              .slice(0, 4)
              .map((model) => {
                const vs = variantsByModel.get(model.slug) ?? []
                return (
                  <BikeCard
                    key={model.slug}
                    model={model}
                    brand={brandsBySlug.get(model.brand_slug)}
                    variants={vs}
                    saved={vs.some((v) => garage.includes(v.slug) || wishlist.includes(v.slug))}
                    comparing={vs.some((v) => compare.includes(v.slug))}
                    onToggleSave={() => vs[0] && toggleGarage(vs[0].slug)}
                    onToggleCompare={() => vs[0] && toggleCompare(vs[0].slug)}
                  />
                )
              })}
          </div>
        </section>
      )}

      {/* Featured */}
      <section className="container py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Popular right now</h2>
            <p className="mt-1 text-sm text-muted-foreground">India&apos;s best-selling two-wheelers, priced and specced.</p>
          </div>
          <Button variant="ghost" asChild className="hidden sm:inline-flex">
            <Link to="/bikes">
              View all <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((model) => {
            const variants = variantsByModel.get(model.slug) ?? []
            return (
              <BikeCard
                key={model.slug}
                model={model}
                brand={brandsBySlug.get(model.brand_slug)}
                variants={variants}
                saved={variants.some((v) => saved.has(v.slug))}
                comparing={variants.some((v) => compare.includes(v.slug))}
                onToggleSave={() => variants[0] && toggleGarage(variants[0].slug)}
                onToggleCompare={() => variants[0] && toggleCompare(variants[0].slug)}
              />
            )
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-border bg-card/40">
        <div className="container grid gap-10 py-16 md:grid-cols-3">
          <Step
            icon={<GitCompareArrows className="size-5" />}
            title="Pick and compare"
            body="Filter by engine, mileage, brakes and budget. Drop up to four bikes side by side."
          />
          <Step
            icon={<IndianRupee className="size-5" />}
            title="See the real price"
            body="Ex-showroom, state on-road estimate and EMI — plus every retailer offer in one list."
          />
          <Step
            icon={<Wrench className="size-5" />}
            title="Make it yours"
            body="Add genuine and aftermarket parts. Fitment is checked against your exact model and year."
          />
        </div>
      </section>

      {/* Catalogue stats — StatsCounter counts up when scrolled into view */}
      <section className="container py-14" data-testid="catalog-stats">
        <dl className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {[
            { label: 'Models listed', value: models.length, suffix: '+' },
            { label: 'Variants priced', value: variants.length, suffix: '+' },
            { label: 'Brands', value: brands.length },
            { label: 'Retailers tracked', value: retailers.length },
          ].map((stat) => (
            <div key={stat.label}>
              <dd className="text-3xl font-semibold tracking-tight sm:text-4xl">
                <StatsCounter value={stat.value} suffix={stat.suffix ?? ''} />
              </dd>
              <dt className="mt-1 text-sm text-muted-foreground">{stat.label}</dt>
            </div>
          ))}
        </dl>
      </section>

      {/* Electric spotlight */}
      {electric.length > 0 && (
        <section className="container py-16">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold tracking-tight">Go electric</h2>
            <p className="mt-1 text-sm text-muted-foreground">Zero tailpipe, lower running costs, instant torque.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {electric.map((model) => {
              const variants = variantsByModel.get(model.slug) ?? []
              return (
                <BikeCard
                  key={model.slug}
                  model={model}
                  brand={brandsBySlug.get(model.brand_slug)}
                  variants={variants}
                  saved={variants.some((v) => saved.has(v.slug))}
                  comparing={variants.some((v) => compare.includes(v.slug))}
                  onToggleSave={() => variants[0] && toggleGarage(variants[0].slug)}
                  onToggleCompare={() => variants[0] && toggleCompare(variants[0].slug)}
                />
              )
            })}
          </div>
        </section>
      )}

      {/* FAQs — vendored FaqAccordion */}
      <section className="border-t border-border">
        <div className="container grid gap-10 py-16 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Good to know</h2>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
              How pricing, fitment and buying work on BikeLelo.
            </p>
          </div>
          <FaqAccordion title="BikeLelo FAQs" items={FAQ_ITEMS} className="border-0 bg-transparent p-0" />
        </div>
      </section>

      <section className="container pb-20">
        <div className="flex flex-col items-center rounded-2xl border border-border bg-card px-6 py-14 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">Not sure where to start?</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Answer three questions and we&apos;ll rank the catalogue for you, or read the guide first — it explains
            prices, specs and fitment in plain English.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link to="/find">Find my bike</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/guide">How BikeLelo works</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/bikes">Browse all bikes</Link>
            </Button>
          </div>
          {source === 'seed' && (
            <p className="mt-6 text-[11px] text-muted-foreground">
              Showing the bundled catalogue snapshot. Live Supabase data activates once the schema is applied.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}

function Step({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <div className="space-y-3">
      <div className="grid size-10 place-items-center rounded-lg border border-border bg-background text-brand">{icon}</div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  )
}
