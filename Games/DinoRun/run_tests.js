// Comprehensive Headless Simulation Test for Ultimate Dino Run

const fs = require('fs');
const vm = require('vm');

// Mock browser globals for Node test environment
global.window = {
  devicePixelRatio: 1,
  innerWidth: 1200,
  innerHeight: 500,
  matchMedia: () => ({ matches: false }),
  screen: { orientation: { type: 'landscape-primary', lock: async () => {}, addEventListener: () => {} } },
  addEventListener: () => {},
  removeEventListener: () => {},
  AudioContext: class {
    constructor() {
      this.currentTime = 0;
      this.sampleRate = 44100;
      this.destination = {};
      this.state = 'running';
    }
    createGain() {
      return {
        gain: {
          value: 1,
          setValueAtTime: () => {},
          linearRampToValueAtTime: () => {},
          exponentialRampToValueAtTime: () => {},
          cancelScheduledValues: () => {}
        },
        connect: () => {}
      };
    }
    createOscillator() {
      return {
        type: 'sine',
        frequency: {
          setValueAtTime: () => {},
          exponentialRampToValueAtTime: () => {}
        },
        connect: () => {},
        start: () => {},
        stop: () => {}
      };
    }
    createBiquadFilter() {
      return {
        type: 'lowpass',
        frequency: {
          setValueAtTime: () => {},
          exponentialRampToValueAtTime: () => {}
        },
        connect: () => {}
      };
    }
    createBuffer(ch, len, sr) {
      return {
        getChannelData: () => new Float32Array(len)
      };
    }
    createBufferSource() {
      return {
        buffer: null,
        connect: () => {},
        start: () => {},
        stop: () => {}
      };
    }
  }
};

global.navigator = {
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  maxTouchPoints: 0
};

const store = {};
global.localStorage = {
  getItem: (k) => store[k] || null,
  setItem: (k, v) => { store[k] = v.toString(); },
  removeItem: (k) => { delete store[k]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); }
};

global.document = {
  getElementById: (id) => ({
    textContent: '',
    value: '50',
    checked: true,
    classList: { add: () => {}, remove: () => {} },
    addEventListener: () => {},
    style: {},
    appendChild: () => {},
    removeChild: () => {},
    getContext: () => ({
      scale: () => {},
      resetTransform: () => {},
      clearRect: () => {},
      fillRect: () => {},
      beginPath: () => {},
      closePath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      arc: () => {},
      ellipse: () => {},
      fill: () => {},
      stroke: () => {},
      save: () => {},
      restore: () => {},
      translate: () => {},
      rotate: () => {},
      roundRect: () => {},
      createLinearGradient: () => ({ addColorStop: () => {} }),
      createRadialGradient: () => ({ addColorStop: () => {} })
    }),
    getBoundingClientRect: () => ({ width: 1200, height: 500 })
  }),
  addEventListener: () => {}
};

global.requestAnimationFrame = (cb) => setTimeout(cb, 16);
global.cancelAnimationFrame = (id) => clearTimeout(id);

// Load and run script.js in global context
const code = fs.readFileSync('script.js', 'utf8');
vm.runInThisContext(code);

console.log('--- RUNNING ULTIMATE DINO RUN TEST SUITE ---');

// Test 1: StorageManager
console.log('1. Testing StorageManager...');
StorageManager.resetHighScore();
if (StorageManager.getHighScore() !== 0) throw new Error('Expected 0 initial high score');
const saved = StorageManager.saveHighScore(1500);
if (!saved) throw new Error('Expected saveHighScore(1500) to return true');
if (StorageManager.getHighScore() !== 1500) throw new Error('Expected high score 1500');
const lowerSaved = StorageManager.saveHighScore(1200);
if (lowerSaved) throw new Error('Lower score should not beat high score');
StorageManager.resetHighScore();
if (StorageManager.getHighScore() !== 0) throw new Error('Expected 0 after reset');
console.log('   StorageManager: PASS');

// Test 2: Dino Physics & Hitbox
console.log('2. Testing Dino Physics & Hitbox...');
const dino = new Dino(415);
if (!dino.isGrounded) throw new Error('Dino should start grounded');
const initialHitbox = dino.getHitbox();

// Jump
const jumped = dino.jump();
if (!jumped || dino.isGrounded) throw new Error('Jump should unground dino');
dino.update(0.016, 8, null);
if (dino.y >= 415 - dino.standHeight) throw new Error('Dino should have moved up in air');

// Fast fall and landing
for (let i = 0; i < 60; i++) {
  dino.update(0.016, 8, () => {});
}
if (!dino.isGrounded) throw new Error('Dino should have landed back on the ground');

