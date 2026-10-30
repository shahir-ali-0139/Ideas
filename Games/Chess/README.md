#   Chess — Premium Browser Chess Platform

> A luxury, futuristic browser chess platform with an original visual identity, advanced glassmorphism interface, vanilla JavaScript chess engine, intelligent built-in Robot AI, and Pass & Play manual multiplayer.

![  Chess](https://img.shields.io/badge/Anti--Gravity-Chess-00f0ff?style=for-the-badge&logo=chess)
![Pure Vanilla JS](https://img.shields.io/badge/Dependencies-Zero-8b5cf6?style=for-the-badge)
![Unit & Integration Tests](https://img.shields.io/badge/Tests-100%25%20Passing-10b981?style=for-the-badge)
![Responsive Mobile & Desktop](https://img.shields.io/badge/Layout-100%25%20Responsive-38bdf8?style=for-the-badge)

---

## 1. Project Overview

**  Chess** is a production-grade chess web application built entirely from scratch with **HTML5, CSS3, and Vanilla JavaScript (ES6+)**. It requires **no frameworks, no bundlers, no build steps, and no external dependencies**. The application is runnable directly in any modern web browser or via a static HTTP server.

The platform provides a FIDE-compliant chess rules engine, a responsive glassmorphism UI, an interactive **Robot AI vs. Manual Play** option bar, tactical puzzle training, an opening explorer, and high-precision monotonic chess clocks.

---

## 2. File Structure

```
c:\Games\Chess\
├── index.html                  # Accessible layout, SVG brand, Robot/Manual bar, dialogs, and controls
├── styles.css                  # Advanced glassmorphism design system, responsive breakpoints, and animations
├── script.js                   # Rules engine, Minimax AI, openings, audio synthesizer, clocks, and UI logic
├── tests/
│   ├── unit-tests.html         # Browser-runnable unit test runner interface
│   ├── unit-tests.js           # 36 automated unit test suites covering engine, rules, clocks, and FEN
│   ├── integration-tests.html  # Live sandbox integration test interface
│   └── integration-tests.js    # 17 end-to-end DOM tests (clicks, drag-and-drop, promotion, dialogs, Robot/Manual)
└── README.md                   # Complete architectural, operational, and testing documentation
```

---

## 3. Robot vs. Manual Play Options

The platform features a prominent, responsive **Play Mode Bar** located directly above the board arena:

### 🤖 Robot AI Mode (`vs-computer`)
* **Built-in Minimax AI with Alpha-Beta Pruning**: Powered by positional Piece-Square Tables (PST) and MVV-LVA move ordering.
* **Selectable AI Strength Levels**:
  * **Level 1 · Casual**: Fast searches with slight heuristic randomization (~800 estimated rating).
  * **Level 2 · Intermediate**: 2-ply search with capture-focused move ordering (~1200 estimated rating).
  * **Level 3 · Advanced**: 3-ply full Alpha-Beta minimax evaluation (~1600 estimated rating).
  * **Level 4 · Expert**: 4-ply deep search with tactical pruning and killer moves (~2000 estimated rating).
* **Side Selection (⚪ White or ⚫ Black)**:
  * Select **White**: User plays White from the bottom perspective and makes the first move; the Robot replies as Black.
  * Select **Black**: The board automatically flips to Black's perspective; the Robot automatically calculates and plays the opening move as White!
* **Non-Blocking Execution**: AI calculations run asynchronously via microtasks, displaying dynamic "Cyber Robot is thinking..." status without freezing the browser thread.
* **Human Input Guard**: Input is locked while the Robot is thinking to prevent illegal turns or race conditions.

### 👥 Manual Play Mode (`local-2p`)
* **Local Two-Player Pass & Play**: Designed for two humans playing on a shared computer, tablet, or phone.
* **Dynamic Player Cards**: Top card displays "Player 2 (Black)" and bottom card displays "Player 1 (White)", updating turn badges and clock countdowns dynamically.
* **Full Reversibility**: Both sides can request takebacks (Undo/Redo), flip the board perspective, or offer draws.

---

## 4. Responsive Design System

The application is engineered to look and feel like a native desktop and mobile application across all screen widths (from **320px ultra-compact phones** to **4K displays**):

| Breakpoint | Layout Adaptations |
| :--- | :--- |
| **Desktop ($> 1180\text{px}$)** | Multi-column arena with central board, player cards, controls bar, and right-hand inspector panel. |
| **Tablet ($768\text{px} - 1180\text{px}$)** | Single-column centered layout with stacked inspector tabs below the controls bar. |
| **Mobile ($480\text{px} - 768\text{px}$)** | Header navigation wraps smoothly; mode switcher stacks cleanly with full-width segmented controls; controls bar wraps into a clean 2-row layout. |
| **Small Mobile ($320\text{px} - 480\text{px}$)** | Ergonomic **4-column touch grid** for game controls; player card fonts and avatar badges auto-scale; board fits 100% viewport width with zero horizontal overflow. |

### Touch & Mobile Interactions
* **Dual Input Support**: Supports both **click/tap-to-move** and **pointer/drag-and-drop** with visual drag avatars.
* **Touch Target Standards**: All interactive buttons meet or exceed the 36px–44px minimum tap target guidelines.
* **Preventing Viewport Drift**: Touch actions on the chessboard use `touch-action: none` to prevent accidental page scrolls during piece drag.

---

## 5. Visual Identity & Design System

### Palette
* **Space Backdrop**: Dark Navy (`#070b14`), Deep Midnight (`#0b1120`), Slate Surface (`rgba(15, 23, 42, 0.72)`)
* **Electric Cyan Glow**: Primary accent (`#00f0ff`, `rgba(0, 240, 255, 0.35)`)
* **Cosmic Violet**: Secondary accent (`#8b5cf6`, `rgba(139, 92, 246, 0.35)`)
* **Ambient Lighting**: 3 floating glowing orbs with smooth CSS keyframe oscillation
* **Glass Highlights**: Multi-layered panels with `backdrop-filter: blur(16px)` and translucent 1px borders

### Vector Piece Glyphs
Custom-crafted inline SVG piece vectors embedded directly in the application. Pieces feature iridescent gradients, drop shadows, and glowing strokes—completely immune to broken external asset URLs or network lag.

### Board Themes
Switchable live via the header palette button or settings modal:
1. **Cyber Neon**: Electric cyan and midnight slate.
2. **Cosmic Violet**: Nebula purple and deep space.
3. **Classic Walnut**: Rich walnut wood and warm ivory glass.
4. **Emerald Glass**: Deep forest green and frosted crystal.

---

## 6. Architecture & Technical Components

The application is structured into modular, pure-function components exposed under the `window` namespace:

### `ChessEngine`
* **Board Representation**: Mailbox 64-square array ($0 = a1, 63 = h8$) with rank/file coordinate helpers.
* **Full Legal Move Generation**: Pseudo-legal generation for all piece types filtered through king-safety simulation.
* **Check, Checkmate & Stalemate**: Exact verification of checking rays, pins, and legal escapes.
* **Special Rules Enforced**:
  * **Castling**: Kingside and Queenside with all restrictions (king or rook moved, path occupied, king in check, king passing through check, or landing in check).
  * **En Passant**: Correct capture square tracking, expiration on next move, and pawn removal.
  * **Pawn Promotion**: Promotion to Queen, Rook, Bishop, or Knight with interactive modal dialog and keyboard hotkeys (`Q`, `R`, `B`, `N`).
  * **Insufficient Material**: Automatic draw detection for $K$ vs $K$, $K+B$ vs $K$, $K+N$ vs $K$, and $K+B$ vs $K+B$ on same-color squares.
  * **Fifty-Move Rule & Seventy-Five-Move Rule**: Draw claimable at 100 half-moves, automatic termination at 150 half-moves.
  * **Threefold & Fivefold Repetition**: Position hashing tracking board state, active color, castling rights, and en passant availability.
* **Notation**:
  * **SAN Generator**: Full Standard Algebraic Notation with file/rank disambiguation (`Nde4`, `N2f3`), capture indicators (`x`), check (`+`), checkmate (`#`), and promotion (`=Q`).
  * **FEN Parser & Serializer**: Strict format and piece validation.
  * **PGN Import & Export**: Seven-tag roster metadata and numbered move text.
* **Undo & Redo**: Full snapshot reversibility preserving castling rights, en passant history, half-move clock, and repetition tables.

### `ChessAI`
* **Evaluation Function**: Material values ($P=100, N=320, B=330, R=500, Q=900, K=20000$) combined with Piece-Square Tables (PST) for positional center control, knight centralization, rook 7th-rank infiltration, and king safety.
* **Minimax with Alpha-Beta Pruning**: Configurable depth levels 1 to 4.
* **Move Ordering**: MVV-LVA (Most Valuable Victim - Least Valuable Attacker) to maximize alpha-beta pruning cutoffs.
* **Async Time-Slicing**: Search runs via non-blocking microtasks/timeouts to keep the UI smooth and responsive.

### `ChessOpenings`
Bundled opening database containing 35+ classic openings with ECO codes, names, and strategic tips (e.g., *Ruy Lopez, Italian Game, Sicilian Defense, French Defense, Caro-Kann, Queen's Gambit, King's Indian Defense, English Opening, Scandinavian Defense*). Automatically identifies the deepest matching opening as moves are played.

### `ChessPuzzles`
Curated tactical puzzles with FEN, difficulty rating, prompt, and interactive move validation. The system verifies the user's move, plays the engine's reply, and presents feedback.

### `ChessSound`
Pure browser **Web Audio API** synthesizer. Creates authentic percussive taps, capture clicks, check chimes, and castle swooshes using native audio nodes and oscillators. Works completely offline with zero external audio files.

### `ChessClock`
High-precision monotonic chess clocks using `performance.now()`. Supports increment per move, pause/resume, low-time warning pulsation, and timeout termination without timing drift.

---

## 7. How to Launch & Run

### Method 1: Direct File Opening
Double-click `index.html` in file explorer to open directly in Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari.

### Method 2: Local Static Server
Run with any lightweight HTTP server:
```bash
# Using Node.js
npx serve c:\Games\Chess

# Or using Python 3
python -m http.server 8080 --directory c:\Games\Chess
```
Then navigate to `http://localhost:8080` in your web browser.

---

## 8. How to Run the Automated Test Suites

### Unit Tests
Open `tests/unit-tests.html` in your browser, or navigate to:
```
http://localhost:8080/tests/unit-tests.html
```
The unit test suite runs 36 automated tests across 7 suites covering:
* Board representation and starting setup
* Piece movement and obstacle blocking
* King safety, pinned pieces, and checks
* Castling rights, en passant, and promotions
* Checkmate, stalemate, insufficient material, and 50-move/repetition draws
* Undo/redo consistency
* Clock monotonic time increments and timeout handling

### Integration Tests
Open `tests/integration-tests.html` in your browser, or navigate to:
```
http://localhost:8080/tests/integration-tests.html
```
The integration suite tests 17 end-to-end user flows in a live DOM sandbox:
1. 32-piece initial board rendering
2. Square clicks and piece selection
3. Drag-and-drop movement
4. Illegal move rejection and visual feedback
5. Playing a 4-move opening and verifying SAN list
6. Castling moving both King and Rook DOM elements
7. En passant pawn removal from DOM
8. Pawn promotion modal selection and Queen placement
9. Checkmate game-over modal display
10. Undo/redo position restoration
11. Board flip perspective toggle
12. Theme toggle updating body datasets
13. FEN import and export through UI modal
14. PGN import and history reproduction
15. Sound toggle and audio state flipping
16. **Robot AI vs Manual Play Mode Switcher**
17. **Robot Level and Side Selection (⚪ White / ⚫ Black)**

---

## 9. Keyboard Controls & Accessibility

* **Piece Selection**: Click or press `Enter` / `Space` on any friendly piece.
* **Piece Destination**: Click or press `Enter` / `Space` on any valid target square.
* **Deselect**: Press `Escape`.
* **Flip Board Perspective**: Press `F`.
* **Undo Move (Takeback)**: Press `Ctrl + Z` (or `Cmd + Z`).
* **Redo Move**: Press `Ctrl + Y` (or `Cmd + Y`).
* **Hint (Show Best Move)**: Press `H`.
* **Pawn Promotion Hotkeys**: When the promotion dialog appears, press `Q` (Queen), `R` (Rook), `B` (Bishop), or `N` (Knight).
* **Reduced Motion**: Respects `prefers-reduced-motion: reduce` by disabling ambient orb animations and instant transitions.
* **Accessibility**: Includes semantic `role="grid"`, `role="button"`, ARIA labels on all 64 squares, and visible high-contrast focus rings for keyboard users.

---

## 10. Known Limitations

* **Engine Strength**: The built-in AI is designed as an accessible in-browser sparring opponent (depth 1–4, ~800–2000 estimated rating). It does not use opening tablebases or deep neural network evaluations (Stockfish/NNUE), prioritizing zero dependencies and low battery consumption.
* **Online Multiplayer**: Online WebSockets multiplayer requires an external server harness; local 2-Player Pass & Play is included natively.
