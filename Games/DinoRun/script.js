/**
 * Ultimate Dino Run – Advanced Browser Game
 * Complete, polished, and responsive endless runner arcade game.
 * Vanilla JavaScript with HTML5 Canvas & Web Audio API procedural sound system.
 */

// ============================================================================
// 1. STORAGE & SETTINGS MANAGER
// ============================================================================

class StorageManager {
  static KEYS = {
    HIGH_SCORE: 'udr_high_score',
    SETTINGS: 'udr_settings',
    STATS: 'udr_stats'
  };

  static defaultSettings = {
    musicEnabled: true,
    sfxEnabled: true,
    musicVolume: 0.6,
    sfxVolume: 0.8,
    difficulty: 'standard', // casual, standard, hardcore
    screenShake: true,
    particles: true
  };

  static defaultStats = {
    gamesPlayed: 0,
    totalDistance: 0,
    highestLevel: 1,
    totalObstaclesCleared: 0
  };

  static isAvailable() {
    try {
      const testKey = '__udr_test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  static getHighScore() {
    if (!this.isAvailable()) return 0;
    try {
      const saved = localStorage.getItem(this.KEYS.HIGH_SCORE);
      const score = parseInt(saved, 10);
      return isNaN(score) ? 0 : Math.max(0, score);
    } catch (e) {
      console.warn('Could not read high score from storage', e);
      return 0;
    }
  }

  static saveHighScore(score) {
    if (!this.isAvailable()) return false;
    try {
      const current = this.getHighScore();
      if (score > current) {
        localStorage.setItem(this.KEYS.HIGH_SCORE, Math.floor(score).toString());
        return true; // New record set!
      }
      return false;
    } catch (e) {
      console.warn('Could not save high score to storage', e);
      return false;
    }
  }

  static resetHighScore() {
    if (!this.isAvailable()) return;
    try {
      localStorage.setItem(this.KEYS.HIGH_SCORE, '0');
    } catch (e) {
      console.warn('Could not reset high score', e);
    }
  }

  static getSettings() {
    if (!this.isAvailable()) return { ...this.defaultSettings };
    try {
      const saved = localStorage.getItem(this.KEYS.SETTINGS);
      if (!saved) return { ...this.defaultSettings };
      return { ...this.defaultSettings, ...JSON.parse(saved) };
    } catch (e) {
      return { ...this.defaultSettings };
    }
  }

  static saveSettings(settings) {
    if (!this.isAvailable()) return;
    try {
      localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('Could not save settings', e);
    }
  }

  static getStats() {
    if (!this.isAvailable()) return { ...this.defaultStats };
    try {
      const saved = localStorage.getItem(this.KEYS.STATS);
      if (!saved) return { ...this.defaultStats };
      return { ...this.defaultStats, ...JSON.parse(saved) };
    } catch (e) {
      return { ...this.defaultStats };
    }
  }

  static updateStats(callback) {
    if (!this.isAvailable()) return;
    try {
      const stats = this.getStats();
      const updated = callback(stats) || stats;
      localStorage.setItem(this.KEYS.STATS, JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not update stats', e);
    }
  }
}

// ============================================================================
// 2. WEB AUDIO API SYNTHESIZER & SOUND SYSTEM
// ============================================================================

class SoundSystem {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;

    this.settings = StorageManager.getSettings();

    // Music Sequencer State
    this.isPlayingMusic = false;
    this.currentLevelIndex = 1;
    this.seqTimer = null;
    this.seqStep = 0;
    this.tempo = 120; // BPM

    // Track active oscillators for smooth teardown
    this.activeNodes = new Set();
  }

  init() {
    if (this.ctx) return;
    const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtxClass) return;

    this.ctx = new AudioCtxClass();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.setValueAtTime(this.settings.musicEnabled ? this.settings.musicVolume * 0.35 : 0, this.ctx.currentTime);
    this.musicGain.connect(this.masterGain);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.setValueAtTime(this.settings.sfxEnabled ? this.settings.sfxVolume * 0.45 : 0, this.ctx.currentTime);
    this.sfxGain.connect(this.masterGain);
  }

  resumeIfNeeded() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  updateVolumes(settings) {
    this.settings = settings;
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const mVol = settings.musicEnabled ? settings.musicVolume * 0.35 : 0;
    const sVol = settings.sfxEnabled ? settings.sfxVolume * 0.45 : 0;

    this.musicGain.gain.cancelScheduledValues(t);
    this.musicGain.gain.linearRampToValueAtTime(mVol, t + 0.1);

    this.sfxGain.gain.cancelScheduledValues(t);
    this.sfxGain.gain.linearRampToValueAtTime(sVol, t + 0.1);
  }

  // --- Sound Effects (SFX) ---

  playJump() {
    if (!this.settings.sfxEnabled || !this.ctx) return;
    this.resumeIfNeeded();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(460, t + 0.15);

    gain.gain.setValueAtTime(0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.22);
  }

  playLand() {
    if (!this.settings.sfxEnabled || !this.ctx) return;
    this.resumeIfNeeded();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.08);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.09);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.1);
  }

  playDuck() {
    if (!this.settings.sfxEnabled || !this.ctx) return;
    this.resumeIfNeeded();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(90, t + 0.12);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

    // Filter to soften the slide sound
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, t);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.13);
  }

  playCollision() {
    if (!this.settings.sfxEnabled || !this.ctx) return;
    this.resumeIfNeeded();

    const t = this.ctx.currentTime;

    // Noise component
    const bufferSize = this.ctx.sampleRate * 0.3;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(400, t);
    noiseFilter.frequency.exponentialRampToValueAtTime(60, t + 0.28);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.8, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.28);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);

    // Low boom
    const boom = this.ctx.createOscillator();
    const boomGain = this.ctx.createGain();
    boom.type = 'triangle';
    boom.frequency.setValueAtTime(160, t);
    boom.frequency.exponentialRampToValueAtTime(30, t + 0.3);

    boomGain.gain.setValueAtTime(0.9, t);
    boomGain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

    boom.connect(boomGain);
    boomGain.connect(this.sfxGain);

    noise.start(t);
    boom.start(t);
    noise.stop(t + 0.3);
    boom.stop(t + 0.32);
  }

  playLevelUp() {
    if (!this.settings.sfxEnabled || !this.ctx) return;
    this.resumeIfNeeded();

    const t = this.ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C4, E4, G4, C5, E5, G5
    const stepTime = 0.07;

    notes.forEach((freq, idx) => {
      const noteTime = t + idx * stepTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0, noteTime);
      gain.gain.linearRampToValueAtTime(0.5, noteTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, noteTime + 0.18);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(noteTime);
      osc.stop(noteTime + 0.2);
    });
  }

  playHighScore() {
    if (!this.settings.sfxEnabled || !this.ctx) return;
    this.resumeIfNeeded();

    const t = this.ctx.currentTime;
    const chords = [
      { notes: [392.0, 493.88, 587.33], time: 0, dur: 0.14 },    // G maj
      { notes: [440.0, 554.37, 659.25], time: 0.16, dur: 0.14 }, // A maj
      { notes: [523.25, 659.25, 783.99], time: 0.34, dur: 0.45 } // C maj triumphant!
    ];

    chords.forEach(chord => {
      chord.notes.forEach(freq => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = t + chord.time;

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.25, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + chord.dur);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, startTime);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(startTime);
        osc.stop(startTime + chord.dur + 0.05);
      });
    });
  }

  playGameOver() {
    if (!this.settings.sfxEnabled || !this.ctx) return;
    this.resumeIfNeeded();

    const t = this.ctx.currentTime;
    const notes = [311.13, 293.66, 277.18, 261.63, 196.00]; // Sad descending tone
    const stepTime = 0.12;

    notes.forEach((freq, idx) => {
      const startTime = t + idx * stepTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.35, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.22);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(700, startTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(startTime);
      osc.stop(startTime + 0.24);
    });
  }

  playBonus() {
    if (!this.settings.sfxEnabled || !this.ctx) return;
    this.resumeIfNeeded();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(1760, t + 0.12);

    gain.gain.setValueAtTime(0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.2);
  }

  playButtonClick() {
    if (!this.settings.sfxEnabled || !this.ctx) return;
    this.resumeIfNeeded();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(660, t + 0.04);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.06);
  }

  // --- Dynamic Procedural Background Music (BGM) ---

  startMusic(levelIndex = 1) {
    this.currentLevelIndex = levelIndex;
    if (this.isPlayingMusic) return;
    this.resumeIfNeeded();

    this.isPlayingMusic = true;
    this.seqStep = 0;
    this.scheduleNextBeat();
  }

  stopMusic() {
    this.isPlayingMusic = false;
    if (this.seqTimer) {
      clearTimeout(this.seqTimer);
      this.seqTimer = null;
    }
  }

  changeLevelMusic(levelIndex) {
    this.currentLevelIndex = levelIndex;
    // Music adapts automatically on the very next beat!
  }

  scheduleNextBeat() {
    if (!this.isPlayingMusic || !this.ctx) return;

    // Tempo adapts based on level (120 BPM up to 160 BPM in Extreme)
    const tempos = [118, 124, 130, 138, 148, 162];
    this.tempo = tempos[Math.min(this.currentLevelIndex - 1, tempos.length - 1)];
    const beatSeconds = (60 / this.tempo) / 4; // 16th notes

    this.playTrackStep(this.seqStep, this.currentLevelIndex);
    this.seqStep = (this.seqStep + 1) % 32;

    this.seqTimer = setTimeout(() => {
      this.scheduleNextBeat();
    }, beatSeconds * 1000);
  }

  playTrackStep(step, level) {
    if (!this.settings.musicEnabled || !this.ctx) return;
    const t = this.ctx.currentTime;

    // 16-step patterns for Bass, Melody & Percussion
    // Level 1: Desert (C Major Chiptune Adventure)
    // Level 2: Sunset (Chillwave A Minor / F Maj)
    // Level 3: Night (Mystic Deep Tech Pulse)
    // Level 4: Jungle (Syncopated Tribal Groove)
    // Level 5: Cyber (Cyberpunk Darksynth Drive)
    // Level 6: Extreme (Fast Acid Glitch Rush)

    let bassNote = null;
    let leadNote = null;
    let hat = false;
    let snare = false;
    let kick = (step % 8 === 0 || step % 8 === 6);

    const s16 = step % 16;

    if (level === 1) {
      // Desert
      const bassProg = [130.81, 130.81, 164.81, 164.81, 174.61, 174.61, 196.00, 196.00]; // C3, E3, F3, G3
      bassNote = (s16 % 2 === 0) ? bassProg[Math.floor(s16 / 2)] : null;
      const melody = [523.25, 0, 587.33, 0, 659.25, 587.33, 523.25, 0, 392.00, 0, 440.00, 523.25, 587.33, 0, 0, 0];
      leadNote = melody[s16];
      hat = (s16 % 4 === 2);
    } else if (level === 2) {
      // Sunset
      const bassProg = [110.00, 110.00, 130.81, 130.81, 87.31, 87.31, 98.00, 98.00]; // A2, C3, F2, G2
      bassNote = (s16 % 2 === 0) ? bassProg[Math.floor(s16 / 2)] : null;
      const melody = [440, 0, 523.25, 659.25, 0, 587.33, 523.25, 0, 392, 440, 0, 523.25, 440, 0, 392, 0];
      leadNote = melody[s16];
      hat = true;
      snare = (s16 === 4 || s16 === 12);
    } else if (level === 3) {
      // Night Mode
      const bassProg = [73.42, 73.42, 73.42, 98.00, 82.41, 82.41, 73.42, 110.00]; // D2, G2, E2, A2
      bassNote = (s16 % 2 === 0) ? bassProg[Math.floor(s16 / 2)] : null;
      const melody = [293.66, 0, 440, 0, 392, 0, 349.23, 0, 329.63, 293.66, 0, 440, 523.25, 0, 440, 0];
      leadNote = (s16 % 2 === 1) ? melody[s16] : null;
      hat = (s16 % 2 === 0);
      snare = (s16 === 8);
    } else if (level === 4) {
      // Jungle
      const bassProg = [98.00, 146.83, 98.00, 164.81, 98.00, 130.81, 110.00, 146.83];
      bassNote = bassProg[Math.floor(s16 / 2)];
      const melody = [587.33, 587.33, 0, 659.25, 0, 783.99, 659.25, 0, 523.25, 0, 587.33, 659.25, 0, 440, 523.25, 0];
      leadNote = (s16 % 4 !== 3) ? melody[s16] : null;
      hat = true;
      snare = (s16 === 4 || s16 === 10 || s16 === 14);
    } else if (level === 5) {
      // Cyber World
      const bassProg = [65.41, 130.81, 65.41, 130.81, 77.78, 155.56, 87.31, 174.61]; // Fast 16th rolling bass
      bassNote = bassProg[s16 % bassProg.length];
      const melody = [523.25, 622.25, 783.99, 622.25, 523.25, 932.33, 783.99, 622.25];
      leadNote = (s16 % 2 === 0) ? melody[(s16 / 2) % melody.length] : null;
      hat = true;
      snare = (s16 === 4 || s16 === 12);
    } else {
      // Extreme Mode
      const bassProg = [82.41, 164.81, 82.41, 196.00, 73.42, 146.83, 87.31, 174.61];
      bassNote = bassProg[s16 % bassProg.length];
      const melody = [659.25, 783.99, 880.00, 987.77, 880.00, 783.99, 659.25, 587.33];
      leadNote = melody[s16 % melody.length];
      hat = true;
      snare = (s16 === 4 || s16 === 8 || s16 === 12);
      kick = (s16 % 4 === 0);
    }

    // Play Synth Bass
    if (bassNote) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = (level >= 5) ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(bassNote, t);

      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(level >= 5 ? 800 : 350, t);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      osc.start(t);
      osc.stop(t + 0.13);
    }

    // Play Synth Lead Melody
    if (leadNote && leadNote > 0) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = (level === 1) ? 'square' : ((level >= 5) ? 'sawtooth' : 'sine');
      osc.frequency.setValueAtTime(leadNote, t);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.005, t + 0.15);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2200, t);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      osc.start(t);
      osc.stop(t + 0.16);
    }

    // Play Kick Drum
    if (kick) {
      const kickOsc = this.ctx.createOscillator();
      const kickGain = this.ctx.createGain();
      kickOsc.type = 'sine';
      kickOsc.frequency.setValueAtTime(120, t);
      kickOsc.frequency.exponentialRampToValueAtTime(30, t + 0.08);

      kickGain.gain.setValueAtTime(0.35, t);
      kickGain.gain.exponentialRampToValueAtTime(0.01, t + 0.09);

      kickOsc.connect(kickGain);
      kickGain.connect(this.musicGain);

      kickOsc.start(t);
      kickOsc.stop(t + 0.1);
    }

    // Play Hi-Hat
    if (hat) {
      const hatBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.03, this.ctx.sampleRate);
      const data = hatBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

      const hatSource = this.ctx.createBufferSource();
      hatSource.buffer = hatBuffer;

      const hatFilter = this.ctx.createBiquadFilter();
      hatFilter.type = 'highpass';
      hatFilter.frequency.setValueAtTime(7000, t);

      const hatGain = this.ctx.createGain();
      hatGain.gain.setValueAtTime(0.06, t);
      hatGain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

      hatSource.connect(hatFilter);
      hatFilter.connect(hatGain);
      hatGain.connect(this.musicGain);

      hatSource.start(t);
    }

    // Play Snare
    if (snare) {
      const snareBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.08, this.ctx.sampleRate);
      const data = snareBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

      const snareSource = this.ctx.createBufferSource();
      snareSource.buffer = snareBuffer;

      const snareFilter = this.ctx.createBiquadFilter();
      snareFilter.type = 'bandpass';
      snareFilter.frequency.setValueAtTime(1500, t);

      const snareGain = this.ctx.createGain();
      snareGain.gain.setValueAtTime(0.14, t);
      snareGain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

      snareSource.connect(snareFilter);
      snareFilter.connect(snareGain);
      snareGain.connect(this.musicGain);

      snareSource.start(t);
    }
  }
}

