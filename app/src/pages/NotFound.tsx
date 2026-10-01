import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="container grid min-h-[60vh] place-items-center py-20 text-center">
      <div>
        <p className="text-sm font-medium uppercase tracking-widest text-brand">404</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Wrong turn</h1>
        <p className="mt-2 text-sm text-muted-foreground">This road doesn&apos;t exist. Let&apos;s get you back on track.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild>
            <Link to="/">Go home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/bikes">Browse bikes</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
