export interface BikeStationData {
  stationId: string;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  totalTripsMonthly: number;
  morningRushPercentage: number; // 7am - 10am share
  bikeLanesAdjacent: number; // 0 to 4
  protectedBikeway: boolean;
  transitConnectionScore: number; // 1 - 100
  demographicIncomeK: number;
}

export interface CandidateShopSite {
  siteId: string;
  name: string;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  cyclistDensityIndex: number; // 0 - 100
  morningRushVolume: number; // riders per morning peak
  nearestCompetitorMeters: number;
  annualFootTrafficK: number;
  monthlyRentPerSqFt: number;
  bikeCorridorsCount: number;
  projectedAnnualRevenueK: number;
  roiScore: number; // 1 - 100
  status: 'recommended' | 'viable' | 'saturated' | 'under_review';
  pros: string[];
  risks: string[];
  recommendedConcept: string;
}

export interface BikeCorridor {
  corridorId: string;
  name: string;
  city: string;
  pathType: 'Protected Cycle Track' | 'Buffered Bike Lane' | 'Off-Street Greenway' | 'Shared Street';
  lengthMiles: number;
  dailyCyclists: number;
  growthRatePct: number;
  coordinates: [number, number][]; // [lat, lng] array
}

export const CITIES_DATA: Record<string, {
  name: string;
  center: [number, number];
  zoom: number;
  stations: BikeStationData[];
  corridors: BikeCorridor[];
  candidateSites: CandidateShopSite[];
  summary: {
    totalActiveCyclists: number;
    annualTripsGrowth: number;
    unmetCoffeeDemandScore: number;
  };
}> = {
  austin: {
    name: 'Austin, TX',
    center: [30.2672, -97.7431],
    zoom: 13,
    summary: {
      totalActiveCyclists: 84000,
      annualTripsGrowth: 18.4,
      unmetCoffeeDemandScore: 92
    },
    stations: [
      {
        stationId: 'ATX-001',
        name: 'Shoal Creek Blvd & 24th St',
        city: 'Austin',
        latitude: 30.2885,
        longitude: -97.7512,
        totalTripsMonthly: 14200,
        morningRushPercentage: 42.5,
        bikeLanesAdjacent: 2,
        protectedBikeway: true,
        transitConnectionScore: 88,
        demographicIncomeK: 98
      },
      {
        stationId: 'ATX-002',
        name: 'East 4th St & Comal Corridor',
        city: 'Austin',
        latitude: 30.2625,
        longitude: -97.7265,
        totalTripsMonthly: 19800,
        morningRushPercentage: 51.2,
        bikeLanesAdjacent: 3,
        protectedBikeway: true,
        transitConnectionScore: 94,
        demographicIncomeK: 112
      },
      {
        stationId: 'ATX-003',
        name: 'South Congress & Riverside Dr',
        city: 'Austin',
        latitude: 30.2592,
        longitude: -97.7468,
        totalTripsMonthly: 23400,
        morningRushPercentage: 38.0,
        bikeLanesAdjacent: 2,
        protectedBikeway: true,
        transitConnectionScore: 91,
        demographicIncomeK: 105
      },
      {
        stationId: 'ATX-004',
        name: 'Barton Springs & Ann and Roy Butler Hike-and-Bike Trail',
        city: 'Austin',
        latitude: 30.2618,
        longitude: -97.7634,
        totalTripsMonthly: 28900,
        morningRushPercentage: 46.8,
        bikeLanesAdjacent: 3,
        protectedBikeway: true,
        transitConnectionScore: 85,
        demographicIncomeK: 124
      },
      {
        stationId: 'ATX-005',
        name: 'Rainey St & Lady Bird Boardwalk',
        city: 'Austin',
        latitude: 30.2575,
        longitude: -97.7385,
        totalTripsMonthly: 17300,
        morningRushPercentage: 34.2,
        bikeLanesAdjacent: 2,
        protectedBikeway: true,
        transitConnectionScore: 78,
        demographicIncomeK: 135
      }
    ],
    corridors: [
      {
        corridorId: 'ATX-COR-1',
        name: 'Ann & Roy Butler Trail North & South Loop',
        city: 'Austin',
        pathType: 'Off-Street Greenway',
        lengthMiles: 10.1,
        dailyCyclists: 6400,
        growthRatePct: 22.1,
        coordinates: [
          [30.2655, -97.7695],
          [30.2618, -97.7634],
          [30.2592, -97.7468],
          [30.2575, -97.7385],
          [30.2520, -97.7210]
        ]
      },
      {
        corridorId: 'ATX-COR-2',
        name: 'Lance Armstrong Bikeway (4th St Urban Spine)',
        city: 'Austin',
        pathType: 'Protected Cycle Track',
        lengthMiles: 5.4,
        dailyCyclists: 4800,
        growthRatePct: 29.5,
        coordinates: [
          [30.2680, -97.7550],
          [30.2650, -97.7410],
          [30.2625, -97.7265],
          [30.2605, -97.7120]
        ]
      },
      {
        corridorId: 'ATX-COR-3',
        name: 'Shoal Creek Urban Greenway Trail',
        city: 'Austin',
        pathType: 'Protected Cycle Track',
        lengthMiles: 3.9,
        dailyCyclists: 3100,
        growthRatePct: 15.3,
        coordinates: [
          [30.3010, -97.7470],
          [30.2885, -97.7512],
          [30.2740, -97.7525],
          [30.2670, -97.7520]
        ]
      }
    ],
    candidateSites: [
      {
        siteId: 'SITE-ATX-EAST4TH',
        name: 'East 4th St & Comal Rail Corridor Hub',
        address: '1301 E 4th St, Austin, TX 78702',
        city: 'Austin',
        state: 'TX',
        latitude: 30.2628,
        longitude: -97.7271,
        cyclistDensityIndex: 96,
        morningRushVolume: 1250,
        nearestCompetitorMeters: 480,
        annualFootTrafficK: 320,
        monthlyRentPerSqFt: 46,
        bikeCorridorsCount: 3,
        projectedAnnualRevenueK: 1140,
        roiScore: 94,
        status: 'recommended',
        pros: [
          'Direct frontage onto Lance Armstrong Bikeway protected track',
          'MetroRail Downtown commuter station interchange within 120m',
          '51% morning commuter surge with high specialty espresso affinity',
          'Ample space for 12-bike secure parking corral and outdoor hydration pump'
        ],
        risks: [
          'Summer afternoon heat reduces foot traffic between 2pm-5pm (requires misting patio)',
          'High demand during SXSW requires seasonal pop-up staffing buffer'
        ],
        recommendedConcept: 'Flagship VeloBrew Roastery + Quick-Service Walk-up & Roll-through Bidon Refill Counter'
      },
      {
        siteId: 'SITE-ATX-BARTON',
        name: 'Barton Springs Trailhead Pavilion',
        address: '1600 Barton Springs Rd, Austin, TX 78704',
        city: 'Austin',
        state: 'TX',
        latitude: 30.2621,
        longitude: -97.7642,
        cyclistDensityIndex: 91,
        morningRushVolume: 1080,
        nearestCompetitorMeters: 310,
        annualFootTrafficK: 450,
        monthlyRentPerSqFt: 58,
        bikeCorridorsCount: 2,
        projectedAnnualRevenueK: 1280,
        roiScore: 89,
        status: 'recommended',
        pros: [
          'Highest weekend recreation cyclist volume in Central Texas',
          'Immediate access to Butler Hike-and-Bike Trail bridge',
          'High average order value with cold brew growler refills'
        ],
        risks: [
          'Higher commercial lease rate per square foot',
          'City parkland historical zoning constraints on interior alterations'
        ],
        recommendedConcept: 'Boutique Espresso Bar + Electrolyte Hydration Station'
      },
      {
        siteId: 'SITE-ATX-RAINEY',
        name: 'Rainey St & Lady Bird Trail Intersection',
        address: '72 Rainey St, Austin, TX 78701',
        city: 'Austin',
        state: 'TX',
        latitude: 30.2579,
        longitude: -97.7391,
        cyclistDensityIndex: 79,
        morningRushVolume: 640,
        nearestCompetitorMeters: 140,
        annualFootTrafficK: 610,
        monthlyRentPerSqFt: 72,
        bikeCorridorsCount: 2,
        projectedAnnualRevenueK: 980,
        roiScore: 73,
        status: 'viable',
        pros: [
          'Extremely dense high-rise residential demographics',
          'Direct connector to Lady Bird Lake Boardwalk'
        ],
        risks: [
          'High density of competing cafes within 200 meters',
          'Evening nightlife crowd may conflict with morning athlete atmosphere'
        ],
        recommendedConcept: 'Compact Espresso Kiosk & Cold Brew Taproom'
      },
      {
        siteId: 'SITE-ATX-SHOAL',
        name: 'Shoal Creek & West 24th Corner',
        address: '2404 Shoal Crest Ave, Austin, TX 78705',
        city: 'Austin',
        state: 'TX',
        latitude: 30.2882,
        longitude: -97.7508,
        cyclistDensityIndex: 82,
        morningRushVolume: 790,
        nearestCompetitorMeters: 620,
        annualFootTrafficK: 210,
        monthlyRentPerSqFt: 38,
        bikeCorridorsCount: 2,
        projectedAnnualRevenueK: 820,
        roiScore: 85,
        status: 'viable',
        pros: [
          'Student & faculty commuter corridor between West Campus and UT Medical',
          'Low commercial lease overhead'
        ],
        risks: [
          'Summer seasonality dip during university break periods'
        ],
        recommendedConcept: 'Neighborhood Study & Cycling Clubhouse'
      }
    ]
  },
  nyc: {
    name: 'New York, NY',
    center: [40.7128, -74.0060],
    zoom: 12,
    summary: {
      totalActiveCyclists: 550000,
      annualTripsGrowth: 26.8,
      unmetCoffeeDemandScore: 95
    },
    stations: [
      {
        stationId: 'NYC-001',
        name: 'Hudson River Greenway & Christopher St',
        city: 'New York',
        latitude: 40.7335,
        longitude: -74.0112,
        totalTripsMonthly: 48500,
        morningRushPercentage: 54.1,
        bikeLanesAdjacent: 4,
        protectedBikeway: true,
        transitConnectionScore: 96,
        demographicIncomeK: 165
      },
      {
        stationId: 'NYC-002',
        name: 'Williamsburg Bridge Plaza & Bedford Ave',
        city: 'New York',
        latitude: 40.7118,
        longitude: -73.9620,
        totalTripsMonthly: 62300,
        morningRushPercentage: 59.8,
        bikeLanesAdjacent: 3,
        protectedBikeway: true,
        transitConnectionScore: 98,
        demographicIncomeK: 140
      },
      {
        stationId: 'NYC-003',
        name: 'Brooklyn Waterfront Greenway & DUMBO',
        city: 'New York',
        latitude: 40.7032,
        longitude: -73.9890,
        totalTripsMonthly: 39100,
        morningRushPercentage: 47.2,
        bikeLanesAdjacent: 3,
        protectedBikeway: true,
        transitConnectionScore: 92,
        demographicIncomeK: 180
      }
    ],
    corridors: [
      {
        corridorId: 'NYC-COR-1',
        name: 'Hudson River Greenway (Busiest US Cycle Path)',
        city: 'New York',
        pathType: 'Off-Street Greenway',
        lengthMiles: 12.9,
        dailyCyclists: 14500,
        growthRatePct: 24.2,
        coordinates: [
          [40.7550, -74.0080],
          [40.7335, -74.0112],
          [40.7150, -74.0160],
          [40.7040, -74.0175]
        ]
      },
      {
        corridorId: 'NYC-COR-2',
        name: 'Williamsburg Bridge & Bedford Commuter Superhighway',
        city: 'New York',
        pathType: 'Protected Cycle Track',
        lengthMiles: 4.2,
        dailyCyclists: 11200,
        growthRatePct: 31.0,
        coordinates: [
          [40.7180, -73.9880],
          [40.7140, -73.9720],
          [40.7118, -73.9620],
          [40.7145, -73.9570]
        ]
      }
    ],
    candidateSites: [
      {
        siteId: 'SITE-NYC-WBURG',
        name: 'Williamsburg Bridge Descent & Roebling St',
        address: '220 Roebling St, Brooklyn, NY 11211',
        city: 'New York',
        state: 'NY',
        latitude: 40.7115,
        longitude: -73.9598,
        cyclistDensityIndex: 98,
        morningRushVolume: 3400,
        nearestCompetitorMeters: 380,
        annualFootTrafficK: 890,
        monthlyRentPerSqFt: 110,
        bikeCorridorsCount: 3,
        projectedAnnualRevenueK: 2450,
        roiScore: 97,
        status: 'recommended',
        pros: [
          'Captures over 3,400 daily morning bridge commuters descending into Brooklyn',
          'High propensity for nitro cold brew and quick breakfast carb fuel',
          'Exceptional brand visibility for national brand launch'
        ],
        risks: [
          'High commercial square footage costs',
          'Strict NYC DOT sidewalk clearance regulations for bike racks'
        ],
        recommendedConcept: 'High-Volume Micro-Roastery + Rapid Express Mobile Pickup Window'
      },
      {
        siteId: 'SITE-NYC-WESTVILL',
        name: 'Hudson River Greenway & West 11th St',
        address: '385 West St, New York, NY 10014',
        city: 'New York',
        state: 'NY',
        latitude: 40.7350,
        longitude: -74.0098,
        cyclistDensityIndex: 94,
        morningRushVolume: 2800,
        nearestCompetitorMeters: 510,
        annualFootTrafficK: 1200,
        monthlyRentPerSqFt: 145,
        bikeCorridorsCount: 2,
        projectedAnnualRevenueK: 2700,
        roiScore: 92,
        status: 'recommended',
        pros: [
          'Unrivaled Greenway frontage with waterfront park view',
          'Massive weekend running/cycling endurance community'
        ],
        risks: [
          'Premium West Village lease rates'
        ],
        recommendedConcept: 'Flagship Destination Cafe + Peloton Club Lounge'
      }
    ]
  },
  sf: {
    name: 'San Francisco, CA',
    center: [37.7749, -122.4194],
    zoom: 13,
    summary: {
      totalActiveCyclists: 125000,
      annualTripsGrowth: 19.5,
      unmetCoffeeDemandScore: 88
    },
    stations: [
      {
        stationId: 'SF-001',
        name: 'Market St & 8th St (The Wiggle Confluence)',
        city: 'San Francisco',
        latitude: 37.7780,
        longitude: -122.4145,
        totalTripsMonthly: 31200,
        morningRushPercentage: 56.4,
        bikeLanesAdjacent: 3,
        protectedBikeway: true,
        transitConnectionScore: 97,
        demographicIncomeK: 155
      },
      {
        stationId: 'SF-002',
        name: 'The Embarcadero & Ferry Building Plaza',
        city: 'San Francisco',
        latitude: 37.7955,
        longitude: -122.3937,
        totalTripsMonthly: 44100,
        morningRushPercentage: 48.9,
        bikeLanesAdjacent: 4,
        protectedBikeway: true,
        transitConnectionScore: 99,
        demographicIncomeK: 175
      }
    ],
    corridors: [
      {
        corridorId: 'SF-COR-1',
        name: 'The Embarcadero Protected Promenade',
        city: 'San Francisco',
        pathType: 'Protected Cycle Track',
        lengthMiles: 3.5,
        dailyCyclists: 7200,
        growthRatePct: 18.7,
        coordinates: [
          [37.8080, -122.4100],
          [37.7955, -122.3937],
          [37.7850, -122.3880],
          [37.7710, -122.3870]
        ]
      }
    ],
    candidateSites: [
      {
        siteId: 'SITE-SF-WIGGLE',
        name: 'Duboce Park & The Wiggle Bike Gateway',
        address: '55 Duboce Ave, San Francisco, CA 94103',
        city: 'San Francisco',
        state: 'CA',
        latitude: 37.7698,
        longitude: -122.4242,
        cyclistDensityIndex: 95,
        morningRushVolume: 2200,
        nearestCompetitorMeters: 410,
        annualFootTrafficK: 520,
        monthlyRentPerSqFt: 62,
        bikeCorridorsCount: 3,
        projectedAnnualRevenueK: 1650,
        roiScore: 93,
        status: 'recommended',
        pros: [
          'Iconic nexus of SF cycling network connecting Mission to Sunset',
          'Flattest bicycle route across SF hills guarantees maximum commuter passage',
          'Adjacent to Duboce Park Muni light rail portal'
        ],
        risks: [
          'Neighborhood preservation zoning requiring thorough permit review'
        ],
        recommendedConcept: 'Artisanal Pour-Over & Quick Bidon Espresso Bar'
      }
    ]
  }
};