// ============================================================================
// 3. PARTICLE & VISUAL EFFECTS SYSTEM
// ============================================================================

class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  reset() {
    this.particles = [];
  }

  // Dust puff when running on ground
  addRunDust(x, y) {
    this.particles.push({
      type: 'circle',
      x: x + (Math.random() * 8 - 4),
      y: y - 2,
      vx: -(Math.random() * 2 + 1.5),
      vy: -(Math.random() * 1.5 + 0.5),
      size: Math.random() * 4 + 3,
      alpha: 0.65,
      color: '#cbd5e1',
      decay: 0.035
    });
  }

  // Burst of dust on jump
  addJumpBurst(x, y) {
    for (let i = 0; i < 7; i++) {
      this.particles.push({
        type: 'circle',
        x: x + (Math.random() * 20 - 10),
        y: y,
        vx: (Math.random() - 0.5) * 4,
        vy: -(Math.random() * 3 + 1),
        size: Math.random() * 5 + 3,
        alpha: 0.8,
        color: '#e2e8f0',
        decay: 0.04
      });
    }
  }

  // Friction spark/dust stream while ducking/sliding
  addSlideDust(x, y) {
    this.particles.push({
      type: 'circle',
      x: x + (Math.random() * 15 - 5),
      y: y - 1,
      vx: -(Math.random() * 5 + 3),
      vy: -(Math.random() * 1.2),
      size: Math.random() * 3 + 2,
      alpha: 0.7,
      color: Math.random() > 0.5 ? '#f97316' : '#cbd5e1',
      decay: 0.05
    });
  }

  // Debris explosion upon collision
  addExplosion(x, y, color = '#ef4444') {
    const count = 28;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 2;
      this.particles.push({
        type: 'debris',
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 6 + 3,
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 0.4,
        alpha: 1.0,
        color: i % 2 === 0 ? color : '#facc15',
        gravity: 0.25,
        decay: 0.025
      });
    }
  }

  // Celebratory confetti for New High Score and Level Up
  addConfetti(canvasWidth, canvasHeight) {
    const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];
    for (let i = 0; i < 45; i++) {
      this.particles.push({
        type: 'confetti',
        x: Math.random() * canvasWidth,
        y: Math.random() * -50,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 4 + 3,
        size: Math.random() * 8 + 4,
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 0.2,
        alpha: 1.0,
        color: colors[Math.floor(Math.random() * colors.length)],
        gravity: 0.08,
        decay: 0.008
      });
    }
  }

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.gravity) {
        p.vy += p.gravity;
      }

      if (p.vRot) {
        p.rotation += p.vRot;
      }

      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  draw(ctx) {
    ctx.save();
    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;

      if (p.type === 'circle') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'debris' || p.type === 'confetti') {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation || 0);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
        ctx.restore();
      }
    }
    ctx.restore();
  }
}

// ============================================================================
// 4. PARALLAX MULTI-ENVIRONMENT BACKGROUND RENDERER
// ============================================================================

