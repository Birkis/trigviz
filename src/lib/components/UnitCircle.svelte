<script lang="ts">
	type Intersection = { x: number; y: number } | null;

	type UnitCircleProps = {
		circleSize: number;
		cx: number;
		cy: number;
		r: number;
		phase: number;
		pad: number;
		tailW: number;
		tailH: number;
		tailPad: number;
		tailMid: number;
		tailAmp: number;
		tailPath: string;
		sinv: number;
		cosv: number;
		tanv: number;
		tanDefined: boolean;
		tanLineX: number;
		tanIntersection: Intersection;
		showTanConstruction: boolean;
	};

	let {
		circleSize,
		cx,
		cy,
		r,
		phase,
		pad,
		tailW,
		tailH,
		tailPad,
		tailMid,
		tailAmp,
		tailPath,
		sinv,
		cosv,
		tanv,
		tanDefined,
		tanLineX,
		tanIntersection,
		showTanConstruction,
		svgEl = $bindable(null)
	}: UnitCircleProps & { svgEl?: SVGSVGElement | null } = $props();

	const { arcPath, labelX, labelY } = $derived.by(() => {
		const arcRadius = r * 0.3;
		const arcStartX = cx + arcRadius;
		const arcStartY = cy;
		const arcEndX = cx + arcRadius * Math.cos(phase);
		const arcEndY = cy - arcRadius * Math.sin(phase);
		// sweep=0: counterclockwise on screen (math-positive), matching our y-flipped coords
		// largeArc: use the long arc when θ > π so the wedge always traces from 0 to θ
		const largeArc = phase > Math.PI ? 1 : 0;
		const path = `M ${arcStartX} ${arcStartY} A ${arcRadius} ${arcRadius} 0 ${largeArc} 0 ${arcEndX} ${arcEndY} L ${cx} ${cy} Z`;
		const labelAngle = phase / 2;
		const labelRadius = r * 0.45;
		const x = cx + labelRadius * Math.cos(labelAngle);
		const y = cy - labelRadius * Math.sin(labelAngle);
		return { arcPath: path, labelX: x, labelY: y };
	});
</script>

<div class="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/30 backdrop-blur">
	<div class="mb-4 flex items-center justify-between text-sm text-slate-200">
		<span class="font-semibold uppercase tracking-[0.2em]">Unit Circle</span>
		<span class="text-xs text-slate-400">projections</span>
	</div>

	<div class="flex flex-col gap-6 lg:flex-row lg:items-center">
		<svg
			viewBox={`0 0 ${circleSize} ${circleSize}`}
			class="h-auto w-full lg:w-[60%]"
			role="img"
			aria-label="Unit circle with sin, cos, and tan projections"
			bind:this={svgEl}
		>
			<line x1="0" y1={cy} x2={circleSize} y2={cy} stroke="rgba(255,255,255,0.15)" stroke-width="2" />
			<line x1={cx} y1="0" x2={cx} y2={circleSize} stroke="rgba(255,255,255,0.15)" stroke-width="2" />

			<circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="2.5" />

			<path
				d={arcPath}
				fill="rgba(244,63,94,0.15)"
				stroke="rgba(244,63,94,0.5)"
				stroke-width="1.5"
			/>
			<text x={labelX} y={labelY} font-size="11" fill="rgba(255,255,255,0.9)" text-anchor="middle" dominant-baseline="middle">
				θ = {phase.toFixed(2)}
			</text>

			{#if showTanConstruction}
				<line
					x1={tanLineX}
					y1="0"
					x2={tanLineX}
					y2={circleSize}
					stroke="rgba(245,158,11,0.45)"
					stroke-width="2"
					stroke-dasharray="6 6"
				/>
				{#if tanIntersection}
					<line
						x1={cx}
						y1={cy}
						x2={tanIntersection.x}
						y2={tanIntersection.y}
						stroke="rgba(245,158,11,0.7)"
						stroke-width="2"
						stroke-dasharray="6 6"
					/>
					<circle cx={tanIntersection.x} cy={tanIntersection.y} r="5" fill="rgb(245,158,11)" />
				{/if}
			{/if}

			<line
				x1={cx + r * cosv}
				y1={cy - r * sinv}
				x2={cx + r * cosv}
				y2={cy}
				stroke="rgb(16,185,129)"
				stroke-width="2.5"
				stroke-dasharray="5 4"
			/>
			{#if Math.abs(sinv) > 0.15}
				<text
					x={cx + r * cosv + 8}
					y={cy - (r * sinv) / 2}
					font-size="11"
					fill="rgb(16,185,129)"
					dominant-baseline="middle"
				>sin</text>
			{/if}
			<line
				x1={cx + r * cosv}
				y1={cy - r * sinv}
				x2={cx}
				y2={cy - r * sinv}
				stroke="rgb(59,130,246)"
				stroke-width="2.5"
				stroke-dasharray="5 4"
			/>
			{#if Math.abs(cosv) > 0.15}
				<text
					x={cx + (r * cosv) / 2}
					y={cy - r * sinv - 8}
					font-size="11"
					fill="rgb(59,130,246)"
					text-anchor="middle"
				>cos</text>
			{/if}

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
				tan = {tanDefined ? tanv.toFixed(3) : 'undefined'}
			</text>
		</svg>

		<div class="hidden w-full rounded-xl ring-1 ring-white/10 lg:block lg:w-[40%]">
			<div class="mb-2 text-xs uppercase tracking-[0.2em] text-slate-400">sin tail</div>
			<svg viewBox={`0 0 ${tailW} ${tailH}`} class="h-auto w-full" role="img" aria-label="Recent sine tail">
				<rect x="1" y="1" width={tailW - 2} height={tailH - 2} rx="12" fill="none" stroke="rgba(255,255,255,0.14)" stroke-width="2" />
				<line x1={tailPad} y1={tailMid} x2={tailW - tailPad} y2={tailMid} stroke="rgba(255,255,255,0.14)" stroke-width="2" />
				<path d={tailPath} fill="none" stroke="rgb(16,185,129)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
				<circle cx={tailW - tailPad} cy={tailMid - sinv * tailAmp} r="5" fill="rgb(16,185,129)" />
			</svg>
		</div>
	</div>
</div>
