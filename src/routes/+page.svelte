<script lang="ts">
	import { onDestroy, onMount } from 'svelte';

	const TAU = Math.PI * 2;

	let running = $state(true);
	let speed = $state(1.6);
	let phase = $state(0);
	let turns = $state(0);

	let showSin = $state(true);
	let showCos = $state(true);
	let showTan = $state(true);

	const circleSize = 340;
	const plotW = 560;
	const plotH = 340;
	const pad = 18;

	let sinPath = $state('');
	let cosPath = $state('');
	let tanPath = $state('');
	let tanPenDown = $state(false);

	const amp = (plotH - pad * 2) * 0.45;
	const midY = plotH / 2;

	const cosv = $derived.by(() => Math.cos(phase));
	const sinv = $derived.by(() => Math.sin(phase));
	const tanv = $derived.by(() => Math.tan(phase));

	const cx = circleSize / 2;
	const cy = circleSize / 2;
	const r = circleSize * 0.38;

	function clamp(value: number, min: number, max: number) {
		return Math.max(min, Math.min(max, value));
	}

	function resetTrace() {
		sinPath = '';
		cosPath = '';
		tanPath = '';
		tanPenDown = false;
	}

	function xFromPhase(p: number) {
		return pad + (p / TAU) * (plotW - pad * 2);
	}

	function yFromValue(v: number) {
		return midY - v * amp;
	}

	function appendPath(path: string, x: number, y: number) {
		const segment = `${x.toFixed(2)} ${y.toFixed(2)}`;
		return path ? `${path} L ${segment}` : `M ${segment}`;
	}

	function sampleAt(p: number) {
		const x = xFromPhase(p);

		if (showSin) {
			sinPath = appendPath(sinPath, x, yFromValue(Math.sin(p)));
		}
		if (showCos) {
			cosPath = appendPath(cosPath, x, yFromValue(Math.cos(p)));
		}

		if (showTan) {
			const t = Math.tan(p);
			const TAN_CLAMP = 3.2;

			if (Number.isFinite(t) && Math.abs(t) <= TAN_CLAMP) {
				const y = yFromValue(clamp(t, -TAN_CLAMP, TAN_CLAMP));
				if (!tanPenDown) {
					tanPath = tanPath ? `${tanPath} M ${x.toFixed(2)} ${y.toFixed(2)}` : `M ${x.toFixed(2)} ${y.toFixed(2)}`;
					tanPenDown = true;
				} else {
					tanPath = `${tanPath} L ${x.toFixed(2)} ${y.toFixed(2)}`;
				}
			} else {
				tanPenDown = false;
			}
		}
	}

	function resetAndSample(p: number) {
		resetTrace();
		sampleAt(p);
	}

	function setPhaseFromSlider(value: number) {
		phase = value;
		resetAndSample(phase);
	}

	resetAndSample(0);

	let raf = 0;
	let last = 0;

	onMount(() => {
		if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			running = false;
		}

		last = performance.now();

		const tick = (now: number) => {
			raf = requestAnimationFrame(tick);
			const dt = (now - last) / 1000;
			last = now;

			if (!running) return;

			phase += speed * dt;

			if (phase >= TAU) {
				phase = phase % TAU;
				turns += 1;
				resetAndSample(phase);
			} else {
				sampleAt(phase);
			}
		};

		raf = requestAnimationFrame(tick);
	});

	onDestroy(() => cancelAnimationFrame(raf));
</script>

