/**
 * Procedural Ambient Audio Synthesizer (Web Audio API)
 * Generates continuous soothing acoustic layers for coffee shop atmosphere:
 * 1. Espresso Steam Hiss (Filtered noise with soft envelope swell)
 * 2. Gentle Rain on Cafe Awning (Brownian noise matrix)
 * 3. Bike Bell Harmonic Chime (Dual high-frequency decaying sines: 1840Hz & 2420Hz)
 * 4. Vinyl Warmth & Surface Micro-Crackles
 * 5. Cafe Murmur & Ambient Resonance
 */

class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private isRunning: boolean = false;
  private masterGain: GainNode | null = null;

  // Layer Gain Nodes
  private steamGain: GainNode | null = null;
  private rainGain: GainNode | null = null;
  private vinylGain: GainNode | null = null;
  private murmurGain: GainNode | null = null;

  // Layer Volumes (0.0 to 1.0)
  public steamVol = 0.25;
  public rainVol = 0.35;
  public vinylVol = 0.20;
  public murmurVol = 0.15;
  public masterVol = 0.5;

  private bellIntervalId: any = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.masterVol;
      this.masterGain.connect(this.ctx.destination);
    }
  }

  public async start() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    this.setupSteamLayer();
    this.setupRainLayer();
    this.setupVinylLayer();
    this.setupMurmurLayer();

    // Occasional gentle bicycle chime (every 18-35 seconds)
    this.scheduleBikeBells();

    this.isRunning = true;
  }

  public stop() {
    if (this.ctx && this.ctx.state === 'running') {
      this.ctx.suspend();
    }
    if (this.bellIntervalId) {
      clearInterval(this.bellIntervalId);
      this.bellIntervalId = null;
    }
    this.isRunning = false;
  }

  public getIsPlaying(): boolean {
    return this.isRunning;
  }

  public setMasterVolume(val: number) {
    this.masterVol = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.masterVol, this.ctx.currentTime, 0.05);
    }
  }

  public setLayerVolume(layer: 'steam' | 'rain' | 'vinyl' | 'murmur', val: number) {
    const clamped = Math.max(0, Math.min(1, val));
    if (!this.ctx) return;

    if (layer === 'steam' && this.steamGain) {
      this.steamVol = clamped;
      this.steamGain.gain.setTargetAtTime(clamped * 0.3, this.ctx.currentTime, 0.05);
    } else if (layer === 'rain' && this.rainGain) {
      this.rainVol = clamped;
      this.rainGain.gain.setTargetAtTime(clamped * 0.4, this.ctx.currentTime, 0.05);
    } else if (layer === 'vinyl' && this.vinylGain) {
      this.vinylVol = clamped;
      this.vinylGain.gain.setTargetAtTime(clamped * 0.25, this.ctx.currentTime, 0.05);
    } else if (layer === 'murmur' && this.murmurGain) {
      this.murmurVol = clamped;
      this.murmurGain.gain.setTargetAtTime(clamped * 0.2, this.ctx.currentTime, 0.05);
    }
  }

  /**
   * Manual Trigger: Bicycle Double Ring Chime!
   */
  public triggerBikeBell() {
    if (!this.ctx || !this.masterGain) this.initContext();
    if (!this.ctx || !this.masterGain) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const now = this.ctx.currentTime;
    this.playSingleBellStrike(now, 1840, 0.18);
    this.playSingleBellStrike(now + 0.09, 2420, 0.22);
  }

  private playSingleBellStrike(time: number, freq: number, gainAmount: number) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(gainAmount, time + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.8);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.85);
  }

  private scheduleBikeBells() {
    if (this.bellIntervalId) clearInterval(this.bellIntervalId);
    this.bellIntervalId = setInterval(() => {
      if (this.isRunning && Math.random() > 0.4) {
        this.triggerBikeBell();
      }
    }, 24000);
  }

  // --- Procedural Generators ---

  private setupSteamLayer() {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 3200;
    filter.Q.value = 1.8;

    this.steamGain = this.ctx.createGain();
    this.steamGain.gain.value = this.steamVol * 0.3;

    whiteNoise.connect(filter);
    filter.connect(this.steamGain);
    this.steamGain.connect(this.masterGain);

    whiteNoise.start();
  }

  private setupRainLayer() {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;

    // Pink / Brown noise integration
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }

    const brownNoise = this.ctx.createBufferSource();
    brownNoise.buffer = noiseBuffer;
    brownNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1200;

    this.rainGain = this.ctx.createGain();
    this.rainGain.gain.value = this.rainVol * 0.4;

    brownNoise.connect(filter);
    filter.connect(this.rainGain);
    this.rainGain.connect(this.masterGain);

    brownNoise.start();
  }

  private setupVinylLayer() {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      // Occasional crackle spikes
      if (Math.random() < 0.0015) {
        output[i] = (Math.random() * 2 - 1) * 0.8;
      } else {
        output[i] = (Math.random() * 2 - 1) * 0.02;
      }
    }

    const vinylNoise = this.ctx.createBufferSource();
    vinylNoise.buffer = noiseBuffer;
    vinylNoise.loop = true;

    this.vinylGain = this.ctx.createGain();
    this.vinylGain.gain.value = this.vinylVol * 0.25;

    vinylNoise.connect(this.vinylGain);
    this.vinylGain.connect(this.masterGain);

    vinylNoise.start();
  }

  private setupMurmurLayer() {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 500;
    filter.Q.value = 4.0;

    this.murmurGain = this.ctx.createGain();
    this.murmurGain.gain.value = this.murmurVol * 0.2;

    noise.connect(filter);
    filter.connect(this.murmurGain);
    this.murmurGain.connect(this.masterGain);

    noise.start();
  }
}

export const soundEngine = new AmbientSoundEngine();
