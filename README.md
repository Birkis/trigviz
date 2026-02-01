# Unit Circle Visualizer

An interactive SvelteKit visualization of the unit circle that draws sine, cosine, and tangent curves in real time.

## Features

- Frame-rate independent sampling for smooth curves at any speed.
- Toggle sin/cos/tan curves and scrub theta.
- Tangent scaling with adjustable clamp and asymptote guides.
- Optional tangent-line construction on the unit circle.
- Keyboard controls for fast exploration.

## Controls

- **Space**: pause/run animation
- **Left/Right arrows**: scrub θ (hold Shift for bigger steps)
- **Speed** slider: rad/s
- **Tan clamp** slider: tan is shown up to ±clamp and scaled to fit
- **Tan construction**: shows the geometric tangent line at x = 1

## Developing

Install dependencies and start the dev server:

```sh
npm install
npm run dev
```

Open the app in a new tab:

```sh
npm run dev -- --open
```

## Building

```sh
npm run build
npm run preview
```
