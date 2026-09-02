import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  ShoppingBag, 
  MapPin, 
  Sparkles, 
  Layers, 
  Sliders, 
  Terminal, 
  Activity,
  Bell
} from 'lucide-react';
import { soundEngine } from '../lib/audio-synthesizer';

interface HeaderProps {
  activeTab: 'siting' | 'agent' | 'catalog' | 'telemetry';
  setActiveTab: (tab: 'siting' | 'agent' | 'catalog' | 'telemetry') => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  cartCount: number;
  openCart: () => void;
  openTestModal: () => void;
  openSoundModal: () => void;
  openRAGModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedCity,
  setSelectedCity,
  cartCount,
  openCart,
  openTestModal,
  openSoundModal,
  openRAGModal,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const toggleSound = () => {
    if (isPlayingAudio) {
      soundEngine.stop();
      setIsPlayingAudio(false);
    } else {
      soundEngine.start();
      setIsPlayingAudio(true);
    }
  };

  const handleRingBell = () => {
    soundEngine.triggerBikeBell();
  };

  return (
    <header id="main-header" className="sticky top-0 z-40 bg-[#0F172A]/95 backdrop-blur-md border-b border-[#1E293B]">
      {/* Top Utility & Status Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand & City Indicator */}
          <div className="flex items-center space-x-3 sm:space-x-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-[#38BDF8] to-[#2563EB] rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.4)] ring-1 ring-[#38BDF8]/40">
                <div className="w-4 h-4 border-2 border-white rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <span className="text-sm sm:text-base font-bold tracking-tight text-white">
                    BEANSTREAM EXPANSION AGENT
                  </span>
                </div>
                <span className="text-[10px] text-[#38BDF8] font-mono uppercase tracking-[0.2em]">
                  Lab 2: Siting Optimization System
                </span>
              </div>
            </div>

            {/* City Selector */}
            <div className="relative hidden md:block">
              <select
                id="city-selector"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-[#020617] text-[#E0E0E0] text-xs font-mono rounded-lg border border-[#1E293B] hover:border-[#334155] px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#38BDF8] cursor-pointer transition-colors"
              >
                <option value="austin">Austin, TX (B-Cycle Network)</option>
                <option value="nyc">New York, NY (Citi Bike Hub)</option>
                <option value="sf">San Francisco, CA (Bay Wheels &amp; The Wiggle)</option>
              </select>
            </div>
          </div>

          {/* Action Bar & Security Badge */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Security Defense Badge */}
            <div 
              id="security-shield-indicator"
              className="flex items-center gap-2 bg-[#1E293B] px-3 py-1.5 rounded-full border border-[#334155] shadow-sm"
              title="Enterprise Defense-in-Depth Active: PromptGuard, CartSecurityValidator, InputSanitizer, Sliding-Window Limiter"
            >
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-[11px] font-medium text-green-400 uppercase tracking-wider font-mono">
                PromptGuard Active
              </span>
            </div>

            {/* BigQuery MCP Server Region Badge */}
            <div className="hidden xl:flex flex-col items-end px-2">
              <span className="text-[9px] text-[#64748B] font-mono">BigQuery MCP</span>
              <span className="text-[11px] font-mono text-white font-medium">US-CENTRAL1-A</span>
            </div>

            <div className="hidden xl:block w-px h-7 bg-[#1E293B] mx-1"></div>

            {/* 14/14 Automated Tests Launcher */}
            <button
              id="btn-open-tests"
              onClick={openTestModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-[#E0E0E0] hover:text-green-400 border border-[#334155] text-xs font-mono font-medium transition-colors cursor-pointer shadow-sm"
              title="Run Automated Test Suite (14/14 tests)"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
              <span className="hidden sm:inline">14/14 Tests</span>
              <span className="sm:hidden">Tests</span>
            </button>

            {/* RAG Knowledge Base Search */}
            <button
              id="btn-open-rag"
              onClick={openRAGModal}
              className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-[#E0E0E0] hover:text-[#38BDF8] border border-[#334155] text-xs font-medium transition-colors cursor-pointer shadow-sm"
              title="Open RAG Knowledge Search"
            >
              <Layers className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>RAG Docs</span>
            </button>

            {/* Sound Synthesizer Quick Bell & Mixer */}
            <div className="flex items-center rounded-lg bg-[#020617] border border-[#1E293B] p-0.5">
              <button
                id="btn-ring-bike-bell"
                onClick={handleRingBell}
                className="p-1.5 hover:bg-[#1E293B] text-[#94A3B8] hover:text-[#F59E0B] rounded-md transition-colors cursor-pointer"
                title="Ring Bike Bell (Procedural Chime)"
              >
                <Bell className="w-3.5 h-3.5" />
              </button>
              <button
                id="btn-toggle-sound"
                onClick={toggleSound}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  isPlayingAudio ? 'bg-[#38BDF8]/20 text-[#38BDF8]' : 'text-[#64748B] hover:text-[#E0E0E0]'
                }`}
                title={isPlayingAudio ? 'Mute Procedural Cafe Sound' : 'Play Ambient Coffee Shop Sounds'}
              >
                {isPlayingAudio ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>
              <button
                id="btn-open-sound-mixer"
                onClick={openSoundModal}
                className="p-1.5 hover:bg-[#1E293B] text-[#64748B] hover:text-[#E0E0E0] rounded-md transition-colors cursor-pointer"
                title="Sound Synthesizer Mixer Settings"
              >
                <Sliders className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Secure Cart Button */}
            <button
              id="btn-open-cart"
              onClick={openCart}
              className="relative flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#3B82F6] text-white font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(37,99,235,0.35)] transition-all cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-white" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#020617] text-[#38BDF8] text-[11px] font-bold font-mono border border-[#38BDF8]/40">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Primary Workspace Navigation Tabs */}
        <div className="flex items-center space-x-1 sm:space-x-2 py-2 border-t border-[#1E293B] overflow-x-auto scrollbar-none">
          <button
            id="tab-siting"
            onClick={() => setActiveTab('siting')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'siting'
                ? 'bg-[#020617] text-[#38BDF8] border border-[#38BDF8]/50 shadow-[0_0_12px_rgba(56,189,248,0.2)]'
                : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]/60 border border-transparent'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Siting GIS &amp; BigQuery Lab</span>
          </button>

          <button
            id="tab-agent"
            onClick={() => setActiveTab('agent')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'agent'
                ? 'bg-[#020617] text-[#38BDF8] border border-[#38BDF8]/50 shadow-[0_0_12px_rgba(56,189,248,0.2)]'
                : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]/60 border border-transparent'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>AI Barista Sage (Expansion Agent)</span>
          </button>

          <button
            id="tab-catalog"
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'catalog'
                ? 'bg-[#020617] text-[#38BDF8] border border-[#38BDF8]/50 shadow-[0_0_12px_rgba(56,189,248,0.2)]'
                : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]/60 border border-transparent'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Menu &amp; Cyclist Fuel Catalog</span>
          </button>

          <button
            id="tab-telemetry"
            onClick={() => setActiveTab('telemetry')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'telemetry'
                ? 'bg-[#020617] text-green-400 border border-green-500/50 shadow-[0_0_12px_rgba(34,197,94,0.2)]'
                : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]/60 border border-transparent'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-green-400" />
            <span>ADK Telemetry &amp; MCP Logs</span>
          </button>
        </div>
      </div>
    </header>
  );
};
