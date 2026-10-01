import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { KineticTextLoader } from '@/components/vendor'
import { CatalogProvider } from '@/lib/catalog'
import { StoreProvider } from '@/lib/store'

/**
 * GitHub Pages serves project sites under /<repo>/, and repository names are
 * case-sensitive, so a baked-in base path breaks if the repo name differs.
 * Derive the router base from the URL instead: an optional first segment that
 * is not one of our own routes is the deployment prefix. This works both at a
 * domain root and under any repo name, without baking the path in at build time.
 */
const APP_ROUTES = new Set(['bikes', 'parts', 'build', 'compare', 'garage', 'guide', 'find'])

function routerBasename(): string {
  const compiled = import.meta.env.BASE_URL
  if (compiled && compiled !== '/' && compiled !== './') return compiled
  if (typeof window === 'undefined') return '/'
  const [first] = window.location.pathname.split('/').filter(Boolean)
  if (!first || APP_ROUTES.has(first)) return '/'
  return `/${first}/`
}

const Home = lazy(() => import('@/pages/Home'))
const Browse = lazy(() => import('@/pages/Browse'))
const ModelDetail = lazy(() => import('@/pages/ModelDetail'))
const Compare = lazy(() => import('@/pages/Compare'))
const Configurator = lazy(() => import('@/pages/Configurator'))
const Parts = lazy(() => import('@/pages/Parts'))
const Garage = lazy(() => import('@/pages/Garage'))
const FindBike = lazy(() => import('@/pages/FindBike'))
const Guide = lazy(() => import('@/pages/Guide'))
const NotFound = lazy(() => import('@/pages/NotFound'))

export default function App() {
  return (
    <BrowserRouter basename={routerBasename()}>
      <CatalogProvider>
        <StoreProvider>
          <AppShell>
            <Suspense
              fallback={
                <div className="grid min-h-[60vh] place-items-center">
                  <KineticTextLoader text="Loading" />
                </div>
              }
            >
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/bikes" element={<Browse />} />
                <Route path="/bikes/:modelSlug" element={<ModelDetail />} />
                <Route path="/find" element={<FindBike />} />
                <Route path="/compare" element={<Compare />} />
                <Route path="/build" element={<Configurator />} />
                <Route path="/build/:buildSlug" element={<Configurator />} />
                <Route path="/parts" element={<Parts />} />
                <Route path="/garage" element={<Garage />} />
                <Route path="/guide" element={<Guide />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </AppShell>
        </StoreProvider>
      </CatalogProvider>
    </BrowserRouter>
  )
}
