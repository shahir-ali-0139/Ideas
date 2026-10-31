/**
 * PAC-MAN Arcade Classic - Complete Game Engine
 * HTML5 Canvas, CSS3, Vanilla JavaScript
 * Zero external libraries or frameworks.
 */

'use strict';

/* ==========================================================================
   1. CONSTANTS, DIRECTION VECTORS & GAME TILES
   ========================================================================== */

const TILE_SIZE = 20;
const COLS = 28;
const ROWS = 31;
const CANVAS_WIDTH = COLS * TILE_SIZE;  // 560
const CANVAS_HEIGHT = ROWS * TILE_SIZE; // 620

const DIR_NONE  = { x: 0,  y: 0,  angle: 0 };
const DIR_UP    = { x: 0,  y: -1, angle: 1.5 * Math.PI };
const DIR_DOWN  = { x: 0,  y: 1,  angle: 0.5 * Math.PI };
const DIR_LEFT  = { x: -1, y: 0,  angle: Math.PI };
const DIR_RIGHT = { x: 1,  y: 0,  angle: 0 };

const TILE_EMPTY      = '_';
const TILE_WALL       = 'W';
const TILE_PELLET     = '.';
const TILE_ENERGIZER  = 'O';
const TILE_DOOR       = 'D';
const TILE_HOUSE      = 'H';
const TILE_TUNNEL     = 'T';

const GHOST_MODE_HOUSE      = 'HOUSE';
const GHOST_MODE_EXITING    = 'EXITING';
const GHOST_MODE_CHASE      = 'CHASE';
const GHOST_MODE_SCATTER    = 'SCATTER';
const GHOST_MODE_FRIGHTENED = 'FRIGHTENED';
const GHOST_MODE_EATEN      = 'EATEN';

const GAME_STATE_START       = 'START';
const GAME_STATE_READY       = 'READY';
const GAME_STATE_PLAYING     = 'PLAYING';
const GAME_STATE_DYING       = 'DYING';
const GAME_STATE_LEVEL_CLEAR = 'LEVEL_CLEAR';
const GAME_STATE_GAMEOVER    = 'GAMEOVER';
const GAME_STATE_PAUSED      = 'PAUSED';

// Classic 28x31 Pac-Man Maze Map
const MAZE_MAP_DATA = [
  'WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
  'W............WW............W',
  'W.WWWW.WWWWW.WW.WWWWW.WWWW.W',
  'WOWWWW.WWWWW.WW.WWWWW.WWWWOW',
  'W.WWWW.WWWWW.WW.WWWWW.WWWW.W',
  'W..........................W',
  'W.WWWW.WW.WWWWWWWW.WW.WWWW.W',
  'W.WWWW.WW.WWWWWWWW.WW.WWWW.W',
  'W......WW....WW....WW......W',
  'WWWWWW.WWWWW_WW_WWWWW.WWWWWW',
  '_____W.WWWWW_WW_WWWWW.W_____',
  '_____W.WW__________WW.W_____',
  '_____W.WW_WWWDDWWW_WW.W_____',
  'WWWWWW.WW_W______W_WW.WWWWWW',
  'TTTTTT.___W_HHHH_W___.TTTTTT',
  'WWWWWW.WW_W______W_WW.WWWWWW',
  '_____W.WW_WWWWWWWW_WW.W_____',
  '_____W.WW__________WW.W_____',
  '_____W.WW_WWWWWWWW_WW.W_____',
  'WWWWWW.WW_WWWWWWWW_WW.WWWWWW',
  'W............WW............W',
  'W.WWWW.WWWWW.WW.WWWWW.WWWW.W',
  'W.WWWW.WWWWW.WW.WWWWW.WWWW.W',
  'WO..WW.......__.......WW..OW',
  'WWW.WW.WW.WWWWWWWW.WW.WW.WWW',
  'WWW.WW.WW.WWWWWWWW.WW.WW.WWW',
  'W......WW....WW....WW......W',
  'W.WWWWWWWWWW.WW.WWWWWWWWWW.W',
  'W.WWWWWWWWWW.WW.WWWWWWWWWW.W',
  'W..........................W',
  'WWWWWWWWWWWWWWWWWWWWWWWWWWWW'
];

/* ==========================================================================
   2. STORAGE MANAGER (COOKIE-BASED STATS PERSISTENCE)
   ========================================================================== */

class StorageManager {
  constructor() {
    this.cookieKey = 'pacman_arcade_data';
    this.highScoreKey = 'pacman_high_score';
    this.defaultStats = {
      highestScore: 0,
      currentScore: 0,
      totalGamesPlayed: 0,
      highestLevelReached: 1
    };
    this.stats = this.loadStats();
  }

  isCookieAvailable() {
    try {
      return typeof navigator.cookieEnabled === 'boolean' ? navigator.cookieEnabled : true;
    } catch {
      return false;
    }
  }

  getCookie(name) {
    if (!this.isCookieAvailable()) return null;
    try {
      const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
      return match ? decodeURIComponent(match[1]) : null;
    } catch (e) {
      console.warn('Error reading cookie:', e);
      return null;
    }
  }

