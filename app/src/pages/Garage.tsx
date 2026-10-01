import { Link } from 'react-router-dom'
import { GitCompareArrows, Heart, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BikeCard } from '@/components/catalog/BikeCard'
import { EmptyState } from '@/components/common/EmptyState'
import { useCatalog } from '@/lib/catalog'
import { useStore } from '@/lib/store'

export default function Garage() {
  const { variantsBySlug, modelsBySlug, brandsBySlug, variantsByModel } = useCatalog()
  const { garage, wishlist, builds, toggleGarage, toggleWishlist, compare, toggleCompare } = useStore()

  function renderSaved(slugs: string[], empty: { title: string; description: string }) {
    const models = new Map<string, ReturnType<typeof modelsBySlug.get>>()
    for (const slug of slugs) {
      const variant = variantsBySlug.get(slug)
      const model = variant ? modelsBySlug.get(variant.model_slug) : undefined
      if (model) models.set(model.slug, model)
    }
    if (models.size === 0) {
      return (
        <EmptyState
          icon={<Heart className="size-6" />}
          title={empty.title}
          description={empty.description}
          action={
            <Button asChild>
              <Link to="/bikes">Browse bikes</Link>
            </Button>
          }
        />
      )
    }
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...models.values()].map((model) => {
          if (!model) return null
          const variants = variantsByModel.get(model.slug) ?? []
          return (
            <BikeCard
              key={model.slug}
              model={model}
              brand={brandsBySlug.get(model.brand_slug)}
              variants={variants}
              saved={variants.some((v) => garage.includes(v.slug) || wishlist.includes(v.slug))}
              comparing={variants.some((v) => compare.includes(v.slug))}
              onToggleSave={() => {
                const v = variants.find((x) => wishlist.includes(x.slug)) ?? variants[0]
                if (!v) return
                if (wishlist.includes(v.slug)) toggleWishlist(v.slug)
                else toggleGarage(v.slug)
              }}
              onToggleCompare={() => variants[0] && toggleCompare(variants[0].slug)}
            />
          )
        })}
      </div>
    )
  }

  return (
    <div className="container py-10">
      <h1 className="mb-8 text-3xl font-semibold tracking-tight">My garage</h1>
      <Tabs defaultValue="garage">
        <TabsList>
          <TabsTrigger value="garage">
            Garage <span className="ml-1.5 text-muted-foreground">{garage.length}</span>
          </TabsTrigger>
          <TabsTrigger value="wishlist">
            Wishlist <span className="ml-1.5 text-muted-foreground">{wishlist.length}</span>
          </TabsTrigger>
          <TabsTrigger value="builds">
            Builds <span className="ml-1.5 text-muted-foreground">{builds.length}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="garage" className="mt-6">
          {renderSaved(garage, {
            title: 'Your garage is empty',
            description: 'Save bikes you own or are considering — they will show up here.',
          })}
        </TabsContent>

        <TabsContent value="wishlist" className="mt-6">
          {renderSaved(wishlist, {
            title: 'Nothing on your wishlist',
            description: 'Tap the heart on any bike to keep it for later.',
          })}
        </TabsContent>

        <TabsContent value="builds" className="mt-6">
          {builds.length === 0 ? (
            <EmptyState
              icon={<Wrench className="size-6" />}
              title="No builds yet"
              description="Use the configurator to spec a bike with accessories."
              action={
                <Button asChild>
                  <Link to="/build">Start a build</Link>
                </Button>
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {builds.map((b) => {
                const variant = b.variant_slug ? variantsBySlug.get(b.variant_slug) : undefined
                const model = variant ? modelsBySlug.get(variant.model_slug) : undefined
                return (
                  <Link
                    key={b.slug}
                    to={`/build/${b.slug}`}
                    className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-ring/40"
                  >
                    <h3 className="font-semibold">{b.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {model ? `${brandsBySlug.get(model.brand_slug)?.name} ${model.name}` : 'No bike selected'} ·{' '}
                      {b.items.length} part{b.items.length === 1 ? '' : 's'}
                    </p>
                  </Link>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {compare.length > 0 && (
        <div className="mt-10">
          <Button variant="outline" asChild>
            <Link to="/compare">
              <GitCompareArrows className="size-4" /> Review {compare.length} bike{compare.length === 1 ? '' : 's'} in compare
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
