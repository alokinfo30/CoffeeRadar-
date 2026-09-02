export interface CoffeeItem {
  id: string;
  name: string;
  category: 'espresso' | 'cold-brew' | 'pour-over' | 'food' | 'merch';
  price: number; // In cents or dollars (e.g. 5.50)
  description: string;
  calories: number;
  caffeineMg: number;
  allergens: ('nuts' | 'dairy' | 'gluten' | 'soy' | 'none')[];
  isDecaf: boolean;
  cyclistBenefits: string;
  badge?: string;
  imageUrl?: string;
}

export const AUTHORITATIVE_CATALOG: Record<string, CoffeeItem> = {
  'velo-nitro-coldbrew': {
    id: 'velo-nitro-coldbrew',
    name: 'Velocita Nitro Cold Brew',
    category: 'cold-brew',
    price: 5.75,
    description: 'Slow-steeped for 20 hours with single-origin Ethiopian Yirgacheffe, nitrogen-infused for a creamy microfoam head without dairy.',
    calories: 15,
    caffeineMg: 220,
    allergens: ['none'],
    isDecaf: false,
    cyclistBenefits: 'High bioavailability caffeine for sustained endurance wattage.',
    badge: 'Best Seller'
  },
  'aero-flat-white': {
    id: 'aero-flat-white',
    name: 'Aero Flat White (Electrolyte Infused)',
    category: 'espresso',
    price: 5.50,
    description: 'Double ristretto espresso pulled over velvety steamed oat or whole milk with a pinch of Himalayan pink salt & magnesium.',
    calories: 140,
    caffeineMg: 150,
    allergens: ['dairy'],
    isDecaf: false,
    cyclistBenefits: 'Replenishes sodium & magnesium lost during intense hill climbs.',
    badge: 'Cyclist Favorite'
  },
  'tour-de-decaf': {
    id: 'tour-de-decaf',
    name: 'Tour de Decaf Mountain Water Pour-Over',
    category: 'pour-over',
    price: 6.00,
    description: '100% Swiss Mountain Water processed Colombian Huila. Tested < 2.1 mg caffeine per 12oz cup, exceeding strict decaf purity thresholds.',
    calories: 5,
    caffeineMg: 2.1,
    allergens: ['none'],
    isDecaf: true,
    cyclistBenefits: 'Full polyphenol antioxidant recovery without disrupting post-ride sleep architecture.',
    badge: 'Lab Certified <3mg'
  },
  'gravel-grinder-cortado': {
    id: 'gravel-grinder-cortado',
    name: 'Gravel Grinder Cortado',
    category: 'espresso',
    price: 4.75,
    description: '1:1 ratio of intense espresso blend (Guatemala + Sumatra) with silky warm milk. High body, dark chocolate & cedar notes.',
    calories: 75,
    caffeineMg: 140,
    allergens: ['dairy'],
    isDecaf: false,
    cyclistBenefits: 'Compact volume for quick hydration before high-cadence intervals.'
  },
  'peloton-matcha-tonic': {
    id: 'peloton-matcha-tonic',
    name: 'Peloton Ceremonial Matcha Tonic',
    category: 'cold-brew',
    price: 6.25,
    description: 'Uji ceremonial grade matcha whisked with artisanal sparkling tonic water and a splash of organic yuzu citrus.',
    calories: 45,
    caffeineMg: 70,
    allergens: ['none'],
    isDecaf: false,
    cyclistBenefits: 'L-theanine + slow-burn caffeine prevents heart rate spikes during sprint zones.'
  },
  'almond-recovery-flapjack': {
    id: 'almond-recovery-flapjack',
    name: 'Almond & Date Power Flapjack',
    category: 'food',
    price: 4.50,
    description: 'Slow-burning rolled oats, organic Medjool dates, toasted California almonds, chia seeds, and sea salt.',
    calories: 280,
    caffeineMg: 0,
    allergens: ['nuts', 'gluten'],
    isDecaf: true,
    cyclistBenefits: '4:1 carb-to-protein ratio designed for 45-minute glycogen replenishment.'
  },
  'gluten-free-banana-bread': {
    id: 'gluten-free-banana-bread',
    name: 'Roasted Pecan GF Banana Bread',
    category: 'food',
    price: 4.75,
    description: 'Naturally sweetened ripe Cavendish bananas with almond flour and roasted Georgia pecans. 100% Gluten-free recipe.',
    calories: 240,
    caffeineMg: 0,
    allergens: ['nuts'],
    isDecaf: true,
    cyclistBenefits: 'Gentle on sensitive stomachs during multi-hour endurance brevets.'
  },
  'velobrew-musette-bag': {
    id: 'velobrew-musette-bag',
    name: 'VeloBrew Water-Resistant Musette Bag',
    category: 'merch',
    price: 18.00,
    description: 'Classic cotton-canvas feed bag with snap closure and diagonal shoulder strap for grab-and-go espresso beans.',
    calories: 0,
    caffeineMg: 0,
    allergens: ['none'],
    isDecaf: true,
    cyclistBenefits: 'Aerodynamic storage for mid-ride pastries and 250g coffee bags.'
  },
  'hydro-flask-handlebar-bottle': {
    id: 'hydro-flask-handlebar-bottle',
    name: 'Insulated 500ml Coffee Bidon',
    category: 'merch',
    price: 24.00,
    description: 'Vacuum-insulated stainless steel bottle sized specifically for standard 74mm bicycle bottle cages. Keeps coffee piping hot for 6 hours.',
    calories: 0,
    caffeineMg: 0,
    allergens: ['none'],
    isDecaf: true,
    cyclistBenefits: 'Never drink lukewarm road coffee again on cold morning club rides.'
  }
};
