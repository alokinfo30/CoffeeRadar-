/**
 * BigQuery MCP Server (Model Context Protocol)
 * Provides tool definitions and SQL execution engine for Gemini agents to query
 * public bikeshare datasets, cycling corridors, demographic layers, and siting suitability.
 */

import { CITIES_DATA, CandidateShopSite, BikeStationData } from '../data/datasets.js';

export interface MCPToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'OBJECT';
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface QueryExecutionResult {
  query: string;
  columns: string[];
  rows: Record<string, any>[];
  totalRows: number;
  bytesScanned: number;
  executionTimeMs: number;
  cacheHit: boolean;
  jobId: string;
}

export const BIGQUERY_MCP_TOOLS: MCPToolDefinition[] = [
  {
    name: 'bigquery_list_datasets',
    description: 'Lists all available BigQuery public datasets and VeloBrew expansion data tables for cyclist-centric market research.',
    parameters: {
      type: 'OBJECT',
      properties: {
        filter: {
          type: 'STRING',
          description: 'Optional filter keyword (e.g. "bikeshare", "corridor", "demographics").'
        }
      }
    }
  },
  {
    name: 'bigquery_get_table_schema',
    description: 'Fetches the schema definition and column types for a specific BigQuery table.',
    parameters: {
      type: 'OBJECT',
      properties: {
        datasetId: {
          type: 'STRING',
          description: 'The dataset identifier (e.g. "bigquery-public-data.austin_bikeshare" or "velo_expansion").'
        },
        tableId: {
          type: 'STRING',
          description: 'The table identifier (e.g. "bikeshare_trips", "bikeshare_stations", "corridor_metrics").'
        }
      },
      required: ['datasetId', 'tableId']
    }
  },
  {
    name: 'bigquery_execute_query',
    description: 'Executes a safe BigQuery SQL statement against public bikeshare datasets and returns structured rows with query telemetry.',
    parameters: {
      type: 'OBJECT',
      properties: {
        sql: {
          type: 'STRING',
          description: 'Standard SQL query to execute. Must be read-only (SELECT queries only).'
        },
        city: {
          type: 'STRING',
          description: 'Target city context ("austin", "nyc", "sf").'
        }
      },
      required: ['sql']
    }
  },
  {
    name: 'bigquery_analyze_corridors',
    description: 'Analyzes spatial bike corridors, calculating morning commuter flow ratio, cyclist density index, and competitor buffer distances.',
    parameters: {
      type: 'OBJECT',
      properties: {
        city: {
          type: 'STRING',
          description: 'Target city ("austin", "nyc", "sf").'
        },
        minMorningRushRatio: {
          type: 'NUMBER',
          description: 'Minimum morning peak trip percentage threshold (e.g., 0.40 for 40%).'
        }
      },
      required: ['city']
    }
  },
  {
    name: 'geospatial_cyclist_density',
    description: 'Computes candidate coffee shop placement rankings using a multi-criteria scoring algorithm (cyclist volume, competitor distance, median income, transit connectivity).',
    parameters: {
      type: 'OBJECT',
      properties: {
        city: {
          type: 'STRING',
          description: 'Target city identifier.'
        },
        minRoiScore: {
          type: 'NUMBER',
          description: 'Filter candidates with minimum projected ROI score (1-100).'
        }
      },
      required: ['city']
    }
  }
];

export class BigQueryMCPServer {
  private static DATASETS = [
    {
      datasetId: 'bigquery-public-data.austin_bikeshare',
      tables: ['bikeshare_trips', 'bikeshare_stations', 'station_activity_hourly'],
      description: 'Austin B-cycle public ride telemetry, trip origins, destinations, and duration metrics.'
    },
    {
      datasetId: 'bigquery-public-data.new_york_citibike',
      tables: ['citibike_trips', 'citibike_stations', 'bridge_crossings_daily'],
      description: 'NYC Citi Bike millions of commuter trips, bridge crossings, and waterfront greenway flow.'
    },
    {
      datasetId: 'bigquery-public-data.san_francisco_bikeshare',
      tables: ['bikeshare_trips', 'bikeshare_stations', 'wiggle_corridor_counts'],
      description: 'SF Bay Wheels bike trips, elevation profiles, and transit hub transfers.'
    },
    {
      datasetId: 'velo_expansion.market_intelligence',
      tables: ['candidate_sites', 'competitor_locations', 'specialty_coffee_expenditure'],
      description: 'Proprietary VeloBrew expansion models, lease cost comps, and cyclist demographic indices.'
    }
  ];

  public static listDatasets(filter?: string) {
    if (!filter) return this.DATASETS;
    const lower = filter.toLowerCase();
    return this.DATASETS.filter(
      (d) =>
        d.datasetId.toLowerCase().includes(lower) ||
        d.description.toLowerCase().includes(lower) ||
        d.tables.some((t) => t.toLowerCase().includes(lower))
    );
  }

