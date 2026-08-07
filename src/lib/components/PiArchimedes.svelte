<script lang="ts">
	import { onDestroy } from 'svelte';
	import {
		MAX_STEPS,
		boundsAtStep,
		polygonPath,
		regularPolygonVertices,
		sidesAtStep,
		type ArchimedesPoint
	} from '$lib/math/archimedes';

	type Props = {
		step?: number;
		size?: number;
	};

	let { step = $bindable(0), size = 420 }: Props = $props();

	const cx = $derived(size / 2);
	const cy = $derived(size / 2);
	const radius = $derived(size * 0.32);

	const bounds = $derived(boundsAtStep(step));
	const sides = $derived(sidesAtStep(step));

	const outerPoints = $derived(regularPolygonVertices(sides, radius, 'circumscribed', cx, cy));
	const innerPoints = $derived(regularPolygonVertices(sides, radius, 'inscribed', cx, cy));
	const outerPath = $derived(polygonPath(outerPoints));
	const innerPath = $derived(polygonPath(innerPoints));

	const nextSides = $derived(step < MAX_STEPS ? sidesAtStep(step + 1) : sides);
	const nextOuterPoints = $derived(
		regularPolygonVertices(nextSides, radius, 'circumscribed', cx, cy)
	);
	const cutSegments = $derived.by(() => {
		if (step >= MAX_STEPS) return [] as { from: ArchimedesPoint; to: ArchimedesPoint }[];
		const cuts: { from: ArchimedesPoint; to: ArchimedesPoint }[] = [];
		for (let i = 0; i < outerPoints.length; i++) {
			const a = nextOuterPoints[2 * i];
			const b = nextOuterPoints[2 * i + 1];
			if (a && b) cuts.push({ from: a, to: b });
		}
		return cuts;
	});

	let playing = $state(false);
	let showCuts = $state(true);
	let playTimer: ReturnType<typeof setInterval> | null = null;

	function stopPlay() {
		playing = false;
		if (playTimer) {
			clearInterval(playTimer);
			playTimer = null;
		}
	}

	function startPlay() {
		stopPlay();
		playing = true;
		if (step >= MAX_STEPS) step = 0;
		playTimer = setInterval(() => {
			if (step >= MAX_STEPS) {
				stopPlay();
				return;
			}
			step += 1;
		}, 1100);
	}

	function togglePlay() {
		if (playing) stopPlay();
		else startPlay();
	}

	function reset() {
		stopPlay();
		step = 0;
	}

	function handleStepInput(event: Event) {
		stopPlay();
		const value = Number((event.currentTarget as HTMLInputElement).value);
		if (Number.isFinite(value)) step = value;
	}

	onDestroy(stopPlay);

	const accuracyPct = $derived((1 - bounds.error / Math.PI) * 100);
</script>

