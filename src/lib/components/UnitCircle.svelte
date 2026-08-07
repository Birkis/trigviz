<script lang="ts">
	import { formatAngle, type AngleUnit } from '$lib/math/angles';
	import { phaseFromCirclePointer } from '$lib/sim/pointerScrub';
	import { createCircleGeometry, createTailGeometry } from '$lib/sim/plotGeometry';

	type Props = {
		phase: number;
		sinv: number;
		cosv: number;
		tanv: number | null;
		tailPath: string;
		showTanConstruction: boolean;
		unit?: AngleUnit;
		circleSize?: number;
		svgEl?: SVGSVGElement | null;
		onPhaseScrub?: (phase: number) => void;
	};

	let {
		phase,
		sinv,
		cosv,
		tanv,
		tailPath,
		showTanConstruction,
		unit = 'rad',
		circleSize = 340,
		svgEl = $bindable<SVGSVGElement | null>(null),
		onPhaseScrub
	}: Props = $props();

	const geometry = $derived(createCircleGeometry(circleSize));
	const tail = $derived(createTailGeometry(circleSize));
	const { cx, cy, r, pad, tanLineX } = $derived(geometry);
	const { tailW, tailH, tailPad, tailMid, tailAmp } = $derived(tail);

	let dragging = $state(false);

	const tipX = $derived(cx + r * cosv);
	const tipY = $derived(cy - r * sinv);

	const tanIntersection = $derived.by(() => {
		if (tanv === null || Math.abs(cosv) < 1e-8) return null;
		return { x: tanLineX, y: cy - r * (sinv / cosv) };
	});

	const { arcPath, labelX, labelY } = $derived.by(() => {
		const arcRadius = r * 0.3;
		const arcStartX = cx + arcRadius;
		const arcStartY = cy;
		const arcEndX = cx + arcRadius * Math.cos(phase);
		const arcEndY = cy - arcRadius * Math.sin(phase);
		const largeArc = phase > Math.PI ? 1 : 0;
		const path = `M ${arcStartX} ${arcStartY} A ${arcRadius} ${arcRadius} 0 ${largeArc} 0 ${arcEndX} ${arcEndY} L ${cx} ${cy} Z`;
		const labelAngle = phase / 2;
		const labelRadius = r * 0.45;
		return {
			arcPath: path,
			labelX: cx + labelRadius * Math.cos(labelAngle),
			labelY: cy - labelRadius * Math.sin(labelAngle)
		};
	});

	function scrubFromEvent(event: PointerEvent) {
		if (!svgEl || !onPhaseScrub) return;
		const next = phaseFromCirclePointer(svgEl, event.clientX, event.clientY, cx, cy);
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
		<span class="font-semibold tracking-[0.2em] uppercase">Unit Circle</span>
		<span class="text-xs text-slate-400">drag the tip to scrub</span>
	</div>

	<div class="flex flex-col gap-6 lg:flex-row lg:items-center">
		<svg
			viewBox={`0 0 ${circleSize} ${circleSize}`}
			class="h-auto w-full touch-none lg:w-[60%] {onPhaseScrub ? 'cursor-crosshair' : ''}"
			role="img"
			aria-label="Unit circle with sin, cos, and tan projections. Drag to scrub theta."
			bind:this={svgEl}
			onpointerdown={handlePointerDown}
			onpointermove={handlePointerMove}
			onpointerup={handlePointerUp}
			onpointercancel={handlePointerUp}
		>
			<title>Unit circle</title>
			<desc>A rotating radius with sin and cos projections for the current angle.</desc>

			<line
				x1="0"
				y1={cy}
				x2={circleSize}
				y2={cy}
				stroke="rgba(255,255,255,0.15)"
				stroke-width="2"
			/>
			<line
				x1={cx}
				y1="0"
				x2={cx}
				y2={circleSize}
				stroke="rgba(255,255,255,0.15)"
				stroke-width="2"
			/>

			<circle {cx} {cy} {r} fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="2.5" />

			<path
				d={arcPath}
				fill="rgba(244,63,94,0.15)"
				stroke="rgba(244,63,94,0.5)"
				stroke-width="1.5"
			/>
			<text
				x={labelX}
				y={labelY}
				font-size="11"
				fill="rgba(255,255,255,0.9)"
				text-anchor="middle"
				dominant-baseline="middle"
			>
				θ = {formatAngle(phase, unit, 2)}
			</text>

			{#if showTanConstruction}
				<line
					x1={tanLineX}
					y1="0"
					x2={tanLineX}
					y2={circleSize}
					stroke="var(--color-tan)"
					stroke-opacity="0.45"
					stroke-width="2"
					stroke-dasharray="6 6"
				/>
				{#if tanIntersection}
					<line
						x1={cx}
						y1={cy}
						x2={tanIntersection.x}
						y2={tanIntersection.y}
						stroke="var(--color-tan)"
						stroke-opacity="0.7"
						stroke-width="2"
						stroke-dasharray="6 6"
					/>
					<circle cx={tanIntersection.x} cy={tanIntersection.y} r="5" fill="var(--color-tan)" />
				{/if}
			{/if}

			<line
				x1={tipX}
				y1={tipY}
				x2={tipX}
				y2={cy}
				stroke="var(--color-sin)"
				stroke-width="2.5"
				stroke-dasharray="5 4"
			/>
			{#if Math.abs(sinv) > 0.15}
				<text
					x={tipX + 8}
					y={cy - (r * sinv) / 2}
					font-size="11"
					fill="var(--color-sin)"
					dominant-baseline="middle"
				>
					sin
				</text>
			{/if}
			<line
				x1={tipX}
				y1={tipY}
				x2={cx}
				y2={tipY}
				stroke="var(--color-cos)"
				stroke-width="2.5"
				stroke-dasharray="5 4"
			/>
			{#if Math.abs(cosv) > 0.15}
				<text
					x={cx + (r * cosv) / 2}
					y={tipY - 8}
					font-size="11"
					fill="var(--color-cos)"
					text-anchor="middle"
				>
					cos
				</text>
			{/if}

			<line
				x1={cx}
				y1={cy}
				x2={tipX}
				y2={tipY}
				stroke="var(--color-radius)"
				stroke-width="3"
				stroke-linecap="round"
			/>
			<circle
				cx={tipX}
				cy={tipY}
				r="8"
				fill="var(--color-radius)"
				stroke="rgba(255,255,255,0.45)"
				stroke-width="2"
				class={onPhaseScrub ? 'cursor-grab' : ''}
			/>

			<text x={pad} y={pad + 6} font-size="14" fill="rgba(255,255,255,0.9)">
				(cos, sin) = ({cosv.toFixed(3)}, {sinv.toFixed(3)})
			</text>
			<text x={pad} y={pad + 26} font-size="14" fill="rgba(255,255,255,0.8)">
				tan = {tanv === null ? 'undefined' : tanv.toFixed(3)}
			</text>
		</svg>

		<div class="w-full rounded-xl ring-1 ring-white/10 lg:w-[40%]">
			<div class="mb-2 text-xs tracking-[0.2em] text-slate-400 uppercase">sin tail</div>
			<svg
				viewBox={`0 0 ${tailW} ${tailH}`}
				class="h-auto w-full"
				role="img"
				aria-label="Recent sine tail"
			>
				<rect
					x="1"
					y="1"
					width={tailW - 2}
					height={tailH - 2}
					rx="12"
					fill="none"
					stroke="rgba(255,255,255,0.14)"
					stroke-width="2"
				/>
				<line
					x1={tailPad}
					y1={tailMid}
					x2={tailW - tailPad}
					y2={tailMid}
					stroke="rgba(255,255,255,0.14)"
					stroke-width="2"
				/>
				<path
					d={tailPath}
					fill="none"
					stroke="var(--color-sin)"
					stroke-width="3"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
				<circle cx={tailW - tailPad} cy={tailMid - sinv * tailAmp} r="5" fill="var(--color-sin)" />
			</svg>
		</div>
	</div>
</div>
