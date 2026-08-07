# Trigviz

Interactive SvelteKit visualization of the unit circle that draws sine, cosine, and tangent curves in real time.

## Features

- Frame-rate independent sampling with capped frame deltas for stable curves
- Toggle sin/cos/tan curves and scrub theta (scrubbing auto-pauses)
- Drag the unit-circle tip or curves phase line to scrub
- Angle presets (0, π/6, π/4, …) and rad/deg display toggle
- Shareable URL state (`theta`, `speed`, `unit`, `show`, …) plus Copy link
- Live identities and a short “this frame” explanation
- Tangent scaling with adjustable clamp and asymptote guides
- Optional tangent-line construction on the unit circle
- Full sin/cos/tan curves on mobile and desktop

## Controls

- **Space**: pause/run animation
- **Left/Right arrows**: scrub θ (hold Shift for bigger steps)
- **Drag**: radius tip on the circle, or anywhere on the curves plot
- **Presets / rad|deg**: jump to classic angles; switch display units
- **Copy link**: writes the current viz state into the URL and clipboard
- **Speed** slider: rad/s
- **Tan clamp** slider: tan is shown up to ±clamp and scaled to fit
- **Tan construction**: shows the geometric tangent line at x = 1

## Developing

Requires Node.js 20+.

```sh
npm install
npm run dev
```

Open the app:

```sh
npm run dev -- --open
```

## Scripts

| Command           | Purpose                           |
| ----------------- | --------------------------------- |
| `npm run dev`     | Local dev server                  |
| `npm run build`   | Production build (Vercel adapter) |
| `npm run preview` | Preview production build          |
| `npm run check`   | `svelte-check` / TypeScript       |
| `npm run lint`    | Prettier check                    |
| `npm test`        | Vitest unit tests                 |

## Building / Deploy

```sh
npm run build
npm run preview
```

Configured with `@sveltejs/adapter-vercel`. Deploy by connecting the repo to Vercel (or any host that runs `npm run build` for SvelteKit).
