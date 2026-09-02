import React, { useState } from 'react';
import { 
  MapPin, 
  Bike, 
  Layers, 
  TrendingUp, 
  DollarSign, 
  Compass, 
  Play, 
  Database, 
  CheckCircle, 
  AlertTriangle, 
  Search,
  Maximize2,
  Sparkles,
  Shield,
  ArrowUpRight,
  Info
} from 'lucide-react';
import { CityData, CandidateShopSite, BikeStationData, BikeCorridor } from '../types';

interface SitingMapLabProps {
  cityData: CityData | null;
  selectedCity: string;
  onSelectCandidateForAgent: (site: CandidateShopSite) => void;
  onOpenBigQueryQuery: (sql: string) => void;
}

export const SitingMapLab: React.FC<SitingMapLabProps> = ({
  cityData,
  selectedCity,
  onSelectCandidateForAgent,
}) => {
  const [selectedSite, setSelectedSite] = useState<CandidateShopSite | null>(null);
  const [activeLayer, setActiveLayer] = useState<'all' | 'candidates' | 'corridors' | 'stations'>('all');
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [customSql, setCustomSql] = useState<string>(
    `SELECT \n  site_id, name, morning_rush_volume, cyclist_density_index, \n  nearest_competitor_meters, projected_annual_revenue_k, roi_score\nFROM \`bigquery-public-data.austin_bikeshare.candidate_sites\`\nWHERE cyclist_density_index >= 80\nORDER BY roi_score DESC;\n`
  );
  const [bqExecuting, setBqExecuting] = useState(false);
  const [bqResult, setBqResult] = useState<any>(null);
  const [bqError, setBqError] = useState<string | null>(null);

  const candidateSites = cityData?.candidateSites || [];
  const stations = cityData?.stations || [];
  const corridors = cityData?.corridors || [];

  const currentSelection = selectedSite || candidateSites[0] || null;

  // Convert GPS Coordinates to Relative SVG Canvas Percentage
  const bounds = React.useMemo(() => {
    if (!cityData || (stations.length === 0 && candidateSites.length === 0)) {
      return { minLat: 30.24, maxLat: 30.31, minLng: -97.78, maxLng: -97.70 };
    }
    const allLats = [
      ...stations.map((s) => s.latitude),
      ...candidateSites.map((c) => c.latitude)
    ];
    const allLngs = [
      ...stations.map((s) => s.longitude),
      ...candidateSites.map((c) => c.longitude)
    ];

    const padding = 0.008;
    return {
      minLat: Math.min(...allLats) - padding,
      maxLat: Math.max(...allLats) + padding,
      minLng: Math.min(...allLngs) - padding,
      maxLng: Math.max(...allLngs) + padding
    };
  }, [cityData, stations, candidateSites]);

  const projectToSvg = (lat: number, lng: number) => {
    const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100;
    // Invert Y axis for SVG
    const y = 100 - ((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * 100;
    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
  };

  const handleExecuteBigQuery = async () => {
    setBqExecuting(true);
    setBqError(null);
    try {
      const res = await fetch('/api/bigquery/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: customSql, city: selectedCity })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Query execution failed');
      }
      setBqResult(data);
    } catch (err: any) {
      setBqError(err.message || 'Execution error');
    } finally {
      setBqExecuting(false);
    }
  };

  const loadSamplePreset = (preset: 'rush' | 'competitor' | 'corridor') => {
    if (preset === 'rush') {
      setCustomSql(`-- Identify Top Morning Rush Bike Stations (> 45% peak commute share)\nSELECT \n  station_id, name, total_trips_monthly, morning_rush_percentage, \n  bike_lanes_adjacent, protected_bikeway\nFROM \`bigquery-public-data.${selectedCity === 'nyc' ? 'new_york_citibike' : selectedCity === 'sf' ? 'san_francisco_bikeshare' : 'austin_bikeshare'}.stations\`\nWHERE morning_rush_percentage > 40.0\nORDER BY total_trips_monthly DESC;`);
    } else if (preset === 'competitor') {
      setCustomSql(`-- Spatial Competitor Buffer Analysis (> 300m insulation zone)\nSELECT \n  site_id, name, address, nearest_competitor_meters, \n  cyclist_density_index, roi_score\nFROM \`velo_expansion.${selectedCity}_market_intelligence.candidate_sites\`\nWHERE nearest_competitor_meters >= 350\nORDER BY roi_score DESC;`);
    } else {
      setCustomSql(`-- High-Volume Cycling Corridors Growth Rate\nSELECT \n  corridor_id, name, path_type, daily_cyclists, growth_rate_pct\nFROM \`velo_expansion.${selectedCity}_market_intelligence.corridors\`\nORDER BY daily_cyclists DESC;`);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Strategic Overview Bar */}
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-grid-cyber"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#020617] text-[#38BDF8] border border-[#1E293B] tracking-wider">
                BIGQUERY_MCP_GIS
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {cityData?.name || 'Urban Cycling Network'} Siting Matrix
              </h2>
            </div>
            <p className="text-sm text-[#94A3B8] mt-1">
              Correlating public bikeshare commuter trips, Class-IV cycle tracks, and competitor density to optimize store placement.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center sm:text-left">
            <div className="bg-[#020617] border border-[#1E293B] rounded-xl p-3">
              <div className="text-[10px] text-[#64748B] uppercase font-mono tracking-wider">Active Cyclists</div>
              <div className="text-xl font-bold text-white font-mono mt-0.5">
                {cityData?.summary.totalActiveCyclists.toLocaleString() || '84,000'}
              </div>
            </div>
            <div className="bg-[#020617] border border-[#1E293B] rounded-xl p-3">
              <div className="text-[10px] text-[#64748B] uppercase font-mono tracking-wider">YoY Ride Growth</div>
              <div className="text-xl font-bold text-[#22C55E] font-mono mt-0.5">
                +{cityData?.summary.annualTripsGrowth || 18.4}%
              </div>
            </div>
            <div className="bg-[#020617] border border-[#1E293B] rounded-xl p-3">
              <div className="text-[10px] text-[#64748B] uppercase font-mono tracking-wider">Demand Index</div>
              <div className="text-xl font-bold text-[#38BDF8] font-mono mt-0.5">
                {cityData?.summary.unmetCoffeeDemandScore || 92}/100
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Map (Left) + Candidate Deep Dive & Scorecard (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive GIS Map */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            
            {/* Map Header & Controls */}
            <div className="bg-[#0F172A] px-5 py-4 border-b border-[#1E293B] flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <Compass className="w-4 h-4 text-[#38BDF8]" />
                <h3 className="text-sm font-semibold text-white tracking-wide">
                  Geospatial Expansion Grid
                </h3>
              </div>

              {/* Layer Filters */}
              <div className="flex items-center space-x-1.5 text-xs">
                <button
                  onClick={() => setActiveLayer('all')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors cursor-pointer ${
                    activeLayer === 'all' ? 'bg-[#020617] text-[#38BDF8] border border-[#38BDF8]/40' : 'text-[#94A3B8] hover:text-white bg-[#020617]/50 border border-[#1E293B]'
                  }`}
                >
                  ALL_LAYERS
                </button>
                <button
                  onClick={() => setActiveLayer('candidates')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors cursor-pointer ${
                    activeLayer === 'candidates' ? 'bg-[#020617] text-[#38BDF8] border border-[#38BDF8]/40' : 'text-[#94A3B8] hover:text-white bg-[#020617]/50 border border-[#1E293B]'
                  }`}
                >
                  CANDIDATES
                </button>
                <button
                  onClick={() => setActiveLayer('corridors')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors cursor-pointer ${
                    activeLayer === 'corridors' ? 'bg-[#020617] text-[#38BDF8] border border-[#38BDF8]/40' : 'text-[#94A3B8] hover:text-white bg-[#020617]/50 border border-[#1E293B]'
                  }`}
                >
                  BIKE_TRACKS
                </button>
                <button
                  onClick={() => setShowHeatmap(!showHeatmap)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors flex items-center space-x-1 cursor-pointer ${
                    showHeatmap ? 'bg-[#020617] text-[#22C55E] border border-green-500/40' : 'text-[#64748B] bg-[#020617]/50 border border-[#1E293B]'
                  }`}
                  title="Toggle Morning Commuter Heatmap"
                >
                  <span>HEATMAP</span>
                </button>
              </div>
            </div>

            {/* SVG GIS Stage */}
            <div className="relative w-full aspect-[4/3] bg-[#020617] select-none overflow-hidden">
              
              {/* Map Grid Background Texture */}
              <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#38BDF8 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

              {/* Commuter Heatmap Blobs (Simulated Density Fields) */}
              {showHeatmap && (
                <div className="absolute inset-0 pointer-events-none opacity-30">
                  <div className="absolute w-48 h-48 rounded-full bg-gradient-to-r from-[#38BDF8]/40 to-[#2563EB]/20 blur-3xl top-1/4 left-1/3 animate-pulse"></div>
                  <div className="absolute w-56 h-56 rounded-full bg-gradient-to-r from-emerald-500/20 to-[#38BDF8]/30 blur-3xl bottom-1/4 right-1/4"></div>
                </div>
              )}

              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* 1. Render Bike Corridors / Paths */}
                {(activeLayer === 'all' || activeLayer === 'corridors') &&
                  corridors.map((corridor) => {
                    const pointsStr = corridor.coordinates
                      .map((coord) => {
                        const pt = projectToSvg(coord[0], coord[1]);
                        return `${pt.x},${pt.y}`;
                      })
                      .join(' ');

                    return (
                      <g key={corridor.corridorId}>
                        <polyline
                          points={pointsStr}
                          fill="none"
                          stroke="#38BDF8"
                          strokeWidth="1.2"
                          strokeDasharray={corridor.pathType === 'Off-Street Greenway' ? '2,2' : 'none'}
                          opacity="0.8"
                        />
                      </g>
                    );
                  })}

                {/* 2. Render Bikeshare Station Nodes */}
                {(activeLayer === 'all' || activeLayer === 'stations') &&
                  stations.map((station) => {
                    const pt = projectToSvg(station.latitude, station.longitude);
                    const size = Math.max(1.2, Math.min(2.5, station.totalTripsMonthly / 12000));
                    return (
                      <g key={station.stationId}>
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={size}
                          fill="#38BDF8"
                          opacity="0.6"
                          className="transition-all hover:opacity-100 cursor-pointer"
                        >
                          <title>{`${station.name} (${station.totalTripsMonthly.toLocaleString()} monthly trips - ${station.morningRushPercentage}% AM rush)`}</title>
                        </circle>
                      </g>
                    );
                  })}

                {/* 3. Render Candidate Coffee Shop Locations */}
                {(activeLayer === 'all' || activeLayer === 'candidates') &&
                  candidateSites.map((site) => {
                    const pt = projectToSvg(site.latitude, site.longitude);
                    const isSelected = currentSelection?.siteId === site.siteId;
                    const isOptimal = site.status === 'recommended';

                    return (
                      <g
                        key={site.siteId}
                        className="cursor-pointer"
                        onClick={() => setSelectedSite(site)}
                      >
                        {/* 300m Competitor Catchment Radius Ring */}
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="7"
                          fill={isOptimal ? '#22C55E' : isSelected ? '#38BDF8' : '#F59E0B'}
                          fillOpacity={isSelected ? '0.2' : '0.08'}
                          stroke={isOptimal ? '#22C55E' : isSelected ? '#38BDF8' : '#F59E0B'}
                          strokeWidth="0.6"
                          strokeDasharray="2,1.5"
                        />

                        {/* Center Pin Marker */}
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={isSelected ? '2.8' : '2.2'}
                          fill={isOptimal ? '#22C55E' : isSelected ? '#38BDF8' : '#F59E0B'}
                          stroke="#020617"
                          strokeWidth="0.8"
                        />

                        {/* Label */}
                        <text
                          x={pt.x}
                          y={pt.y - 3.5}
                          textAnchor="middle"
                          fill={isOptimal ? '#22C55E' : isSelected ? '#38BDF8' : '#94A3B8'}
                          fontSize="2.4"
                          fontFamily="monospace"
                          fontWeight={isSelected ? 'bold' : 'normal'}
                          className="pointer-events-none drop-shadow-md"
                        >
                          {site.name.split(' ')[0]}
                        </text>
                      </g>
                    );
                  })}
              </svg>

              {/* Map Legend */}
              <div className="absolute bottom-3 left-3 bg-[#0F172A]/90 backdrop-blur-sm border border-[#1E293B] rounded-xl p-3 text-[11px] text-[#94A3B8] space-y-1.5 shadow-xl">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]"></span>
                  <span className="text-white">Optimal Candidate (ROI &gt; 85)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></span>
                  <span>Secondary Placement Site</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-0.5 bg-[#38BDF8]"></span>
                  <span>Class-IV Protected Bike Track</span>
                </div>
              </div>
            </div>

            {/* Candidate Quick Selector Strip */}
            <div className="p-3 bg-[#0F172A] border-t border-[#1E293B] grid grid-cols-2 sm:grid-cols-4 gap-2">
              {candidateSites.map((site) => (
                <button
                  key={site.siteId}
                  onClick={() => setSelectedSite(site)}
                  className={`text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                    currentSelection?.siteId === site.siteId
                      ? 'bg-[#020617] border-[#38BDF8]/60 text-white shadow-[0_0_15px_rgba(56,189,248,0.15)]'
                      : 'bg-[#020617]/50 border-[#1E293B] text-[#94A3B8] hover:border-[#334155] hover:text-white'
                  }`}
                >
                  <div className="font-semibold truncate">{site.name}</div>
                  <div className="flex items-center justify-between text-[11px] mt-1 font-mono">
                    <span className="text-[#38BDF8]">ROI: {site.roiScore}</span>
                    <span className="text-[#64748B]">{site.morningRushVolume} am/vol</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Selected Candidate Deep Dive & Strategic Scorecard */}
        <div className="lg:col-span-5 space-y-4">
          {currentSelection ? (
            <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-5 shadow-2xl space-y-4">
              
              {/* Header Title & Status */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                      currentSelection.status === 'recommended'
                        ? 'bg-[#020617] text-[#22C55E] border border-green-500/40'
                        : 'bg-[#020617] text-[#94A3B8] border border-[#1E293B]'
                    }`}>
                      {currentSelection.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-mono text-[#64748B]">ID: {currentSelection.siteId}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">
                    {currentSelection.name}
                  </h3>
                  <p className="text-xs text-[#94A3B8] mt-0.5">{currentSelection.address}</p>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-[#38BDF8] font-mono">
                    {currentSelection.roiScore}
                  </div>
                  <div className="text-[10px] text-[#64748B] uppercase tracking-widest font-mono">ROI Score</div>
                </div>
              </div>

              {/* Multi-Criteria Metrics Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-[#020617] border border-[#1E293B] rounded-xl p-3">
                  <div className="flex items-center justify-between text-xs text-[#64748B]">
                    <span>Cyclist Density</span>
                    <Bike className="w-3.5 h-3.5 text-[#38BDF8]" />
                  </div>
                  <div className="text-base font-bold text-white font-mono mt-0.5">
                    {currentSelection.cyclistDensityIndex}/100
                  </div>
                  <div className="w-full bg-[#1E293B] h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-[#38BDF8] h-full rounded-full" style={{ width: `${currentSelection.cyclistDensityIndex}%` }}></div>
                  </div>
                </div>

                <div className="bg-[#020617] border border-[#1E293B] rounded-xl p-3">
                  <div className="flex items-center justify-between text-xs text-[#64748B]">
                    <span>Morning Commute</span>
                    <TrendingUp className="w-3.5 h-3.5 text-[#22C55E]" />
                  </div>
                  <div className="text-base font-bold text-white font-mono mt-0.5">
                    {currentSelection.morningRushVolume.toLocaleString()} <span className="text-xs font-normal text-[#64748B]">am/vol</span>
                  </div>
                  <div className="w-full bg-[#1E293B] h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-[#22C55E] h-full rounded-full" style={{ width: `${Math.min(100, (currentSelection.morningRushVolume / 3000) * 100)}%` }}></div>
                  </div>
                </div>

                <div className="bg-[#020617] border border-[#1E293B] rounded-xl p-3">
                  <div className="flex items-center justify-between text-xs text-[#64748B]">
                    <span>Competitor Buffer</span>
                    <Shield className="w-3.5 h-3.5 text-[#38BDF8]" />
                  </div>
                  <div className="text-base font-bold text-white font-mono mt-0.5">
                    {currentSelection.nearestCompetitorMeters}m <span className="text-xs font-normal text-[#64748B]">buffer</span>
                  </div>
                  <div className="text-[10px] text-[#22C55E] mt-1 font-mono">
                    {currentSelection.nearestCompetitorMeters >= 300 ? '✓ Insulated from rivals' : '⚠ Rival cafe nearby'}
                  </div>
                </div>

                <div className="bg-[#020617] border border-[#1E293B] rounded-xl p-3">
                  <div className="flex items-center justify-between text-xs text-[#64748B]">
                    <span>Projected Revenue</span>
                    <DollarSign className="w-3.5 h-3.5 text-[#F59E0B]" />
                  </div>
                  <div className="text-base font-bold text-white font-mono mt-0.5">
                    ${currentSelection.projectedAnnualRevenueK}k <span className="text-xs font-normal text-[#64748B]">/ yr</span>
                  </div>
                  <div className="text-[10px] text-[#64748B] mt-1 font-mono">
                    Rent: ${currentSelection.monthlyRentPerSqFt}/sq.ft
                  </div>
                </div>
              </div>

              {/* Recommended Operational Concept */}
              <div className="bg-[#020617] border border-[#1E293B] rounded-xl p-3.5">
                <div className="text-xs font-semibold text-[#38BDF8] flex items-center space-x-1.5 font-mono uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Recommended Store Concept</span>
                </div>
                <p className="text-xs text-[#94A3B8] mt-1.5 leading-relaxed">
                  {currentSelection.recommendedConcept}
                </p>
              </div>

              {/* Pros & Risks */}
              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-semibold text-[#22C55E] font-mono text-[11px] uppercase tracking-wider">Key Advantages:</span>
                  <ul className="mt-1 space-y-1 text-[#94A3B8]">
                    {currentSelection.pros.map((pro, idx) => (
                      <li key={idx} className="flex items-start space-x-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-[#22C55E] shrink-0 mt-0.5" />
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="font-semibold text-[#F59E0B] font-mono text-[11px] uppercase tracking-wider">Operational Risks:</span>
                  <ul className="mt-1 space-y-1 text-[#64748B]">
                    {currentSelection.risks.map((risk, idx) => (
                      <li key={idx} className="flex items-start space-x-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B] shrink-0 mt-0.5" />
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Inspect with AI Expansion Agent Button */}
              <button
                id="btn-analyze-with-agent"
                onClick={() => onSelectCandidateForAgent(currentSelection)}
                className="w-full py-2.5 px-4 rounded-xl bg-[#2563EB] hover:bg-[#3B82F6] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#38BDF8]" />
                <span>Deep-Dive with Gemini Siting Agent</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-8 text-center text-[#64748B]">
              Select a candidate site from the map to inspect metrics.
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: BigQuery MCP Query Explorer & Runner */}
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#1E293B] pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-[#020617] text-[#38BDF8] border border-[#1E293B]">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                BigQuery MCP Server Workbench
              </h3>
              <p className="text-xs text-[#64748B]">
                Execute SQL statements across public bikeshare tables via Model Context Protocol tools.
              </p>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center space-x-1.5 text-xs">
            <span className="text-[#64748B] text-[11px] mr-1 hidden sm:inline font-mono">Presets:</span>
            <button
              onClick={() => loadSamplePreset('rush')}
              className="px-2.5 py-1 rounded-lg bg-[#020617] hover:bg-[#1E293B] text-[#94A3B8] hover:text-[#38BDF8] border border-[#1E293B] font-mono text-[11px] transition-colors cursor-pointer"
            >
              Morning Rush
            </button>
            <button
              onClick={() => loadSamplePreset('competitor')}
              className="px-2.5 py-1 rounded-lg bg-[#020617] hover:bg-[#1E293B] text-[#94A3B8] hover:text-[#38BDF8] border border-[#1E293B] font-mono text-[11px] transition-colors cursor-pointer"
            >
              Competitor Radius
            </button>
            <button
              onClick={() => loadSamplePreset('corridor')}
              className="px-2.5 py-1 rounded-lg bg-[#020617] hover:bg-[#1E293B] text-[#94A3B8] hover:text-[#38BDF8] border border-[#1E293B] font-mono text-[11px] transition-colors cursor-pointer"
            >
              Bike Corridors
            </button>
          </div>
        </div>

        {/* SQL Editor Box */}
        <div className="space-y-2">
          <div className="relative">
            <textarea
              id="bq-sql-editor"
              value={customSql}
              onChange={(e) => setCustomSql(e.target.value)}
              rows={4}
              className="w-full bg-[#020617] font-mono text-xs text-[#38BDF8] border border-[#1E293B] rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-[#38BDF8] resize-y"
              placeholder="SELECT * FROM `bigquery-public-data.austin_bikeshare.stations`..."
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#64748B] font-mono">
              ⚡ Rate Limit: 30 queries / min (Sliding Window Protected)
            </span>
            <button
              id="btn-run-bq-query"
              onClick={handleExecuteBigQuery}
              disabled={bqExecuting}
              className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-[#3B82F6] disabled:opacity-50 text-white font-bold text-xs font-mono flex items-center space-x-2 transition-all cursor-pointer shadow-[0_0_20px_rgba(37,99,235,0.3)]"
            >
              {bqExecuting ? (
                <span>Executing BigQuery Job...</span>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Execute Query</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {bqError && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-mono">
            {bqError}
          </div>
        )}

        {/* Query Results Table & Telemetry */}
        {bqResult && (
          <div className="space-y-3 pt-2">
            <div className="flex flex-wrap items-center justify-between text-xs text-[#64748B] bg-[#020617] p-2.5 rounded-xl border border-[#1E293B] font-mono">
              <div className="flex items-center space-x-4">
                <span>Rows: <strong className="text-white">{bqResult.totalRows}</strong></span>
                <span>Latency: <strong className="text-[#22C55E]">{bqResult.executionTimeMs}ms</strong></span>
                <span>Bytes Scanned: <strong className="text-[#38BDF8]">{(bqResult.bytesScanned / (1024 * 1024)).toFixed(2)} MB</strong></span>
              </div>
              <span className="text-[#64748B] text-[10px]">Job ID: {bqResult.jobId}</span>
            </div>

            <div className="overflow-x-auto border border-[#1E293B] rounded-xl max-h-56 bg-[#020617]">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#0A0B10] text-[#64748B] uppercase tracking-wider text-[10px] sticky top-0 border-b border-[#1E293B]">
                  <tr>
                    {bqResult.columns.map((col: string) => (
                      <th key={col} className="p-2.5 border-b border-[#1E293B] whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B] text-[#E0E0E0]">
                  {bqResult.rows.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-[#0F172A]/50">
                      {bqResult.columns.map((col: string) => (
                        <td key={col} className="p-2.5 whitespace-nowrap">
                          {String(row[col])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
