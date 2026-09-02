import React, { useState } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Sliders, 
  Bell, 
  X, 
  Coffee, 
  CloudRain, 
  Disc, 
  Users, 
  Wind,
  Sparkles
} from 'lucide-react';
import { soundEngine } from '../lib/audio-synthesizer';

interface SoundSynthesizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SoundSynthesizerModal: React.FC<SoundSynthesizerModalProps> = ({
  isOpen,
  onClose
}) => {
  const [isPlaying, setIsPlaying] = useState(soundEngine.getIsPlaying());
  const [masterVol, setMasterVol] = useState(soundEngine.masterVol);
  const [steamVol, setSteamVol] = useState(soundEngine.steamVol);
  const [rainVol, setRainVol] = useState(soundEngine.rainVol);
  const [vinylVol, setVinylVol] = useState(soundEngine.vinylVol);
  const [murmurVol, setMurmurVol] = useState(soundEngine.murmurVol);

  if (!isOpen) return null;

  const handleTogglePlay = () => {
    if (isPlaying) {
      soundEngine.stop();
      setIsPlaying(false);
    } else {
      soundEngine.start();
      setIsPlaying(true);
    }
  };

  const handleMasterChange = (val: number) => {
    setMasterVol(val);
    soundEngine.setMasterVolume(val);
  };

  const handleLayerChange = (layer: 'steam' | 'rain' | 'vinyl' | 'murmur', val: number) => {
    if (layer === 'steam') setSteamVol(val);
    if (layer === 'rain') setRainVol(val);
    if (layer === 'vinyl') setVinylVol(val);
    if (layer === 'murmur') setMurmurVol(val);
    soundEngine.setLayerVolume(layer, val);
  };

  const applyPreset = (preset: 'rush' | 'rainy' | 'focus' | 'minimal') => {
    if (!isPlaying) {
      soundEngine.start();
      setIsPlaying(true);
    }
    if (preset === 'rush') {
      handleLayerChange('steam', 0.5);
      handleLayerChange('rain', 0.1);
      handleLayerChange('vinyl', 0.3);
      handleLayerChange('murmur', 0.45);
    } else if (preset === 'rainy') {
      handleLayerChange('steam', 0.2);
      handleLayerChange('rain', 0.65);
      handleLayerChange('vinyl', 0.4);
      handleLayerChange('murmur', 0.1);
    } else if (preset === 'focus') {
      handleLayerChange('steam', 0.15);
      handleLayerChange('rain', 0.3);
      handleLayerChange('vinyl', 0.45);
      handleLayerChange('murmur', 0.05);
    } else {
      handleLayerChange('steam', 0.1);
      handleLayerChange('rain', 0.1);
      handleLayerChange('vinyl', 0.15);
      handleLayerChange('murmur', 0.05);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0B10]/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-3.5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#020617] text-[#38BDF8] border border-[#1E293B] flex items-center justify-center shadow-inner">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Procedural Cafe & Cyclist Acoustics
              </h3>
              <p className="text-xs text-[#94A3B8] font-mono">
                Web Audio API Synthesizer (Zero Samples / Pure Sine & Noise)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-white hover:bg-[#1E293B] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Master Play / Pause & Quick Bell Strike */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#020617] border border-[#1E293B]">
          <button
            onClick={handleTogglePlay}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer ${
              isPlaying
                ? 'bg-[#2563EB] hover:bg-[#3B82F6] text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]'
                : 'bg-[#1E293B] hover:bg-[#334155] text-white'
            }`}
          >
            {isPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-[#94A3B8]" />}
            <span>{isPlaying ? 'Synthesizer Active' : 'Start Audio Engine'}</span>
          </button>

          <button
            onClick={() => soundEngine.triggerBikeBell()}
            className="px-3.5 py-2 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-[#38BDF8] border border-[#1E293B] text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Bell className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Ring Bike Bell</span>
          </button>
        </div>

        {/* Acoustic Presets */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-[#94A3B8]">Atmospheric Presets:</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <button
              onClick={() => applyPreset('rush')}
              className="p-2 rounded-xl bg-[#020617] border border-[#1E293B] hover:border-[#38BDF8]/50 text-[#94A3B8] hover:text-[#38BDF8] font-mono text-xs text-center transition-colors cursor-pointer"
            >
              Morning Rush
            </button>
            <button
              onClick={() => applyPreset('rainy')}
              className="p-2 rounded-xl bg-[#020617] border border-[#1E293B] hover:border-[#38BDF8]/50 text-[#94A3B8] hover:text-[#38BDF8] font-mono text-xs text-center transition-colors cursor-pointer"
            >
              Rainy Roastery
            </button>
            <button
              onClick={() => applyPreset('focus')}
              className="p-2 rounded-xl bg-[#020617] border border-[#1E293B] hover:border-[#38BDF8]/50 text-[#94A3B8] hover:text-[#38BDF8] font-mono text-xs text-center transition-colors cursor-pointer"
            >
              Espresso Focus
            </button>
            <button
              onClick={() => applyPreset('minimal')}
              className="p-2 rounded-xl bg-[#020617] border border-[#1E293B] hover:border-[#38BDF8]/50 text-[#94A3B8] hover:text-[#38BDF8] font-mono text-xs text-center transition-colors cursor-pointer"
            >
              Quiet Vinyl
            </button>
          </div>
        </div>

        {/* Individual Layer Sliders */}
        <div className="space-y-3 pt-1 font-mono text-xs">
          {/* Master Volume */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-white">
              <span className="font-semibold">Master Volume</span>
              <span className="text-[#38BDF8]">{Math.round(masterVol * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={masterVol}
              onChange={(e) => handleMasterChange(parseFloat(e.target.value))}
              className="w-full accent-[#38BDF8] bg-[#020617] rounded-lg cursor-pointer h-1.5"
            />
          </div>

          {/* Steam Hiss */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-[#94A3B8]">
              <span className="flex items-center space-x-1.5">
                <Coffee className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>Espresso Steam Hiss (Filtered Noise)</span>
              </span>
              <span className="text-[#64748B]">{Math.round(steamVol * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={steamVol}
              onChange={(e) => handleLayerChange('steam', parseFloat(e.target.value))}
              className="w-full accent-[#38BDF8] bg-[#020617] rounded-lg cursor-pointer h-1.5"
            />
          </div>

          {/* Rain on Awning */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-[#94A3B8]">
              <span className="flex items-center space-x-1.5">
                <CloudRain className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>Rain on Cafe Awning (Brownian Noise)</span>
              </span>
              <span className="text-[#64748B]">{Math.round(rainVol * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={rainVol}
              onChange={(e) => handleLayerChange('rain', parseFloat(e.target.value))}
              className="w-full accent-[#38BDF8] bg-[#020617] rounded-lg cursor-pointer h-1.5"
            />
          </div>

          {/* Vinyl Warmth */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-[#94A3B8]">
              <span className="flex items-center space-x-1.5">
                <Disc className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>Vinyl Crackle & Turntable Warmth</span>
              </span>
              <span className="text-[#64748B]">{Math.round(vinylVol * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={vinylVol}
              onChange={(e) => handleLayerChange('vinyl', parseFloat(e.target.value))}
              className="w-full accent-[#38BDF8] bg-[#020617] rounded-lg cursor-pointer h-1.5"
            />
          </div>

          {/* Cafe Murmur */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-[#94A3B8]">
              <span className="flex items-center space-x-1.5">
                <Users className="w-3.5 h-3.5 text-[#94A3B8]" />
                <span>Cafe Murmur & Ambient Resonance</span>
              </span>
              <span className="text-[#64748B]">{Math.round(murmurVol * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={murmurVol}
              onChange={(e) => handleLayerChange('murmur', parseFloat(e.target.value))}
              className="w-full accent-[#38BDF8] bg-[#020617] rounded-lg cursor-pointer h-1.5"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