// Ducking
dino.duck(true);
if (!dino.isDucking) throw new Error('Dino should be ducking');
const duckHitbox = dino.getHitbox();
if (duckHitbox.h >= initialHitbox.h) throw new Error('Ducking height should be significantly smaller');
dino.duck(false);
if (dino.isDucking) throw new Error('Dino should stop ducking');
console.log('   Dino Physics & Hitbox: PASS');

// Test 3: Obstacle Heights & Fair Clearance
console.log('3. Testing Obstacles & Collision...');
const groundY = 415;
const midBird = new Obstacle('BIRD', 80, groundY, { tier: 'mid' });
const lowBird = new Obstacle('BIRD', 80, groundY, { tier: 'low' });
const tallCactus = new Obstacle('CACTUS_LARGE', 80, groundY);

// When Dino is standing: should collide with midBird
dino.reset();
const standingBox = dino.getHitbox();
const midBox = midBird.getHitbox();
const collidesStandingMid = (
  standingBox.x < midBox.x + midBox.w &&
  standingBox.x + standingBox.w > midBox.x &&
  standingBox.y < midBox.y + midBox.h &&
  standingBox.y + standingBox.h > midBox.y
);
if (!collidesStandingMid) throw new Error('Standing Dino should hit mid bird!');

// When Dino ducks: should clear under midBird!
dino.duck(true);
const duckingBox = dino.getHitbox();
const collidesDuckingMid = (
  duckingBox.x < midBox.x + midBox.w &&
  duckingBox.x + duckingBox.w > midBox.x &&
  duckingBox.y < midBox.y + midBox.h &&
  duckingBox.y + duckingBox.h > midBox.y
);
if (collidesDuckingMid) throw new Error('Ducking Dino should duck under mid bird!');

console.log('   Obstacle Collision & Duck Mechanics: PASS');

// Test 4: Level Manager Progression
console.log('4. Testing Level Progression across all 6 tiers...');
const lvlMgr = new LevelManager();
const scoresToTest = [
  { score: 100, expId: 1, expName: 'Desert' },
  { score: 500, expId: 2, expName: 'Sunset' },
  { score: 1200, expId: 3, expName: 'Night' },
  { score: 2200, expId: 4, expName: 'Jungle' },
  { score: 3500, expId: 5, expName: 'Cyber World' },
  { score: 5500, expId: 6, expName: 'Extreme Mode' }
];

scoresToTest.forEach(test => {
  const lvl = lvlMgr.getLevelForScore(test.score);
  if (lvl.id !== test.expId || lvl.name !== test.expName) {
    throw new Error(`Score ${test.score} expected level ${test.expId} (${test.expName}) but got ${lvl.id} (${lvl.name})`);
  }
  const speed = lvlMgr.calculateSpeed(test.score, 'standard');
  if (speed <= 0 || isNaN(speed)) throw new Error('Invalid calculated speed');
});
console.log('   Level Progression: PASS');

// Test 5: Sound System Web Audio Synthesis
console.log('5. Testing Web Audio Sound Engine...');
const sound = new SoundSystem();
sound.init();
sound.playJump();
sound.playLand();
sound.playDuck();
sound.playCollision();
sound.playLevelUp();
sound.playHighScore();
sound.playGameOver();
sound.playBonus();
sound.playButtonClick();
// BGM test step
for (let lvl = 1; lvl <= 6; lvl++) {
  sound.playTrackStep(0, lvl);
  sound.playTrackStep(4, lvl);
  sound.playTrackStep(8, lvl);
}
console.log('   Web Audio Sound Engine: PASS');

// Test 6: Mobile vs Desktop Orientation Verification
console.log('6. Testing Mobile vs Desktop Orientation Handling...');
const game = new UltimateDinoGame();
// On desktop test env (Windows UA, 0 touch points):
if (game.isMobileDevice()) throw new Error('Desktop environment should NOT be detected as mobile');
// Test orientation check for desktop
game.checkOrientation();
console.log('   Desktop orientation check (no rotate prompt): PASS');

// Simulate mobile device
global.navigator.maxTouchPoints = 5;
global.window.matchMedia = (query) => ({ matches: query.includes('coarse') });
if (!game.isMobileDevice()) throw new Error('Touch device with coarse pointer should be detected as mobile');
console.log('   Mobile detection: PASS');

if (game.animationFrameId) cancelAnimationFrame(game.animationFrameId);

console.log('ALL VERIFICATION TESTS PASSED SUCCESSFULLY! 🚀');
process.exit(0);
