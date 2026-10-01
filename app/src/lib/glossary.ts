export interface GlossaryEntry {
  term: string
  short: string
  detail?: string
}

/** Explanations surfaced as inline tooltips beside specs and prices. */
export const GLOSSARY: Record<string, GlossaryEntry> = {
  engine_cc: {
    term: 'Engine displacement',
    short: 'The size of the engine, in cubic centimetres.',
    detail:
      'Bigger is usually more powerful but thirstier. Roughly: up to 110cc for city commuting, 125-160cc for mixed use, 200cc+ for highway touring. It also sets your road-tax slab.',
  },
  power_ps: {
    term: 'Max power',
    short: 'Peak output in PS (metric horsepower).',
    detail: 'Reached high in the rev range. More power means easier overtaking and relaxed highway cruising.',
  },
  torque_nm: {
    term: 'Max torque',
    short: 'Pulling force, in newton-metres.',
    detail: 'Strong low-rpm torque is what makes a bike feel quick off the line and easy in traffic.',
  },
  mileage_kmpl: {
    term: 'Mileage',
    short: 'Kilometres per litre of fuel.',
    detail:
      'Real-world figures usually run 10-20% below the claimed number. Electric two-wheelers show range instead.',
  },
  kerb_weight_kg: {
    term: 'Kerb weight',
    short: 'Ready-to-ride weight, with a full tank.',
    detail: 'Lighter bikes are easier to paddle around and park. Under 120 kg is light for a motorcycle.',
  },
  seat_height_mm: {
    term: 'Seat height',
    short: 'Height of the saddle from the ground.',
    detail: 'Riders under about 5 ft 6 in usually prefer under 800 mm. Sit on the bike before deciding.',
  },
  ground_clearance_mm: {
    term: 'Ground clearance',
    short: 'Lowest point of the bike above the road.',
    detail: 'Around 160 mm clears Indian speed breakers; 200 mm and up suits rough roads.',
  },
  wheelbase_mm: {
    term: 'Wheelbase',
    short: 'Distance between the two axles.',
    detail: 'Shorter is nippier in traffic; longer is steadier at speed.',
  },
  abs: {
    term: 'Braking system',
    short: 'ABS stops the wheels locking; CBS links them.',
    detail:
      'ABS is the safety upgrade, preventing wheel lock under hard braking. CBS (combined braking) is cheaper and common on commuters.',
  },
  brake_front: { term: 'Front brake', short: 'Disc brakes bite harder than drum brakes.' },
  brake_rear: { term: 'Rear brake', short: 'Usually drum on commuters, disc on sportier bikes.' },
  fuel_tank_l: { term: 'Fuel tank', short: 'Capacity in litres, so bigger means fewer fuel stops.' },
  range_km: {
    term: 'Range',
    short: 'How far it goes on a charge (electric).',
    detail: 'Real range drops in heavy traffic, in the rain, or with a pillion aboard.',
  },
  battery_kwh: {
    term: 'Battery',
    short: 'Usable battery capacity in kWh.',
    detail: 'Treat it like fuel-tank size for an EV. It drives both range and price.',
  },
  charging_time_hrs: {
    term: 'Charging time',
    short: 'Time to charge, typically from a standard socket.',
    detail: 'Most Indian EVs charge overnight at home. Fast-charging support varies by model.',
  },
  transmission: {
    term: 'Transmission',
    short: 'How many gears, or automatic.',
    detail: 'Scooters and EVs are automatic. More gears generally means more relaxed highway riding.',
  },
  cooling: { term: 'Cooling', short: 'Air-cooled is simpler; liquid-cooled copes better with heat.' },
  fuel_system: {
    term: 'Fuel system',
    short: 'Fuel injection is smoother and cleaner than a carburettor.',
    detail: 'Every new bike sold in India is fuel-injected (BS6).',
  },
  tyre_type: { term: 'Tyre type', short: 'Tubeless tyres lose air slowly and are easier to repair.' },
  body_type: {
    term: 'Body type',
    short: 'The bike’s overall character.',
    detail:
      'Commuter for daily city runs, scooter for convenience, sport for performance, cruiser for relaxed miles, adventure for mixed roads, cafe racer for style.',
  },
  fuel_type: { term: 'Fuel', short: 'Petrol or electric. EVs cut running costs sharply.' },
  ex_showroom_inr: {
    term: 'Ex-showroom price',
    short: 'Price before road tax, registration and insurance.',
    detail:
      'The figure manufacturers advertise, and it already includes GST. The on-road calculator shows what you actually pay.',
  },
  gst_rate: {
    term: 'GST',
    short: 'Tax built into the ex-showroom price.',
    detail: 'Since Sept 2025: 18% up to 350cc, 40% above 350cc, and 5% for electric two-wheelers.',
  },
}

export interface ConceptEntry extends GlossaryEntry {
  id: string
}

/** Longer explainers used by the guide page and the first-visit hint. */
export const CONCEPTS: ConceptEntry[] = [
  {
    id: 'ex-showroom',
    term: 'Ex-showroom vs on-road price',
    short: 'The sticker price is not what you pay at the dealership.',
    detail:
      'Ex-showroom includes GST but excludes road tax, registration and insurance. Add 10-25% for the on-road total, depending on your state. Every bike page here has a state-wise on-road calculator.',
  },
  {
    id: 'emi',
    term: 'EMI and financing',
    short: 'Most two-wheelers in India are bought on finance.',
    detail:
      'EMI depends on how much you borrow, the interest rate and the tenure. A larger down payment lowers the monthly figure. The EMI sliders on any bike page show that trade-off instantly.',
  },
  {
    id: 'fitment',
    term: 'Fitment',
    short: 'Whether a part actually fits your bike.',
    detail:
      'Accessories are tied to a make, model and year, so an exhaust for a Classic 350 will not bolt onto a Hunter. BikeLelo checks this for you once you pick a bike in the configurator.',
  },
  {
    id: 'retailers',
    term: 'Why you are sent to other sites',
    short: 'BikeLelo compares; the retailer sells.',
    detail:
      'No stock is held here. Each offer links out to the retailer or the maker’s own store, so you buy on their price and their terms. We may earn a commission, which never changes what you pay.',
  },
  {
    id: 'prices',
    term: 'Where prices come from',
    short: 'Manufacturer lists plus scheduled retailer checks.',
    detail:
      'Ex-showroom prices are seeded from manufacturer price lists and refreshed by a scheduled scraper. Each offer shows when it was last checked so you can judge how fresh it is.',
  },
]
