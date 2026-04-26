# LOCK TYPE SHOOTER

LOCK TYPE SHOOTER is a browser-based pointing and typing trainer built with Vite and React.

Aim with a mouse or trackball, click to lock a target, then type the displayed word to shoot it down. The game supports English typing and Japanese romaji typing, including multiple valid romaji patterns.

## Features

- Lock-on pointing practice with mouse or trackball
- English and Japanese romaji typing modes
- Asteroids, combo scoring, rank results, and overdrive clears
- GitHub Pages deployment via GitHub Actions
- MIT License

## Development

```bash
npm install
npm run dev
```

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
