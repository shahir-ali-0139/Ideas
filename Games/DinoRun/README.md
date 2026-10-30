# 🦖 Ultimate Dino Run – Advanced Browser Game

An addictive, polished, responsive, and modern endless runner arcade game inspired by Chrome Dino, built with **HTML5 Canvas, CSS3, and Vanilla JavaScript**.

Features procedural vector graphics, a multi-track Web Audio API synthesizer for background music and sound effects, 6 dynamic environments with smooth color transitions, progressive difficulty, particle systems, and persistent high-score tracking.

---

## 🎮 How to Play

Open `index.html` directly in any modern desktop or mobile web browser. No installation, server, build step, or external dependencies are required.

```bash
# Option 1: Simply double click index.html
# Option 2: Serve locally using python or node
python -m http.server 8080
# then open http://localhost:8080 in your browser
```

---

## 🕹️ Controls

| Control | Desktop (Keyboard) | Desktop (Mouse) | Mobile / Touch Screen |
| :--- | :--- | :--- | :--- |
| **Jump** | `SPACE` / `▲` Up Arrow / `W` | Left Click on canvas | Tap canvas / On-screen `[ JUMP ▲ ]` button |
| **Variable Jump** | Release jump key early for a low hop; hold for full leap | Release click early | Tap lightly / Release touch |
| **Duck & Slide** | `▼` Down Arrow / `S` | — | Swipe Down / On-screen `[ DUCK ▼ ]` button |
| **Fast Drop (Stomp)** | `▼` Down Arrow while in mid-air | — | Swipe Down while airborne |
| **Pause / Resume** | `P` / `ESC` | Pause icon button | Pause icon button |
| **Quick Mute** | `M` | Audio icon button | Audio icon button |
| **Quick Restart** | `R` (when playing or game over) | — | Retry button |
| **Fullscreen** | — | Fullscreen icon button | Fullscreen icon button |

---

## 🌍 The 6 Progressive Environments

The environment, obstacle generation, and background music dynamically adapt as you achieve higher scores:

1. **🏜️ Level 1: Desert (0 – 500 pts)**
   - *Theme:* Classic sunny desert mesa, rolling dunes, bright clouds.
   - *Obstacles:* Small and large cacti with fair introductory pacing.
   - *Music:* Upbeat 8-bit retro adventure chiptune.

2. **🌆 Level 2: Sunset (500 – 1,200 pts)**
   - *Theme:* Warm violet and orange gradient, setting sun halo, mountain silhouettes.
   - *Obstacles:* Introduces flapping **Pterodactyls (Birds)** at 3 heights:
     - *Low birds:* Jump over!
     - *Mid birds:* Duck and slide underneath!
     - *High birds:* Run safely overhead!
   - *Music:* Chillwave melodic synth with lush chords.

3. **🌙 Level 3: Night Mode (1,200 – 2,200 pts)**
   - *Theme:* Dark obsidian sky, glowing crescent moon, 70+ twinkling stars, fireflies.
   - *Obstacles:* Glowing blue crystal stalagmites and night pterodactyls.
   - *Music:* Ambient sub-bass tech pulse with mystic plucks.

4. **🌴 Level 4: Jungle (2,200 – 3,500 pts)**
   - *Theme:* Deep emerald prehistoric jungle canopy with exotic foliage.
   - *Obstacles:* Snapping carnivorous Venus flytraps, dense cactus clusters, and low-flying birds.
   - *Music:* Syncopated tribal rhythm with percussive grooves.

5. **⚡ Level 5: Cyber World (3,500 – 5,000 pts)**
   - *Theme:* Cyberpunk neon city skyline, neon grid horizon, cyber visor on Dino.
   - *Obstacles:* Floating **Cyber Drones** with vertical hover patterns and warning scan lasers.
   - *Music:* Fast driving darksynth / synthwave with rolling 16th-note bass.

6. **🔥 Level 6: Extreme Mode (5,000+ pts)**
   - *Theme:* Burning crimson nebula, hyper-drive starfield, maximum speed.
   - *Obstacles:* Mixed rapid combinations of moving cyber drones, cacti, and multi-tier birds.
   - *Music:* Hyper-tempo overdrive acid synth (160+ BPM).

---

## 🏆 Scoring & Bonus Mechanics

- **Distance Score:** Continuously tallies meters traveled based on running speed.
- **Obstacle Cleared Bonus:** `+25 points` awarded for every obstacle passed.
- **Close Call Bonus:** `+100 points` awarded when clearing an obstacle within millimeters of danger! Spawns a floating golden "+100 CLOSE CALL!" badge and celebratory chime.
- **Distance Milestones:** Celebratory fanfare and banner toast trigger every 500 meters.
- **Persistent High Score:** Saved automatically to `localStorage` when beating your personal best record, surviving page refreshes and browser restarts. Can be reset with confirmation in the Settings menu.

---

## 🔊 Immersive Procedural Web Audio Engine

No external audio assets or MP3 files needed. The game features an integrated real-time polyphonic synthesizer using the browser's native **Web Audio API**:

- **Sound Effects (SFX):**
  - Jump frequency sweep (140Hz → 460Hz).
  - Landing low-pass thump.
  - Duck/slide filtered noise swoosh.
  - Collision crunch with noise buffer and pitch explosion.
  - Level-up 6-note ascending arpeggio fanfare.
  - New high-score triumphant brass chord sequence.
  - Game-over sad descending glissando.
  - Close call crystal chime ding.
  - Soft UI interaction ticks.
- **Procedural BGM:**
  - 16/32-step musical loop sequencer with separate bass, lead, kick, snare, and hi-hat synthesizer voices tailored to each environment.
- **Audio Controls:**
  - Independent music and SFX enable toggles.
  - Dedicated volume sliders (0% – 100%).
  - Audio unlocks automatically upon first user interaction to comply with browser autoplay security policies.

---

## 🎨 Visuals & High Performance

- **Procedural Vector Drawing on Canvas:** Crisp, scale-independent rendering of the Dinosaur (with running leg cycle, tail bounce, blinking eyes, ducking posture, teeth, claws, and cyber visor), cacti, birds, drones, and jungle plants.
- **Mobile Landscape Responsive Architecture:** Automatically prompts mobile users in portrait orientation to rotate their device into landscape for maximum reaction runway, with `screen.orientation.lock('landscape')` integration upon fullscreen. Desktop users are never prompted or disrupted.
- **High-DPI / Retina Display Support:** Internal canvas backing store scales to `window.devicePixelRatio` for razor-sharp rendering on 4K, Retina, and mobile screens.
- **Delta-Time Physics:** Frame-rate independent movement calculated using `performance.now()` with delta clamping (max 50ms) to prevent clipping during frame drops.
- **Particle System:** Running dust puffs, jump bursts, sliding friction streaks, collision debris, and celebratory confetti.
- **Tab Inactivity Pause:** Automatically pauses when switching tabs (`document.hidden`) to prevent runaway game loops.

---

## 📁 Project Structure

```
DinoRun/
├── index.html        # Semantic HTML5 layout, HUD, menus, and overlays
├── style.css         # Modern glassmorphism UI, typography, mobile layout
├── script.js         # Modular game engine, audio synth, physics, obstacles, levels
├── run_tests.js      # Headless unit verification test suite (Node.js)
└── assets/           # Asset placeholders & documentation
    └── README.md
```

---

## 🧪 Testing

Run the included verification suite to test storage, physics, collision accuracy, and level progression:

```bash
node run_tests.js
```
