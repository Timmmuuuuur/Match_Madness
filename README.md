# Match Madness

Duolingo-style word matching for **English ↔ French** with tiered vocabulary pools.

## Word pools

| Pool | Words | Description |
|------|-------|-------------|
| 500 | 500 | Core essentials |
| 1,000 | 1,000 | Everyday vocabulary |
| 1,500 | 1,500 | Strong foundation |
| 2,000 | 2,000 | Advanced pool |

Words are sourced from a French–English frequency dictionary and filtered for game-friendly pairs.

## Quick start (no install)

The **standalone** version runs immediately — no npm required:

```bash
cd standalone
python3 -m http.server 5173
```

Open [http://localhost:5173](http://localhost:5173)

## React web app (Vite)

Full React + TypeScript version with the same game logic:

```bash
cd web
npm install
npm run dev
```

## Mobile (iOS & Android)

Expo React Native app in `mobile/` — same word pools and game:

```bash
cd mobile
npm install
npx expo start
```

Then press `i` for iOS simulator or `a` for Android emulator, or scan the QR code with Expo Go.

## Rebuild word pools

After updating the source dictionary:

```bash
node scripts/build-word-pools.mjs
```

This writes JSON files to `shared/data/` used by web and mobile.

## How to play

1. Choose a word pool (500 → 2K)
2. Pick **English → French** or **French → English** (controls which language appears on the left)
3. Match translation pairs across the two columns
4. You have 3 lives; streaks boost your score
5. Complete 5 rounds of 6 pairs each

## Project structure

```
Match_Madness/
├── standalone/     # Zero-build web app (open with any static server)
├── web/            # React + Vite web app
├── mobile/         # Expo React Native (iOS & Android)
├── shared/         # Word pools + shared types
└── scripts/        # Word pool generator
```
