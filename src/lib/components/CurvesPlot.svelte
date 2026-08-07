<script lang="ts">
	import { TAU } from '$lib/math/trig';
	import { phaseFromPlotPointer } from '$lib/sim/pointerScrub';
	import {
		PLOT_X_TICKS,
		PLOT_Y_TICKS,
		TAN_ASYMPTOTES,
		createPlotGeometry
	} from '$lib/sim/plotGeometry';

	type Props = {
		phase: number;
		sinPath: string;
		cosPath: string;
		tanPath: string;
		showSin: boolean;
		showCos: boolean;
		showTan: boolean;
		tanClamp: number;
		sinv: number;
		cosv: number;
		tanv: number | null;
		plotW?: number;
		plotH?: number;
		pad?: number;
		svgEl?: SVGSVGElement | null;
		onPhaseScrub?: (phase: number) => void;
	};

	let {
		phase,
		sinPath,
		cosPath,
		tanPath,
		showSin,
		showCos,
		showTan,
		tanClamp,
		sinv,
		cosv,
		tanv,
		plotW = 560,
		plotH = 380,
		pad = 18,
		svgEl = $bindable<SVGSVGElement | null>(null),
		onPhaseScrub
	}: Props = $props();

	const geometry = $derived(createPlotGeometry(plotW, plotH, pad));
	const { midY, xFromPhase, yFromValue, yFromTan } = $derived(geometry);

	let dragging = $state(false);

	const tanTicks = $derived(
		showTan
			? [
					{ label: `+${tanClamp.toFixed(1)}`, value: tanClamp },
					{ label: `-${tanClamp.toFixed(1)}`, value: -tanClamp }
				]
			: []
	);

	function scrubFromEvent(event: PointerEvent) {
		if (!svgEl || !onPhaseScrub) return;
		const next = phaseFromPlotPointer(svgEl, event.clientX, event.clientY, plotW, pad);
		if (next !== null) onPhaseScrub(next);
	}

	function handlePointerDown(event: PointerEvent) {
		if (!onPhaseScrub || !svgEl) return;
		dragging = true;
		svgEl.setPointerCapture(event.pointerId);
		scrubFromEvent(event);
	}

	function handlePointerMove(event: PointerEvent) {
		if (!dragging) return;
		scrubFromEvent(event);
	}

	function handlePointerUp(event: PointerEvent) {
		if (!svgEl) return;
		dragging = false;
		if (svgEl.hasPointerCapture(event.pointerId)) {
			svgEl.releasePointerCapture(event.pointerId);
		}
	}
</script>