class BackgroundRenderer {
  constructor(canvasWidth, canvasHeight, groundY) {
    this.width = canvasWidth;
    this.height = canvasHeight;
    this.groundY = groundY;

    // Environmental Definitions for 6 Levels
    this.environments = [
      {
        id: 1,
        name: 'Desert',
        icon: '🏜️',
        skyTop: [112, 197, 206],      // #70c5ce
        skyBottom: [225, 240, 243],   // #e1f0f3
        sunColor: '#fffbeb',
        sunGlow: 'rgba(254, 240, 138, 0.4)',
        sunY: 90,
        farMountains: '#b48a60',
        midHills: '#c99e74',
        groundColor: '#d4ab7e',
        groundAccent: '#b58e65',
        starOpacity: 0
      },
      {
        id: 2,
        name: 'Sunset',
        icon: '🌆',
        skyTop: [67, 24, 82],         // deep violet
        skyBottom: [249, 115, 22],    // warm orange
        sunColor: '#fed7aa',
        sunGlow: 'rgba(249, 115, 22, 0.65)',
        sunY: 130,
        farMountains: '#581c87',
        midHills: '#7e22ce',
        groundColor: '#9a3412',
        groundAccent: '#7c2d12',
        starOpacity: 0.15
      },
      {
        id: 3,
        name: 'Night',
        icon: '🌙',
        skyTop: [4, 9, 23],           // obsidian navy
        skyBottom: [15, 23, 42],      // deep midnight
        sunColor: '#f1f5f9',          // Moon
        sunGlow: 'rgba(226, 232, 240, 0.35)',
        sunY: 80,
        farMountains: '#1e293b',
        midHills: '#334155',
        groundColor: '#0f172a',
        groundAccent: '#1e293b',
        starOpacity: 1.0
      },
      {
        id: 4,
        name: 'Jungle',
        icon: '🌴',
        skyTop: [6, 78, 59],          // deep emerald
        skyBottom: [16, 185, 129],    // bright lush green
        sunColor: '#fef08a',
        sunGlow: 'rgba(254, 240, 138, 0.4)',
        sunY: 100,
        farMountains: '#064e3b',
        midHills: '#047857',
        groundColor: '#14532d',
        groundAccent: '#166534',
        starOpacity: 0
      },
      {
        id: 5,
        name: 'Cyber World',
        icon: '⚡',
        skyTop: [15, 10, 35],         // dark cyber violet
        skyBottom: [76, 29, 149],     // neon purple
        sunColor: '#06b6d4',          // Cyber orb
        sunGlow: 'rgba(6, 182, 212, 0.6)',
        sunY: 110,
        farMountains: '#2e1065',
        midHills: '#4c1d95',
        groundColor: '#090514',
        groundAccent: '#06b6d4',
        starOpacity: 0.8
      },
      {
        id: 6,
        name: 'Extreme Mode',
        icon: '🔥',
        skyTop: [30, 5, 25],          // burning void
        skyBottom: [159, 18, 57],     // crimson inferno
        sunColor: '#fbbf24',          // Supernova
        sunGlow: 'rgba(239, 68, 68, 0.7)',
        sunY: 95,
        farMountains: '#831843',
        midHills: '#9f1239',
        groundColor: '#180410',
        groundAccent: '#ef4444',
        starOpacity: 1.0
      }
    ];

    this.currentEnvIndex = 0;
    this.targetEnvIndex = 0;
    this.transitionProgress = 1.0; // 0 to 1

    // Parallax Layer Scroll Offsets
    this.farScroll = 0;
    this.midScroll = 0;
    this.nearScroll = 0;
    this.groundScroll = 0;

    // Pre-generate static clouds and stars
    this.clouds = [
      { x: 150, y: 80, scale: 1.0 },
      { x: 480, y: 55, scale: 0.8 },
      { x: 820, y: 95, scale: 1.1 },
      { x: 1140, y: 70, scale: 0.9 }
    ];

    this.stars = [];
    for (let i = 0; i < 70; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * (this.groundY - 120),
        size: Math.random() * 2 + 1,
        twinkleSpeed: Math.random() * 3 + 1,
        phase: Math.random() * Math.PI * 2
      });
    }

    // Ground details (pebbles, cracks, cyber nodes)
    this.groundPebbles = [];
    for (let i = 0; i < 40; i++) {
      this.groundPebbles.push({
        x: Math.random() * this.width,
        y: this.groundY + Math.random() * (this.height - this.groundY),
        w: Math.random() * 8 + 3,
        h: Math.random() * 3 + 2
      });
    }
  }

  setEnvironment(envIndex) {
    if (envIndex === this.targetEnvIndex) return;
    this.targetEnvIndex = Math.max(0, Math.min(envIndex, this.environments.length - 1));
    this.transitionProgress = 0.0;
  }

  update(dt, gameSpeed) {
    // Parallax scrolling
    this.farScroll = (this.farScroll + gameSpeed * 0.12) % this.width;
    this.midScroll = (this.midScroll + gameSpeed * 0.35) % this.width;
    this.nearScroll = (this.nearScroll + gameSpeed * 0.65) % this.width;
    this.groundScroll = (this.groundScroll + gameSpeed) % this.width;

    // Smooth environment transition
    if (this.transitionProgress < 1.0) {
      this.transitionProgress += dt * 0.55; // Complete transition in ~1.8 seconds
      if (this.transitionProgress >= 1.0) {
        this.transitionProgress = 1.0;
        this.currentEnvIndex = this.targetEnvIndex;
      }
    }
  }

  // Linear color interpolation
  lerpColor(c1, c2, t) {
    return [
      Math.round(c1[0] + (c2[0] - c1[0]) * t),
      Math.round(c1[1] + (c2[1] - c1[1]) * t),
      Math.round(c1[2] + (c2[2] - c1[2]) * t)
    ];
  }

  getCurrentEnv() {
    return this.environments[this.currentEnvIndex];
  }

  getTargetEnv() {
    return this.environments[this.targetEnvIndex];
  }

  draw(ctx, time) {
    const cur = this.getCurrentEnv();
    const tgt = this.getTargetEnv();
    const t = this.transitionProgress;

    // 1. Draw Sky Gradient
    const skyTop = this.lerpColor(cur.skyTop, tgt.skyTop, t);
    const skyBottom = this.lerpColor(cur.skyBottom, tgt.skyBottom, t);

    const skyGrad = ctx.createLinearGradient(0, 0, 0, this.groundY);
    skyGrad.addColorStop(0, `rgb(${skyTop.join(',')})`);
    skyGrad.addColorStop(1, `rgb(${skyBottom.join(',')})`);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // 2. Draw Stars (Twinkling in Night & Cyber/Extreme modes)
    const starAlpha = cur.starOpacity + (tgt.starOpacity - cur.starOpacity) * t;
    if (starAlpha > 0.05) {
      ctx.save();
      for (const star of this.stars) {
        const twinkle = 0.4 + 0.6 * Math.sin(time * star.twinkleSpeed + star.phase);
        ctx.globalAlpha = starAlpha * twinkle;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(star.x, star.y, star.size, star.size);
      }
      ctx.restore();
    }

    // 3. Draw Celestial Body (Sun, Moon, or Cyber Core)
    ctx.save();
    const sunY = cur.sunY + (tgt.sunY - cur.sunY) * t;
    const sunX = this.width * 0.78;

    // Glowing halo
    const glowGrad = ctx.createRadialGradient(sunX, sunY, 15, sunX, sunY, 70);
    glowGrad.addColorStop(0, tgt.sunGlow);
    glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 70, 0, Math.PI * 2);
    ctx.fill();

    // Body disc
    ctx.fillStyle = tgt.sunColor;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 26, 0, Math.PI * 2);
    ctx.fill();

    // Moon shadow in night mode
    if (tgt.id === 3) {
      ctx.fillStyle = `rgb(${skyTop.join(',')})`;
      ctx.beginPath();
      ctx.arc(sunX + 9, sunY - 4, 23, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 4. Draw Clouds
    if (tgt.id === 1 || tgt.id === 2 || tgt.id === 4) {
      ctx.save();
      ctx.fillStyle = tgt.id === 2 ? 'rgba(254, 215, 170, 0.45)' : 'rgba(255, 255, 255, 0.65)';
      for (const cloud of this.clouds) {
        const cx = (cloud.x - this.farScroll * 0.4 + this.width) % this.width;
        this.drawCloud(ctx, cx, cloud.y, cloud.scale);
      }
      ctx.restore();
    }

    // 5. Far Mountains Layer (Parallax 1)
    this.drawFarMountains(ctx, tgt.farMountains);

    // 6. Mid Hills / Trees / Structures Layer (Parallax 2)
    this.drawMidHills(ctx, tgt.midHills, tgt.id);

    // 7. Ground Rendering & Texture
    this.drawGround(ctx, tgt);
  }

  drawCloud(ctx, x, y, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.arc(20, -6, 22, 0, Math.PI * 2);
    ctx.arc(42, 0, 16, 0, Math.PI * 2);
    ctx.arc(22, 10, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawFarMountains(ctx, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();

    const baseline = this.groundY - 30;
    ctx.moveTo(0, this.height);
    ctx.lineTo(0, baseline);

    const step = 150;
    const offset = -(this.farScroll % step);

    for (let x = offset - step; x < this.width + step * 2; x += step) {
      const peakY = baseline - 70 - Math.abs(Math.sin((x + 100) * 0.005)) * 60;
      ctx.lineTo(x + step * 0.5, peakY);
      ctx.lineTo(x + step, baseline);
    }

    ctx.lineTo(this.width, this.height);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  drawMidHills(ctx, color, envId) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();

    const baseline = this.groundY;
    ctx.moveTo(0, this.height);
    ctx.lineTo(0, baseline);

    const step = 90;
    const offset = -(this.midScroll % step);

    for (let x = offset - step; x < this.width + step * 2; x += step) {
      if (envId === 5) {
        // Cyber skyline (blocks and spires)
        const buildingH = 40 + ((Math.abs(Math.sin(x * 0.05)) * 60) | 0);
        ctx.lineTo(x, baseline - buildingH);
        ctx.lineTo(x + step * 0.7, baseline - buildingH);
        ctx.lineTo(x + step * 0.7, baseline);
      } else {
        // Natural rolling dunes / prehistoric hills
        const hillH = 25 + Math.sin(x * 0.015) * 30;
        ctx.lineTo(x + step * 0.5, baseline - hillH);
        ctx.lineTo(x + step, baseline);
      }
    }

    ctx.lineTo(this.width, this.height);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  drawGround(ctx, env) {
    ctx.save();

    // Solid ground body
    ctx.fillStyle = env.groundColor;
    ctx.fillRect(0, this.groundY, this.width, this.height - this.groundY);

    // Ground edge line / neon strip
    ctx.lineWidth = env.id === 5 || env.id === 6 ? 3 : 2;
    ctx.strokeStyle = env.groundAccent;

    if (env.id === 5) {
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 10;
    }

    ctx.beginPath();
    ctx.moveTo(0, this.groundY);
    ctx.lineTo(this.width, this.groundY);
    ctx.stroke();

    // Ground texture pebbles / cyber lines
    ctx.fillStyle = env.groundAccent;
    for (const p of this.groundPebbles) {
      const px = (p.x - this.groundScroll + this.width) % this.width;
      if (env.id === 5) {
        // Cyber horizontal data ticks
        ctx.fillRect(px, p.y, p.w * 1.5, 2);
      } else {
        // Rounded pebbles / dots
        ctx.beginPath();
        ctx.ellipse(px, p.y, p.w * 0.5, p.h * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }
}

// ============================================================================
// 5. DINO CHARACTER (PLAYER)
// ============================================================================

class Dino {
  constructor(groundY) {
    this.groundY = groundY;

    // Normal Dimensions
    this.standWidth = 62;
    this.standHeight = 72;

    // Ducking Dimensions (sleek aerodynamic profile)
    this.duckWidth = 84;
    this.duckHeight = 40;

    // Current Bounding Box
    this.width = this.standWidth;
    this.height = this.standHeight;

    this.x = 80;
    this.y = this.groundY - this.height;
    this.vy = 0;

    // Physics parameters
    this.gravity = 0.75;
    this.jumpForce = -14.6;
    this.fastDropForce = 2.2;

    // State machine
    this.isGrounded = true;
    this.isJumping = false;
    this.isDucking = false;
    this.isDead = false;

    // Animation Timers
    this.animTime = 0;
    this.blinkTimer = 0;
    this.isBlinking = false;
  }

  reset() {
    this.width = this.standWidth;
    this.height = this.standHeight;
    this.x = 80;
    this.y = this.groundY - this.height;
    this.vy = 0;
    this.isGrounded = true;
    this.isJumping = false;
    this.isDucking = false;
    this.isDead = false;
    this.animTime = 0;
  }

  jump() {
    if (this.isDead) return false;
    if (this.isGrounded) {
      this.vy = this.jumpForce;
      this.isGrounded = false;
      this.isJumping = true;
      return true; // Triggered jump
    }
    return false;
  }

  // Variable Jump Height: cut jump short if button released early
  cutJumpShort() {
    if (this.isJumping && this.vy < -4) {
      this.vy *= 0.45;
    }
  }

  duck(isPressed) {
    if (this.isDead) return;
    this.isDucking = isPressed;

    if (this.isDucking) {
      this.width = this.duckWidth;
      this.height = this.duckHeight;
      if (this.isGrounded) {
        this.y = this.groundY - this.duckHeight;
      } else {
        // Fast Drop: pressing duck while airborne sends you back down quickly!
        this.vy += this.fastDropForce;
      }
    } else {
      this.width = this.standWidth;
      this.height = this.standHeight;
      if (this.isGrounded) {
        this.y = this.groundY - this.standHeight;
      }
    }
  }

  update(dt, gameSpeed, onLandCallback) {
    this.animTime += dt * (gameSpeed * 1.8);

    // Blinking animation logic
    this.blinkTimer += dt;
    if (this.blinkTimer > 3.5) {
      this.isBlinking = true;
      if (this.blinkTimer > 3.7) {
        this.isBlinking = false;
        this.blinkTimer = 0;
      }
    }

    // Apply Vertical Physics
    if (!this.isGrounded) {
      this.vy += this.gravity;
      this.y += this.vy;

      const currentFloor = this.groundY - this.height;
      if (this.y >= currentFloor) {
        this.y = currentFloor;
        this.vy = 0;
        this.isGrounded = true;
        this.isJumping = false;
        if (onLandCallback) onLandCallback(this.x + this.width / 2, this.groundY);
      }
    }
  }

  // Bounding box for collision detection with slight padding for fairness
  getHitbox() {
    const padX = 6;
    const padY = 4;
    return {
      x: this.x + padX,
      y: this.y + padY,
      w: this.width - padX * 2,
      h: this.height - padY * 2
    };
  }

  draw(ctx, levelId = 1) {
    ctx.save();
    ctx.translate(this.x, this.y);

    const isCyber = levelId === 5 || levelId === 6;
    const skinColor = isCyber ? '#10b981' : '#22c55e';
    const darkColor = isCyber ? '#065f46' : '#15803d';
    const bellyColor = '#86efac';

    if (this.isDucking && this.isGrounded) {
      this.drawDuckingDino(ctx, skinColor, darkColor, bellyColor, isCyber);
    } else {
      this.drawStandingDino(ctx, skinColor, darkColor, bellyColor, isCyber);
    }

    ctx.restore();
  }

  drawStandingDino(ctx, skin, darkSkin, belly, isCyber) {
    // Leg Running Animation (Natural trigonometric cycle)
    const legPhase = this.isGrounded ? Math.sin(this.animTime) : 0;
    const leg1Angle = this.isGrounded ? legPhase * 0.6 : 0.3;
    const leg2Angle = this.isGrounded ? -legPhase * 0.6 : -0.3;

    // Tail (sways dynamically)
    const tailY = 28 + (this.isGrounded ? Math.sin(this.animTime * 0.5) * 2 : 0);
    ctx.fillStyle = darkSkin;
    ctx.beginPath();
    ctx.moveTo(8, tailY);
    ctx.quadraticCurveTo(-14, tailY + 8, -20, tailY - 6);
    ctx.quadraticCurveTo(-10, tailY + 16, 12, tailY + 18);
    ctx.closePath();
    ctx.fill();

    // Back leg (shadowed)
    this.drawLeg(ctx, 36, 48, leg2Angle, darkSkin);

    // Main Body & Belly
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.roundRect(10, 20, 36, 32, [14, 14, 8, 8]);
    ctx.fill();

    // Belly Accent
    ctx.fillStyle = belly;
    ctx.beginPath();
    ctx.roundRect(24, 26, 18, 22, [6, 6, 6, 6]);
    ctx.fill();

    // Spine Spikes
    ctx.fillStyle = isCyber ? '#06b6d4' : darkSkin;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(8, 24 + i * 8);
      ctx.lineTo(4, 21 + i * 8);
      ctx.lineTo(8, 18 + i * 8);
      ctx.fill();
    }

    // Front leg
    this.drawLeg(ctx, 22, 48, leg1Angle, skin);

    // Cute Little Dino Arm
    const armAngle = this.isGrounded ? Math.cos(this.animTime) * 0.3 : 0.2;
    ctx.save();
    ctx.translate(34, 32);
    ctx.rotate(armAngle);
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.roundRect(0, 0, 14, 6, 3);
    ctx.fill();
    // Claws
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(12, 1, 3, 2);
    ctx.fillRect(12, 4, 3, 2);
    ctx.restore();

    // Head & Snout
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.roundRect(22, 2, 38, 26, [8, 14, 6, 6]);
    ctx.fill();

    // Mouth
    ctx.fillStyle = this.isDead ? '#0f172a' : '#14532d';
    ctx.fillRect(40, 20, 20, 4);

    // Sharp White Teeth
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(42, 20); ctx.lineTo(45, 23); ctx.lineTo(48, 20);
    ctx.moveTo(50, 20); ctx.lineTo(53, 23); ctx.lineTo(56, 20);
    ctx.fill();

    // Eye / Cyber Visor
    if (isCyber) {
      // Futuristic Glowing Cyber Visor!
      ctx.fillStyle = '#06b6d4';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 8;
      ctx.fillRect(36, 7, 22, 6);
      ctx.shadowBlur = 0;
    } else if (this.isDead) {
      // Dead "X" eye
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(40, 7); ctx.lineTo(46, 13);
      ctx.moveTo(46, 7); ctx.lineTo(40, 13);
      ctx.stroke();
    } else {
      // Expressive blinking eye
      if (!this.isBlinking) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(43, 10, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(44.5, 10, 2.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Closed eyelid
        ctx.strokeStyle = '#14532d';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(38, 10);
        ctx.lineTo(48, 10);
        ctx.stroke();
      }
    }
  }

  drawDuckingDino(ctx, skin, darkSkin, belly, isCyber) {
    const legPhase = Math.sin(this.animTime * 1.3);

    // Low Horizontal Tail
    ctx.fillStyle = darkSkin;
    ctx.beginPath();
    ctx.moveTo(4, 20);
    ctx.quadraticCurveTo(-18, 18, -22, 10);
    ctx.quadraticCurveTo(-10, 26, 12, 28);
    ctx.closePath();
    ctx.fill();

    // Low Elongated Torso
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.roundRect(8, 12, 54, 22, [8, 10, 6, 6]);
    ctx.fill();

    // Low Forward Head
    ctx.beginPath();
    ctx.roundRect(50, 10, 32, 20, [6, 12, 4, 4]);
    ctx.fill();

    // Cyber Visor / Eye
    if (isCyber) {
      ctx.fillStyle = '#06b6d4';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 8;
      ctx.fillRect(66, 14, 14, 5);
      ctx.shadowBlur = 0;
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(70, 16, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(71.5, 16, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Scuttling Duck Legs
    this.drawLeg(ctx, 24, 30, legPhase * 0.5, skin);
    this.drawLeg(ctx, 42, 30, -legPhase * 0.5, darkSkin);
  }

  drawLeg(ctx, hipX, hipY, angle, color) {
    ctx.save();
    ctx.translate(hipX, hipY);
    ctx.rotate(angle);
    ctx.fillStyle = color;

    // Thigh & Shin
    ctx.beginPath();
    ctx.roundRect(-4, 0, 8, 18, 3);
    ctx.fill();

    // Foot with 3 Toes
    ctx.beginPath();
    ctx.roundRect(-2, 16, 14, 5, 2);
    ctx.fill();

    ctx.restore();
  }
}

// ============================================================================
// 6. OBSTACLES SYSTEM (CACTI, BIRDS, DRONES, VINES, HAZARDS)
// ============================================================================

class Obstacle {
  constructor(type, x, groundY, options = {}) {
    this.type = type;
    this.x = x;
    this.groundY = groundY;
    this.options = options;

    this.cleared = false;
    this.closeCallDetected = false;

    // Type Configurations
    switch (type) {
      case 'CACTUS_SMALL':
        this.width = 30;
        this.height = 54;
        this.y = this.groundY - this.height;
        break;

      case 'CACTUS_LARGE':
        this.width = 42;
        this.height = 76;
        this.y = this.groundY - this.height;
        break;

      case 'CACTUS_GROUP':
        this.count = options.count || 2;
        this.width = 28 * this.count + 12;
        this.height = 68;
        this.y = this.groundY - this.height;
        break;

      case 'BIRD':
        // Flying heights:
        // 'high' (y = ground - 165): run underneath safely
        // 'mid' (y = ground - 85): must duck/slide under!
        // 'low' (y = ground - 38): must jump over!
        this.heightTier = options.tier || 'mid';
        this.width = 54;
        this.height = 36;
        if (this.heightTier === 'high') {
          this.y = this.groundY - 165;
        } else if (this.heightTier === 'mid') {
          this.y = this.groundY - 85;
        } else {
          this.y = this.groundY - 38;
        }
        this.animTimer = Math.random() * Math.PI;
        this.wingState = 0; // -1 to 1
        break;

      case 'CYBER_DRONE':
        this.width = 46;
        this.height = 42;
        this.baseY = this.groundY - 110;
        this.y = this.baseY;
        this.hoverTimer = Math.random() * Math.PI * 2;
        break;

      case 'JUNGLE_PLANT':
        this.width = 44;
        this.height = 64;
        this.y = this.groundY - this.height;
        this.snapTimer = 0;
        break;

      case 'ROCK_SPIKE':
        this.width = 46;
        this.height = 56;
        this.y = this.groundY - this.height;
        break;

      default:
        this.width = 32;
        this.height = 50;
        this.y = this.groundY - this.height;
    }
  }

  update(dt, gameSpeed) {
    this.x -= gameSpeed;

    if (this.type === 'BIRD') {
      this.animTimer += dt * 9;
      this.wingState = Math.sin(this.animTimer);
      // Pterodactyls fly slightly faster than scenery
      this.x -= gameSpeed * 0.15;
    } else if (this.type === 'CYBER_DRONE') {
      this.hoverTimer += dt * 3.5;
      this.y = this.baseY + Math.sin(this.hoverTimer) * 18;
    } else if (this.type === 'JUNGLE_PLANT') {
      this.snapTimer += dt * 4;
    }
  }

  getHitbox() {
    // Generous inset hitboxes to keep gameplay fair & satisfying
    const inset = 4;
    return {
      x: this.x + inset,
      y: this.y + inset,
      w: this.width - inset * 2,
      h: this.height - inset * 2
    };
  }

  draw(ctx, levelId = 1) {
    ctx.save();
    ctx.translate(this.x, this.y);

    switch (this.type) {
      case 'CACTUS_SMALL':
        this.drawCactus(ctx, this.width, this.height, '#15803d', '#166534');
        break;

      case 'CACTUS_LARGE':
        this.drawCactus(ctx, this.width, this.height, '#16a34a', '#14532d');
        break;

      case 'CACTUS_GROUP':
        this.drawCactusGroup(ctx);
        break;

      case 'BIRD':
        this.drawBird(ctx, levelId);
        break;

      case 'CYBER_DRONE':
        this.drawCyberDrone(ctx);
        break;

      case 'JUNGLE_PLANT':
        this.drawJunglePlant(ctx);
        break;

      case 'ROCK_SPIKE':
        this.drawRockSpikes(ctx);
        break;
    }

    ctx.restore();
  }

  drawCactus(ctx, w, h, mainColor, branchColor) {
    // Main Trunk
    ctx.fillStyle = mainColor;
    ctx.beginPath();
    ctx.roundRect(w * 0.35, 0, w * 0.3, h, 6);
    ctx.fill();

    // Left Arm
    ctx.fillStyle = branchColor;
    ctx.beginPath();
    ctx.roundRect(0, h * 0.28, w * 0.35, w * 0.22, 4);
    ctx.roundRect(0, h * 0.12, w * 0.2, h * 0.25, 4);
    ctx.fill();

    // Right Arm
    ctx.beginPath();
    ctx.roundRect(w * 0.65, h * 0.4, w * 0.35, w * 0.22, 4);
    ctx.roundRect(w * 0.8, h * 0.22, w * 0.2, h * 0.25, 4);
    ctx.fill();

    // Subtle needles
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(w * 0.48, h * 0.18, 2, 2);
    ctx.fillRect(w * 0.48, h * 0.5, 2, 2);
  }

  drawCactusGroup(ctx) {
    for (let i = 0; i < this.count; i++) {
      ctx.save();
      ctx.translate(i * 26, (i % 2 === 0 ? 0 : 8));
      const subH = this.height - (i % 2 === 0 ? 0 : 8);
      this.drawCactus(ctx, 28, subH, '#16a34a', '#15803d');
      ctx.restore();
    }
  }

  drawBird(ctx, levelId) {
    const wingY = this.wingState * 14;

    // Body
    ctx.fillStyle = levelId === 3 ? '#94a3b8' : '#78350f';
    ctx.beginPath();
    ctx.ellipse(26, 18, 16, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Long Beak
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(12, 16);
    ctx.lineTo(-4, 18);
    ctx.lineTo(12, 21);
    ctx.closePath();
    ctx.fill();

    // Eye
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(14, 15, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(13.5, 15, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Flapping Wings
    ctx.fillStyle = levelId === 3 ? '#64748b' : '#92400e';
    ctx.beginPath();
    ctx.moveTo(20, 16);
    ctx.lineTo(34, 16 - wingY);
    ctx.lineTo(44, 16);
    ctx.closePath();
    ctx.fill();
  }

  drawCyberDrone(ctx) {
    // Cyber Bot Body
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(4, 6, 38, 26, 8);
    ctx.fill();

    // Neon Core Visor
    ctx.fillStyle = '#06b6d4';
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 10;
    ctx.fillRect(10, 14, 26, 8);
    ctx.shadowBlur = 0;

    // Propellers / Thrusters
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(8, 32, 8, 4);
    ctx.fillRect(30, 32, 8, 4);

    // Scan Laser Downward (visual warning indicator)
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(23, 30);
    ctx.lineTo(23, 70);
    ctx.stroke();
  }

  drawJunglePlant(ctx) {
    // Exotic Carnivorous Venus Flytrap
    ctx.fillStyle = '#047857';
    ctx.beginPath();
    ctx.roundRect(16, 20, 12, 44, 4); // Stem
    ctx.fill();

    // Snapping Head
    const mouthGap = Math.abs(Math.sin(this.snapTimer)) * 8;
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(22, 14 - mouthGap, 14, Math.PI, 0); // Upper jaw
    ctx.fill();
    ctx.beginPath();
    ctx.arc(22, 18 + mouthGap, 14, 0, Math.PI); // Lower jaw
    ctx.fill();

    // Teeth
    ctx.fillStyle = '#ffffff';
    for (let x = 12; x <= 32; x += 6) {
      ctx.fillRect(x, 14 - mouthGap, 2, 4);
      ctx.fillRect(x, 16 + mouthGap, 2, 4);
    }
  }

  drawRockSpikes(ctx) {
    // Glowing Crystal Spikes for Night Level
    ctx.fillStyle = '#3b82f6';
    ctx.shadowColor = '#3b82f6';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(4, this.height);
    ctx.lineTo(14, 8);
    ctx.lineTo(24, this.height);
    ctx.moveTo(18, this.height);
    ctx.lineTo(28, 0);
    ctx.lineTo(38, this.height);
    ctx.moveTo(30, this.height);
    ctx.lineTo(40, 14);
    ctx.lineTo(46, this.height);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

class ObstacleManager {
  constructor(canvasWidth, groundY) {
    this.canvasWidth = canvasWidth;
    this.groundY = groundY;
    this.obstacles = [];

    this.minGap = 360;
    this.spawnTimer = 0;
    this.obstaclesClearedCount = 0;
  }

  reset() {
    this.obstacles = [];
    this.spawnTimer = 0;
    this.obstaclesClearedCount = 0;
  }

  update(dt, gameSpeed, levelId, dino, onClearedCallback, onCloseCallCallback) {
    // Move & update existing obstacles
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.update(dt, gameSpeed);

      // Check for clearance
      if (!obs.cleared && (obs.x + obs.width < dino.x)) {
        obs.cleared = true;
        this.obstaclesClearedCount++;
        if (onClearedCallback) onClearedCallback(obs);
      }

      // Check for "Close Call" bonus
      if (!obs.closeCallDetected && obs.cleared) {
        obs.closeCallDetected = true;
        const dinoHit = dino.getHitbox();
        const obsHit = obs.getHitbox();
        const dist = Math.hypot(
          (dinoHit.x + dinoHit.w / 2) - (obsHit.x + obsHit.w / 2),
          (dinoHit.y + dinoHit.h / 2) - (obsHit.y + obsHit.h / 2)
        );

        if (dist < 88) {
          if (onCloseCallCallback) {
            onCloseCallCallback(obs.x + obs.width, obs.y);
          }
        }
      }

      // Remove offscreen
      if (obs.x + obs.width < -100) {
        this.obstacles.splice(i, 1);
      }
    }

    // Spawn logic with fair, dynamic spacing based on current speed
    this.spawnTimer -= dt;
    const lastObs = this.obstacles[this.obstacles.length - 1];
    const canSpawn = !lastObs || (this.canvasWidth - (lastObs.x + lastObs.width) >= this.minGap);

    if (canSpawn && this.spawnTimer <= 0) {
      this.spawnObstacle(levelId, gameSpeed);
      // Dynamic spacing: high speed requires more physical distance for human reaction time!
      this.minGap = Math.max(340, gameSpeed * 26 + (Math.random() * 220));
      this.spawnTimer = 0.2 + Math.random() * 0.4;
    }
  }

  spawnObstacle(levelId, gameSpeed) {
    const spawnX = this.canvasWidth + 60;
    let type = 'CACTUS_SMALL';
    let options = {};

    // Select obstacle pool based on level progression
    if (levelId === 1) {
      // Level 1: Desert (Gentle introduction with cacti)
      const roll = Math.random();
      if (roll < 0.5) type = 'CACTUS_SMALL';
      else if (roll < 0.85) type = 'CACTUS_LARGE';
      else {
        type = 'CACTUS_GROUP';
        options.count = 2;
      }
    } else if (levelId === 2) {
      // Level 2: Sunset (Introduce flying birds!)
      const roll = Math.random();
      if (roll < 0.4) {
        type = 'CACTUS_LARGE';
      } else if (roll < 0.6) {
        type = 'CACTUS_GROUP';
        options.count = 2;
      } else {
        type = 'BIRD';
        // Balanced bird heights: low (jump), mid (duck), high (overhead)
        const bRoll = Math.random();
        options.tier = bRoll < 0.4 ? 'mid' : (bRoll < 0.75 ? 'low' : 'high');
      }
    } else if (levelId === 3) {
      // Level 3: Night (Introduce glowing crystal spikes & night birds)
      const roll = Math.random();
      if (roll < 0.35) {
        type = 'ROCK_SPIKE';
      } else if (roll < 0.65) {
        type = 'BIRD';
        options.tier = Math.random() > 0.5 ? 'mid' : 'low';
      } else {
        type = 'CACTUS_LARGE';
      }
    } else if (levelId === 4) {
      // Level 4: Jungle (Jungle plants, large cacti, birds)
      const roll = Math.random();
      if (roll < 0.35) {
        type = 'JUNGLE_PLANT';
      } else if (roll < 0.65) {
        type = 'BIRD';
        options.tier = Math.random() > 0.45 ? 'mid' : 'low';
      } else {
        type = 'CACTUS_GROUP';
        options.count = 3;
      }
    } else if (levelId === 5) {
      // Level 5: Cyber World (Cyber drones & fast hazards)
      const roll = Math.random();
      if (roll < 0.4) {
        type = 'CYBER_DRONE';
      } else if (roll < 0.75) {
        type = 'BIRD';
        options.tier = 'mid'; // Duck challenge!
      } else {
        type = 'CACTUS_LARGE';
      }
    } else {
      // Level 6: Extreme Mode (Mixed dynamic obstacle patterns)
      const pool = ['CACTUS_LARGE', 'CACTUS_GROUP', 'BIRD', 'CYBER_DRONE', 'ROCK_SPIKE', 'JUNGLE_PLANT'];
      type = pool[Math.floor(Math.random() * pool.length)];
      if (type === 'BIRD') {
        options.tier = Math.random() > 0.5 ? 'mid' : 'low';
      } else if (type === 'CACTUS_GROUP') {
        options.count = Math.random() > 0.5 ? 2 : 3;
      }
    }

    this.obstacles.push(new Obstacle(type, spawnX, this.groundY, options));
  }

  checkCollision(dino) {
    const dBox = dino.getHitbox();

    for (const obs of this.obstacles) {
      const oBox = obs.getHitbox();

      // Axis-Aligned Bounding Box (AABB) intersection
      const collision = (
        dBox.x < oBox.x + oBox.w &&
        dBox.x + dBox.w > oBox.x &&
        dBox.y < oBox.y + oBox.h &&
        dBox.y + dBox.h > oBox.y
      );

      if (collision) {
        return obs;
      }
    }
    return null;
  }

  draw(ctx, levelId) {
    for (const obs of this.obstacles) {
      obs.draw(ctx, levelId);
    }
  }
}

// ============================================================================
// 7. LEVEL & PROGRESSION MANAGER
// ============================================================================

class LevelManager {
  static LEVELS = [
    { id: 1, name: 'Desert', icon: '🏜️', minScore: 0, maxScore: 500, baseSpeed: 8.0 },
    { id: 2, name: 'Sunset', icon: '🌆', minScore: 500, maxScore: 1200, baseSpeed: 9.8 },
    { id: 3, name: 'Night', icon: '🌙', minScore: 1200, maxScore: 2200, baseSpeed: 11.5 },
    { id: 4, name: 'Jungle', icon: '🌴', minScore: 2200, maxScore: 3500, baseSpeed: 13.0 },
    { id: 5, name: 'Cyber World', icon: '⚡', minScore: 3500, maxScore: 5000, baseSpeed: 14.6 },
    { id: 6, name: 'Extreme Mode', icon: '🔥', minScore: 5000, maxScore: Infinity, baseSpeed: 16.2 }
  ];

  constructor() {
    this.currentLevelIndex = 0;
  }

  reset() {
    this.currentLevelIndex = 0;
  }

  getLevelForScore(score) {
    for (let i = LevelManager.LEVELS.length - 1; i >= 0; i--) {
      if (score >= LevelManager.LEVELS[i].minScore) {
        return LevelManager.LEVELS[i];
      }
    }
    return LevelManager.LEVELS[0];
  }

  calculateSpeed(score, difficulty = 'standard') {
    const lvl = this.getLevelForScore(score);

    // Difficulty multiplier
    let diffMult = 1.0;
    if (difficulty === 'casual') diffMult = 0.85;
    if (difficulty === 'hardcore') diffMult = 1.15;

    // Smooth speed ramp within level
    const progressInLevel = (score - lvl.minScore) / (lvl.maxScore === Infinity ? 5000 : (lvl.maxScore - lvl.minScore));
    const smoothRamp = Math.min(1.5, Math.max(0, progressInLevel * 1.6));

    // Cap at a balanced maximum to keep game playable with human reflexes
    const finalSpeed = (lvl.baseSpeed + smoothRamp) * diffMult;
    return Math.min(finalSpeed, 18.5);
  }
}

// ============================================================================
// 8. MAIN GAME ENGINE & UI ORCHESTRATOR
// ============================================================================

class UltimateDinoGame {
  constructor() {
    // Canvas & Context Setup
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvasWrapper = document.getElementById('canvas-wrapper');

    // Logical Virtual Resolution (1200 x 500)
    this.VIRTUAL_WIDTH = 1200;
    this.VIRTUAL_HEIGHT = 500;
    this.GROUND_Y = 415;

    // High DPI Scaling
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    // Systems
    this.sound = new SoundSystem();
    this.particles = new ParticleSystem();
    this.bg = new BackgroundRenderer(this.VIRTUAL_WIDTH, this.VIRTUAL_HEIGHT, this.GROUND_Y);
    this.dino = new Dino(this.GROUND_Y);
    this.obstacles = new ObstacleManager(this.VIRTUAL_WIDTH, this.GROUND_Y);
    this.levelMgr = new LevelManager();

    // Game State: 'MENU', 'COUNTDOWN', 'PLAYING', 'PAUSED', 'GAMEOVER'
    this.state = 'MENU';
    this.score = 0;
    this.bonusScore = 0;
    this.highScore = StorageManager.getHighScore();
    this.speed = 8.0;
    this.isNewRecord = false;
    this.milestoneStep = 100;

    // Time & Game Loop Management
    this.lastTime = 0;
    this.gameTime = 0;
    this.countdownValue = 3;
    this.countdownTimer = null;
    this.animationFrameId = null;
    this.orientationDismissed = false;

    // Floating Bonus Layer
    this.floatingLayer = document.getElementById('floating-bonuses-layer');

    // DOM UI Elements
    this.initDOMElements();
    this.bindEvents();
    this.updateUI();
    this.checkOrientation();

    // Initial Screen
    this.showScreen('screen-main-menu');

    // Attempt automatic fullscreen on initial visit
    this.enterFullscreen();

    // Start background render loop for menu
    this.startEngineLoop();
  }

  resizeCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    const w = rect.width || window.innerWidth || 1200;
    const h = rect.height || window.innerHeight || 500;
    const aspect = w / (h || 1);

    this.VIRTUAL_HEIGHT = 500;
    this.VIRTUAL_WIDTH = Math.max(1000, Math.round(this.VIRTUAL_HEIGHT * aspect));
    this.GROUND_Y = 415;

    this.canvas.width = this.VIRTUAL_WIDTH * dpr;
    this.canvas.height = this.VIRTUAL_HEIGHT * dpr;

    this.ctx.resetTransform();
    this.ctx.scale(dpr, dpr);

    if (this.bg) {
      this.bg.width = this.VIRTUAL_WIDTH;
      this.bg.height = this.VIRTUAL_HEIGHT;
      this.bg.groundY = this.GROUND_Y;
    }
    if (this.obstacles) {
      this.obstacles.canvasWidth = this.VIRTUAL_WIDTH;
      this.obstacles.groundY = this.GROUND_Y;
    }
    if (this.dino) {
      this.dino.groundY = this.GROUND_Y;
    }
  }

  initDOMElements() {
    // HUD
    this.hud = document.getElementById('hud');
    this.hudLevelIcon = document.getElementById('level-icon');
    this.hudLevelName = document.getElementById('level-name');
    this.hudLevelNum = document.getElementById('level-num');
    this.hudSpeedVal = document.getElementById('speed-value');
    this.hudHiScore = document.getElementById('hi-score-hud');
    this.hudCurrScore = document.getElementById('current-score-hud');

    // Overlays
    this.screenMainMenu = document.getElementById('screen-main-menu');
    this.screenPause = document.getElementById('screen-pause');
    this.screenGameOver = document.getElementById('screen-game-over');
    this.countdownOverlay = document.getElementById('countdown-overlay');
    this.countdownText = document.getElementById('countdown-text');
    this.milestoneBanner = document.getElementById('milestone-banner');
    this.milestoneTitle = document.getElementById('milestone-title');
    this.milestoneDesc = document.getElementById('milestone-desc');
    this.milestoneIcon = document.getElementById('milestone-icon');

    // Buttons
    this.btnPlay = document.getElementById('btn-play-game');
    this.btnRetry = document.getElementById('btn-retry');
    this.btnResume = document.getElementById('btn-resume');
    this.btnPause = document.getElementById('btn-pause');
    this.btnRestartPaused = document.getElementById('btn-restart-paused');
    this.btnQuitToMenu = document.getElementById('btn-quit-to-menu');
    this.btnGoMenu = document.getElementById('btn-go-menu');
    this.btnAudioToggle = document.getElementById('btn-audio-toggle');
    this.iconSoundOn = document.getElementById('icon-sound-on');
    this.iconSoundOff = document.getElementById('icon-sound-off');
    this.btnFullscreen = document.getElementById('btn-fullscreen');
    this.iconFsEnter = document.getElementById('icon-fs-enter');
    this.iconFsExit = document.getElementById('icon-fs-exit');

    // Modals
    this.modalSettings = document.getElementById('modal-settings');
    this.modalInstructions = document.getElementById('modal-instructions');
    this.btnOpenSettings = document.getElementById('btn-open-settings');
    this.btnCloseSettings = document.getElementById('btn-close-settings');
    this.btnSaveSettings = document.getElementById('btn-save-settings');
    this.btnSettingsPaused = document.getElementById('btn-settings-paused');
    this.btnOpenInstructions = document.getElementById('btn-open-instructions');
    this.btnCloseInstructions = document.getElementById('btn-close-instructions');
    this.btnInstructionsGotit = document.getElementById('btn-instructions-gotit');
    this.btnResetHighScore = document.getElementById('btn-reset-high-score');

    // Settings Controls
    this.chkMusic = document.getElementById('chk-music');
    this.rngMusicVol = document.getElementById('rng-music-vol');
    this.valMusicVol = document.getElementById('val-music-vol');
    this.chkSfx = document.getElementById('chk-sfx');
    this.rngSfxVol = document.getElementById('rng-sfx-vol');
    this.valSfxVol = document.getElementById('val-sfx-vol');
    this.selDifficulty = document.getElementById('sel-difficulty');
    this.chkShake = document.getElementById('chk-shake');
    this.chkParticles = document.getElementById('chk-particles');

    // Mobile Touch Buttons
    this.btnTouchJump = document.getElementById('btn-touch-jump');
    this.btnTouchDuck = document.getElementById('btn-touch-duck');

    // Mobile Rotate Device Overlay
    this.rotateOverlay = document.getElementById('screen-rotate-device');
    this.btnDismissRotate = document.getElementById('btn-dismiss-rotate');
    if (this.btnDismissRotate) {
      this.btnDismissRotate.addEventListener('click', () => {
        this.orientationDismissed = true;
        if (this.rotateOverlay) this.rotateOverlay.classList.add('hidden');
      });
    }

    // Fill settings inputs from stored settings
    const s = StorageManager.getSettings();
    this.chkMusic.checked = s.musicEnabled;
    this.rngMusicVol.value = Math.round(s.musicVolume * 100);
    this.valMusicVol.textContent = `${this.rngMusicVol.value}%`;
    this.chkSfx.checked = s.sfxEnabled;
    this.rngSfxVol.value = Math.round(s.sfxVolume * 100);
    this.valSfxVol.textContent = `${this.rngSfxVol.value}%`;
    this.selDifficulty.value = s.difficulty;
    this.chkShake.checked = s.screenShake;
    this.chkParticles.checked = s.particles;
  }

  bindEvents() {
    // --- Keyboard Controls ---
    window.addEventListener('keydown', (e) => {
      // First interaction unlocks AudioContext
      this.sound.resumeIfNeeded();

      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        if (this.state === 'PLAYING') {
          if (this.dino.jump()) {
            this.sound.playJump();
            if (this.sound.settings.particles) {
              this.particles.addJumpBurst(this.dino.x + this.dino.width / 2, this.GROUND_Y);
            }
          }
        } else if (this.state === 'GAMEOVER') {
          this.startCountdown();
        } else if (this.state === 'MENU') {
          this.startCountdown();
        }
      }

      if (e.code === 'ArrowDown' || e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.key === 'Shift') {
        e.preventDefault();
        if (this.state === 'PLAYING') {
          if (!this.dino.isDucking) {
            this.dino.duck(true);
            this.sound.playDuck();
          }
        }
      }

      if (e.code === 'KeyP' || e.code === 'Escape') {
        e.preventDefault();
        if (this.state === 'PLAYING') {
          this.pauseGame();
        } else if (this.state === 'PAUSED') {
          this.resumeGame();
        }
      }

      if (e.code === 'KeyM') {
        e.preventDefault();
        this.toggleMasterSound();
      }

      if (e.code === 'KeyR' && (this.state === 'PLAYING' || this.state === 'PAUSED' || this.state === 'GAMEOVER')) {
        e.preventDefault();
        this.startCountdown();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        this.dino.cutJumpShort();
      }

      if (e.code === 'ArrowDown' || e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.key === 'Shift') {
        this.dino.duck(false);
      }
    });

    // --- Mouse Click / Tap & Touch Gestures on Canvas ---
    let touchStartY = 0;
    let touchStartX = 0;
    let touchStartTime = 0;

    this.canvas.addEventListener('touchstart', (e) => {
      this.sound.resumeIfNeeded();
      if (e.touches.length > 0) {
        touchStartY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;
        touchStartTime = performance.now();
      }
    }, { passive: true });

    this.canvas.addEventListener('touchend', (e) => {
      if (e.changedTouches.length > 0 && this.state === 'PLAYING') {
        const deltaY = e.changedTouches[0].clientY - touchStartY;
        const deltaX = e.changedTouches[0].clientX - touchStartX;
        const duration = performance.now() - touchStartTime;

        if (deltaY > 35 && Math.abs(deltaY) > Math.abs(deltaX)) {
          // Swipe Down detected: Duck briefly
          this.dino.duck(true);
          this.sound.playDuck();
          setTimeout(() => this.dino.duck(false), 550);
        } else if (duration < 300) {
          // Quick Tap or Swipe Up detected: Jump!
          if (this.dino.jump()) {
            this.sound.playJump();
            if (this.sound.settings.particles) {
              this.particles.addJumpBurst(this.dino.x + this.dino.width / 2, this.GROUND_Y);
            }
          }
        }
      }
    }, { passive: true });

    this.canvas.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse') {
        this.sound.resumeIfNeeded();
        if (this.state === 'PLAYING') {
          if (this.dino.jump()) {
            this.sound.playJump();
            if (this.sound.settings.particles) {
              this.particles.addJumpBurst(this.dino.x + this.dino.width / 2, this.GROUND_Y);
            }
          }
        }
      }
    });

    this.canvas.addEventListener('pointerup', () => {
      this.dino.cutJumpShort();
    });

    // --- Mobile Touch Buttons ---
    const bindTouchAction = (btn, onStart, onEnd) => {
      const handleStart = (e) => {
        e.preventDefault();
        this.sound.resumeIfNeeded();
        btn.classList.add('active-touch');
        onStart();
      };
      const handleEnd = (e) => {
        e.preventDefault();
        btn.classList.remove('active-touch');
        onEnd();
      };

      btn.addEventListener('pointerdown', handleStart);
      btn.addEventListener('pointerup', handleEnd);
      btn.addEventListener('pointercancel', handleEnd);
      btn.addEventListener('pointerleave', handleEnd);
    };

    bindTouchAction(
      this.btnTouchJump,
      () => {
        if (this.state === 'PLAYING') {
          if (this.dino.jump()) {
            this.sound.playJump();
            if (this.sound.settings.particles) {
              this.particles.addJumpBurst(this.dino.x + this.dino.width / 2, this.GROUND_Y);
            }
          }
        }
      },
      () => {
        this.dino.cutJumpShort();
      }
    );

    bindTouchAction(
      this.btnTouchDuck,
      () => {
        if (this.state === 'PLAYING') {
          this.dino.duck(true);
          this.sound.playDuck();
        }
      },
      () => {
        this.dino.duck(false);
      }
    );

    // --- UI Buttons ---
    this.btnPlay.addEventListener('click', () => {
      this.sound.playButtonClick();
      this.startCountdown();
    });

    this.btnRetry.addEventListener('click', () => {
      this.sound.playButtonClick();
      this.startCountdown();
    });

    this.btnResume.addEventListener('click', () => {
      this.sound.playButtonClick();
      this.resumeGame();
    });

    this.btnPause.addEventListener('click', () => {
      this.sound.playButtonClick();
      this.pauseGame();
    });

    this.btnRestartPaused.addEventListener('click', () => {
      this.sound.playButtonClick();
      this.startCountdown();
    });

    this.btnQuitToMenu.addEventListener('click', () => {
      this.sound.playButtonClick();
      this.returnToMenu();
    });

    this.btnGoMenu.addEventListener('click', () => {
      this.sound.playButtonClick();
      this.returnToMenu();
    });

    this.btnAudioToggle.addEventListener('click', () => {
      this.sound.playButtonClick();
      this.toggleMasterSound();
    });

    this.btnFullscreen.addEventListener('click', () => {
      this.toggleFullscreen();
    });

    // --- Modals ---
    this.btnOpenSettings.addEventListener('click', () => {
      this.sound.playButtonClick();
      this.openModal('modal-settings');
    });

    this.btnCloseSettings.addEventListener('click', () => {
      this.sound.playButtonClick();
      this.closeModal('modal-settings');
    });

    this.btnSaveSettings.addEventListener('click', () => {
      this.sound.playButtonClick();
      this.applySettingsFromUI();
      this.closeModal('modal-settings');
    });

    this.btnSettingsPaused.addEventListener('click', () => {
      this.sound.playButtonClick();
      this.openModal('modal-settings');
    });

    this.btnOpenInstructions.addEventListener('click', () => {
      this.sound.playButtonClick();
      this.openModal('modal-instructions');
    });

    this.btnCloseInstructions.addEventListener('click', () => {
      this.sound.playButtonClick();
      this.closeModal('modal-instructions');
    });

    this.btnInstructionsGotit.addEventListener('click', () => {
      this.sound.playButtonClick();
      this.closeModal('modal-instructions');
    });

    this.btnResetHighScore.addEventListener('click', () => {
      if (confirm('Are you sure you want to permanently reset your high score record?')) {
        StorageManager.resetHighScore();
        this.highScore = 0;
        this.updateUI();
        this.showMilestoneToast('RECORD RESET', 'Your high score has been cleared.', '🗑️');
      }
    });

    // Settings live changes
    this.rngMusicVol.addEventListener('input', (e) => {
      this.valMusicVol.textContent = `${e.target.value}%`;
      this.applySettingsFromUI();
    });

    this.rngSfxVol.addEventListener('input', (e) => {
      this.valSfxVol.textContent = `${e.target.value}%`;
      this.applySettingsFromUI();
    });

    this.chkMusic.addEventListener('change', () => this.applySettingsFromUI());
    this.chkSfx.addEventListener('change', () => this.applySettingsFromUI());
    this.selDifficulty.addEventListener('change', () => this.applySettingsFromUI());
    this.chkShake.addEventListener('change', () => this.applySettingsFromUI());
    this.chkParticles.addEventListener('change', () => this.applySettingsFromUI());

    // --- Tab Visibility Change: Auto-pause when user leaves tab ---
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.state === 'PLAYING') {
        this.pauseGame();
      }
    });

    // --- Automatic Fullscreen on First User Interaction ---
    const triggerAutoFullscreen = () => {
      this.enterFullscreen();
      window.removeEventListener('pointerdown', triggerAutoFullscreen, { capture: true });
      window.removeEventListener('keydown', triggerAutoFullscreen, { capture: true });
      window.removeEventListener('touchstart', triggerAutoFullscreen, { capture: true });
      window.removeEventListener('click', triggerAutoFullscreen, { capture: true });
    };

    window.addEventListener('pointerdown', triggerAutoFullscreen, { capture: true, passive: true });
    window.addEventListener('keydown', triggerAutoFullscreen, { capture: true, passive: true });
    window.addEventListener('touchstart', triggerAutoFullscreen, { capture: true, passive: true });
    window.addEventListener('click', triggerAutoFullscreen, { capture: true, passive: true });

    // --- Fullscreen State Change Listener ---
    const fsEvents = ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'];
    fsEvents.forEach(ev => {
      document.addEventListener(ev, () => {
        this.updateFullscreenIcons();
        this.resizeCanvas();
        this.checkOrientation();
      });
    });

    // --- Screen Orientation & Resize Listeners ---
    window.addEventListener('resize', () => {
      this.resizeCanvas();
      this.checkOrientation();
    });

    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.resizeCanvas();
        this.checkOrientation();
      }, 150);
    });

    if (window.screen && window.screen.orientation) {
      window.screen.orientation.addEventListener('change', () => {
        this.resizeCanvas();
        this.checkOrientation();
      });
    }
  }

  applySettingsFromUI() {
    const newSettings = {
      musicEnabled: this.chkMusic.checked,
      musicVolume: parseInt(this.rngMusicVol.value, 10) / 100,
      sfxEnabled: this.chkSfx.checked,
      sfxVolume: parseInt(this.rngSfxVol.value, 10) / 100,
      difficulty: this.selDifficulty.value,
      screenShake: this.chkShake.checked,
      particles: this.chkParticles.checked
    };

    StorageManager.saveSettings(newSettings);
    this.sound.updateVolumes(newSettings);
    this.updateAudioIcons();
  }

  toggleMasterSound() {
    const isMuted = !this.sound.settings.musicEnabled && !this.sound.settings.sfxEnabled;
    const nextState = isMuted;

    this.chkMusic.checked = nextState;
    this.chkSfx.checked = nextState;
    this.applySettingsFromUI();
  }

  updateAudioIcons() {
    const isMuted = !this.sound.settings.musicEnabled && !this.sound.settings.sfxEnabled;
    if (isMuted) {
      this.iconSoundOn.classList.add('hidden');
      this.iconSoundOff.classList.remove('hidden');
    } else {
      this.iconSoundOn.classList.remove('hidden');
      this.iconSoundOff.classList.add('hidden');
    }
  }

  isMobileDevice() {
    const hasTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const isMobileUA = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|webOS/i.test(navigator.userAgent || '');
    const isSmallTouch = hasTouch && window.matchMedia('(pointer: coarse)').matches;
    return isMobileUA || isSmallTouch;
  }

  checkOrientation() {
    // Desktop users are NEVER prompted or forced
    if (!this.isMobileDevice()) {
      if (this.rotateOverlay) this.rotateOverlay.classList.add('hidden');
      return;
    }

    const isPortrait = window.innerHeight > window.innerWidth ||
                       (window.screen && window.screen.orientation && window.screen.orientation.type && window.screen.orientation.type.includes('portrait'));

    if (isPortrait && !this.orientationDismissed) {
      if (this.rotateOverlay) this.rotateOverlay.classList.remove('hidden');
    } else {
      if (this.rotateOverlay) this.rotateOverlay.classList.add('hidden');
    }
  }

  async enterFullscreen() {
    const docEl = document.documentElement || document.body;
    if (!docEl) return Promise.resolve();

    const requestFs = docEl.requestFullscreen ||
                      docEl.webkitRequestFullscreen ||
                      docEl.mozRequestFullScreen ||
                      docEl.msRequestFullscreen;

    const isFs = document.fullscreenElement ||
                 document.webkitFullscreenElement ||
                 document.mozFullScreenElement ||
                 document.msFullscreenElement;

    if (requestFs && !isFs) {
      try {
        await requestFs.call(docEl);
      } catch (e) {
        // Silently catch browser policy rejections before user gesture
      }
    }

    // Automatically lock mobile devices to landscape orientation in fullscreen
    if (this.isMobileDevice() && window.screen && window.screen.orientation && window.screen.orientation.lock) {
      try {
        await window.screen.orientation.lock('landscape');
      } catch (e) {
        // Ignored on browsers without Screen Orientation Lock permission
      }
    }

    this.checkOrientation();
    return Promise.resolve();
  }

  toggleFullscreen() {
    const isFs = document.fullscreenElement ||
                 document.webkitFullscreenElement ||
                 document.mozFullScreenElement ||
                 document.msFullscreenElement;

    if (!isFs) {
      this.enterFullscreen();
    } else {
      const exitFs = document.exitFullscreen ||
                     document.webkitExitFullscreen ||
                     document.mozCancelFullScreen ||
                     document.msExitFullscreen;
      if (exitFs) {
        exitFs.call(document).catch(() => {});
      }
    }
  }

  updateFullscreenIcons() {
    const isFs = document.fullscreenElement ||
                 document.webkitFullscreenElement ||
                 document.mozFullScreenElement ||
                 document.msFullscreenElement;

    if (this.iconFsEnter && this.iconFsExit) {
      if (isFs) {
        this.iconFsEnter.classList.add('hidden');
        this.iconFsExit.classList.remove('hidden');
      } else {
        this.iconFsEnter.classList.remove('hidden');
        this.iconFsExit.classList.add('hidden');
      }
    }
  }

  showScreen(screenId) {
    const screens = ['screen-main-menu', 'screen-pause', 'screen-game-over'];
    screens.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add('hidden');
    });

    if (screenId) {
      const target = document.getElementById(screenId);
      if (target) target.classList.remove('hidden');
    }
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('hidden');
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
  }

  // --- Countdown Transition (3, 2, 1, RUN!) ---
  startCountdown() {
    this.enterFullscreen();
    this.sound.resumeIfNeeded();
    this.showScreen(null); // Hide all screens
    this.closeModal('modal-settings');
    this.closeModal('modal-instructions');

    this.resetGameVariables();
    this.state = 'COUNTDOWN';
    this.countdownValue = 3;

    this.hud.classList.remove('hidden');
    this.countdownOverlay.classList.remove('hidden');
    this.countdownText.textContent = this.countdownValue;
    this.countdownText.style.color = '#ffffff';

    this.sound.playButtonClick();

    if (this.countdownTimer) clearInterval(this.countdownTimer);

    this.countdownTimer = setInterval(() => {
      this.countdownValue--;
      if (this.countdownValue > 0) {
        this.countdownText.textContent = this.countdownValue;
        this.sound.playButtonClick();
      } else if (this.countdownValue === 0) {
        this.countdownText.textContent = 'RUN!';
        this.countdownText.style.color = '#22c55e';
        this.sound.playJump();
      } else {
        clearInterval(this.countdownTimer);
        this.countdownTimer = null;
        this.countdownOverlay.classList.add('hidden');
        this.startGameplay();
      }
    }, 750);
  }

  resetGameVariables() {
    this.score = 0;
    this.bonusScore = 0;
    this.speed = 8.0;
    this.isNewRecord = false;
    this.milestoneStep = 100;

    this.dino.reset();
    this.obstacles.reset();
    this.particles.reset();
    this.levelMgr.reset();
    this.bg.setEnvironment(0);

    this.floatingLayer.innerHTML = '';
    this.updateUI();
  }

  startGameplay() {
    this.state = 'PLAYING';
    this.lastTime = performance.now();
    this.sound.startMusic(1);
  }

  pauseGame() {
    if (this.state !== 'PLAYING') return;
    this.state = 'PAUSED';
    this.sound.stopMusic();

    document.getElementById('pause-score-val').textContent = this.formatScore(this.score);
    document.getElementById('pause-level-val').textContent = this.levelMgr.getLevelForScore(this.score).name;

    this.showScreen('screen-pause');
  }

  resumeGame() {
    if (this.state !== 'PAUSED') return;
    this.showScreen(null);
    this.state = 'PLAYING';
    this.lastTime = performance.now();

    const curLvl = this.levelMgr.getLevelForScore(this.score);
    this.sound.startMusic(curLvl.id);
  }

  returnToMenu() {
    this.state = 'MENU';
    this.sound.stopMusic();
    this.hud.classList.add('hidden');
    this.countdownOverlay.classList.add('hidden');
    this.showScreen('screen-main-menu');
    this.updateUI();
  }

  triggerGameOver(obstacle) {
    this.state = 'GAMEOVER';
    this.dino.isDead = true;
    this.sound.stopMusic();
    this.sound.playCollision();
    this.sound.playGameOver();

    // Screen Shake effect
    if (this.sound.settings.screenShake) {
      this.canvasWrapper.classList.remove('shake-screen');
      void this.canvasWrapper.offsetWidth; // Trigger reflow
      this.canvasWrapper.classList.add('shake-screen');
    }

    // Explosion Particles
    if (this.sound.settings.particles) {
      this.particles.addExplosion(this.dino.x + this.dino.width / 2, this.dino.y + this.dino.height / 2);
    }

    // Record Checking & LocalStorage persistence
    const beaten = StorageManager.saveHighScore(this.score);
    this.isNewRecord = beaten;
    if (beaten) {
      this.highScore = Math.floor(this.score);
      this.sound.playHighScore();
      if (this.sound.settings.particles) {
        this.particles.addConfetti(this.VIRTUAL_WIDTH, this.VIRTUAL_HEIGHT);
      }
    }

    // Update Lifetime Stats
    StorageManager.updateStats(stats => {
      stats.gamesPlayed = (stats.gamesPlayed || 0) + 1;
      stats.totalDistance = (stats.totalDistance || 0) + Math.floor(this.score);
      stats.totalObstaclesCleared = (stats.totalObstaclesCleared || 0) + this.obstacles.obstaclesClearedCount;
      const curLvl = this.levelMgr.getLevelForScore(this.score).id;
      stats.highestLevel = Math.max(stats.highestLevel || 1, curLvl);
      return stats;
    });

    // Populate Game Over Screen
    const curLevel = this.levelMgr.getLevelForScore(this.score);
    document.getElementById('go-final-score').textContent = this.formatScore(this.score);
    document.getElementById('go-best-score').textContent = this.formatScore(this.highScore);
    document.getElementById('go-level-reached').textContent = `${curLevel.name} (${curLevel.icon})`;
    document.getElementById('go-obstacles-cleared').textContent = this.obstacles.obstaclesClearedCount;
    document.getElementById('go-bonus-points').textContent = `+${this.bonusScore}`;

    const newRecordBadge = document.getElementById('new-high-score-badge');
    if (this.isNewRecord) {
      newRecordBadge.classList.remove('hidden');
    } else {
      newRecordBadge.classList.add('hidden');
    }

    setTimeout(() => {
      this.showScreen('screen-game-over');
    }, 600);
  }

  showMilestoneToast(title, desc, icon = '🎉') {
    this.milestoneTitle.textContent = title;
    this.milestoneDesc.textContent = desc;
    this.milestoneIcon.textContent = icon;

    this.milestoneBanner.classList.remove('hidden');
    setTimeout(() => {
      this.milestoneBanner.classList.add('hidden');
    }, 2800);
  }

  addFloatingBonus(text, x, y) {
    const el = document.createElement('div');
    el.className = 'floating-bonus';
    el.textContent = text;

    // Convert virtual coords to percentage for fluid placement
    const leftPct = (x / this.VIRTUAL_WIDTH) * 100;
    const topPct = (y / this.VIRTUAL_HEIGHT) * 100;

    el.style.left = `${leftPct}%`;
    el.style.top = `${topPct}%`;

    this.floatingLayer.appendChild(el);
    setTimeout(() => {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 1200);
  }

  formatScore(val) {
    return Math.floor(val).toString().padStart(5, '0');
  }

  updateUI() {
    const curLvl = this.levelMgr.getLevelForScore(this.score);

    this.hudLevelIcon.textContent = curLvl.icon;
    this.hudLevelName.textContent = curLvl.name;
    this.hudLevelNum.textContent = `LVL ${curLvl.id}`;
    this.hudSpeedVal.textContent = `${(this.speed / 8.0).toFixed(1)}x`;

    const scoreStr = this.formatScore(this.score);
    const hiScoreStr = this.formatScore(this.highScore);

    this.hudCurrScore.textContent = scoreStr;
    this.hudHiScore.textContent = hiScoreStr;

    // Menu High Score card
    const menuHi = document.getElementById('menu-hi-score');
    if (menuHi) menuHi.textContent = hiScoreStr;
  }

  // --- Main Engine Loop (requestAnimationFrame with delta time) ---
  startEngineLoop() {
    const loop = (timestamp) => {
      if (!this.lastTime) this.lastTime = timestamp;
      const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05); // Cap delta to 50ms to prevent tunneling
      this.lastTime = timestamp;
      this.gameTime += dt;

      this.update(dt);
      this.render();

      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  update(dt) {
    const settings = StorageManager.getSettings();

    if (this.state === 'PLAYING') {
      // 1. Calculate progressive speed
      this.speed = this.levelMgr.calculateSpeed(this.score, settings.difficulty);

      // 2. Score progression (survival time + distance)
      const prevScore = this.score;
      this.score += dt * (this.speed * 2.2);

      // 3. Milestone Notification (every 500 points)
      if (Math.floor(this.score / 500) > Math.floor(prevScore / 500)) {
        this.sound.playBonus();
        this.showMilestoneToast('DISTANCE MILESTONE!', `${Math.floor(this.score / 500) * 500} METERS SURVIVED!`, '⭐');
      }

      // 4. Level & Environment Progression Detection
      const oldLevel = this.levelMgr.getLevelForScore(prevScore);
      const newLevel = this.levelMgr.getLevelForScore(this.score);

      if (newLevel.id !== oldLevel.id) {
        // Level up!
        this.bg.setEnvironment(newLevel.id - 1);
        this.sound.changeLevelMusic(newLevel.id);
        this.sound.playLevelUp();
        if (settings.particles) {
          this.particles.addConfetti(this.VIRTUAL_WIDTH, this.VIRTUAL_HEIGHT);
        }
        this.showMilestoneToast(
          `LEVEL UP: ${newLevel.name.toUpperCase()}!`,
          `Speed accelerated! New hazards incoming.`,
          newLevel.icon
        );
      }

      // Check real-time high score pass
      if (!this.isNewRecord && this.score > this.highScore && this.highScore > 0) {
        this.isNewRecord = true;
        this.sound.playBonus();
        this.showMilestoneToast('NEW RECORD!', 'You just set a new high score!', '🏆');
      }

      // 5. Update Background Parallax
      this.bg.update(dt, this.speed);

      // 6. Update Dino Player
      this.dino.update(dt, this.speed, (landX, landY) => {
        this.sound.playLand();
        if (settings.particles) {
          this.particles.addJumpBurst(landX, landY);
        }
      });

      // Dust puff while running
      if (this.dino.isGrounded && settings.particles) {
        if (this.dino.isDucking) {
          this.particles.addSlideDust(this.dino.x, this.GROUND_Y);
        } else if (Math.random() < 0.25) {
          this.particles.addRunDust(this.dino.x, this.GROUND_Y);
        }
      }

      // 7. Update Obstacles
      this.obstacles.update(
        dt,
        this.speed,
        newLevel.id,
        this.dino,
        (clearedObs) => {
          // Cleared obstacle bonus
          const bonus = 25;
          this.score += bonus;
          this.bonusScore += bonus;
        },
        (closeX, closeY) => {
          // "Close Call" reward
          const closeBonus = 100;
          this.score += closeBonus;
          this.bonusScore += closeBonus;
          this.sound.playBonus();
          this.addFloatingBonus('+100 CLOSE CALL!', closeX, closeY);
        }
      );

      // 8. Collision Check
      const collisionObs = this.obstacles.checkCollision(this.dino);
      if (collisionObs) {
        this.triggerGameOver(collisionObs);
      }

      // 9. Update Particles
      this.particles.update(dt);

      // 10. Update HUD UI
      this.updateUI();

    } else if (this.state === 'MENU' || this.state === 'COUNTDOWN' || this.state === 'GAMEOVER') {
      // Gentle ambient background scroll on menu or pause
      const idleSpeed = this.state === 'COUNTDOWN' ? 4 : 2;
      this.bg.update(dt, idleSpeed);

      if (this.state === 'MENU' || this.state === 'COUNTDOWN') {
        this.dino.update(dt, idleSpeed, null);
        if (Math.random() < 0.25 && settings.particles) {
          this.particles.addRunDust(this.dino.x, this.GROUND_Y);
        }
      }

      this.particles.update(dt);
    }
  }

  render() {
    this.ctx.clearRect(0, 0, this.VIRTUAL_WIDTH, this.VIRTUAL_HEIGHT);

    const curLvl = this.levelMgr.getLevelForScore(this.score);

    // 1. Draw Parallax Background
    this.bg.draw(this.ctx, this.gameTime);

    // 2. Draw Obstacles (when playing or game over)
    if (this.state !== 'MENU') {
      this.obstacles.draw(this.ctx, curLvl.id);
    }

    // 3. Draw Dino Character (attract mode in menu and during gameplay)
    this.dino.draw(this.ctx, curLvl.id);

    // 4. Draw Particles (dust, confetti, sparks, debris)
    this.particles.draw(this.ctx);
  }
}

// ============================================================================
// 9. GAME BOOTSTRAPPER
// ============================================================================

window.addEventListener('DOMContentLoaded', () => {
  window.dinoGame = new UltimateDinoGame();
});