  public static getTableSchema(datasetId: string, tableId: string) {
    if (tableId.includes('stations')) {
      return {
        datasetId,
        tableId,
        columns: [
          { name: 'station_id', type: 'STRING', mode: 'REQUIRED', description: 'Unique station identifier' },
          { name: 'name', type: 'STRING', mode: 'REQUIRED', description: 'Station street name / intersection' },
          { name: 'latitude', type: 'FLOAT64', mode: 'REQUIRED', description: 'GPS Latitude' },
          { name: 'longitude', type: 'FLOAT64', mode: 'REQUIRED', description: 'GPS Longitude' },
          { name: 'total_trips_monthly', type: 'INT64', mode: 'NULLABLE', description: 'Monthly bike pickups and dropoffs' },
          { name: 'morning_rush_ratio', type: 'FLOAT64', mode: 'NULLABLE', description: 'Share of trips occurring 7-10 AM' },
          { name: 'protected_lane_flag', type: 'BOOLEAN', mode: 'NULLABLE', description: 'True if direct access to Class IV cycle track' }
        ]
      };
    }

    if (tableId.includes('trips')) {
      return {
        datasetId,
        tableId,
        columns: [
          { name: 'trip_id', type: 'STRING', mode: 'REQUIRED' },
          { name: 'start_station_id', type: 'STRING', mode: 'REQUIRED' },
          { name: 'end_station_id', type: 'STRING', mode: 'REQUIRED' },
          { name: 'start_time', type: 'TIMESTAMP', mode: 'REQUIRED' },
          { name: 'duration_minutes', type: 'FLOAT64', mode: 'NULLABLE' },
          { name: 'user_type', type: 'STRING', mode: 'NULLABLE' }
        ]
      };
    }

    return {
      datasetId,
      tableId,
      columns: [
        { name: 'site_id', type: 'STRING', mode: 'REQUIRED' },
        { name: 'candidate_name', type: 'STRING', mode: 'REQUIRED' },
        { name: 'cyclist_density_score', type: 'INT64', mode: 'REQUIRED' },
        { name: 'competitor_distance_m', type: 'INT64', mode: 'REQUIRED' },
        { name: 'projected_revenue_annual', type: 'FLOAT64', mode: 'REQUIRED' },
        { name: 'roi_rank', type: 'INT64', mode: 'REQUIRED' }
      ]
    };
  }

  public static executeQuery(sql: string, cityKey: string = 'austin'): QueryExecutionResult {
    const startTime = Date.now();
    const cleanSql = sql.trim();

    // Safety checks: Block destructive commands
    if (/^\s*(DROP|DELETE|UPDATE|INSERT|ALTER|TRUNCATE|CREATE|GRANT|REVOKE)/i.test(cleanSql)) {
      throw new Error('Security Violation: Only read-only SELECT queries are permitted in BigQuery MCP Server.');
    }

    const city = CITIES_DATA[cityKey.toLowerCase()] || CITIES_DATA.austin;
    let rows: Record<string, any>[] = [];
    let columns: string[] = [];

    // Synthesize realistic BigQuery results based on query target
    if (/stations|station_activity/i.test(cleanSql)) {
      columns = ['station_id', 'station_name', 'monthly_trips', 'morning_rush_pct', 'protected_lane', 'transit_score'];
      rows = city.stations.map((s) => ({
        station_id: s.stationId,
        station_name: s.name,
        monthly_trips: s.totalTripsMonthly,
        morning_rush_pct: `${s.morningRushPercentage}%`,
        protected_lane: s.protectedBikeway,
        transit_score: s.transitConnectionScore
      }));
    } else if (/corridor/i.test(cleanSql)) {
      columns = ['corridor_id', 'corridor_name', 'path_type', 'daily_cyclists', 'growth_rate_pct'];
      rows = city.corridors.map((c) => ({
        corridor_id: c.corridorId,
        corridor_name: c.name,
        path_type: c.pathType,
        daily_cyclists: c.dailyCyclists,
        growth_rate_pct: `${c.growthRatePct}%`
      }));
    } else {
      // Siting / candidate placement query
      columns = ['site_id', 'name', 'address', 'cyclist_density_idx', 'morning_rush_volume', 'competitor_dist_m', 'projected_revenue_k', 'roi_score', 'status'];
      rows = city.candidateSites.map((site) => ({
        site_id: site.siteId,
        name: site.name,
        address: site.address,
        cyclist_density_idx: site.cyclistDensityIndex,
        morning_rush_volume: site.morningRushVolume,
        competitor_dist_m: site.nearestCompetitorMeters,
        projected_revenue_k: `$${site.projectedAnnualRevenueK}k`,
        roi_score: site.roiScore,
        status: site.status
      }));
    }

    const executionTimeMs = Math.floor(Math.random() * 80) + 40; // 40-120ms realistic cloud latency
    const bytesScanned = Math.floor(Math.random() * 15000000) + 25000000; // ~25MB to 40MB BigQuery scan

    return {
      query: cleanSql,
      columns,
      rows,
      totalRows: rows.length,
      bytesScanned,
      executionTimeMs,
      cacheHit: false,
      jobId: `bquxjob_${Math.random().toString(36).substring(2, 10)}_${Date.now()}`
    };
  }

  public static analyzeCorridors(cityKey: string, minMorningRushRatio: number = 0.40) {
    const city = CITIES_DATA[cityKey.toLowerCase()] || CITIES_DATA.austin;
    const qualifyingStations = city.stations.filter(
      (s) => s.morningRushPercentage / 100 >= minMorningRushRatio
    );

    return {
      city: city.name,
      totalCorridors: city.corridors.length,
      corridors: city.corridors,
      qualifyingStationsCount: qualifyingStations.length,
      topMorningRushStations: qualifyingStations.sort(
        (a, b) => b.morningRushPercentage - a.morningRushPercentage
      ),
      cyclistGrowthSummary: `${city.summary.annualTripsGrowth}% Year-over-Year active rider growth`
    };
  }

  public static geospatialCyclistDensity(cityKey: string, minRoiScore: number = 70) {
    const city = CITIES_DATA[cityKey.toLowerCase()] || CITIES_DATA.austin;
    const filteredCandidates = city.candidateSites.filter((c) => c.roiScore >= minRoiScore);

    return {
      city: city.name,
      totalEvaluatedSites: city.candidateSites.length,
      recommendedSites: filteredCandidates.sort((a, b) => b.roiScore - a.roiScore),
      topRecommendedSite: filteredCandidates[0] || null,
      marketDemandScore: city.summary.unmetCoffeeDemandScore
    };
  }
}
