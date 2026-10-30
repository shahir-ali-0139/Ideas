# 🎲 Ludo - Vanilla JavaScript Web Game

A modern, responsive, full-featured Ludo board game built entirely from scratch with **Vanilla HTML5, CSS3, and JavaScript (ES6+)**. No frameworks, no external libraries, and no build tools required.

---

## 📸 Overview

This project brings the classic tabletop board game to the browser with rich animations, procedural Web Audio sound effects, intelligent AI opponents, dynamic color customization, automatic fullscreen support, and a responsive layout tailored for every device—from smartphones to 4K widescreen monitors.

---

## ✨ Features

### 📺 Automatic Fullscreen & Immersive Experience
- **Auto Fullscreen on Visit**: Automatically attempts to enter fullscreen mode upon initial visit (`DOMContentLoaded` / `load`) and immediately triggers on the user's very first interaction (`click`, `touchstart`, `pointerdown`, or `keydown`) complying with browser gesture security policies.
- **Dedicated Fullscreen Toggle**: Accessible header button with dynamic SVG icons to toggle in and out of fullscreen at any time.
- **Cross-Browser Engine**: Full fallback compatibility with standard Fullscreen API, WebKit (`webkitRequestFullscreen`), Mozilla (`mozRequestFullScreen`), and Microsoft Edge/IE (`msRequestFullscreen`).
- **Game Action Fullscreen Hook**: Starting, rolling the dice, restarting, or replaying seamlessly re-engages fullscreen mode.

### 📱 Responsive for Every Device & Orientation
- **Adaptive Layout System**:
  - **Desktop & Widescreen Laptops (≥ 960px)**: 2-column side-by-side master layout with board on the left and control sidebar on the right, fitting cleanly within `100dvh` without page scrolling.
  - **Tablets (641px – 959px)**: Fluid board scaling with dynamic 3-column scoreboard and responsive HUD cards.
  - **Mobile Portrait (≤ 640px)**: Vertically stacked layout with centered touch-optimized controls and action buttons.
  - **Small Mobile (≤ 380px)**: Edge-to-edge compact layout with 1-column color inputs and minified control chips.
  - **Mobile Landscape (Height ≤ 560px & Landscape)**: Specialized 2-column side-by-side mode with fluid board scaling (`min(calc(100dvh - 2.8rem), 54vw)`) and custom slim scrollable sidebar.
- **Safe Area Insets**: Full support for `env(safe-area-inset-*)` accommodating device notches, Dynamic Island, and system navigation bars.
- **Dynamic Viewport Units**: Built with `100dvh`, `clamp()`, and `min()` ensuring zero unwanted viewport clipping or accidental overflow.

### 👥 Player Modes (2, 3, or 4 Players)
- **4 Players**: Full classic 4-corner board (Red, Green, Yellow, Blue).
- **3 Players**: 3 active players (Red, Green, Yellow); the unused 4th cage is cleanly hidden.
- **2 Players**: Automatically pairs diagonal opponents (Green & Blue) for balanced gameplay; unused cages (Red & Yellow) are hidden with transparent, seamless board rendering.

### 🤖 Intelligent AI / Robot Opponents
- Any player can be dynamically toggled between **Human** and **Robot** using the scoreboard chips.
- Custom heuristic AI analyzes board state each turn:
  - Prioritizes unlocking tokens on roll of 6.
  - Seeks capture opportunities against vulnerable opponents.
  - Evades incoming opponent threats.
  - Leverages safe squares (marked with ★) and token stacks.
  - Focuses on advancing tokens into the home stretch and final winning triangle.
- Fully automated turn execution with realistic thinking pauses.

### 🎨 Live Color Customization
- Customize any player's cage color directly via text inputs (supports Hex codes like `#ff3366` or named CSS colors like `crimson` and `teal`).
- Dynamic real-time styling powered by CSS custom properties (`--red`, `--green`, `--yellow`, `--blue`).
- One-click **Reset** button to restore original default palette.
- Customizer panel dynamically adapts: color inputs for inactive cages automatically hide.

### 📜 Complete Traditional Ludo Rules
- **Base Release**: Roll a **6** to bring a token out of the yard onto the track start position.
- **Bonus Turns**: Awarded upon rolling a **6**, capturing an opponent token, or reaching home.
- **Three Consecutive Sixes**: Rolling three 6s in a row forfeits the turn to prevent unfair streaks.
- **Capturing**: Landing on an opponent's token sends it back to its starting cage.
- **Safe Squares (★)**: Star-marked cells protect tokens from being captured.
- **Token Stacking**: Multiple friendly tokens on the same cell create a safe stack.
- **Exact Home Finish**: Tokens must enter their dedicated color path and roll the exact count to land in the center home triangle.
- **Victory Condition**: First player to guide all 4 tokens into the center home wins with a victory celebration modal.

### 🔊 Procedural Web Audio Sound Effects
Zero external audio files—sound is procedurally synthesized using the browser's built-in **Web Audio API**:
- Dice shuffle rattle & roll settle ticks
- Cheerful high-pitch chime on rolling a 6
- Token hopping sound on movement
- Safe-stop notification tone
- Capture impact sound
- Goal celebration fanfare
- Winning victory melody

### ⌨️ Keyboard Shortcuts & Accessibility
- <kbd>Space</kbd> or <kbd>Enter</kbd> (when focused on dice): Roll dice.
- <kbd>1</kbd>, <kbd>2</kbd>, <kbd>3</kbd>, <kbd>4</kbd>: Select and move corresponding movable token.
- <kbd>Esc</kbd>: Close open drawer dropdowns.
- Clear pulse animations on all valid tokens awaiting player choice.

---

## 📁 Project Structure

```text
├── index.html        # Semantic HTML5 board layout, fullscreen header, HUD, and modals
├── style.css         # Responsive styling, CSS Grid, animations, safe-area insets, and fullscreen rules
├── script.js         # Core game engine, rules, AI logic, Web Audio synthesizer, and Fullscreen API
└── README.md         # Comprehensive documentation and guide
```

---

## 🚀 Getting Started

No installation, compilation, or web servers required.

### 1. Direct Browser Launch
Simply double-click or open `index.html` in any modern web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari).

### 2. Local HTTP Server (Optional)
If you prefer running through a local development server:

```bash
# Using Python 3
python -m http.server 8080

# Using Node.js (npx)
npx serve .
```

Then visit `http://localhost:8080` in your browser.

---

## 🕹️ Controls Guide

| Action | Control |
|---|---|
| **Toggle Fullscreen** | Click the fullscreen icon button in the top header |
| **Roll Dice** | Click the center dice or press <kbd>Space</kbd> |
| **Select Token** | Click on any pulsing token or press keys <kbd>1</kbd>–<kbd>4</kbd> |
| **Toggle Human / AI** | Click any colored player chip in the scoreboard (before game starts) |
| **Start / Pause / Resume** | Click the **Start** button in the control panel |
| **Restart Game** | Click the **Restart** button at any time |
| **Change Player Count** | Select 2, 3, or 4 from the **Players** dropdown |
| **Customize Colors** | Type any valid color code into the cage input fields |

---

## 🛠️ Built With

- **HTML5**: Semantic tags, accessible ARIA roles, viewport fit cover meta, and responsive markup.
- **CSS3**: CSS Grid (15×15 board matrix), CSS variables, dynamic viewport units (`100dvh`), media queries, and keyframe animations.
- **JavaScript (ES6+)**: Pure vanilla JS with modular state architecture, async/await animation loops, Fullscreen API, and Web Audio API synthesis.

---

## 📄 License

This project is open-source and free to use for personal, educational, or entertainment purposes.