<div class="viz-panel">
	<div class="mb-4 flex items-center justify-between text-sm text-slate-200">
		<span class="font-semibold tracking-[0.2em] uppercase">Curves</span>
		<span class="text-xs text-slate-400">drag to scrub theta</span>
	</div>

	<svg
		viewBox={`0 0 ${plotW} ${plotH}`}
		class="h-auto w-full touch-none {onPhaseScrub ? 'cursor-ew-resize' : ''}"
		role="img"
		aria-label="Sine cosine tangent curves. Drag to scrub theta."
		bind:this={svgEl}
		onpointerdown={handlePointerDown}
		onpointermove={handlePointerMove}
		onpointerup={handlePointerUp}
		onpointercancel={handlePointerUp}
	>
		<title>Trigonometric curves</title>
		<desc>Sine, cosine, and tangent plotted from 0 to 2π for the current animation.</desc>

		<rect
			x="1"
			y="1"
			width={plotW - 2}
			height={plotH - 2}
			rx="12"
			fill="none"
			stroke="rgba(255,255,255,0.12)"
			stroke-width="2"
		/>
		<rect
			x={xFromPhase(0)}
			y={pad}
			width={xFromPhase(TAU / 4) - xFromPhase(0)}
			height={plotH - pad * 2}
			fill="rgba(255,255,255,0.02)"
		/>
		<rect
			x={xFromPhase(TAU / 4)}
			y={pad}
			width={xFromPhase(TAU / 2) - xFromPhase(TAU / 4)}
			height={plotH - pad * 2}
			fill="rgba(255,255,255,0.04)"
		/>
		<rect
			x={xFromPhase(TAU / 2)}
			y={pad}
			width={xFromPhase((TAU * 3) / 4) - xFromPhase(TAU / 2)}
			height={plotH - pad * 2}
			fill="rgba(255,255,255,0.02)"
		/>
		<rect
			x={xFromPhase((TAU * 3) / 4)}
			y={pad}
			width={xFromPhase(TAU) - xFromPhase((TAU * 3) / 4)}
			height={plotH - pad * 2}
			fill="rgba(255,255,255,0.04)"
		/>
		<text
			x={xFromPhase(TAU / 8)}
			y={pad - 6}
			font-size="11"
			fill="rgba(255,255,255,0.2)"
			text-anchor="middle">Q1</text
		>
		<text
			x={xFromPhase((TAU * 3) / 8)}
			y={pad - 6}
			font-size="11"
			fill="rgba(255,255,255,0.2)"
			text-anchor="middle">Q2</text
		>
		<text
			x={xFromPhase((TAU * 5) / 8)}
			y={pad - 6}
			font-size="11"
			fill="rgba(255,255,255,0.2)"
			text-anchor="middle">Q3</text
		>
		<text
			x={xFromPhase((TAU * 7) / 8)}
			y={pad - 6}
			font-size="11"
			fill="rgba(255,255,255,0.2)"
			text-anchor="middle">Q4</text
		>
		<line
			x1={pad}
			y1={midY}
			x2={plotW - pad}
			y2={midY}
			stroke="rgba(255,255,255,0.14)"
			stroke-width="2"
		/>
		<line
			x1={pad}
			y1={pad}
			x2={pad}
			y2={plotH - pad}
			stroke="rgba(255,255,255,0.14)"
			stroke-width="2"
		/>

		{#each PLOT_X_TICKS as tick (tick.label)}
			<line
				x1={xFromPhase(tick.value)}
				y1={plotH - pad}
				x2={xFromPhase(tick.value)}
				y2={plotH - pad + 6}
				stroke="rgba(255,255,255,0.35)"
				stroke-width="2"
			/>
			<text
				x={xFromPhase(tick.value)}
				y={plotH - 4}
				font-size="12"
				fill="rgba(255,255,255,0.6)"
				text-anchor="middle"
			>
				{tick.label}
			</text>
		{/each}

		{#each PLOT_Y_TICKS as tick (tick.label)}
			<line
				x1={pad - 6}
				y1={yFromValue(tick.value)}
				x2={pad}
				y2={yFromValue(tick.value)}
				stroke="rgba(255,255,255,0.35)"
				stroke-width="2"
			/>
			<text
				x={pad - 10}
				y={yFromValue(tick.value) + 4}
				font-size="12"
				fill="rgba(255,255,255,0.6)"
				text-anchor="end"
			>
				{tick.label}
			</text>
		{/each}

		{#if showTan}
			{#each TAN_ASYMPTOTES as asymptote (asymptote)}
				<line
					x1={xFromPhase(asymptote)}
					y1={pad}
					x2={xFromPhase(asymptote)}
					y2={plotH - pad}
					stroke="var(--color-tan)"
					stroke-opacity="0.35"
					stroke-width="2"
					stroke-dasharray="6 6"
				/>
			{/each}

			{#each tanTicks as tick (tick.label)}
				<line
					x1={plotW - pad}
					y1={yFromTan(tick.value, tanClamp)}
					x2={plotW - pad + 6}
					y2={yFromTan(tick.value, tanClamp)}
					stroke="var(--color-tan)"
					stroke-opacity="0.6"
					stroke-width="2"
				/>
				<text
					x={plotW - pad + 10}
					y={yFromTan(tick.value, tanClamp) + 4}
					font-size="12"
					fill="var(--color-tan)"
					fill-opacity="0.7"
					text-anchor="start"
				>
					{tick.label}
				</text>
			{/each}
		{/if}

		<line
			x1={xFromPhase(phase)}
			y1={pad}
			x2={xFromPhase(phase)}
			y2={plotH - pad}
			stroke="rgba(255,255,255,0.45)"
			stroke-width="3"
			stroke-dasharray="6 6"
		/>
		<!-- Wider invisible hit target for the phase scrubber -->
		<line
			x1={xFromPhase(phase)}
			y1={pad}
			x2={xFromPhase(phase)}
			y2={plotH - pad}
			stroke="transparent"
			stroke-width="24"
		/>

		{#if showSin}
			<path
				d={sinPath}
				fill="none"
				stroke="var(--color-sin)"
				stroke-width="3"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		{/if}
		{#if showCos}
			<path
				d={cosPath}
				fill="none"
				stroke="var(--color-cos)"
				stroke-width="3"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		{/if}
		{#if showTan}
			<path
				d={tanPath}
				fill="none"
				stroke="var(--color-tan)"
				stroke-width="3"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		{/if}

		{#if showSin}
			<circle
				cx={xFromPhase(phase)}
				cy={yFromValue(sinv)}
				r="5"
				fill="var(--color-sin)"
				stroke="rgba(255,255,255,0.3)"
				stroke-width="2"
			/>
		{/if}
		{#if showCos}
			<circle
				cx={xFromPhase(phase)}
				cy={yFromValue(cosv)}
				r="5"
				fill="var(--color-cos)"
				stroke="rgba(255,255,255,0.3)"
				stroke-width="2"
			/>
		{/if}
		{#if showTan && tanv !== null}
			<circle
				cx={xFromPhase(phase)}
				cy={yFromTan(tanv, tanClamp)}
				r="5"
				fill="var(--color-tan)"
				stroke="rgba(255,255,255,0.3)"
				stroke-width="2"
			/>
		{/if}

		<text x={pad} y={pad - 6} font-size="12" fill="rgba(255,255,255,0.55)">y = sin/cos/tan(θ)</text>
		{#if showTan}
			<text
				x={plotW - pad}
				y={pad - 6}
				font-size="12"
				fill="var(--color-tan)"
				fill-opacity="0.7"
				text-anchor="end"
			>
				tan scaled to ±{tanClamp.toFixed(1)}
			</text>
		{/if}
	</svg>

	<div class="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-300">
		{#if showSin}
			<span class="flex items-center gap-1.5">
				<span class="h-0.5 w-6 rounded-full bg-[var(--color-sin)]"></span>
				sin(θ)
			</span>
		{/if}
		{#if showCos}
			<span class="flex items-center gap-1.5">
				<span class="h-0.5 w-6 rounded-full bg-[var(--color-cos)]"></span>
				cos(θ)
			</span>
		{/if}
		{#if showTan}
			<span class="flex items-center gap-1.5">
				<span class="h-0.5 w-6 rounded-full bg-[var(--color-tan)]"></span>
				tan(θ)
			</span>
		{/if}
	</div>

	<div class="mt-4 grid grid-cols-1 gap-3 text-sm text-white/90 sm:grid-cols-3">
		<div class="rounded-xl bg-emerald-500/10 px-3 py-2 text-emerald-100">
			sin: <span class="tabular-nums">{sinv.toFixed(4)}</span>
		</div>
		<div class="rounded-xl bg-sky-500/10 px-3 py-2 text-sky-100">
			cos: <span class="tabular-nums">{cosv.toFixed(4)}</span>
		</div>
		<div class="rounded-xl bg-amber-500/10 px-3 py-2 text-amber-100">
			tan: <span class="tabular-nums">{tanv === null ? 'undefined' : tanv.toFixed(4)}</span>
		</div>
	</div>
</div>
