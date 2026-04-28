# LOCK TYPE SHOOTER

LOCK TYPE SHOOTER is a browser-based pointing and typing trainer built with Vite and React.

Aim with a mouse or trackball, click to lock a target, then type the displayed word to shoot it down. The game supports familiar English words and Japanese romaji typing, including multiple valid romaji patterns.

## Features

- Lock-on pointing practice with mouse or trackball
- Familiar English and Japanese word pools that grow from short words into longer words before cycling back
- Dedicated typing dock separated from the playfield
- Procedural Web Audio shooting sound effects and background music
- Funnel-style enemy approach, varied asteroid paths, combo scoring, no-miss milestone bonuses, miss-ended bonus time rushes, rank results, and overdrive clears
- GitHub Pages deployment via GitHub Actions
- MIT License

## Development

```bash
npm install
npm run dev
```

## Source Layout

- `src/App.jsx` keeps the main game loop, canvas rendering, scoring, and input flow.
- `src/game/typingConfig.js` keeps typing languages, word pools, romaji variants, and word-length pacing.
- `src/game/gameConfig.js` keeps score, rank, bonus time, and share text tuning.
- `src/game/audio.js` keeps procedural shooting sound effects and background music.
- `src/game/math.js` keeps small shared canvas/game math helpers.
- `src/components/` keeps small reusable React UI components.
- `public/result-card.jpg` is the large image card used when sharing results to X.

## Build

```bash
npm run build
```

## GitHub Pages

The repository includes a GitHub Actions workflow that builds and deploys the app when `main` is pushed.

For Project Pages, the workflow sets:

```bash
VITE_BASE_PATH=/${{ github.event.repository.name }}/
```

## License

MIT