  setCookie(name, value, days = 365) {
    if (!this.isCookieAvailable()) return;
    try {
      const maxAge = days * 24 * 60 * 60;
      const isSecure = window.location.protocol === 'https:';
      const cookieStr = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax${isSecure ? '; Secure' : ''}`;
      document.cookie = cookieStr;
    } catch (e) {
      console.warn('Error setting cookie:', e);
    }
  }

  loadStats() {
    let parsed = null;
    const cookieData = this.getCookie(this.cookieKey);

    if (cookieData) {
      try {
        parsed = JSON.parse(cookieData);
      } catch (e) {
        console.warn('Could not parse cookie data:', e);
      }
    }

    // Fallback: check individual high score cookie
    if (!parsed) {
      const legacyHighScore = this.getCookie(this.highScoreKey);
      if (legacyHighScore) {
        parsed = { highestScore: parseInt(legacyHighScore, 10) || 0 };
      }
    }

    // LocalStorage fallback in case cookies are cleared or restricted
    if (!parsed) {
      try {
        const local = localStorage.getItem(this.cookieKey);
        if (local) parsed = JSON.parse(local);
      } catch (e) {}
    }

    const merged = Object.assign({}, this.defaultStats, parsed || {});
    // Ensure all numeric types
    merged.highestScore = Number(merged.highestScore) || 0;
    merged.currentScore = Number(merged.currentScore) || 0;
    merged.totalGamesPlayed = Number(merged.totalGamesPlayed) || 0;
    merged.highestLevelReached = Math.max(1, Number(merged.highestLevelReached) || 1);
    return merged;
  }

  saveStats() {
    const jsonStr = JSON.stringify(this.stats);
    this.setCookie(this.cookieKey, jsonStr);
    this.setCookie(this.highScoreKey, String(this.stats.highestScore));

    // Mirror to localStorage as backup
    try {
      localStorage.setItem(this.cookieKey, jsonStr);
    } catch (e) {}
  }

  recordGameStart() {
    this.stats.totalGamesPlayed++;
    this.saveStats();
  }

  recordLevelReached(level) {
    if (level > this.stats.highestLevelReached) {
      this.stats.highestLevelReached = level;
      this.saveStats();
    }
  }

  updateCurrentScore(score) {
    this.stats.currentScore = score;
    let isNewHigh = false;
    if (score > this.stats.highestScore) {
      this.stats.highestScore = score;
      isNewHigh = true;
    }
    this.saveStats();
    return isNewHigh;
  }

  resetAllStats() {
    this.stats = Object.assign({}, this.defaultStats);
    const isSecure = window.location.protocol === 'https:';
    if (this.isCookieAvailable()) {
      try {
        document.cookie = `${this.cookieKey}=; path=/; max-age=0; SameSite=Lax${isSecure ? '; Secure' : ''}`;
        document.cookie = `${this.highScoreKey}=; path=/; max-age=0; SameSite=Lax${isSecure ? '; Secure' : ''}`;
      } catch (e) {}
    }
    try {
      localStorage.removeItem(this.cookieKey);
    } catch (e) {}
    this.saveStats();
  }
}

/* ==========================================================================
   3. AUDIO MANAGER (WEB AUDIO API RETRO CHIPTUNE SYNTHESIZER)
   ========================================================================== */

class AudioManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.musicGain = null;

    this.sfxEnabled = true;
    this.musicEnabled = true;
    this.volume = 0.7; // 0.0 to 1.0

    this.isUnlocked = false;
    this.bgmTimer = null;
    this.bgmStep = 0;
    this.currentBgmType = null; // 'NORMAL', 'FRIGHTENED', 'EYES'
    this.lastWakaTime = 0;

    this.initAudioContext();
    this.registerAutoplayUnlock();
  }

  initAudioContext() {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
        this.masterGain = this.ctx.createGain();
        this.sfxGain = this.ctx.createGain();
        this.musicGain = this.ctx.createGain();

        this.sfxGain.connect(this.masterGain);
        this.musicGain.connect(this.masterGain);
        this.masterGain.connect(this.ctx.destination);

        this.setVolume(this.volume);
        this.updateGainStates();
      }
    } catch (e) {
      console.warn('Web Audio API not supported in this browser:', e);
    }
  }

  registerAutoplayUnlock() {
    const unlockHandler = () => {
      this.unlock();
      ['pointerdown', 'keydown', 'touchstart'].forEach(evt => {
        window.removeEventListener(evt, unlockHandler);
      });
    };
    ['pointerdown', 'keydown', 'touchstart'].forEach(evt => {
      window.addEventListener(evt, unlockHandler, { passive: true });
    });
  }

  unlock() {
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().then(() => {
        this.isUnlocked = true;
      }).catch(() => {});
    } else {
      this.isUnlocked = true;
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  toggleSfx() {
    this.sfxEnabled = !this.sfxEnabled;
    this.updateGainStates();
    return this.sfxEnabled;
  }

  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    this.updateGainStates();
    if (!this.musicEnabled) {
      this.stopBgm();
    }
    return this.musicEnabled;
  }

  updateGainStates() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    if (this.sfxGain) {
      this.sfxGain.gain.setValueAtTime(this.sfxEnabled ? 1 : 0, now);
    }
    if (this.musicGain) {
      this.musicGain.gain.setValueAtTime(this.musicEnabled ? 0.75 : 0, now);
    }
  }

  // --- Sound Effects Synthesizer Methods ---

  /**
   * Classic Waka-Waka alternating bite sound
   */
  playWaka(index) {
    if (!this.sfxEnabled || !this.ctx || this.ctx.state !== 'running') return;
    const now = this.ctx.currentTime;
    if (now - this.lastWakaTime < 0.08) return; // rate limit
    this.lastWakaTime = now;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      const isHigh = (index % 2 === 0);
      const startFreq = isHigh ? 480 : 380;
      const endFreq = isHigh ? 280 : 210;

      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.07);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.07);
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
    } catch (e) {}
  }

  /**
   * Power Pellet Energizer consumed sound
   */
  playPowerPellet() {
    if (!this.sfxEnabled || !this.ctx || this.ctx.state !== 'running') return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.28);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.45, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.28);
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
    } catch (e) {}
  }

  /**
   * Ghost Eaten rewarding 4-note ascending fanfare
   */
  playEatGhost() {
    if (!this.sfxEnabled || !this.ctx || this.ctx.state !== 'running') return;
    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      const noteLen = 0.055;

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const noteStart = now + idx * noteLen;

        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.001, noteStart);
        gain.gain.linearRampToValueAtTime(0.25, noteStart + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + noteLen);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(noteStart);
        osc.stop(noteStart + noteLen);
        osc.onended = () => {
          osc.disconnect();
          gain.disconnect();
        };
      });
    } catch (e) {}
  }

  /**
   * Fruit Eaten sparkle chime
   */
  playEatFruit() {
    if (!this.sfxEnabled || !this.ctx || this.ctx.state !== 'running') return;
    try {
      const now = this.ctx.currentTime;
      const notes = [784, 1318]; // G5, E6
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = now + idx * 0.08;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(0.3, start + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.12);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(start);
        osc.stop(start + 0.12);
        osc.onended = () => {
          osc.disconnect();
          gain.disconnect();
        };
      });
    } catch (e) {}
  }

  /**
   * Pac-Man Death crumbling pitch-bent chirp
   */
  playDeath() {
    if (!this.sfxEnabled || !this.ctx || this.ctx.state !== 'running') return;
    this.stopBgm();
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Pitch sweep
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 1.1);

      // Low pass filter to soften sawtooth
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.frequency.exponentialRampToValueAtTime(200, now + 1.1);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 1.1);
      osc.onended = () => {
        osc.disconnect();
        filter.disconnect();
        gain.disconnect();
      };
    } catch (e) {}
  }

  /**
   * Ready / Level Start introductory jingle
   */
  playReadyMelody() {
    if (!this.sfxEnabled || !this.ctx || this.ctx.state !== 'running') return;
    try {
      const now = this.ctx.currentTime;
      // Original 8-bit retro jingle
      const melody = [
        { f: 493.88, d: 0.10 }, // B4
        { f: 987.77, d: 0.10 }, // B5
        { f: 739.99, d: 0.10 }, // F#5
        { f: 622.25, d: 0.10 }, // D#5
        { f: 987.77, d: 0.12 }, // B5
        { f: 739.99, d: 0.18 }, // F#5
        { f: 622.25, d: 0.25 }, // D#5
        { f: 523.25, d: 0.10 }, // C5
        { f: 1046.5, d: 0.10 }, // C6
        { f: 783.99, d: 0.10 }, // G5
        { f: 659.25, d: 0.10 }, // E5
        { f: 1046.5, d: 0.12 }, // C6
        { f: 783.99, d: 0.18 }, // G5
        { f: 659.25, d: 0.35 }, // E5
      ];

      let t = now;
      melody.forEach(note => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.f, t);

        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.28, t + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, t + note.d);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(t);
        osc.stop(t + note.d);
        osc.onended = () => {
          osc.disconnect();
          gain.disconnect();
        };

        t += note.d * 1.05;
      });
    } catch (e) {}
  }

  /**
   * Level Complete victory fanfare
   */
  playLevelClear() {
    if (!this.sfxEnabled || !this.ctx || this.ctx.state !== 'running') return;
    this.stopBgm();
    try {
      const now = this.ctx.currentTime;
      const fanfare = [
        { f: 523.25, d: 0.12 }, // C5
        { f: 659.25, d: 0.12 }, // E5
        { f: 783.99, d: 0.12 }, // G5
        { f: 1046.5, d: 0.18 }, // C6
        { f: 880.00, d: 0.12 }, // A5
        { f: 1046.5, d: 0.12 }, // C6
        { f: 1174.6, d: 0.18 }, // D6
        { f: 1318.5, d: 0.45 }, // E6
      ];

      let t = now;
      fanfare.forEach(note => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(note.f, t);

        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.24, t + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, t + note.d);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(t);
        osc.stop(t + note.d);
        osc.onended = () => {
          osc.disconnect();
          gain.disconnect();
        };

        t += note.d * 1.08;
      });
    } catch (e) {}
  }

  /**
   * Game Over descending melancholy cadence
   */
  playGameOver() {
    if (!this.sfxEnabled || !this.ctx || this.ctx.state !== 'running') return;
    this.stopBgm();
    try {
      const now = this.ctx.currentTime;
      const notes = [
        { f: 440.0, d: 0.22 }, // A4
        { f: 415.3, d: 0.22 }, // G#4
        { f: 392.0, d: 0.25 }, // G4
        { f: 349.2, d: 0.45 }  // F4
      ];

      let t = now;
      notes.forEach(note => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(note.f, t);

        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.25, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + note.d);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(t);
        osc.stop(t + note.d);
        osc.onended = () => {
          osc.disconnect();
          gain.disconnect();
        };

        t += note.d * 1.1;
      });
    } catch (e) {}
  }

  /**
   * Extra Life Award Fanfare
   */
  playExtraLife() {
    if (!this.sfxEnabled || !this.ctx || this.ctx.state !== 'running') return;
    try {
      const now = this.ctx.currentTime;
      const notes = [659.25, 783.99, 987.77, 1318.5]; // E5, G5, B5, E6
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const t = now + idx * 0.07;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.35, t + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(t);
        osc.stop(t + 0.14);
      });
    } catch (e) {}
  }

  // --- Background Looping Music & Ambient Sirens ---

  /**
   * Starts or updates ambient arcade siren/music
   * @param {string} type 'NORMAL' | 'FRIGHTENED' | 'EYES'
   * @param {number} dotsRemaining Remaining dots (increases siren pitch as dots decrease)
   */
  startBgm(type = 'NORMAL', dotsRemaining = 244) {
    if (!this.musicEnabled || !this.ctx || this.ctx.state !== 'running') return;

    if (this.currentBgmType === type && this.bgmTimer) {
      // already playing this theme
      return;
    }

    this.stopBgm();
    this.currentBgmType = type;

    let intervalMs = 380;
    if (type === 'FRIGHTENED') intervalMs = 170;
    if (type === 'EYES') intervalMs = 120;

    this.bgmTimer = setInterval(() => {
      if (!this.musicEnabled || !this.ctx || this.ctx.state !== 'running') return;
      const now = this.ctx.currentTime;
      this.bgmStep = (this.bgmStep + 1) % 4;

      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        if (type === 'NORMAL') {
          // Tension pitch rises as pellets are consumed
          const dotRatio = Math.max(0, Math.min(1, 1 - (dotsRemaining / 244)));
          const baseFreq = 95 + dotRatio * 45;
          const freqs = [baseFreq, baseFreq * 1.15, baseFreq * 1.25, baseFreq * 1.15];
          const freq = freqs[this.bgmStep];

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(0.2, now + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

          osc.connect(gain);
          gain.connect(this.musicGain);

          osc.start(now);
          osc.stop(now + 0.3);
        } else if (type === 'FRIGHTENED') {
          // Rapid alternating alert sirens
          const freqs = [260, 340, 260, 390];
          const freq = freqs[this.bgmStep];

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

          osc.connect(gain);
          gain.connect(this.musicGain);

          osc.start(now);
          osc.stop(now + 0.14);
        } else if (type === 'EYES') {
          // Rapid radar ping
          const freq = (this.bgmStep % 2 === 0) ? 750 : 920;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(0.2, now + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

          osc.connect(gain);
          gain.connect(this.musicGain);

          osc.start(now);
          osc.stop(now + 0.09);
        }
      } catch (e) {}
    }, intervalMs);
  }

  stopBgm() {
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
    this.currentBgmType = null;
  }
}

/* ==========================================================================
   4. MAZE & TILE MAP MANAGER
   ========================================================================== */

class Maze {
  constructor() {
    this.grid = [];
    this.totalPellets = 0;
    this.pelletsRemaining = 0;
    this.energizers = [];
    this.loadGrid();
  }

  loadGrid() {
    this.grid = [];
    this.totalPellets = 0;
    this.energizers = [];

    for (let r = 0; r < ROWS; r++) {
      const rowStr = MAZE_MAP_DATA[r];
      const rowArr = [];
      for (let c = 0; c < COLS; c++) {
        const char = rowStr[c];
        rowArr.push(char);
        if (char === TILE_PELLET || char === TILE_ENERGIZER) {
          this.totalPellets++;
          if (char === TILE_ENERGIZER) {
            this.energizers.push({ x: c, y: r });
          }
        }
      }
      this.grid.push(rowArr);
    }
    this.pelletsRemaining = this.totalPellets;
  }

  reset() {
    this.loadGrid();
  }

  getCell(c, r) {
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return TILE_WALL;
    return this.grid[r][c];
  }

  setCell(c, r, val) {
    if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
      this.grid[r][c] = val;
    }
  }

  isWall(c, r) {
    const cell = this.getCell(c, r);
    return cell === TILE_WALL;
  }

  isWalkable(c, r, isGhost = false, isEaten = false) {
    // Warp tunnel row 14
    if (r === 14 && (c < 0 || c >= COLS)) {
      return true;
    }
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) {
      return false;
    }

    const cell = this.grid[r][c];
    if (cell === TILE_WALL) return false;

    // Ghost house door
    if (cell === TILE_DOOR) {
      return isGhost; // Only ghosts can pass through door
    }

    // Ghost house interior
    if (cell === TILE_HOUSE) {
      return isGhost; // Pac-Man cannot enter house
    }

    return true;
  }

  /**
   * Renders the classic glowing neon maze and pellets
   */
  draw(ctx, animTime) {
    ctx.save();

    // 1. Draw glowing blue maze walls
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = this.grid[r][c];
        const x = c * TILE_SIZE;
        const y = r * TILE_SIZE;

        if (cell === TILE_WALL) {
          // Draw wall block with subtle inner fill
          ctx.fillStyle = '#0a1226';
          ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

          // Check borders for outer stroke
          const up    = this.isWall(c, r - 1);
          const down  = this.isWall(c, r + 1);
          const left  = this.isWall(c - 1, r);
          const right = this.isWall(c + 1, r);

          ctx.shadowColor = '#0055ff';
          ctx.shadowBlur = 6;
          ctx.strokeStyle = '#2563eb';
          ctx.beginPath();

          if (!up) {
            ctx.moveTo(x, y);
            ctx.lineTo(x + TILE_SIZE, y);
          }
          if (!down) {
            ctx.moveTo(x, y + TILE_SIZE);
            ctx.lineTo(x + TILE_SIZE, y + TILE_SIZE);
          }
          if (!left) {
            ctx.moveTo(x, y);
            ctx.lineTo(x, y + TILE_SIZE);
          }
          if (!right) {
            ctx.moveTo(x + TILE_SIZE, y);
            ctx.lineTo(x + TILE_SIZE, y + TILE_SIZE);
          }
          ctx.stroke();

          // Subtle bright cyan inner pinstripe
          ctx.shadowBlur = 0;
          ctx.strokeStyle = '#60a5fa';
          ctx.lineWidth = 1;
          ctx.beginPath();
          if (!up) {
            ctx.moveTo(x + 1, y + 1);
            ctx.lineTo(x + TILE_SIZE - 1, y + 1);
          }
          if (!down) {
            ctx.moveTo(x + 1, y + TILE_SIZE - 1);
            ctx.lineTo(x + TILE_SIZE - 1, y + TILE_SIZE - 1);
          }
          if (!left) {
            ctx.moveTo(x + 1, y + 1);
            ctx.lineTo(x + 1, y + TILE_SIZE - 1);
          }
          if (!right) {
            ctx.moveTo(x + TILE_SIZE - 1, y + 1);
            ctx.lineTo(x + TILE_SIZE - 1, y + TILE_SIZE - 1);
          }
          ctx.stroke();
          ctx.lineWidth = 3;
        } else if (cell === TILE_DOOR) {
          // Ghost house door in glowing magenta/pink
          ctx.strokeStyle = '#ff77bb';
          ctx.shadowColor = '#ff55aa';
          ctx.shadowBlur = 8;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(x, y + TILE_SIZE / 2);
          ctx.lineTo(x + TILE_SIZE, y + TILE_SIZE / 2);
          ctx.stroke();
        }
      }
    }

    // 2. Draw normal pellets
    ctx.shadowBlur = 4;
    ctx.shadowColor = '#ffeaa7';
    ctx.fillStyle = '#ffeedd';

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (this.grid[r][c] === TILE_PELLET) {
          const cx = c * TILE_SIZE + TILE_SIZE / 2;
          const cy = r * TILE_SIZE + TILE_SIZE / 2;
          ctx.beginPath();
          ctx.arc(cx, cy, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // 3. Draw pulsing Energizers (Power Pellets)
    const energizerPulse = 0.8 + 0.3 * Math.sin(animTime * 9);
    ctx.shadowColor = '#ffbb00';
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#fbbf24';

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (this.grid[r][c] === TILE_ENERGIZER) {
          const cx = c * TILE_SIZE + TILE_SIZE / 2;
          const cy = r * TILE_SIZE + TILE_SIZE / 2;
          ctx.beginPath();
          ctx.arc(cx, cy, 7 * energizerPulse, 0, Math.PI * 2);
          ctx.fill();

          // Bright center highlight
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(cx, cy, 3 * energizerPulse, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fbbf24';
        }
      }
    }

    ctx.restore();
  }
}

/* ==========================================================================
   5. PAC-MAN CHARACTER CLASS
   ========================================================================== */

class Pacman {
  constructor(maze) {
    this.maze = maze;
    this.baseSpeed = 110; // pixels per second
    this.speed = this.baseSpeed;
    this.radius = 8.5;
    this.reset();
  }

  reset() {
    // Start centered at Row 23, Column 13.5
    this.x = 13.5 * TILE_SIZE + TILE_SIZE / 2;
    this.y = 23 * TILE_SIZE + TILE_SIZE / 2;
    this.dir = DIR_LEFT;
    this.nextDir = DIR_LEFT;
    this.mouthAngle = 0.2;
    this.mouthOpening = true;
    this.deathProgress = 0;
    this.isDead = false;
  }

  setDirection(newDir) {
    this.nextDir = newDir;
    // Immediate 180 turnaround allowed without waiting for intersection center
    if (this.dir !== DIR_NONE && newDir.x === -this.dir.x && newDir.y === -this.dir.y) {
      this.dir = newDir;
    }
  }

  getTileX() {
    return Math.floor(this.x / TILE_SIZE);
  }

  getTileY() {
    return Math.floor(this.y / TILE_SIZE);
  }

  update(dt, isFrightenedMode) {
    if (this.isDead) return;

    // Pac-Man speed boosts slightly in frightened mode
    this.speed = isFrightenedMode ? this.baseSpeed * 1.08 : this.baseSpeed;

    const currentTileX = Math.floor(this.x / TILE_SIZE);
    const currentTileY = Math.floor(this.y / TILE_SIZE);
    const centerTileX = currentTileX * TILE_SIZE + TILE_SIZE / 2;
    const centerTileY = currentTileY * TILE_SIZE + TILE_SIZE / 2;

    // Check pre-turn buffering / cornering
    if (this.nextDir !== this.dir && this.nextDir !== DIR_NONE) {
      // Check if turning in nextDir is legal from this tile
      const targetTileX = currentTileX + this.nextDir.x;
      const targetTileY = currentTileY + this.nextDir.y;

      if (this.maze.isWalkable(targetTileX, targetTileY, false, false)) {
        // Corner alignment tolerance
        const distFromCenter = Math.hypot(this.x - centerTileX, this.y - centerTileY);
        if (distFromCenter <= 7) {
          // Snap to corridor axis and take the turn smoothly
          this.x = centerTileX;
          this.y = centerTileY;
          this.dir = this.nextDir;
        }
      }
    }

    // Forward collision check
    if (this.dir !== DIR_NONE) {
      const nextTileX = currentTileX + this.dir.x;
      const nextTileY = currentTileY + this.dir.y;

      const approachingWall = !this.maze.isWalkable(nextTileX, nextTileY, false, false);

      if (approachingWall) {
        // Stop exactly at tile center
        if (this.dir.x > 0 && this.x >= centerTileX) { this.x = centerTileX; return; }
        if (this.dir.x < 0 && this.x <= centerTileX) { this.x = centerTileX; return; }
        if (this.dir.y > 0 && this.y >= centerTileY) { this.y = centerTileY; return; }
        if (this.dir.y < 0 && this.y <= centerTileY) { this.y = centerTileY; return; }
      }

      // Move forward
      this.x += this.dir.x * this.speed * dt;
      this.y += this.dir.y * this.speed * dt;

      // Animated mouth chomping
      if (this.mouthOpening) {
        this.mouthAngle += 2.8 * dt;
        if (this.mouthAngle >= 0.28) {
          this.mouthAngle = 0.28;
          this.mouthOpening = false;
        }
      } else {
        this.mouthAngle -= 2.8 * dt;
        if (this.mouthAngle <= 0.02) {
          this.mouthAngle = 0.02;
          this.mouthOpening = true;
        }
      }
    }

    // Tunnel wrap-around at Row 14
    if (currentTileY === 14) {
      if (this.x < -TILE_SIZE / 2) {
        this.x = CANVAS_WIDTH + TILE_SIZE / 2 - 2;
      } else if (this.x > CANVAS_WIDTH + TILE_SIZE / 2) {
        this.x = -TILE_SIZE / 2 + 2;
      }
    }
  }

  draw(ctx) {
    ctx.save();

    if (this.isDead) {
      // Death folding animation
      const angleSpan = this.deathProgress * Math.PI;
      ctx.fillStyle = '#ffe600';
      ctx.beginPath();
      ctx.arc(this.x, this.y, Math.max(0, this.radius * (1 - this.deathProgress * 0.4)), angleSpan, 2 * Math.PI - angleSpan);
      ctx.lineTo(this.x, this.y);
      ctx.fill();
      ctx.restore();
      return;
    }

    ctx.fillStyle = '#ffe600';
    ctx.shadowColor = '#ffe600';
    ctx.shadowBlur = 6;

    const baseAngle = this.dir.angle;
    const bite = this.mouthAngle * Math.PI;

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, baseAngle + bite, baseAngle + 2 * Math.PI - bite);
    ctx.lineTo(this.x, this.y);
    ctx.fill();

    // Subtle gloss highlight
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(this.x - 2, this.y - 2, this.radius * 0.35, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

/* ==========================================================================
   6. GHOST CHARACTER CLASS (BLINKY, PINKY, INKY, CLYDE)
   ========================================================================== */

class Ghost {
  constructor(name, color, scatterTile, homeTile, maze) {
    this.name = name;
    this.color = color;
    this.scatterTile = scatterTile;
    this.homeTile = homeTile;
    this.maze = maze;

    this.baseSpeed = 100; // pixels per second
    this.speed = this.baseSpeed;
    this.radius = 8.5;

    this.reset();
  }

  reset() {
    this.x = this.homeTile.x * TILE_SIZE + TILE_SIZE / 2;
    this.y = this.homeTile.y * TILE_SIZE + TILE_SIZE / 2;
    this.dir = DIR_UP;
    this.mode = GHOST_MODE_HOUSE;
    this.houseTimer = 0;
    this.houseExitDelay = this.getDefaultExitDelay();
    this.frightenedTimer = 0;
    this.frightenedDuration = 8;
    this.animStep = 0;
    this.isBlinking = false;
  }

  getDefaultExitDelay() {
    switch (this.name) {
      case 'BLINKY': return 0.2;
      case 'PINKY':  return 2.5;
      case 'INKY':   return 6.0;
      case 'CLYDE':  return 10.0;
      default:       return 0;
    }
  }

  getTileX() {
    return Math.floor(this.x / TILE_SIZE);
  }

  getTileY() {
    return Math.floor(this.y / TILE_SIZE);
  }

  makeFrightened(duration) {
    if (this.mode === GHOST_MODE_EATEN || this.mode === GHOST_MODE_HOUSE) return;
    this.mode = GHOST_MODE_FRIGHTENED;
    this.frightenedDuration = duration;
    this.frightenedTimer = duration;
    // Reverse direction immediately upon entering frightened mode
    if (this.dir === DIR_UP) this.dir = DIR_DOWN;
    else if (this.dir === DIR_DOWN) this.dir = DIR_UP;
    else if (this.dir === DIR_LEFT) this.dir = DIR_RIGHT;
    else if (this.dir === DIR_RIGHT) this.dir = DIR_LEFT;
  }

  /**
   * Determine target tile based on arcade personality
   */
  getTargetTile(pacman, blinky, globalMode, level) {
    if (this.mode === GHOST_MODE_EATEN) {
      // Target ghost house door to re-enter
      return { x: 13.5, y: 11 };
    }

    if (this.mode === GHOST_MODE_SCATTER || globalMode === GHOST_MODE_SCATTER) {
      return this.scatterTile;
    }

    const pacTileX = pacman.getTileX();
    const pacTileY = pacman.getTileY();
    const pacDir = pacman.dir;

    switch (this.name) {
      case 'BLINKY':
        // Aggressive chaser: targets Pac-Man's exact tile
        return { x: pacTileX, y: pacTileY };

      case 'PINKY':
        // Ambusher: targets 4 tiles ahead of Pac-Man
        return {
          x: pacTileX + pacDir.x * 4,
          y: pacTileY + pacDir.y * 4
        };

      case 'INKY': {
        // Flanker: vector from Blinky to 2 tiles ahead of Pac-Man, doubled
        const pivotX = pacTileX + pacDir.x * 2;
        const pivotY = pacTileY + pacDir.y * 2;
        const bX = blinky.getTileX();
        const bY = blinky.getTileY();
        return {
          x: bX + (pivotX - bX) * 2,
          y: bY + (pivotY - bY) * 2
        };
      }

      case 'CLYDE': {
        // Shifter / Coward: targets Pac-Man if distance >= 8, else retreats to scatter corner
        const myTileX = this.getTileX();
        const myTileY = this.getTileY();
        const dist = Math.hypot(myTileX - pacTileX, myTileY - pacTileY);
        return dist >= 8 ? { x: pacTileX, y: pacTileY } : this.scatterTile;
      }

      default:
        return { x: pacTileX, y: pacTileY };
    }
  }

  update(dt, pacman, blinky, globalMode, level, pelletsRemaining) {
    this.animStep += dt * 8;

    // 1. Ghost House state
    if (this.mode === GHOST_MODE_HOUSE) {
      this.houseTimer += dt;
      // Gentle bobbing motion in house
      this.y += Math.sin(this.animStep * 2) * 12 * dt;

      if (this.houseTimer >= this.houseExitDelay) {
        this.mode = GHOST_MODE_EXITING;
      }
      return;
    }

    // 2. Ghost Exiting House state
    if (this.mode === GHOST_MODE_EXITING) {
      const exitDoorX = 13.5 * TILE_SIZE + TILE_SIZE / 2;
      const exitDoorY = 11 * TILE_SIZE + TILE_SIZE / 2;

      // Move horizontally to door column
      if (Math.abs(this.x - exitDoorX) > 2) {
        this.x += Math.sign(exitDoorX - this.x) * 60 * dt;
      } else {
        this.x = exitDoorX;
        // Move vertically up through door
        if (this.y > exitDoorY) {
          this.y -= 70 * dt;
        } else {
          this.y = exitDoorY;
          this.mode = globalMode;
          this.dir = DIR_LEFT;
        }
      }
      return;
    }

    // 3. Speed calculation
    let currentSpeed = this.baseSpeed + (level - 1) * 3.5;

    // Blinky Cruise Elroy speed boost
    if (this.name === 'BLINKY' && this.mode === GHOST_MODE_CHASE) {
      if (pelletsRemaining < 15) currentSpeed *= 1.10;
      else if (pelletsRemaining < 30) currentSpeed *= 1.05;
    }

    // Tunnel slowdown
    const curTileY = this.getTileY();
    const curTileX = this.getTileX();
    if (curTileY === 14 && (curTileX <= 5 || curTileX >= 22)) {
      currentSpeed *= 0.5;
    }

    // Frightened mode slowdown & timer
    if (this.mode === GHOST_MODE_FRIGHTENED) {
      currentSpeed *= 0.6;
      this.frightenedTimer -= dt;
      this.isBlinking = this.frightenedTimer < 2.5 && (Math.floor(this.frightenedTimer * 5) % 2 === 0);

      if (this.frightenedTimer <= 0) {
        this.mode = globalMode;
      }
    }

    // Eaten mode (eyes only) double speed
    if (this.mode === GHOST_MODE_EATEN) {
      currentSpeed = this.baseSpeed * 2.1;
      // Reached ghost house entrance?
      const doorX = 13.5 * TILE_SIZE + TILE_SIZE / 2;
      const doorY = 11 * TILE_SIZE + TILE_SIZE / 2;
      if (Math.hypot(this.x - doorX, this.y - doorY) < 8) {
        // Drop into house and revive
        this.x = doorX;
        this.y = 14 * TILE_SIZE + TILE_SIZE / 2;
        this.mode = GHOST_MODE_EXITING;
        return;
      }
    }

    // 4. Movement & Intersection Navigation
    const centerTileX = curTileX * TILE_SIZE + TILE_SIZE / 2;
    const centerTileY = curTileY * TILE_SIZE + TILE_SIZE / 2;

    const distToCenter = Math.hypot(this.x - centerTileX, this.y - centerTileY);

    if (distToCenter < 4) {
      // Pick next direction at tile center
      const targetTile = this.getTargetTile(pacman, blinky, globalMode, level);
      const possibleDirs = [DIR_UP, DIR_LEFT, DIR_DOWN, DIR_RIGHT];

      // Reverse direction is not allowed at intersections
      const oppositeDir = { x: -this.dir.x, y: -this.dir.y };

      const validDirs = possibleDirs.filter(d => {
        if (d.x === oppositeDir.x && d.y === oppositeDir.y) return false;
        const nextX = curTileX + d.x;
        const nextY = curTileY + d.y;
        return this.maze.isWalkable(nextX, nextY, true, this.mode === GHOST_MODE_EATEN);
      });

      if (validDirs.length > 0) {
        if (this.mode === GHOST_MODE_FRIGHTENED) {
          // Random direction in frightened mode
          const randIdx = Math.floor(Math.random() * validDirs.length);
          this.dir = validDirs[randIdx];
        } else {
          // Greedy shortest distance to target
          let bestDir = validDirs[0];
          let bestDist = Infinity;

          validDirs.forEach(d => {
            const nextX = curTileX + d.x;
            const nextY = curTileY + d.y;
            const dist = Math.hypot(nextX - targetTile.x, nextY - targetTile.y);
            if (dist < bestDist) {
              bestDist = dist;
              bestDir = d;
            }
          });

          this.dir = bestDir;
        }
      }
    }

    // Move forward
    this.x += this.dir.x * currentSpeed * dt;
    this.y += this.dir.y * currentSpeed * dt;

    // Tunnel wrap-around at Row 14
    if (curTileY === 14) {
      if (this.x < -TILE_SIZE / 2) {
        this.x = CANVAS_WIDTH + TILE_SIZE / 2 - 2;
      } else if (this.x > CANVAS_WIDTH + TILE_SIZE / 2) {
        this.x = -TILE_SIZE / 2 + 2;
      }
    }
  }

  draw(ctx) {
    ctx.save();

    const cx = this.x;
    const cy = this.y;
    const r = this.radius;

    // If Eaten: Only draw eyes
    if (this.mode === GHOST_MODE_EATEN) {
      this.drawEyes(ctx, cx, cy, r);
      ctx.restore();
      return;
    }

    // Body Color
    let bodyColor = this.color;
    if (this.mode === GHOST_MODE_FRIGHTENED) {
      bodyColor = this.isBlinking ? '#ffffff' : '#2563eb';
    }

    ctx.fillStyle = bodyColor;
    ctx.shadowColor = bodyColor;
    ctx.shadowBlur = 6;

    // --- Draw Classic Ghost Dome & Skirt ---
    ctx.beginPath();
    // Dome top
    ctx.arc(cx, cy - 1, r, Math.PI, 0, false);
    // Right side
    ctx.lineTo(cx + r, cy + r - 2);

    // Animated 3-wave wavy skirt feet
    const waveOffset = Math.sin(this.animStep) * 2;
    const waveWidth = (r * 2) / 3;

    for (let i = 2; i >= 0; i--) {
      const wx = cx - r + i * waveWidth;
      const bottomY = cy + r - ((i % 2 === 0) ? waveOffset : -waveOffset);
      ctx.quadraticCurveTo(wx + waveWidth * 0.5, bottomY + 3, wx, cy + r - 2);
    }

    // Left side
    ctx.lineTo(cx - r, cy - 1);
    ctx.closePath();
    ctx.fill();

    // Eyes & Face
    if (this.mode === GHOST_MODE_FRIGHTENED) {
      // Frightened face: small dots + squiggly mouth
      ctx.fillStyle = this.isBlinking ? '#ef4444' : '#ffeedd';
      ctx.beginPath();
      ctx.arc(cx - 3, cy - 2, 1.8, 0, Math.PI * 2);
      ctx.arc(cx + 3, cy - 2, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Squiggly mouth
      ctx.strokeStyle = this.isBlinking ? '#ef4444' : '#ffeedd';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx - 4, cy + 3);
      ctx.lineTo(cx - 2, cy + 1.5);
      ctx.lineTo(cx, cy + 3);
      ctx.lineTo(cx + 2, cy + 1.5);
      ctx.lineTo(cx + 4, cy + 3);
      ctx.stroke();
    } else {
      this.drawEyes(ctx, cx, cy, r);
    }

    ctx.restore();
  }

  drawEyes(ctx, cx, cy, r) {
    // Eye whites
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 0;

    const eyeOffset = 3.5;
    const eyeRadiusX = 2.8;
    const eyeRadiusY = 3.8;

    // Pupil look direction
    const pupilDx = this.dir.x * 1.5;
    const pupilDy = this.dir.y * 1.5;

    // Left eye white
    ctx.beginPath();
    ctx.ellipse(cx - eyeOffset, cy - 2, eyeRadiusX, eyeRadiusY, 0, 0, Math.PI * 2);
    ctx.fill();

    // Right eye white
    ctx.beginPath();
    ctx.ellipse(cx + eyeOffset, cy - 2, eyeRadiusX, eyeRadiusY, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pupils (deep blue)
    ctx.fillStyle = '#0022cc';
    ctx.beginPath();
    ctx.arc(cx - eyeOffset + pupilDx, cy - 2 + pupilDy, 1.6, 0, Math.PI * 2);
    ctx.arc(cx + eyeOffset + pupilDx, cy - 2 + pupilDy, 1.6, 0, Math.PI * 2);
    ctx.fill();
  }
}

/* ==========================================================================
   7. BONUS FRUIT & FLOATING SCORE POPUPS
   ========================================================================== */

class Fruit {
  constructor() {
    this.x = 13.5 * TILE_SIZE + TILE_SIZE / 2;
    this.y = 17 * TILE_SIZE + TILE_SIZE / 2;
    this.active = false;
    this.timer = 0;
    this.duration = 10; // stays for 10 seconds
    this.points = 100;
    this.level = 1;
  }

  spawn(level) {
    this.level = level;
    this.active = true;
    this.timer = this.duration;

    // Points scale with level
    switch (level) {
      case 1:  this.points = 100; break;  // Cherry
      case 2:  this.points = 300; break;  // Strawberry
      case 3:  this.points = 500; break;  // Orange
      case 4:  this.points = 700; break;  // Apple
      default: this.points = 1000; break; // Melon
    }
  }

  update(dt) {
    if (!this.active) return;
    this.timer -= dt;
    if (this.timer <= 0) {
      this.active = false;
    }
  }

  draw(ctx) {
    if (!this.active) return;
    ctx.save();

    const cx = this.x;
    const cy = this.y;

    // Draw Cherry
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 6;

    // Two red cherries
    ctx.beginPath();
    ctx.arc(cx - 3, cy + 2, 4, 0, Math.PI * 2);
    ctx.arc(cx + 4, cy + 3, 3.8, 0, Math.PI * 2);
    ctx.fill();

    // Green stems
    ctx.strokeStyle = '#22c55e';
    ctx.shadowBlur = 0;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - 3, cy);
    ctx.quadraticCurveTo(cx - 1, cy - 5, cx + 1, cy - 6);
    ctx.moveTo(cx + 4, cy + 1);
    ctx.quadraticCurveTo(cx + 2, cy - 4, cx + 1, cy - 6);
    ctx.stroke();

    ctx.restore();
  }
}

class FloatingText {
  constructor(text, x, y, color = '#00ffff') {
    this.text = text;
    this.x = x;
    this.y = y;
    this.color = color;
    this.life = 1.0; // 1 second duration
    this.maxLife = 1.0;
  }

  update(dt) {
    this.life -= dt;
    this.y -= 18 * dt; // floats up
  }

  draw(ctx) {
    if (this.life <= 0) return;
    ctx.save();
    const alpha = Math.max(0, this.life / this.maxLife);
    ctx.globalAlpha = alpha;
    ctx.font = '9px "Press Start 2P", monospace';
    ctx.fillStyle = this.color;
    ctx.textAlign = 'center';
    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
  }
}

/* ==========================================================================
   8. MAIN GAME CONTROLLER CLASS
   ========================================================================== */

class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');

    this.storage = new StorageManager();
    this.audio = new AudioManager();
    this.maze = new Maze();
    this.pacman = new Pacman(this.maze);
    this.fruit = new Fruit();

    this.ghosts = [
      new Ghost('BLINKY', '#ff0000', { x: 26, y: -2 }, { x: 13.5, y: 11 }, this.maze),
      new Ghost('PINKY',  '#ffb8de', { x: 1,  y: -2 }, { x: 13.5, y: 14 }, this.maze),
      new Ghost('INKY',   '#00ffff', { x: 27, y: 32 }, { x: 11.5, y: 14 }, this.maze),
      new Ghost('CLYDE',  '#ffb847', { x: 0,  y: 32 }, { x: 15.5, y: 14 }, this.maze)
    ];

    this.floatingTexts = [];

    // Game Progression & States
    this.state = GAME_STATE_START;
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.dotsEatenThisLevel = 0;
    this.ghostCombo = 0;
    this.extraLifeAwarded = false;

    // Mode Timers (Scatter vs Chase wave schedule)
    this.globalGhostMode = GHOST_MODE_SCATTER;
    this.waveTimer = 0;
    this.waveScheduleIndex = 0;
    this.stateTimer = 0;
    this.lastFrameTime = performance.now();
    this.animTime = 0;

    // Cache DOM Elements
    this.dom = {
      score: document.getElementById('current-score'),
      highScore: document.getElementById('high-score'),
      finalScore: document.getElementById('final-score'),
      finalLevel: document.getElementById('final-level'),
      newHighScoreMsg: document.getElementById('new-high-score-msg'),
      levelIndicator: document.getElementById('level-indicator'),
      fruitIndicator: document.getElementById('fruit-indicator'),
      livesIcons: document.getElementById('lives-icons'),
      startScreen: document.getElementById('start-screen'),
      readyBanner: document.getElementById('ready-banner'),
      pauseScreen: document.getElementById('pause-screen'),
      levelClearScreen: document.getElementById('level-clear-screen'),
      gameOverScreen: document.getElementById('game-over-screen'),
      clearLevelText: document.getElementById('clear-level-text'),
      clearBonusText: document.getElementById('clear-bonus-text'),
      volumeSlider: document.getElementById('volume-slider'),
      volumeText: document.getElementById('volume-text'),
      btnSfx: document.getElementById('btn-toggle-sfx'),
      btnMusic: document.getElementById('btn-toggle-music'),
      sfxIcon: document.getElementById('sfx-icon'),
      musicIcon: document.getElementById('music-icon'),
      statsDialog: document.getElementById('stats-dialog'),
      helpDialog: document.getElementById('help-dialog'),
      cookieHighScore: document.getElementById('cookie-high-score'),
      cookieCurrentScore: document.getElementById('cookie-current-score'),
      cookieGamesPlayed: document.getElementById('cookie-games-played'),
      cookieMaxLevel: document.getElementById('cookie-max-level'),
      cookieStatus: document.getElementById('cookie-status')
    };

    this.initCanvasDPR();
    this.setupEventListeners();
    this.updateHUD();
    this.updateStatsModalData();

    // Start requestAnimationFrame loop
    requestAnimationFrame((t) => this.loop(t));
  }

  initCanvasDPR() {
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    this.canvas.width = CANVAS_WIDTH * dpr;
    this.canvas.height = CANVAS_HEIGHT * dpr;
    this.ctx.resetTransform();
    this.ctx.scale(dpr, dpr);
  }

  setupEventListeners() {
    // Window Resize / Orientation Change
    window.addEventListener('resize', () => {
      this.initCanvasDPR();
    });

    // Desktop Keyboard Controls
    window.addEventListener('keydown', (e) => {
      this.audio.unlock();

      // Prevent page scrolling on game controls
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }

      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
          this.pacman.setDirection(DIR_UP);
          break;
        case 'ArrowDown':
        case 'KeyS':
          this.pacman.setDirection(DIR_DOWN);
          break;
        case 'ArrowLeft':
        case 'KeyA':
          this.pacman.setDirection(DIR_LEFT);
          break;
        case 'ArrowRight':
        case 'KeyD':
          this.pacman.setDirection(DIR_RIGHT);
          break;
        case 'KeyP':
        case 'Escape':
          this.togglePause();
          break;
        case 'KeyM':
          this.toggleMusic();
          break;
        case 'Space':
        case 'Enter':
          if (this.state === GAME_STATE_START) this.startNewGame();
          else if (this.state === GAME_STATE_GAMEOVER) this.startNewGame();
          else if (this.state === GAME_STATE_LEVEL_CLEAR) this.startNextLevel();
          break;
      }
    });

    // --- Mobile & Tablet Full-Gesture Swipe Controls (No Buttons) ---
    const swipeArrows = {
      UP: document.getElementById('swipe-arrow-up'),
      DOWN: document.getElementById('swipe-arrow-down'),
      LEFT: document.getElementById('swipe-arrow-left'),
      RIGHT: document.getElementById('swipe-arrow-right')
    };
    const swipeTouchZone = document.getElementById('swipe-touch-zone');
    const swipePanel = document.getElementById('swipe-panel');
    const canvasWrap = document.getElementById('canvas-wrapper');

    const flashSwipeArrow = (dirKey) => {
      Object.keys(swipeArrows).forEach(k => {
        if (swipeArrows[k]) swipeArrows[k].classList.remove('active');
      });
      const targetArrow = swipeArrows[dirKey];
      if (targetArrow) {
        targetArrow.classList.add('active');
        clearTimeout(targetArrow._timer);
        targetArrow._timer = setTimeout(() => {
          targetArrow.classList.remove('active');
        }, 220);
      }
    };

    let touchStartX = 0;
    let touchStartY = 0;
    let isTouchActive = false;
    const swipeThreshold = 14; // pixels to trigger turn

    const processSwipeGesture = (dx, dy) => {
      if (Math.hypot(dx, dy) < swipeThreshold) return false;

      let dirKey = '';
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) {
          this.pacman.setDirection(DIR_RIGHT);
          dirKey = 'RIGHT';
        } else {
          this.pacman.setDirection(DIR_LEFT);
          dirKey = 'LEFT';
        }
      } else {
        if (dy > 0) {
          this.pacman.setDirection(DIR_DOWN);
          dirKey = 'DOWN';
        } else {
          this.pacman.setDirection(DIR_UP);
          dirKey = 'UP';
        }
      }

      flashSwipeArrow(dirKey);
      if (navigator.vibrate) {
        try { navigator.vibrate(15); } catch (e) {}
      }
      return true;
    };

    // Attach touch listeners to canvas container and swipe panel
    const touchZones = [canvasWrap, swipePanel, this.canvas].filter(Boolean);

    touchZones.forEach(zone => {
      zone.addEventListener('touchstart', (e) => {
        this.audio.unlock();
        if (e.touches.length > 0) {
          isTouchActive = true;
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
          if (swipeTouchZone) swipeTouchZone.classList.add('swiping');
        }
      }, { passive: true });

      zone.addEventListener('touchmove', (e) => {
        // Prevent all unwanted mobile scrolling, gestures, and pull-to-refresh
        e.preventDefault();
        if (!isTouchActive || e.touches.length === 0) return;

        const curX = e.touches[0].clientX;
        const curY = e.touches[0].clientY;
        const dx = curX - touchStartX;
        const dy = curY - touchStartY;

        // Continuous steering: change direction and reset anchor for next turn
        if (processSwipeGesture(dx, dy)) {
          touchStartX = curX;
          touchStartY = curY;
        }
      }, { passive: false });

      zone.addEventListener('touchend', (e) => {
        if (!isTouchActive) return;
        isTouchActive = false;
        if (swipeTouchZone) swipeTouchZone.classList.remove('swiping');

        if (e.changedTouches.length > 0) {
          const dx = e.changedTouches[0].clientX - touchStartX;
          const dy = e.changedTouches[0].clientY - touchStartY;
          processSwipeGesture(dx, dy);
        }
      }, { passive: true });

      zone.addEventListener('touchcancel', () => {
        isTouchActive = false;
        if (swipeTouchZone) swipeTouchZone.classList.remove('swiping');
      }, { passive: true });
    });

    // Also support mouse drag swipe in DevTools / desktop
    let isMouseDown = false;
    let mouseStartX = 0;
    let mouseStartY = 0;

    canvasWrap.addEventListener('mousedown', (e) => {
      this.audio.unlock();
      isMouseDown = true;
      mouseStartX = e.clientX;
      mouseStartY = e.clientY;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isMouseDown) return;
      const dx = e.clientX - mouseStartX;
      const dy = e.clientY - mouseStartY;
      if (processSwipeGesture(dx, dy)) {
        mouseStartX = e.clientX;
        mouseStartY = e.clientY;
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (!isMouseDown) return;
      isMouseDown = false;
      const dx = e.clientX - mouseStartX;
      const dy = e.clientY - mouseStartY;
      processSwipeGesture(dx, dy);
    });

    // Buttons & UI Controls
    document.getElementById('btn-play').addEventListener('click', () => {
      this.audio.unlock();
      this.startNewGame();
    });

    document.getElementById('btn-play-again').addEventListener('click', () => {
      this.audio.unlock();
      this.startNewGame();
    });

    document.getElementById('btn-next-level').addEventListener('click', () => {
      this.audio.unlock();
      this.startNextLevel();
    });

    document.getElementById('btn-pause').addEventListener('click', () => this.togglePause());
    document.getElementById('btn-resume').addEventListener('click', () => this.togglePause());

    document.getElementById('btn-restart').addEventListener('click', () => {
      if (confirm('Restart current game?')) {
        this.startNewGame();
      }
    });

    document.getElementById('btn-restart-from-pause').addEventListener('click', () => {
      this.togglePause();
      this.startNewGame();
    });

    // Audio Buttons
    this.dom.btnSfx.addEventListener('click', () => this.toggleSfx());
    this.dom.btnMusic.addEventListener('click', () => this.toggleMusic());

    this.dom.volumeSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      this.dom.volumeText.textContent = `${val}%`;
      this.audio.setVolume(val / 100);
    });

    // Dialog Modal Openers
    const openStatsBtn = document.getElementById('btn-open-stats');
    const viewStatsBtn = document.getElementById('btn-view-stats');
    const openHelpBtn = document.getElementById('btn-open-help');
    const howToPlayBtn = document.getElementById('btn-how-to-play');

    const showStatsModal = () => {
      this.updateStatsModalData();
      if (this.dom.statsDialog.showModal) {
        this.dom.statsDialog.showModal();
      }
    };

    const showHelpModal = () => {
      if (this.dom.helpDialog.showModal) {
        this.dom.helpDialog.showModal();
      }
    };

    openStatsBtn.addEventListener('click', showStatsModal);
    viewStatsBtn.addEventListener('click', showStatsModal);
    openHelpBtn.addEventListener('click', showHelpModal);
    howToPlayBtn.addEventListener('click', showHelpModal);

    // Reset Saved Statistics
    document.getElementById('btn-reset-cookie-stats').addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all saved records and statistics?')) {
        this.storage.resetAllStats();
        this.updateHUD();
        this.updateStatsModalData();
        alert('Statistics have been reset to 0.');
      }
    });

    // Modern Web Guidance: Dialog Light-Dismiss Fallback
    const setupDialogLightDismiss = (dialog) => {
      let pressedOutside = false;
      const isOutside = (e) => {
        const r = dialog.getBoundingClientRect();
        return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      };
      dialog.addEventListener('pointerdown', (e) => {
        pressedOutside = isOutside(e);
      });
      dialog.addEventListener('pointerup', (e) => {
        if (pressedOutside && isOutside(e)) {
          dialog.close();
        }
      });
    };

    setupDialogLightDismiss(this.dom.statsDialog);
    setupDialogLightDismiss(this.dom.helpDialog);
  }

  togglePause() {
    if (this.state === GAME_STATE_PLAYING) {
      this.state = GAME_STATE_PAUSED;
      this.audio.stopBgm();
      this.dom.pauseScreen.classList.remove('hidden');
      this.dom.pauseScreen.classList.add('active');
    } else if (this.state === GAME_STATE_PAUSED) {
      this.state = GAME_STATE_PLAYING;
      this.dom.pauseScreen.classList.remove('active');
      this.dom.pauseScreen.classList.add('hidden');
      this.audio.startBgm('NORMAL', this.maze.pelletsRemaining);
    }
  }

  toggleSfx() {
    const isEnabled = this.audio.toggleSfx();
    this.dom.btnSfx.classList.toggle('active-off', !isEnabled);
    this.dom.sfxIcon.textContent = isEnabled ? '🔊' : '🔇';
  }

  toggleMusic() {
    const isEnabled = this.audio.toggleMusic();
    this.dom.btnMusic.classList.toggle('active-off', !isEnabled);
    this.dom.musicIcon.textContent = isEnabled ? '🎵' : '🔇';
    if (isEnabled && this.state === GAME_STATE_PLAYING) {
      this.audio.startBgm('NORMAL', this.maze.pelletsRemaining);
    }
  }

  updateStatsModalData() {
    const stats = this.storage.stats;
    this.dom.cookieHighScore.textContent = String(stats.highestScore).padStart(2, '0');
    this.dom.cookieCurrentScore.textContent = String(stats.currentScore).padStart(2, '0');
    this.dom.cookieGamesPlayed.textContent = String(stats.totalGamesPlayed);
    this.dom.cookieMaxLevel.textContent = String(stats.highestLevelReached);
    this.dom.cookieStatus.textContent = this.storage.isCookieAvailable() ? 'ACTIVE (LAX/SECURE)' : 'FALLBACK MEMORY';
  }

  updateHUD() {
    this.dom.score.textContent = String(this.score).padStart(2, '0');
    this.dom.highScore.textContent = String(this.storage.stats.highestScore).padStart(2, '0');
    this.dom.levelIndicator.textContent = String(this.level);

    // Render Mini Pac-Man Lives Icons
    this.dom.livesIcons.innerHTML = '';
    for (let i = 0; i < this.lives; i++) {
      const span = document.createElement('span');
      span.className = 'life-icon';
      this.dom.livesIcons.appendChild(span);
    }

    // Update Fruit Icon Title
    this.dom.fruitIndicator.title = `Level ${this.level} Bonus Fruit`;
  }

  startNewGame() {
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.extraLifeAwarded = false;
    this.storage.recordGameStart();
    this.storage.recordLevelReached(this.level);

    // Hide all overlay screens
    this.hideAllOverlays();

    this.maze.reset();
    this.startLevelSequence();
  }

  startNextLevel() {
    this.level++;
    this.storage.recordLevelReached(this.level);

    this.hideAllOverlays();
    this.maze.reset();
    this.startLevelSequence();
  }

  startLevelSequence() {
    this.dotsEatenThisLevel = 0;
    this.ghostCombo = 0;
    this.waveScheduleIndex = 0;
    this.waveTimer = 0;
    this.globalGhostMode = GHOST_MODE_SCATTER;

    this.pacman.reset();
    this.ghosts.forEach(g => g.reset());
    this.fruit.active = false;
    this.floatingTexts = [];

    this.state = GAME_STATE_READY;
    this.stateTimer = 2.4; // 2.4s READY! pause
    this.dom.readyBanner.classList.remove('hidden');

    this.audio.playReadyMelody();
    this.updateHUD();
  }

  hideAllOverlays() {
    this.dom.startScreen.classList.remove('active');
    this.dom.startScreen.classList.add('hidden');
    this.dom.pauseScreen.classList.remove('active');
    this.dom.pauseScreen.classList.add('hidden');
    this.dom.levelClearScreen.classList.remove('active');
    this.dom.levelClearScreen.classList.add('hidden');
    this.dom.gameOverScreen.classList.remove('active');
    this.dom.gameOverScreen.classList.add('hidden');
    this.dom.readyBanner.classList.add('hidden');
  }

  // --- Main Animation & Logic Loop ---

  loop(currentTime) {
    const rawDt = (currentTime - this.lastFrameTime) / 1000;
    this.lastFrameTime = currentTime;

    // Clamp dt to prevent tunneling or physics explosion on lag/tab focus
    const dt = Math.min(rawDt, 0.05);
    this.animTime += dt;

    this.update(dt);
    this.render();

    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    // 1. Ready State (Countdown before round begins)
    if (this.state === GAME_STATE_READY) {
      this.stateTimer -= dt;
      if (this.stateTimer <= 0) {
        this.state = GAME_STATE_PLAYING;
        this.dom.readyBanner.classList.add('hidden');
        this.audio.startBgm('NORMAL', this.maze.pelletsRemaining);
      }
      return;
    }

    // 2. Pac-Man Dying State
    if (this.state === GAME_STATE_DYING) {
      this.stateTimer -= dt;
      this.pacman.deathProgress = 1 - (this.stateTimer / 1.3);

      if (this.stateTimer <= 0) {
        this.lives--;
        this.updateHUD();

        if (this.lives > 0) {
          // Restart life
          this.pacman.reset();
          this.ghosts.forEach(g => g.reset());
          this.state = GAME_STATE_READY;
          this.stateTimer = 1.8;
          this.dom.readyBanner.classList.remove('hidden');
        } else {
          // Game Over!
          this.state = GAME_STATE_GAMEOVER;
          this.audio.playGameOver();
          const isNewHigh = this.storage.updateCurrentScore(this.score);

          this.dom.finalScore.textContent = String(this.score);
          this.dom.finalLevel.textContent = String(this.level);
          this.dom.newHighScoreMsg.classList.toggle('hidden', !isNewHigh);

          this.dom.gameOverScreen.classList.remove('hidden');
          this.dom.gameOverScreen.classList.add('active');
          this.updateHUD();
          this.updateStatsModalData();
        }
      }
      return;
    }

    // 3. Level Clear State
    if (this.state === GAME_STATE_LEVEL_CLEAR) {
      this.stateTimer -= dt;
      if (this.stateTimer <= 0) {
        this.dom.clearLevelText.textContent = `LEVEL ${this.level} COMPLETED`;
        this.dom.clearBonusText.textContent = `+${500 * this.level} BONUS POINTS`;
        this.dom.levelClearScreen.classList.remove('hidden');
        this.dom.levelClearScreen.classList.add('active');
      }
      return;
    }

    // 4. Playing State
    if (this.state !== GAME_STATE_PLAYING) return;

    // Check Frightened Status across ghosts
    const isAnyFrightened = this.ghosts.some(g => g.mode === GHOST_MODE_FRIGHTENED);
    const isAnyEaten = this.ghosts.some(g => g.mode === GHOST_MODE_EATEN);

    if (isAnyEaten) {
      this.audio.startBgm('EYES');
    } else if (isAnyFrightened) {
      this.audio.startBgm('FRIGHTENED');
    } else {
      this.audio.startBgm('NORMAL', this.maze.pelletsRemaining);
    }

    // Ghost Scatter / Chase Wave Timers
    if (!isAnyFrightened) {
      this.waveTimer += dt;
      // Standard wave schedule: Scatter 7s, Chase 20s, Scatter 7s, Chase 20s, Scatter 5s, Chase...
      const currentWaveDuration = (this.globalGhostMode === GHOST_MODE_SCATTER) ? 7 : 20;
      if (this.waveTimer >= currentWaveDuration) {
        this.waveTimer = 0;
        this.globalGhostMode = (this.globalGhostMode === GHOST_MODE_SCATTER) ? GHOST_MODE_CHASE : GHOST_MODE_SCATTER;

        // Ghosts reverse direction on wave transition
        this.ghosts.forEach(g => {
          if (g.mode === GHOST_MODE_CHASE || g.mode === GHOST_MODE_SCATTER) {
            g.mode = this.globalGhostMode;
            if (g.dir === DIR_UP) g.dir = DIR_DOWN;
            else if (g.dir === DIR_DOWN) g.dir = DIR_UP;
            else if (g.dir === DIR_LEFT) g.dir = DIR_RIGHT;
            else if (g.dir === DIR_RIGHT) g.dir = DIR_LEFT;
          }
        });
      }
    }

    // Update Pac-Man
    this.pacman.update(dt, isAnyFrightened);

    // Pac-Man Pellet & Energizer Eating Check
    const pTileX = this.pacman.getTileX();
    const pTileY = this.pacman.getTileY();
    const currentCell = this.maze.getCell(pTileX, pTileY);

    if (currentCell === TILE_PELLET) {
      this.maze.setCell(pTileX, pTileY, TILE_EMPTY);
      this.maze.pelletsRemaining--;
      this.dotsEatenThisLevel++;
      this.addScore(10);
      this.audio.playWaka(this.dotsEatenThisLevel);

      // Check Bonus Fruit Spawns at 70 and 170 dots
      if (this.dotsEatenThisLevel === 70 || this.dotsEatenThisLevel === 170) {
        this.fruit.spawn(this.level);
      }

      // Check Level Clear
      if (this.maze.pelletsRemaining <= 0) {
        this.handleLevelClear();
        return;
      }
    } else if (currentCell === TILE_ENERGIZER) {
      this.maze.setCell(pTileX, pTileY, TILE_EMPTY);
      this.maze.pelletsRemaining--;
      this.dotsEatenThisLevel++;
      this.addScore(50);
      this.audio.playPowerPellet();

      // Trigger Frightened Mode for ghosts
      const frightenedDuration = Math.max(2.5, 8.5 - (this.level - 1) * 1.4);
      this.ghostCombo = 0;
      this.ghosts.forEach(g => g.makeFrightened(frightenedDuration));

      if (this.maze.pelletsRemaining <= 0) {
        this.handleLevelClear();
        return;
      }
    }

    // Check Bonus Fruit Collision
    if (this.fruit.active) {
      this.fruit.update(dt);
      const fruitDist = Math.hypot(this.pacman.x - this.fruit.x, this.pacman.y - this.fruit.y);
      if (fruitDist < 12) {
        this.fruit.active = false;
        this.addScore(this.fruit.points);
        this.audio.playEatFruit();
        this.floatingTexts.push(new FloatingText(`+${this.fruit.points}`, this.fruit.x, this.fruit.y, '#fb923c'));
      }
    }

    // Update Ghosts & Ghost Collisions
    const blinky = this.ghosts[0];
    this.ghosts.forEach(ghost => {
      ghost.update(dt, this.pacman, blinky, this.globalGhostMode, this.level, this.maze.pelletsRemaining);

      // Collision Detection with Pac-Man
      const dist = Math.hypot(this.pacman.x - ghost.x, this.pacman.y - ghost.y);
      if (dist < 13) {
        if (ghost.mode === GHOST_MODE_FRIGHTENED) {
          // Ghost Eaten!
          ghost.mode = GHOST_MODE_EATEN;
          this.ghostCombo++;
          const ghostPts = 200 * Math.pow(2, Math.min(3, this.ghostCombo - 1)); // 200, 400, 800, 1600
          this.addScore(ghostPts);
          this.audio.playEatGhost();
          this.floatingTexts.push(new FloatingText(`+${ghostPts}`, ghost.x, ghost.y, '#00ffff'));
        } else if (ghost.mode === GHOST_MODE_CHASE || ghost.mode === GHOST_MODE_SCATTER) {
          // Pac-Man caught!
          this.handlePacmanDeath();
        }
      }
    });

    // Update Floating Texts
    this.floatingTexts.forEach(ft => ft.update(dt));
    this.floatingTexts = this.floatingTexts.filter(ft => ft.life > 0);
  }

  addScore(pts) {
    this.score += pts;
    this.storage.updateCurrentScore(this.score);

    // Extra Life at 10,000 points
    if (!this.extraLifeAwarded && this.score >= 10000) {
      this.extraLifeAwarded = true;
      this.lives++;
      this.audio.playExtraLife();
      this.floatingTexts.push(new FloatingText('1UP!', this.pacman.x, this.pacman.y - 12, '#ffe600'));
    }

    this.updateHUD();
  }

  handlePacmanDeath() {
    this.state = GAME_STATE_DYING;
    this.stateTimer = 1.3;
    this.pacman.isDead = true;
    this.pacman.deathProgress = 0;
    this.audio.playDeath();
  }

  handleLevelClear() {
    this.state = GAME_STATE_LEVEL_CLEAR;
    this.stateTimer = 1.8;
    this.audio.playLevelClear();
    this.addScore(500 * this.level);
  }

  render() {
    this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 1. Draw Maze & Pellets
    this.maze.draw(this.ctx, this.animTime);

    // 2. Draw Bonus Fruit
    this.fruit.draw(this.ctx);

    // 3. Draw Pac-Man
    this.pacman.draw(this.ctx);

    // 4. Draw Ghosts
    this.ghosts.forEach(g => g.draw(this.ctx));

    // 5. Draw Floating Score Texts
    this.floatingTexts.forEach(ft => ft.draw(this.ctx));
  }
}

/* ==========================================================================
   9. INITIALIZE ON WINDOW LOAD
   ========================================================================== */

window.addEventListener('DOMContentLoaded', () => {
  window.pacmanGame = new Game();
});

