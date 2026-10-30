# 🎲 Ludo - Vanilla JavaScript Web Game

A modern, responsive, full-featured Ludo board game built entirely from scratch with **Vanilla HTML5, CSS3, and JavaScript (ES6+)**. No frameworks, no external libraries, and no build tools required.

---

## 📸 Overview

This project brings the classic tabletop board game to the browser with rich animations, Web Audio sound effects, intelligent AI opponents, dynamic color customization, and responsive layout for mobile, tablet, and desktop screens.

---

## ✨ Features

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

### 📱 Responsive & Mobile-Optimized
- Scaled using viewport units (`vmin`, `clamp()`) and CSS Grid.
- Center-mounted 3D dice with animated pip faces and roll bounce.
- Seamless touch/click interactions on mobile, tablet, and widescreen desktop monitors.

---

## 📁 Project Structure

```text
├── index.html        # Semantic HTML5 board layout, HUD, scoreboard, and modals
├── style.css         # Responsive styling, CSS Grid, animations, and color system
├── script.js         # Core game engine, rules, AI logic, and Web Audio synthesizer
└── README.md         # Project documentation and guide
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
| **Roll Dice** | Click the center dice or press <kbd>Space</kbd> |
| **Select Token** | Click on any pulsing token or press keys <kbd>1</kbd>–<kbd>4</kbd> |
| **Toggle Human / AI** | Click any colored player chip in the scoreboard (before game starts) |
| **Start / Pause / Resume** | Click the **Start** button in the control panel |
| **Restart Game** | Click the **Restart** button at any time |
| **Change Player Count** | Select 2, 3, or 4 from the **Players** dropdown |
| **Customize Colors** | Type any valid color code into the cage input fields |

---

## 🛠️ Built With

- **HTML5**: Semantic tags, accessible ARIA roles, and responsive markup.
- **CSS3**: CSS Grid (15×15 board matrix), CSS variables, conic gradients, and keyframe animations.
- **JavaScript (ES6+)**: Pure vanilla JS with modular state architecture, async/await animation loops, and Web Audio API synthesis.

---

## 📄 License

This project is open-source and free to use for personal, educational, or entertainment purposes.
