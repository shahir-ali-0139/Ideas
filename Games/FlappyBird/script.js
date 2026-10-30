/**
 * ============================================================================
 * FLAPPY BIRD - ARCADE EDITION
 * A complete, polished, vanilla HTML5 Canvas game with Web Audio API sound,
 * cookie-based high scores, procedural graphics, and responsive design.
 * ============================================================================
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. CONSTANTS & CONFIGURATION
     ========================================================================== */
  const CANVAS_WIDTH = 400;
  const CANVAS_HEIGHT = 640;
  const GROUND_HEIGHT = 80;

  // Physics tuning (in units per second)
  const GRAVITY = 1050;             // Downward acceleration (px/s^2)
  const JUMP_STRENGTH = -330;       // Instant upward velocity on flap (px/s)
  const MAX_FALL_SPEED = 620;       // Terminal velocity (px/s)

  // Difficulty & Pipe parameters
  const INITIAL_PIPE_SPEED = 150;   // Starting horizontal pipe speed (px/s)
  const MAX_PIPE_SPEED = 235;       // Top pipe speed after progressive scaling
  const INITIAL_PIPE_GAP = 142;     // Initial vertical gap between upper & lower pipes
  const MIN_PIPE_GAP = 108;         // Minimum gap at highest difficulty
  const PIPE_SPACING = 215;         // Horizontal distance between consecutive pipes
  const PIPE_WIDTH = 64;            // Width of pipe bodies
  const PIPE_CAP_HEIGHT = 26;       // Height of top/bottom pipe collars
  const PIPE_MIN_HEIGHT = 50;       // Minimum vertical pipe length

  // Game States
  const STATES = {
    READY: 'READY',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    GAME_OVER: 'GAME_OVER'
  };

  /* ==========================================================================
     2. COOKIE & STORAGE MANAGEMENT
     ========================================================================== */
  const COOKIE_NAME = 'flappyBirdHighScore';
  const COOKIE_MAX_AGE = 31536000; // 365 days in seconds
  let fallbackHighScore = 0; // In-memory/localStorage backup if cookies are disabled

  /**
   * Save highest score to a browser cookie with fallback to localStorage.
   * @param {number} score 
   */
  function saveHighScore(score) {
    try {
      document.cookie = `${COOKIE_NAME}=${score}; max-age=${COOKIE_MAX_AGE}; path=/; SameSite=Lax`;
    } catch (e) {
      console.warn('Cookie save failed:', e);
    }
    try {
      localStorage.setItem(COOKIE_NAME, score.toString());
    } catch (e) {
      fallbackHighScore = score;
    }
  }

  /**
   * Retrieve highest score from browser cookie or fallback storage.
   * @returns {number}
   */
  function getHighScore() {
    try {
      const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=(\\d+)`));
      if (match) {
        return parseInt(match[1], 10);
      }
    } catch (e) {
      console.warn('Cookie read failed:', e);
    }

    try {
      const saved = localStorage.getItem(COOKIE_NAME);
      if (saved !== null) {
        return parseInt(saved, 10) || 0;
      }
    } catch (e) {
      // Ignore
    }

    return fallbackHighScore;
  }

  /**
   * Updates high score if current score is greater.
   * @param {number} score 
   * @returns {boolean} True if new record achieved
   */
  function updateHighScore(score) {
    const currentBest = getHighScore();
    if (score > currentBest) {
      saveHighScore(score);
      return true;
    }
    return false;
  }

  /* ==========================================================================
     3. PROCEDURAL WEB AUDIO SYNTHESIS (No external audio files)
     ========================================================================== */
  const SoundSystem = (function () {
    let audioCtx = null;
    let sfxGain = null;
    let bgmGain = null;
    let isSoundMuted = false;
    let isMusicMuted = true; // Off by default to avoid startling players, can be toggled
    let bgmIntervalId = null;
    let bgmNoteIndex = 0;

    // Catchy retro chiptune melody notes (frequencies in Hz)
    const BGM_MELODY = [
      261.63, 329.63, 392.00, 523.25, // C4, E4, G4, C5
      392.00, 329.63, 261.63, 329.63,
      293.66, 349.23, 440.00, 587.33, // D4, F4, A4, D5
      440.00, 349.23, 293.66, 349.23,
      329.63, 392.00, 493.88, 659.25, // E4, G4, B4, E5
      493.88, 392.00, 349.23, 293.66
    ];

    function initAudio() {
      if (audioCtx) return;
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        audioCtx = new AudioContextClass();

        // SFX Master Channel
        sfxGain = audioCtx.createGain();
        sfxGain.gain.setValueAtTime(isSoundMuted ? 0 : 0.45, audioCtx.currentTime);
        sfxGain.connect(audioCtx.destination);

        // BGM Master Channel
        bgmGain = audioCtx.createGain();
        bgmGain.gain.setValueAtTime(isMusicMuted ? 0 : 0.15, audioCtx.currentTime);
        bgmGain.connect(audioCtx.destination);
      } catch (e) {
        console.warn('Web Audio not supported or blocked:', e);
      }
    }

    function ensureContextReady() {
      initAudio();
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
    }

    /**
     * Wing flap sound: pleasant rising frequency chirp
     */
    function playFlap() {
      if (isSoundMuted || !audioCtx) return;
      ensureContextReady();
      const now = audioCtx.currentTime;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(640, now + 0.12);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(sfxGain);

      osc.start(now);
      osc.stop(now + 0.14);
    }

    /**
     * Point chime: crisp, bright dual-tone arcade bell
     */
    function playScore() {
      if (isSoundMuted || !audioCtx) return;
      ensureContextReady();
      const now = audioCtx.currentTime;

      // Note 1: High crisp tone
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(987.77, now); // B5

      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc1.connect(gain1);
      gain1.connect(sfxGain);
      osc1.start(now);
      osc1.stop(now + 0.18);

      // Note 2: Higher octave chime slightly delayed
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1318.51, now + 0.08); // E6

      gain2.gain.setValueAtTime(0.35, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc2.connect(gain2);
      gain2.connect(sfxGain);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.28);
    }

    /**
     * Collision hit: punchy mechanical impact
     */
    function playHit() {
      if (isSoundMuted || !audioCtx) return;
      ensureContextReady();
      const now = audioCtx.currentTime;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.22);

      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

      osc.connect(gain);
      gain.connect(sfxGain);

      osc.start(now);
      osc.stop(now + 0.24);
    }

    /**
     * Fall / Game Over sound: tragic descending slide
     */
    function playDie() {
      if (isSoundMuted || !audioCtx) return;
      ensureContextReady();
      const now = audioCtx.currentTime;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(460, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.38);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(sfxGain);

      osc.start(now);
      osc.stop(now + 0.4);
    }

    /**
     * Fanfare celebration for new best score
     */
    function playCelebration() {
      if (isSoundMuted || !audioCtx) return;
      ensureContextReady();
      const now = audioCtx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const start = now + idx * 0.1;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.3, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);

        osc.connect(gain);
        gain.connect(sfxGain);

        osc.start(start);
        osc.stop(start + 0.35);
      });
    }

    /**
     * Starts background retro chiptune playback
     */
    function startBGM() {
      if (bgmIntervalId || !audioCtx) return;
      ensureContextReady();
      bgmNoteIndex = 0;

      bgmIntervalId = setInterval(() => {
        if (isMusicMuted || !audioCtx) return;
        const now = audioCtx.currentTime;
        const freq = BGM_MELODY[bgmNoteIndex % BGM_MELODY.length];
        bgmNoteIndex++;

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

        osc.connect(gain);
        gain.connect(bgmGain);

        osc.start(now);
        osc.stop(now + 0.16);
      }, 180); // 180ms per 16th note
    }

    function stopBGM() {
      if (bgmIntervalId) {
        clearInterval(bgmIntervalId);
        bgmIntervalId = null;
      }
    }

    function toggleSound() {
      isSoundMuted = !isSoundMuted;
      if (sfxGain && audioCtx) {
        sfxGain.gain.setValueAtTime(isSoundMuted ? 0 : 0.45, audioCtx.currentTime);
      }
      return !isSoundMuted;
    }

    function toggleMusic() {
      isMusicMuted = !isMusicMuted;
      ensureContextReady();
      if (bgmGain && audioCtx) {
        bgmGain.gain.setValueAtTime(isMusicMuted ? 0 : 0.15, audioCtx.currentTime);
      }
      if (!isMusicMuted && !bgmIntervalId) {
        startBGM();
      } else if (isMusicMuted) {
        stopBGM();
      }
      return !isMusicMuted;
    }

    return {
      initAudio,
      ensureContextReady,
      playFlap,
      playScore,
      playHit,
      playDie,
      playCelebration,
      startBGM,
      stopBGM,
      toggleSound,
      toggleMusic,
      isSoundMuted: () => isSoundMuted,
      isMusicMuted: () => isMusicMuted
    };
  })();

  /* ==========================================================================
     4. GAME ENGINE & OBJECT ENTITIES
     ========================================================================== */

  // Canvas and rendering contexts
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  const mascotCanvas = document.getElementById('mascot-canvas');
  const mascotCtx = mascotCanvas.getContext('2d');

  // DOM Elements
  const gameContainer = document.getElementById('game-container');
  const hudScoreEl = document.getElementById('current-score');
  const hudBestScoreEl = document.getElementById('hud-best-score');
  const startHighScoreEl = document.getElementById('start-high-score');
  const gameOverBestScoreEl = document.getElementById('game-over-best-score');
  const finalScoreEl = document.getElementById('final-score');
  const newBestBadge = document.getElementById('new-best-badge');
  const medalIconEl = document.getElementById('medal-icon');
  const medalTierEl = document.getElementById('medal-tier');
  const flashOverlay = document.getElementById('flash-effect');

  // Screens
  const startScreen = document.getElementById('start-screen');
  const readyScreen = document.getElementById('ready-screen');
  const pauseScreen = document.getElementById('pause-screen');
  const gameOverScreen = document.getElementById('game-over-screen');

  // Buttons
  const startBtn = document.getElementById('start-btn');
  const restartBtn = document.getElementById('restart-btn');
  const pauseBtn = document.getElementById('pause-btn');
  const resumeBtn = document.getElementById('resume-btn');
  const pauseRestartBtn = document.getElementById('pause-restart-btn');
  const pauseHomeBtn = document.getElementById('pause-home-btn');
  const homeBtn = document.getElementById('home-btn');
  const soundBtn = document.getElementById('sound-btn');
  const musicBtn = document.getElementById('music-btn');
  const fullscreenBtn = document.getElementById('fullscreen-btn');

  // Sound Icon SVGs
  const soundOnIcon = document.getElementById('sound-on-icon');
  const soundOffIcon = document.getElementById('sound-off-icon');
  const musicOnIcon = document.getElementById('music-on-icon');
  const musicOffIcon = document.getElementById('music-off-icon');
  const fsEnterIcon = document.getElementById('fullscreen-enter-icon');
  const fsExitIcon = document.getElementById('fullscreen-exit-icon');

  // Core Game State Variables
  let currentState = STATES.READY;
  let score = 0;
  let highScore = getHighScore();
  let animationFrameId = null;
  let lastTimestamp = 0;
  let groundScrollX = 0;
  let isNewRecordAchieved = false;

  // Background Parallax Clouds
  const clouds = [
    { x: 30, y: 70, scale: 0.9, speed: 12 },
    { x: 190, y: 130, scale: 1.15, speed: 18 },
    { x: 320, y: 55, scale: 0.8, speed: 10 }
  ];

  // Particle System
  let particles = [];

  function createFlapFeathers(x, y) {
    for (let i = 0; i < 3; i++) {
      particles.push({
        x: x - 12 + (Math.random() * 6 - 3),
        y: y + (Math.random() * 6 - 3),
        vx: -(40 + Math.random() * 30),
        vy: 20 + (Math.random() * 40 - 20),
        radius: 2 + Math.random() * 2,
        color: '#ffffff',
        alpha: 0.8,
        life: 0.35
      });
    }
  }

  function createScoreSparkles(x, y) {
    for (let i = 0; i < 14; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 90;
      particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2.5 + Math.random() * 2,
        color: Math.random() > 0.4 ? '#ffd32a' : '#ffffff',
        alpha: 1.0,
        life: 0.5
      });
    }
  }

  function createConfettiBurst() {
    const colors = ['#f1c40f', '#e74c3c', '#2ecc71', '#3498db', '#9b59b6', '#e67e22'];
    for (let i = 0; i < 60; i++) {
      const angle = -Math.PI / 2 + (Math.random() * 1.8 - 0.9);
      const speed = 180 + Math.random() * 280;
      particles.push({
        x: CANVAS_WIDTH / 2 + (Math.random() * 100 - 50),
        y: CANVAS_HEIGHT * 0.4,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 3 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1.0,
        gravity: 420,
        life: 1.6
      });
    }
  }

  /**
   * Bird Entity
   */
  const bird = {
    x: 95,
    y: 260,
    radius: 15,          // Hitbox radius
    velocity: 0,
    angle: 0,
    targetAngle: 0,
    flapTimer: 0,
    wingState: 0,        // 0: down, 1: middle, 2: up
    isDead: false,

    reset() {
      this.x = 95;
      this.y = 260;
      this.velocity = 0;
      this.angle = 0;
      this.targetAngle = 0;
      this.flapTimer = 0;
      this.wingState = 0;
      this.isDead = false;
    },

    flap() {
      if (this.isDead) return;
      this.velocity = JUMP_STRENGTH;
      this.targetAngle = -0.42; // Tilt up (~ -24 deg)
      SoundSystem.playFlap();
      createFlapFeathers(this.x, this.y);
    },

    update(dt) {
      if (currentState === STATES.READY) {
        // Idle gentle floating bob
        this.flapTimer += dt * 5;
        this.y = 260 + Math.sin(this.flapTimer) * 10;
        this.angle = 0;
        this.wingState = Math.floor(Math.abs(Math.sin(this.flapTimer * 2)) * 3) % 3;
        return;
      }

      // Apply Gravity
      this.velocity += GRAVITY * dt;
      if (this.velocity > MAX_FALL_SPEED) {
        this.velocity = MAX_FALL_SPEED;
      }
      this.y += this.velocity * dt;

      // Smooth Angular Pitch Rotation
      if (this.velocity < 0) {
        // Tilting upward when rising
        this.targetAngle = -0.42;
      } else {
        // Tilting smoothly downward into a dive as gravity pulls
        this.targetAngle = Math.min(Math.PI / 2, this.velocity / 340);
      }
      this.angle += (this.targetAngle - this.angle) * Math.min(dt * 12, 1);

      // Wing Flap Animation
      if (!this.isDead) {
        this.flapTimer += dt * 14;
        this.wingState = Math.floor(this.flapTimer) % 3;
      } else {
        this.wingState = 1; // Locked wing on death
      }
    }
  };

  /**
   * Pipes Collection & Spawner
   */
  const pipeManager = {
    pipes: [],
    distanceTraveled: 0,

    reset() {
      this.pipes = [];
      this.distanceTraveled = 0;
    },

    getCurrentSpeed() {
      // Dynamic difficulty: gradually scale speed from 150 up to 235
      return Math.min(MAX_PIPE_SPEED, INITIAL_PIPE_SPEED + score * 2.2);
    },

    getCurrentGap() {
      // Dynamic difficulty: gradually reduce gap from 142 down to 108
      return Math.max(MIN_PIPE_GAP, INITIAL_PIPE_GAP - score * 0.75);
    },

    spawnPipe() {
      const gap = this.getCurrentGap();
      const playableHeight = CANVAS_HEIGHT - GROUND_HEIGHT;
      const minTopHeight = PIPE_MIN_HEIGHT;
      const maxTopHeight = playableHeight - gap - PIPE_MIN_HEIGHT;

      // Safe randomized gap positioning
      const topHeight = Math.floor(minTopHeight + Math.random() * (maxTopHeight - minTopHeight));
      const bottomY = topHeight + gap;

      this.pipes.push({
        x: CANVAS_WIDTH + 10,
        topHeight: topHeight,
        bottomY: bottomY,
        width: PIPE_WIDTH,
        passed: false
      });
    },

    update(dt) {
      const speed = this.getCurrentSpeed();
      const moveDist = speed * dt;
      this.distanceTraveled += moveDist;

      // Spawn pipes at uniform physical distance intervals
      if (this.distanceTraveled >= PIPE_SPACING || this.pipes.length === 0) {
        this.spawnPipe();
        this.distanceTraveled = 0;
      }

      // Move existing pipes leftward
      for (let i = this.pipes.length - 1; i >= 0; i--) {
        const pipe = this.pipes[i];
        pipe.x -= moveDist;

        // Check for score increment
        if (!pipe.passed && pipe.x + pipe.width < bird.x) {
          pipe.passed = true;
          score++;
          hudScoreEl.textContent = score.toString();
          SoundSystem.playScore();
          createScoreSparkles(bird.x + 10, bird.y);

          // Live Best Score indicator in HUD
          if (score > highScore) {
            highScore = score;
            hudBestScoreEl.textContent = highScore.toString();
          }
        }

        // Remove off-screen pipes
        if (pipe.x + pipe.width < -20) {
          this.pipes.splice(i, 1);
        }
      }
    }
  };

  /* ==========================================================================
     5. COLLISION DETECTION
     ========================================================================== */

  /**
   * Circle vs Rectangle collision test with inner inset for fair arcade hitboxes.
   */
  function checkCircleRectCollision(cx, cy, r, rx, ry, rw, rh) {
    const closestX = Math.max(rx, Math.min(cx, rx + rw));
    const closestY = Math.max(ry, Math.min(cy, ry + rh));

    const distX = cx - closestX;
    const distY = cy - closestY;

    return distX * distX + distY * distY < r * r;
  }

  function checkCollisions() {
    // 1. Ceiling collision
    if (bird.y - bird.radius <= 0) {
      return true;
    }

    // 2. Ground collision
    const groundY = CANVAS_HEIGHT - GROUND_HEIGHT;
    if (bird.y + bird.radius >= groundY) {
      bird.y = groundY - bird.radius;
      return true;
    }

    // 3. Pipe collisions (with a slightly forgiving 84% inner hitbox radius)
    const effectiveRadius = bird.radius * 0.84;
    for (let i = 0; i < pipeManager.pipes.length; i++) {
      const pipe = pipeManager.pipes[i];

      // Quick bounding check
      if (bird.x + effectiveRadius < pipe.x || bird.x - effectiveRadius > pipe.x + pipe.width) {
        continue;
      }

      // Upper Pipe collision
      if (checkCircleRectCollision(
        bird.x, bird.y, effectiveRadius,
        pipe.x, 0, pipe.width, pipe.topHeight
      )) {
        return true;
      }

      // Lower Pipe collision
      if (checkCircleRectCollision(
        bird.x, bird.y, effectiveRadius,
        pipe.x, pipe.bottomY, pipe.width, groundY - pipe.bottomY
      )) {
        return true;
      }
    }

    return false;
  }

  /* ==========================================================================
     6. PROCEDURAL RENDERING ENGINE (Pure Canvas, No external images)
     ========================================================================== */

  /**
   * Draws a layered, stylized retro bird onto any target canvas context.
   */
  function drawBirdGraphic(targetCtx, x, y, angle, wingState) {
    targetCtx.save();
    targetCtx.translate(x, y);
    targetCtx.rotate(angle);

    // Subtle drop shadow under bird
    targetCtx.fillStyle = 'rgba(0, 0, 0, 0.16)';
    targetCtx.beginPath();
    targetCtx.ellipse(0, 16, 15, 6, 0, 0, Math.PI * 2);
    targetCtx.fill();

    // Main Body: Rounded golden sphere
    const bodyGradient = targetCtx.createRadialGradient(-3, -3, 3, 0, 0, 16);
    bodyGradient.addColorStop(0, '#fff176');
    bodyGradient.addColorStop(0.5, '#fbc02d');
    bodyGradient.addColorStop(1, '#f57f17');

    targetCtx.fillStyle = bodyGradient;
    targetCtx.lineWidth = 2.2;
    targetCtx.strokeStyle = '#5d4037';
    targetCtx.beginPath();
    targetCtx.ellipse(0, 0, 16, 13, 0, 0, Math.PI * 2);
    targetCtx.fill();
    targetCtx.stroke();

    // Cream Belly Accent
    targetCtx.fillStyle = '#fffde7';
    targetCtx.beginPath();
    targetCtx.ellipse(-4, 4, 9, 6, -0.2, 0, Math.PI);
    targetCtx.fill();

    // Rosy Blush Cheek
    targetCtx.fillStyle = 'rgba(255, 112, 67, 0.45)';
    targetCtx.beginPath();
    targetCtx.arc(3, 4, 3.5, 0, Math.PI * 2);
    targetCtx.fill();

    // Animated Wing
    targetCtx.save();
    targetCtx.translate(-5, 0);
    let wingOffsetAngle = 0;
    if (wingState === 0) wingOffsetAngle = 0.35;       // Down
    else if (wingState === 1) wingOffsetAngle = 0;     // Mid
    else if (wingState === 2) wingOffsetAngle = -0.4;  // Up
    targetCtx.rotate(wingOffsetAngle);

    targetCtx.fillStyle = '#fff9c4';
    targetCtx.strokeStyle = '#5d4037';
    targetCtx.lineWidth = 2;
    targetCtx.beginPath();
    targetCtx.ellipse(0, 0, 9, 6, -0.15, 0, Math.PI * 2);
    targetCtx.fill();
    targetCtx.stroke();
    targetCtx.restore();

    // Big Eye (Sclera + Pupil + Glint)
    targetCtx.fillStyle = '#ffffff';
    targetCtx.strokeStyle = '#5d4037';
    targetCtx.lineWidth = 2;
    targetCtx.beginPath();
    targetCtx.arc(7, -4, 5.5, 0, Math.PI * 2);
    targetCtx.fill();
    targetCtx.stroke();

    // Pupil
    targetCtx.fillStyle = '#212121';
    targetCtx.beginPath();
    targetCtx.arc(8.5, -4, 2.8, 0, Math.PI * 2);
    targetCtx.fill();

    // White Glint
    targetCtx.fillStyle = '#ffffff';
    targetCtx.beginPath();
    targetCtx.arc(7.5, -5.5, 1.2, 0, Math.PI * 2);
    targetCtx.fill();

    // Beak: Upper and lower lips
    targetCtx.fillStyle = '#ff7043';
    targetCtx.strokeStyle = '#bf360c';
    targetCtx.lineWidth = 1.8;

    // Upper Beak
    targetCtx.beginPath();
    targetCtx.moveTo(11, -2);
    targetCtx.lineTo(20, 1);
    targetCtx.lineTo(12, 3);
    targetCtx.closePath();
    targetCtx.fill();
    targetCtx.stroke();

    // Lower Beak
    targetCtx.fillStyle = '#f4511e';
    targetCtx.beginPath();
    targetCtx.moveTo(11, 2);
    targetCtx.lineTo(18, 2);
    targetCtx.lineTo(12, 6);
    targetCtx.closePath();
    targetCtx.fill();
    targetCtx.stroke();

    targetCtx.restore();
  }

  /**
   * Draws a classic 3D arcade pipe with dimensional highlights and rims.
   */
  function drawPipe(pipeX, topHeight, bottomY, width) {
    const groundY = CANVAS_HEIGHT - GROUND_HEIGHT;
    const rimOverhang = 4;
    const rimX = pipeX - rimOverhang;
    const rimWidth = width + rimOverhang * 2;

    // Helper: Draws cylindrical pipe gradient body
    function drawPipeBody(x, y, w, h) {
      if (h <= 0) return;
      ctx.save();

      // Dimensional cylinder gradient
      const grad = ctx.createLinearGradient(x, 0, x + w, 0);
      grad.addColorStop(0, '#558b2f');       // Dark outer rim
      grad.addColorStop(0.18, '#73bf2e');    // Green base
      grad.addColorStop(0.38, '#a2e65c');    // Bright highlight stripe
      grad.addColorStop(0.72, '#73bf2e');    // Base green
      grad.addColorStop(1, '#2e580e');       // Deep shadow edge

      ctx.fillStyle = grad;
      ctx.fillRect(x, y, w, h);

      ctx.strokeStyle = '#1e380a';
      ctx.lineWidth = 2.2;
      ctx.strokeRect(x, y, w, h);
      ctx.restore();
    }

    // Helper: Draws pipe rim collar with 3D bevel
    function drawPipeRim(x, y, w, h) {
      ctx.save();
      const grad = ctx.createLinearGradient(x, 0, x + w, 0);
      grad.addColorStop(0, '#558b2f');
      grad.addColorStop(0.15, '#85d936');
      grad.addColorStop(0.35, '#b9f37c');
      grad.addColorStop(0.75, '#68b128');
      grad.addColorStop(1, '#1e380a');

      ctx.fillStyle = grad;
      ctx.fillRect(x, y, w, h);

      ctx.strokeStyle = '#192e07';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(x, y, w, h);
      ctx.restore();
    }

    // --- Upper Pipe ---
    const upperBodyHeight = Math.max(0, topHeight - PIPE_CAP_HEIGHT);
    drawPipeBody(pipeX, 0, width, upperBodyHeight);
    drawPipeRim(rimX, upperBodyHeight, rimWidth, PIPE_CAP_HEIGHT);

    // --- Lower Pipe ---
    const lowerBodyY = bottomY + PIPE_CAP_HEIGHT;
    const lowerBodyHeight = Math.max(0, groundY - lowerBodyY);
    drawPipeRim(rimX, bottomY, rimWidth, PIPE_CAP_HEIGHT);
    drawPipeBody(pipeX, lowerBodyY, width, lowerBodyHeight);
  }

  /**
   * Draws fluffy parallax clouds.
   */
  function drawCloud(cx, cy, scale) {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.78)';
    ctx.beginPath();
    ctx.arc(cx, cy, 20 * scale, 0, Math.PI * 2);
    ctx.arc(cx + 18 * scale, cy - 8 * scale, 24 * scale, 0, Math.PI * 2);
    ctx.arc(cx + 42 * scale, cy - 2 * scale, 20 * scale, 0, Math.PI * 2);
    ctx.arc(cx + 60 * scale, cy + 4 * scale, 14 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /**
   * Main render pass.
   */
  function render() {
    // 1. Sky Background Gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT - GROUND_HEIGHT);
    skyGradient.addColorStop(0, '#4ec0ca');
    skyGradient.addColorStop(0.7, '#85e1e7');
    skyGradient.addColorStop(1, '#c5f2f5');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 2. Parallax Floating Clouds
    for (let i = 0; i < clouds.length; i++) {
      const c = clouds[i];
      drawCloud(c.x, c.y, c.scale);
    }

    // 3. Distant City / Bush Skyline Silhouette
    ctx.fillStyle = 'rgba(115, 191, 46, 0.28)';
    ctx.beginPath();
    const horizonY = CANVAS_HEIGHT - GROUND_HEIGHT;
    ctx.moveTo(0, horizonY);
    for (let x = 0; x <= CANVAS_WIDTH; x += 40) {
      const hillHeight = 22 + Math.sin(x * 0.04) * 8;
      ctx.lineTo(x, horizonY - hillHeight);
    }
    ctx.lineTo(CANVAS_WIDTH, horizonY);
    ctx.closePath();
    ctx.fill();

    // 4. Pipes
    for (let i = 0; i < pipeManager.pipes.length; i++) {
      const p = pipeManager.pipes[i];
      drawPipe(p.x, p.topHeight, p.bottomY, p.width);
    }

    // 5. Scrolling Ground
    const groundY = CANVAS_HEIGHT - GROUND_HEIGHT;
    
    // Top Grass Strip (Lime Green with animated diagonal chevrons)
    ctx.fillStyle = '#73bf2e';
    ctx.fillRect(0, groundY, CANVAS_WIDTH, 14);

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, groundY, CANVAS_WIDTH, 14);
    ctx.clip();
    ctx.fillStyle = '#558b2f';
    const stripeWidth = 14;
    const stripeOffset = groundScrollX % (stripeWidth * 2);
    for (let x = -stripeWidth * 2; x < CANVAS_WIDTH + stripeWidth * 2; x += stripeWidth * 2) {
      ctx.beginPath();
      ctx.moveTo(x - stripeOffset, groundY);
      ctx.lineTo(x + stripeWidth - stripeOffset, groundY);
      ctx.lineTo(x - stripeOffset, groundY + 14);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Ground Border Separator
    ctx.fillStyle = '#2e580e';
    ctx.fillRect(0, groundY + 13, CANVAS_WIDTH, 2);

    // Earth / Sand Bed
    const earthGradient = ctx.createLinearGradient(0, groundY + 15, 0, CANVAS_HEIGHT);
    earthGradient.addColorStop(0, '#ded895');
    earthGradient.addColorStop(1, '#c7be72');
    ctx.fillStyle = earthGradient;
    ctx.fillRect(0, groundY + 15, CANVAS_WIDTH, GROUND_HEIGHT - 15);

    // Subtle decorative pebbles in ground
    ctx.fillStyle = '#c0b666';
    for (let x = 15; x < CANVAS_WIDTH; x += 65) {
      ctx.beginPath();
      ctx.arc(x, groundY + 36, 3, 0, Math.PI * 2);
      ctx.arc(x + 28, groundY + 52, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 6. Active Particles
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 7. Bird Player Character
    drawBirdGraphic(ctx, bird.x, bird.y, bird.angle, bird.wingState);
  }

  /**
   * Updates particle positions and lifetimes.
   */
  function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.gravity) {
        p.vy += p.gravity * dt;
      }
      p.alpha -= dt / p.life;
      if (p.alpha <= 0) {
        particles.splice(i, 1);
      }
    }
  }

  /**
   * Updates cloud drift.
   */
  function updateClouds(dt) {
    for (let i = 0; i < clouds.length; i++) {
      const c = clouds[i];
      c.x -= c.speed * dt;
      if (c.x < -120) {
        c.x = CANVAS_WIDTH + 60;
      }
    }
  }

  /**
   * Idle mascot render on start screen.
   */
  let mascotTime = 0;
  function updateMascot(dt) {
    if (currentState !== STATES.READY) return;
    mascotTime += dt * 4;
    mascotCtx.clearRect(0, 0, mascotCanvas.width, mascotCanvas.height);
    const wingState = Math.floor(Math.abs(Math.sin(mascotTime * 2)) * 3) % 3;
    const bobOffset = Math.sin(mascotTime) * 4;
    drawBirdGraphic(mascotCtx, 40, 36 + bobOffset, 0, wingState);
  }

  /* ==========================================================================
     7. GAME STATE MANAGEMENT & TRANSITIONS
     ========================================================================== */

  function setGameState(newState) {
    currentState = newState;

    // Hide all overlay screens by default
    startScreen.classList.remove('active');
    readyScreen.classList.remove('active');
    pauseScreen.classList.remove('active');
    gameOverScreen.classList.remove('active');

    switch (newState) {
      case STATES.READY:
        bird.reset();
        pipeManager.reset();
        particles = [];
        score = 0;
        hudScoreEl.textContent = '0';
        highScore = getHighScore();
        hudBestScoreEl.textContent = highScore.toString();
        startHighScoreEl.textContent = highScore.toString();
        startScreen.classList.add('active');
        break;

      case STATES.PLAYING:
        // Gameplay actively running
        break;

      case STATES.PAUSED:
        pauseScreen.classList.add('active');
        break;

      case STATES.GAME_OVER:
        handleGameOver();
        break;
    }
  }

  function handleGameOver() {
    bird.isDead = true;
    SoundSystem.playHit();

    // Trigger visual screen shake & white flash effect
    gameContainer.classList.remove('shake');
    void gameContainer.offsetWidth; // Force CSS reflow
    gameContainer.classList.add('shake');

    flashOverlay.classList.remove('active');
    void flashOverlay.offsetWidth;
    flashOverlay.classList.add('active');

    setTimeout(() => {
      SoundSystem.playDie();
    }, 120);

    // Evaluate High Score
    isNewRecordAchieved = updateHighScore(score);
    highScore = getHighScore();

    // Populate Game Over modal
    finalScoreEl.textContent = score.toString();
    gameOverBestScoreEl.textContent = highScore.toString();

    if (isNewRecordAchieved && score > 0) {
      newBestBadge.classList.remove('hidden');
      SoundSystem.playCelebration();
      createConfettiBurst();
    } else {
      newBestBadge.classList.add('hidden');
    }

    // Award Medal Tier
    if (score >= 35) {
      medalIconEl.textContent = '💎';
      medalTierEl.textContent = 'Platinum';
    } else if (score >= 20) {
      medalIconEl.textContent = '🥇';
      medalTierEl.textContent = 'Gold';
    } else if (score >= 10) {
      medalIconEl.textContent = '🥈';
      medalTierEl.textContent = 'Silver';
    } else {
      medalIconEl.textContent = '🥉';
      medalTierEl.textContent = 'Bronze';
    }

    // Delay showing the modal for a smooth death sequence
    setTimeout(() => {
      gameOverScreen.classList.add('active');
    }, 450);
  }

  /**
   * Resets and starts active gameplay.
   */
  function startGame() {
    SoundSystem.ensureContextReady();
    score = 0;
    hudScoreEl.textContent = '0';
    bird.reset();
    pipeManager.reset();
    particles = [];

    // Briefly display the "Get Ready" banner
    startScreen.classList.remove('active');
    gameOverScreen.classList.remove('active');
    readyScreen.classList.add('active');
    currentState = STATES.READY;

    // Initial hop when ready
    bird.flap();

    setTimeout(() => {
      if (currentState === STATES.READY) {
        readyScreen.classList.remove('active');
        setGameState(STATES.PLAYING);
      }
    }, 600);
  }

  /**
   * Restarts the game immediately without reloading page.
   */
  function restartGame() {
    startGame();
  }

  function pauseGame() {
    if (currentState === STATES.PLAYING) {
      setGameState(STATES.PAUSED);
    }
  }

  function resumeGame() {
    if (currentState === STATES.PAUSED) {
      pauseScreen.classList.remove('active');
      lastTimestamp = performance.now(); // Prevent delta spike
      setGameState(STATES.PLAYING);
    }
  }

  /* ==========================================================================
     8. MAIN ANIMATION LOOP (Fixed Delta Time)
     ========================================================================== */
  function gameLoop(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;

    // Delta time clamped to 0.05s to prevent physics glitch on tab switch
    const rawDt = (timestamp - lastTimestamp) / 1000;
    const dt = Math.min(rawDt, 0.05);
    lastTimestamp = timestamp;

    // 1. Logic Update
    updateClouds(dt);
    updateParticles(dt);
    updateMascot(dt);

    if (currentState === STATES.PLAYING) {
      bird.update(dt);
      pipeManager.update(dt);

      // Scroll Ground
      groundScrollX += pipeManager.getCurrentSpeed() * dt;

      // Check Collisions
      if (checkCollisions()) {
        setGameState(STATES.GAME_OVER);
      }
    } else if (currentState === STATES.GAME_OVER) {
      // Allow dead bird to fall to ground if still in air
      const groundY = CANVAS_HEIGHT - GROUND_HEIGHT;
      if (bird.y + bird.radius < groundY) {
        bird.velocity += GRAVITY * dt;
        bird.y += bird.velocity * dt;
        if (bird.y + bird.radius >= groundY) {
          bird.y = groundY - bird.radius;
        }
      }
      bird.update(dt);
    } else if (currentState === STATES.READY) {
      bird.update(dt);
      groundScrollX += INITIAL_PIPE_SPEED * dt * 0.4;
    }

    // 2. Rendering Pass
    render();

    // Request next frame
    animationFrameId = requestAnimationFrame(gameLoop);
  }

  /* ==========================================================================
     9. INPUT CONTROLS & EVENT LISTENERS
     ========================================================================== */

  function handleFlapInput() {
    SoundSystem.ensureContextReady();

    if (currentState === STATES.READY) {
      readyScreen.classList.remove('active');
      setGameState(STATES.PLAYING);
      bird.flap();
    } else if (currentState === STATES.PLAYING) {
      bird.flap();
    }
  }

  // Keyboard controls
  window.addEventListener('keydown', function (e) {
    // Space or ArrowUp to flap
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      e.preventDefault(); // Prevent scrolling page down
      if (currentState === STATES.GAME_OVER) {
        restartGame();
      } else {
        handleFlapInput();
      }
    }

    // P key: Toggle Pause / Resume
    if (e.code === 'KeyP') {
      e.preventDefault();
      if (currentState === STATES.PLAYING) {
        pauseGame();
      } else if (currentState === STATES.PAUSED) {
        resumeGame();
      }
    }

    // M key: Toggle Sound
    if (e.code === 'KeyM') {
      e.preventDefault();
      toggleSoundUI();
    }

    // R key: Quick restart on Game Over
    if (e.code === 'KeyR' && currentState === STATES.GAME_OVER) {
      e.preventDefault();
      restartGame();
    }

    // Escape key: Pause
    if (e.code === 'Escape' && currentState === STATES.PLAYING) {
      pauseGame();
    }
  });

  // Pointer / Touch controls on game canvas
  canvas.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    handleFlapInput();
  });

  // Button Click Handlers (stopPropagation to prevent flap trigger)
  startBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    startGame();
  });

  restartBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    restartGame();
  });

  pauseBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    if (currentState === STATES.PLAYING) pauseGame();
    else if (currentState === STATES.PAUSED) resumeGame();
  });

  resumeBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    resumeGame();
  });

  pauseRestartBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    restartGame();
  });

  pauseHomeBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    setGameState(STATES.READY);
  });

  homeBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    setGameState(STATES.READY);
  });

  function toggleSoundUI() {
    const isUnmuted = SoundSystem.toggleSound();
    if (isUnmuted) {
      soundOnIcon.classList.remove('hidden');
      soundOffIcon.classList.add('hidden');
    } else {
      soundOnIcon.classList.add('hidden');
      soundOffIcon.classList.remove('hidden');
    }
  }

  soundBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    toggleSoundUI();
  });

  musicBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    const isMusicOn = SoundSystem.toggleMusic();
    if (isMusicOn) {
      musicOnIcon.classList.remove('hidden');
      musicOffIcon.classList.add('hidden');
    } else {
      musicOnIcon.classList.add('hidden');
      musicOffIcon.classList.remove('hidden');
    }
  });

  // Fullscreen support
  fullscreenBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    if (!document.fullscreenElement) {
      if (gameContainer.requestFullscreen) {
        gameContainer.requestFullscreen().catch(() => {});
      } else if (gameContainer.webkitRequestFullscreen) {
        gameContainer.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  });

  document.addEventListener('fullscreenchange', function () {
    if (document.fullscreenElement) {
      fsEnterIcon.classList.add('hidden');
      fsExitIcon.classList.remove('hidden');
    } else {
      fsEnterIcon.classList.remove('hidden');
      fsExitIcon.classList.add('hidden');
    }
  });

  // Window blur: Auto-pause game to be considerate
  window.addEventListener('blur', function () {
    if (currentState === STATES.PLAYING) {
      pauseGame();
    }
  });

  /* ==========================================================================
     10. INITIALIZATION
     ========================================================================== */
  function init() {
    // Populate Initial High Scores
    highScore = getHighScore();
    hudBestScoreEl.textContent = highScore.toString();
    startHighScoreEl.textContent = highScore.toString();

    // Start in READY State
    setGameState(STATES.READY);

    // Launch Single Animation Loop
    if (!animationFrameId) {
      animationFrameId = requestAnimationFrame(gameLoop);
    }
  }

  // Boot on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