<div class="flex flex-col gap-6">
	<header class="flex flex-col gap-2">
		<p class="text-sm uppercase tracking-[0.3em] text-slate-300">Unit Circle Visualizer</p>
		<h1 class="text-3xl font-semibold text-white sm:text-4xl">Watch the unit circle draw sin, cos, and tan</h1>
		<p class="max-w-2xl text-sm text-slate-200/80">
			A rotating radius on the unit circle drives the waveforms below. Pause, scrub theta, and explore how the
			projections map into the curves.
		</p>
	</header>

	<section class="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-xl shadow-black/30 backdrop-blur">
		<div class="flex flex-wrap items-center gap-3">
			<button
				class="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
				onclick={() => (running = !running)}
			>
				{running ? 'Pause' : 'Run'}
			</button>

			<button
				class="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10"
				onclick={() => {
					phase = 0;
					turns = 0;
					resetAndSample(phase);
				}}
			>
				Reset
			</button>

			<label class="flex items-center gap-2 text-sm text-slate-200">
				<span class="w-14 text-slate-400">Speed</span>
				<input
					class="h-2 w-56 cursor-pointer appearance-none rounded-full bg-white/20 accent-white"
					type="range"
					min="0"
					max="8"
					step="0.05"
					bind:value={speed}
				/>
				<span class="tabular-nums text-white/80">{speed.toFixed(2)} rad/s</span>
			</label>

			<div class="ml-auto flex flex-wrap items-center gap-2 text-sm text-slate-300">
				<span class="rounded-full bg-white/10 px-3 py-1">Turns: {turns}</span>
				<span class="rounded-full bg-white/10 px-3 py-1">Theta: {phase.toFixed(3)} rad</span>
			</div>
		</div>

		<div class="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-200">
			<label class="flex items-center gap-2">
				<input class="accent-emerald-400" type="checkbox" bind:checked={showSin} />
				<span class="text-emerald-200">sin</span>
			</label>
			<label class="flex items-center gap-2">
				<input class="accent-sky-400" type="checkbox" bind:checked={showCos} />
				<span class="text-sky-200">cos</span>
			</label>
			<label class="flex items-center gap-2">
				<input class="accent-amber-400" type="checkbox" bind:checked={showTan} />
				<span class="text-amber-200">tan (clamped)</span>
			</label>
		</div>

		<div class="mt-4">
			<label class="flex items-center gap-2 text-sm text-slate-300">
				<span class="w-14 text-slate-400">Theta</span>
				<input
					class="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-white"
					type="range"
					min="0"
					max={TAU}
					step="0.0005"
					value={phase}
					oninput={(event) => setPhaseFromSlider(Number((event.currentTarget as HTMLInputElement).value))}
				/>
			</label>
		</div>
	</section>

	<section class="grid grid-cols-1 gap-6 lg:grid-cols-2">
		<div class="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/30 backdrop-blur">
			<div class="mb-4 flex items-center justify-between text-sm text-slate-200">
				<span class="font-semibold uppercase tracking-[0.2em]">Unit Circle</span>
				<span class="text-xs text-slate-400">projections</span>
			</div>

			<svg viewBox={`0 0 ${circleSize} ${circleSize}`} class="h-auto w-full">
				<line x1="0" y1={cy} x2={circleSize} y2={cy} stroke="rgba(255,255,255,0.15)" stroke-width="2" />
				<line x1={cx} y1="0" x2={cx} y2={circleSize} stroke="rgba(255,255,255,0.15)" stroke-width="2" />

				<circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="2.5" />

				<line
					x1={cx + r * cosv}
					y1={cy - r * sinv}
					x2={cx + r * cosv}
					y2={cy}
					stroke="rgb(16,185,129)"
					stroke-width="2"
					stroke-dasharray="6 6"
				/>
				<line
					x1={cx + r * cosv}
					y1={cy - r * sinv}
					x2={cx}
					y2={cy - r * sinv}
					stroke="rgb(59,130,246)"
					stroke-width="2"
					stroke-dasharray="6 6"
				/>

				<line
					x1={cx}
					y1={cy}
					x2={cx + r * cosv}
					y2={cy - r * sinv}
					stroke="rgb(244,63,94)"
					stroke-width="3"
					stroke-linecap="round"
				/>
				<circle cx={cx + r * cosv} cy={cy - r * sinv} r="6" fill="rgb(244,63,94)" />

				<text x={pad} y={pad + 6} font-size="14" fill="rgba(255,255,255,0.9)">
					(cos, sin) = ({cosv.toFixed(3)}, {sinv.toFixed(3)})
				</text>
				<text x={pad} y={pad + 26} font-size="14" fill="rgba(255,255,255,0.8)">
					tan = {Number.isFinite(tanv) ? tanv.toFixed(3) : 'undefined'}
				</text>
			</svg>
		</div>

		<div class="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/30 backdrop-blur">
			<div class="mb-4 flex items-center justify-between text-sm text-slate-200">
				<span class="font-semibold uppercase tracking-[0.2em]">Curves</span>
				<span class="text-xs text-slate-400">theta 0 to 2pi</span>
			</div>

			<svg viewBox={`0 0 ${plotW} ${plotH}`} class="h-auto w-full">
				<rect x="1" y="1" width={plotW - 2} height={plotH - 2} rx="12" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="2" />
				<line x1={pad} y1={midY} x2={plotW - pad} y2={midY} stroke="rgba(255,255,255,0.14)" stroke-width="2" />
				<line
					x1={xFromPhase(phase)}
					y1={pad}
					x2={xFromPhase(phase)}
					y2={plotH - pad}
					stroke="rgba(255,255,255,0.25)"
					stroke-width="2"
					stroke-dasharray="6 6"
				/>

				{#if showSin}
					<path d={sinPath} fill="none" stroke="rgb(16,185,129)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
				{/if}
				{#if showCos}
					<path d={cosPath} fill="none" stroke="rgb(59,130,246)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
				{/if}
				{#if showTan}
					<path d={tanPath} fill="none" stroke="rgb(245,158,11)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
				{/if}

				<text x={pad} y={plotH - 10} font-size="14" fill="rgba(255,255,255,0.7)">
					x = theta (0 to 2pi)
				</text>
			</svg>

			<div class="mt-4 grid grid-cols-1 gap-3 text-sm text-white/90 sm:grid-cols-3">
				<div class="rounded-xl bg-emerald-500/10 px-3 py-2 text-emerald-100">
					sin: <span class="tabular-nums">{sinv.toFixed(4)}</span>
				</div>
				<div class="rounded-xl bg-sky-500/10 px-3 py-2 text-sky-100">
					cos: <span class="tabular-nums">{cosv.toFixed(4)}</span>
				</div>
				<div class="rounded-xl bg-amber-500/10 px-3 py-2 text-amber-100">
					tan: <span class="tabular-nums">{Number.isFinite(tanv) ? tanv.toFixed(4) : 'undefined'}</span>
				</div>
			</div>
		</div>
	</section>
</div>
