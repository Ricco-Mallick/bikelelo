export interface Review {
  model_slug: string
  author_name: string
  city: string
  rating: number
  title: string
  body: string
  months_owned: number
}

/**
 * Sample owner reviews for a handful of popular models so the reviews section
 * is useful out of the box. Real reviews are stored in Supabase's `reviews`
 * table once the schema is applied.
 */
export const REVIEWS: Review[] = [
  {
    model_slug: 'hero-splendor-plus',
    author_name: 'Ankit S.',
    city: 'Jaipur',
    rating: 5,
    title: 'Does exactly what it promises',
    body: 'Around 68 kmpl in the city. Service is cheap and every mechanic knows it. Not exciting, but it has never let me down in three years.',
    months_owned: 34,
  },
  {
    model_slug: 'hero-splendor-plus',
    author_name: 'Priya M.',
    city: 'Pune',
    rating: 4,
    title: 'Great commuter, thin tyres',
    body: 'Light and easy in traffic. The stock tyres feel nervous in the rain, so I upgraded them. Otherwise no complaints.',
    months_owned: 14,
  },
  {
    model_slug: 'honda-activa-6g',
    author_name: 'Rahul K.',
    city: 'Mumbai',
    rating: 5,
    title: 'The default family scooter',
    body: 'Underseat storage fits a helmet, the ride is soft and it starts every morning. Fuel economy around 50 kmpl with two people.',
    months_owned: 22,
  },
  {
    model_slug: 'honda-activa-6g',
    author_name: 'Sneha D.',
    city: 'Bengaluru',
    rating: 4,
    title: 'Comfortable but dated',
    body: 'Very reliable and easy to park. It could use a digital display and a USB charger at this price.',
    months_owned: 9,
  },
  {
    model_slug: 'royal-enfield-classic-350',
    author_name: 'Vikram R.',
    city: 'Delhi',
    rating: 5,
    title: 'The thump is worth it',
    body: 'Torque everywhere, and it cruises at 90 without strain. Heavy in city traffic and the mileage is around 35 kmpl, but you buy it for the feel.',
    months_owned: 18,
  },
  {
    model_slug: 'royal-enfield-classic-350',
    author_name: 'Meera J.',
    city: 'Kochi',
    rating: 4,
    title: 'Lovely to ride, needs care',
    body: 'Servicing is pricier than a commuter and it needs regular chain maintenance. Comfortable for long rides.',
    months_owned: 12,
  },
  {
    model_slug: 'bajaj-pulsar-150',
    author_name: 'Imran A.',
    city: 'Hyderabad',
    rating: 4,
    title: 'Good value 150',
    body: 'Enough power for the highway and parts are cheap. The seat gets firm after an hour.',
    months_owned: 26,
  },
  {
    model_slug: 'tvs-jupiter',
    author_name: 'Lakshmi N.',
    city: 'Chennai',
    rating: 5,
    title: 'Comfortable family scooter',
    body: 'The seat is wide and the suspension handles bad roads well. External fuel filler is a small but brilliant touch.',
    months_owned: 30,
  },
  {
    model_slug: 'tvs-apache-rtr-160-4v',
    author_name: 'Arjun P.',
    city: 'Indore',
    rating: 5,
    title: 'Fun and surprisingly practical',
    body: 'Sharp handling and strong brakes. The ride modes genuinely change the character. Mileage around 45 kmpl.',
    months_owned: 11,
  },
  {
    model_slug: 'ather-450x',
    author_name: 'Nikhil B.',
    city: 'Bengaluru',
    rating: 5,
    title: 'Running costs are tiny',
    body: 'About 30 paise per kilometre at home tariffs. Real range is around 85 km in the city. The app and navigation are genuinely good.',
    months_owned: 16,
  },
  {
    model_slug: 'ather-450x',
    author_name: 'Divya S.',
    city: 'Coimbatore',
    rating: 4,
    title: 'Great city EV, plan longer trips',
    body: 'Instant torque and no service hassle. Fast charging needs the right network, so I keep it for daily commuting.',
    months_owned: 8,
  },
  {
    model_slug: 'honda-shine-125',
    author_name: 'Suresh V.',
    city: 'Nagpur',
    rating: 5,
    title: 'The sensible 125',
    body: 'Smooth engine, easy 60 kmpl, and it handles a pillion without complaining. Ideal if you want zero drama.',
    months_owned: 20,
  },
]

export function reviewsFor(modelSlug: string): Review[] {
  return REVIEWS.filter((r) => r.model_slug === modelSlug)
}

export function ratingSummary(reviews: Review[]): { average: number; count: number } | null {
  if (reviews.length === 0) return null
  const total = reviews.reduce((sum, r) => sum + r.rating, 0)
  return { average: total / reviews.length, count: reviews.length }
}