<section class="viz-panel overflow-hidden">
	<div class="mb-4 flex flex-wrap items-end justify-between gap-3">
		<div>
			<p class="text-xs font-semibold tracking-[0.2em] text-teal-300/80 uppercase">
				Archimedes squeeze
			</p>
			<h2 class="font-display text-2xl text-white">Trapping π between two polygons</h2>
		</div>
		<p class="text-sm text-slate-300 tabular-nums">
			{sides}-gon · diameter 1
		</p>
	</div>

	<div class="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center">
		<div class="relative">
			<svg
				viewBox={`0 0 ${size} ${size}`}
				class="archimedes-stage h-auto w-full"
				role="img"
				aria-label="Circle of diameter 1 trapped between an outer and inner regular polygon"
			>
				<title>Archimedes polygon bounds for π</title>
				<desc>
					An outer polygon has its corners cut inward and an inner polygon gains corners outward,
					squeezing toward the circle whose circumference is π.
				</desc>

				<defs>
					<radialGradient id="pi-glow" cx="50%" cy="45%" r="60%">
						<stop offset="0%" stop-color="rgba(45, 212, 191, 0.18)" />
						<stop offset="55%" stop-color="rgba(15, 23, 42, 0.05)" />
						<stop offset="100%" stop-color="rgba(15, 23, 42, 0)" />
					</radialGradient>
					<linearGradient id="outer-fill" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stop-color="rgba(251, 146, 60, 0.14)" />
						<stop offset="100%" stop-color="rgba(251, 146, 60, 0.04)" />
					</linearGradient>
					<linearGradient id="inner-fill" x1="0%" y1="100%" x2="100%" y2="0%">
						<stop offset="0%" stop-color="rgba(56, 189, 248, 0.16)" />
						<stop offset="100%" stop-color="rgba(56, 189, 248, 0.04)" />
					</linearGradient>
				</defs>

				<rect width={size} height={size} fill="url(#pi-glow)" />

				<!-- Diameter guide -->
				<line
					x1={cx - radius}
					y1={cy}
					x2={cx + radius}
					y2={cy}
					stroke="rgba(255,255,255,0.22)"
					stroke-width="1.5"
					stroke-dasharray="4 5"
				/>
				<circle cx={cx - radius} {cy} r="3" fill="rgba(255,255,255,0.45)" />
				<circle cx={cx + radius} {cy} r="3" fill="rgba(255,255,255,0.45)" />
				<text
					x={cx}
					y={cy + 18}
					text-anchor="middle"
					fill="rgba(255,255,255,0.45)"
					font-size="12"
					font-family="var(--font-sans)"
				>
					diameter = 1
				</text>

				<!-- Outer polygon -->
				<path
					d={outerPath}
					fill="url(#outer-fill)"
					stroke="#fb923c"
					stroke-width="2.5"
					stroke-linejoin="round"
					class="poly-path"
				/>

				<!-- Preview of corner cuts -->
				{#if showCuts && cutSegments.length > 0}
					{#each cutSegments as cut, i (i)}
						<line
							class="cut-preview"
							x1={cut.from.x}
							y1={cut.from.y}
							x2={cut.to.x}
							y2={cut.to.y}
							stroke="#fdba74"
							stroke-width="2"
							stroke-linecap="round"
						/>
					{/each}
				{/if}

				<!-- Circle -->
				<circle
					{cx}
					{cy}
					r={radius}
					fill="none"
					stroke="rgba(255,255,255,0.85)"
					stroke-width="2"
					class="circle-ring"
				/>

				<!-- Inner polygon -->
				<path
					d={innerPath}
					fill="url(#inner-fill)"
					stroke="#38bdf8"
					stroke-width="2.5"
					stroke-linejoin="round"
					class="poly-path"
				/>

				<!-- Labels -->
				<text
					x={cx}
					y={24}
					text-anchor="middle"
					fill="#fdba74"
					font-size="13"
					font-weight="600"
					font-family="var(--font-sans)"
				>
					outer · cut corners
				</text>
				<text
					x={cx}
					y={size - 14}
					text-anchor="middle"
					fill="#7dd3fc"
					font-size="13"
					font-weight="600"
					font-family="var(--font-sans)"
				>
					inner · add corners
				</text>
			</svg>
		</div>

		<div class="flex flex-col gap-5">
			<div class="grid grid-cols-2 gap-3 sm:grid-cols-2">
				<div class="rounded-xl border border-orange-300/20 bg-orange-400/10 px-4 py-3">
					<p class="text-xs tracking-wide text-orange-200/80 uppercase">Outer perimeter</p>
					<p class="mt-1 font-display text-2xl text-orange-100 tabular-nums">
						{bounds.outer.toFixed(6)}
					</p>
					<p class="text-xs text-orange-200/60">upper bound</p>
				</div>
				<div class="rounded-xl border border-sky-300/20 bg-sky-400/10 px-4 py-3">
					<p class="text-xs tracking-wide text-sky-200/80 uppercase">Inner perimeter</p>
					<p class="mt-1 font-display text-2xl text-sky-100 tabular-nums">
						{bounds.inner.toFixed(6)}
					</p>
					<p class="text-xs text-sky-200/60">lower bound</p>
				</div>
				<div class="col-span-2 rounded-xl border border-teal-300/25 bg-teal-400/10 px-4 py-3">
					<p class="text-xs tracking-wide text-teal-200/80 uppercase">
						Average (inner + outer) / 2
					</p>
					<p class="mt-1 font-display text-3xl text-teal-50 tabular-nums">
						{bounds.average.toFixed(8)}
					</p>
					<p class="mt-1 text-sm text-teal-100/70">
						π ≈ {Math.PI.toFixed(8)} · error {bounds.error.toExponential(2)} ·
						{accuracyPct.toFixed(4)}% close
					</p>
				</div>
			</div>

			<div class="flex flex-wrap items-center gap-3">
				<button
					type="button"
					class="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
					onclick={togglePlay}
				>
					{playing ? 'Pause' : 'Animate cuts'}
				</button>
				<button
					type="button"
					class="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10"
					onclick={reset}
				>
					Reset to square
				</button>
				<label class="flex items-center gap-2 text-sm text-slate-300">
					<input type="checkbox" class="accent-teal-300" bind:checked={showCuts} />
					Show next corner cuts
				</label>
			</div>

			<label class="flex flex-col gap-2 text-sm text-slate-200">
				<span class="flex justify-between gap-3">
					<span>Refinement step</span>
					<span class="text-slate-400 tabular-nums">
						{step} / {MAX_STEPS} · {sides} sides
					</span>
				</span>
				<input
					class="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-teal-300"
					type="range"
					min="0"
					max={MAX_STEPS}
					step="1"
					value={step}
					oninput={handleStepInput}
				/>
				<span class="text-xs text-slate-400">
					Each step doubles the sides: cut every outer corner, push a new vertex out on every inner
					side.
				</span>
			</label>

			<div class="sr-only" aria-live="polite" aria-atomic="true">
				Step {step}, {sides} sides. Inner perimeter {bounds.inner.toFixed(5)}, outer
				{bounds.outer.toFixed(5)}, average {bounds.average.toFixed(5)}.
			</div>
		</div>
	</div>
</section>

<style>
	.archimedes-stage {
		border-radius: 1rem;
		background:
			radial-gradient(ellipse 80% 60% at 50% 40%, rgba(20, 184, 166, 0.08), transparent 70%),
			linear-gradient(160deg, rgba(15, 23, 42, 0.9), rgba(8, 47, 73, 0.55));
		border: 1px solid rgba(255, 255, 255, 0.08);
	}

	.poly-path {
		transition:
			d 0.7s cubic-bezier(0.22, 1, 0.36, 1),
			stroke-width 0.3s ease;
	}

	.circle-ring {
		animation: breathe 4.5s ease-in-out infinite;
	}

	.cut-preview {
		animation: cut-pulse 1.6s ease-in-out infinite;
	}

	@keyframes breathe {
		0%,
		100% {
			stroke-opacity: 0.75;
		}
		50% {
			stroke-opacity: 1;
		}
	}

	@keyframes cut-pulse {
		0%,
		100% {
			opacity: 0.25;
		}
		50% {
			opacity: 0.9;
		}
	}
</style>
