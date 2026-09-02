export interface CoffeeItem {
  id: string;
  name: string;
  category: 'espresso' | 'cold-brew' | 'pour-over' | 'food' | 'merch';
  price: number;
  description: string;
  calories: number;
  caffeineMg: number;
  allergens: ('nuts' | 'dairy' | 'gluten' | 'soy' | 'none')[];
  isDecaf: boolean;
  cyclistBenefits: string;
  badge?: string;
  imageUrl?: string;
}

export interface CartItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  catalogItem: CoffeeItem;
  appliedCustomizations?: Record<string, any>;
  clientSubmittedPrice?: number;
}

export interface CartValidationResponse {
  isValid: boolean;
  tamperingDetected: boolean;
  securityViolations: string[];
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  recalculatedTimestamp: string;
}

export interface CandidateShopSite {
  siteId: string;
  name: string;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  cyclistDensityIndex: number;
  morningRushVolume: number;
  nearestCompetitorMeters: number;
  annualFootTrafficK: number;
  monthlyRentPerSqFt: number;
  bikeCorridorsCount: number;
  projectedAnnualRevenueK: number;
  roiScore: number;
  status: 'recommended' | 'viable' | 'saturated' | 'under_review';
  pros: string[];
  risks: string[];
  recommendedConcept: string;
}

export interface BikeStationData {
  stationId: string;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  totalTripsMonthly: number;
  morningRushPercentage: number;
  bikeLanesAdjacent: number;
  protectedBikeway: boolean;
  transitConnectionScore: number;
  demographicIncomeK: number;
}

export interface BikeCorridor {
  corridorId: string;
  name: string;
  city: string;
  pathType: 'Protected Cycle Track' | 'Buffered Bike Lane' | 'Off-Street Greenway' | 'Shared Street';
  lengthMiles: number;
  dailyCyclists: number;
  growthRatePct: number;
  coordinates: [number, number][];
}

export interface CityData {
  name: string;
  center: [number, number];
  zoom: number;
  summary: {
    totalActiveCyclists: number;
    annualTripsGrowth: number;
    unmetCoffeeDemandScore: number;
  };
  stations: BikeStationData[];
  corridors: BikeCorridor[];
  candidateSites: CandidateShopSite[];
}

export interface AgentTelemetryTrace {
  timestamp: string;
  stepName: string;
  actionType: 'PROMPTGUARD_SCAN' | 'RAG_RETRIEVAL' | 'MCP_TOOL_CALL' | 'BIGQUERY_EXECUTION' | 'GEMINI_INFERENCE' | 'FINAL_SYNTHESIS';
  details: Record<string, any>;
  durationMs: number;
}

export interface AgentMessage {
  id: string;
  sender: 'user' | 'agent' | 'security_system';
  content: string;
  timestamp: string;
  threatEvaluation?: {
    isSafe: boolean;
    threatLevel: 'CLEAN' | 'SUSPICIOUS' | 'CRITICAL_BLOCK';
    threatScore: number;
    flaggedPatterns: string[];
    reasons: string[];
    wrappedUserQuery?: string;
  };
  toolCallsExecuted?: {
    toolName: string;
    arguments: Record<string, any>;
    resultSummary: string;
    bytesScanned?: number;
    latencyMs?: number;
  }[];
  ragDocumentsUsed?: {
    id: string;
    title: string;
    score: number;
  }[];
  telemetryTraces?: AgentTelemetryTrace[];
  recommendedSite?: CandidateShopSite;
  totalLatencyMs?: number;
}

export interface TestSuiteResult {
  summary: {
    total: number;
    passed: number;
    failed: number;
    status: 'ALL_PASSED_GREEN' | 'FAILURES_DETECTED';
    durationMs: number;
  };
  tests: {
    id: number;
    name: string;
    category: string;
    passed: boolean;
    details: string;
  }[];
}
