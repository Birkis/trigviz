<script lang="ts">
	type Point = { x: number; y: number };

	type Props = {
		width: number;
		height: number;
		pad: number;
		tailBuffer: Float32Array;
		tailHead: number;
		tailCount: number;
		tailMax: number;
	};

	let {
		width,
		height,
		pad,
		tailBuffer,
		tailHead,
		tailCount,
		tailMax,
		svgEl = $bindable<SVGSVGElement | null>(null),
		currentPoint = $bindable<Point>({ x: 0, y: 0 })
	}: Props & { svgEl?: SVGSVGElement | null; currentPoint?: Point } = $props();

	const midX = $derived.by(() => width / 2);
	const innerW = $derived.by(() => width - pad * 2);
	const innerH = $derived.by(() => height - pad * 2);
	const amp = $derived.by(() => innerW * 0.45);

	const verticalData = $derived.by(() => {
		if (tailCount === 0) {
			return { path: '', point: { x: midX, y: pad } };
		}

		let path = '';
		let lastX = midX;
		let lastY = pad;

		for (let i = 0; i < tailCount; i += 1) {
			const index = (tailHead - tailCount + i + tailMax) % tailMax;
			const y = pad + (i / Math.max(1, tailCount - 1)) * innerH;
			const x = midX + tailBuffer[index] * amp;
			path = path ? `${path} L ${x.toFixed(2)} ${y.toFixed(2)}` : `M ${x.toFixed(2)} ${y.toFixed(2)}`;
			lastX = x;
			lastY = y;
		}

		return { path, point: { x: lastX, y: lastY } };
	});

	$effect(() => {
		currentPoint = verticalData.point;
	});
</script>

<div class="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/30 backdrop-blur">
	<div class="mb-3 flex items-center justify-between text-sm text-slate-200">
		<span class="font-semibold uppercase tracking-[0.2em]">Sine (vertical)</span>
		<span class="text-xs text-slate-400">θ top → bottom</span>
	</div>

	<svg
		viewBox={`0 0 ${width} ${height}`}
		class="h-auto w-full"
		role="img"
		aria-label="Vertical sine trace with theta increasing downward"
		bind:this={svgEl}
	>
		<rect
			x="1"
			y="1"
			width={width - 2}
			height={height - 2}
			rx="12"
			fill="none"
			stroke="rgba(255,255,255,0.12)"
			stroke-width="2"
		/>

		<line
			x1={midX}
			y1={pad}
			x2={midX}
			y2={height - pad}
			stroke="rgba(255,255,255,0.16)"
			stroke-width="2"
			stroke-dasharray="6 6"
		/>

		<text x={midX} y={pad - 6} font-size="12" fill="rgba(255,255,255,0.55)" text-anchor="middle">
			sin(θ)
		</text>

		<line
			x1={pad}
			y1={height - pad}
			x2={width - pad}
			y2={height - pad}
			stroke="rgba(255,255,255,0.14)"
			stroke-width="2"
		/>

		<path
			d={verticalData.path}
			fill="none"
			stroke="rgb(16,185,129)"
			stroke-width="3"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>

		<circle
			cx={currentPoint.x}
			cy={currentPoint.y}
			r="5"
			fill="rgb(16,185,129)"
			stroke="rgba(255,255,255,0.3)"
			stroke-width="2"
		/>
	</svg>
</div>
