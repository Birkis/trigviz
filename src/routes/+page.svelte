<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import ControlsPanel from '$lib/components/ControlsPanel.svelte';
	import CurvesPlot from '$lib/components/CurvesPlot.svelte';
	import SineTraceVertical from '$lib/components/SineTraceVertical.svelte';
	import UnitCircle from '$lib/components/UnitCircle.svelte';
	import { TAU, clamp, isNearAsymptote } from '$lib/math/trig';

	let running = $state(true);
	let speed = $state(1.6);
	let phase = $state(0);
	let turns = $state(0);

	let showSin = $state(true);
	let showCos = $state(true);
	let showTan = $state(true);
	let tanClamp = $state(3);
	let showTanConstruction = $state(false);

	const circleSize = 340;
	const plotW = 560;
	const plotH = 380;
	const pad = 18;
	const tailW = 240;
	const tailH = circleSize;
	const tailPad = 18;
	const tailMax = 220;
	const tanEpsilon = 0.02;

	const verticalTraceW = 280;
	const verticalTraceH = 560;
	const verticalTracePad = 18;

	let sinPath = $state('');
	let cosPath = $state('');
	let tanPath = $state('');
	let tanPenDown = $state(false);

	const amp = (plotH - pad * 2) * 0.48;
	const midY = plotH / 2;
	const tailMid = tailH / 2;
	const tailAmp = (tailH - tailPad * 2) * 0.4;

	const cosv = $derived.by(() => Math.cos(phase));
	const sinv = $derived.by(() => Math.sin(phase));
	const tanv = $derived.by(() => Math.tan(phase));
	const tanDefined = $derived.by(() => !isNearAsymptote(cosv, tanEpsilon));

	const cx = circleSize / 2;
	const cy = circleSize / 2;
	const r = circleSize * 0.38;
	const tanLineX = cx + r;

	let tailBuffer = $state(new Float32Array(tailMax));
	let tailHead = $state(0);
	let tailCount = $state(0);
	let tailVersion = $state(0);
	let lastSamplePhase = $state(0);

	let isDesktop = $state(true);
	let circleSvg = $state<SVGSVGElement | null>(null);
	let curvesSvg = $state<SVGSVGElement | null>(null);
	let verticalSvg = $state<SVGSVGElement | null>(null);
	let overlaySvg = $state<SVGSVGElement | null>(null);
	let overlayWidth = $state(0);
	let overlayHeight = $state(0);
	let visualizationEl: HTMLDivElement | null = null;
	let verticalSinePoint = $state({ x: 0, y: 0 });
	let connectorPath = $state('');
	let connectorScheduled = false;

	const sampleStep = TAU / (plotW - pad * 2);

	function resetTrace() {
		sinPath = '';
		cosPath = '';
		tanPath = '';
		tanPenDown = false;
	}

	function resetTail() {
		tailBuffer = new Float32Array(tailMax);
		tailHead = 0;
		tailCount = 0;
		tailVersion += 1;
	}

	function pushTail(value: number) {
		tailBuffer[tailHead] = value;
		tailHead = (tailHead + 1) % tailMax;
		tailCount = Math.min(tailCount + 1, tailMax);
		tailVersion += 1;
	}

	function scheduleConnectorUpdate() {
		if (connectorScheduled) return;
		connectorScheduled = true;
		requestAnimationFrame(() => {
			connectorScheduled = false;
			updateConnector();
		});
	}

	function toOverlayPoint(svg: SVGSVGElement | null, point: { x: number; y: number }) {
		if (!svg || !overlaySvg) return null;
		const matrix = svg.getScreenCTM();
		if (!matrix) return null;
		const svgPoint = svg.createSVGPoint();
		svgPoint.x = point.x;
		svgPoint.y = point.y;
		const screen = svgPoint.matrixTransform(matrix);
		const overlayRect = overlaySvg.getBoundingClientRect();
		return { x: screen.x - overlayRect.left, y: screen.y - overlayRect.top };
	}

	function updateOverlaySize() {
		if (!visualizationEl) return;
		const rect = visualizationEl.getBoundingClientRect();
		overlayWidth = rect.width;
		overlayHeight = rect.height;
	}

	function updateConnector() {
		if (!overlaySvg || !showSin) {
			connectorPath = '';
			return;
		}

		const startLocal = { x: cx + r * cosv, y: cy - r * sinv };
		const endLocal = isDesktop
			? { x: xFromPhase(phase), y: yFromValue(sinv) }
			: verticalSinePoint;

		const start = toOverlayPoint(circleSvg, startLocal);
		const end = toOverlayPoint(isDesktop ? curvesSvg : verticalSvg, endLocal);

		if (!start || !end) {
			connectorPath = '';
			return;
		}

		connectorPath = `M ${start.x.toFixed(1)} ${start.y.toFixed(1)} L ${end.x.toFixed(1)} ${end.y.toFixed(1)}`;
	}

	function xFromPhase(p: number) {
		return pad + (p / TAU) * (plotW - pad * 2);
	}

	function yFromValue(v: number) {
		return midY - v * amp;
	}

	function yFromTan(v: number) {
		return midY - (v / tanClamp) * amp;
	}

	const plotXTicks = [
		{ label: '0', value: 0 },
		{ label: 'π/2', value: TAU / 4 },
		{ label: 'π', value: TAU / 2 },
		{ label: '3π/2', value: (TAU * 3) / 4 },
		{ label: '2π', value: TAU }
	];

	const plotYTicks = [
		{ label: '1', value: 1 },
		{ label: '0', value: 0 },
		{ label: '-1', value: -1 }
	];

	const tanTicks = $derived.by(() =>
		showTan
			? [
					{ label: `+${tanClamp.toFixed(1)}`, value: tanClamp },
					{ label: `-${tanClamp.toFixed(1)}`, value: -tanClamp }
				]
			: []
	);

	function appendPath(path: string, x: number, y: number) {
		const segment = `${x.toFixed(2)} ${y.toFixed(2)}`;
		return path ? `${path} L ${segment}` : `M ${segment}`;
	}

	function appendMove(path: string, x: number, y: number) {
		const segment = `${x.toFixed(2)} ${y.toFixed(2)}`;
		return path ? `${path} M ${segment}` : `M ${segment}`;
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
			const cosValue = Math.cos(p);
			if (isNearAsymptote(cosValue, tanEpsilon)) {
				tanPenDown = false;
			} else {
				const t = Math.tan(p);
				if (Number.isFinite(t) && Math.abs(t) <= tanClamp) {
					const y = yFromTan(clamp(t, -tanClamp, tanClamp));
					if (!tanPenDown) {
						tanPath = appendMove(tanPath, x, y);
						tanPenDown = true;
					} else {
						tanPath = `${tanPath} L ${x.toFixed(2)} ${y.toFixed(2)}`;
					}
				} else {
					tanPenDown = false;
				}
			}
		}

		pushTail(Math.sin(p));
	}

	function sampleToPhase(targetPhase: number) {
		while (lastSamplePhase + sampleStep <= targetPhase) {
			lastSamplePhase += sampleStep;
			sampleAt(lastSamplePhase);
		}

		if (targetPhase !== lastSamplePhase) {
			lastSamplePhase = targetPhase;
			sampleAt(lastSamplePhase);
		}
	}

	function resetAndSample(targetPhase: number) {
		resetTrace();
		resetTail();
		lastSamplePhase = 0;
		sampleAt(0);
		sampleToPhase(targetPhase);
		scheduleConnectorUpdate();
	}

	function setPhaseAndRebuild(value: number) {
		phase = clamp(value, 0, TAU);
		resetAndSample(phase);
	}

	function toggleSignalUpdates() {
		resetAndSample(phase);
	}

	function updateTanClamp(nextClamp: number) {
		tanClamp = nextClamp;
		resetAndSample(phase);
	}

	$effect(() => {
		tailVersion;
		verticalSinePoint;
		showSin;
		isDesktop;
		scheduleConnectorUpdate();
	});

	const tailPath = $derived.by(() => {
		tailVersion;
		if (tailCount === 0) return '';
		const innerW = tailW - tailPad * 2;
		let path = '';
		for (let i = 0; i < tailCount; i += 1) {
			const index = (tailHead - tailCount + i + tailMax) % tailMax;
			const x = tailPad + (i / Math.max(1, tailCount - 1)) * innerW;
			const y = tailMid - tailBuffer[index] * tailAmp;
			path = path
				? `${path} L ${x.toFixed(2)} ${y.toFixed(2)}`
				: `M ${x.toFixed(2)} ${y.toFixed(2)}`;
		}
		return path;
	});

	const tanIntersection = $derived.by(() =>
		tanDefined ? { x: tanLineX, y: cy - r * (sinv / cosv) } : null
	);

	let raf = 0;
	let last = 0;

	onMount(() => {
		if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			running = false;
		}

		const media = window.matchMedia('(min-width: 1024px)');
		const updateIsDesktop = () => {
			isDesktop = media.matches;
			scheduleConnectorUpdate();
		};
		updateIsDesktop();
		media.addEventListener('change', updateIsDesktop);

		const resizeObserver =
			typeof ResizeObserver !== 'undefined'
				? new ResizeObserver(() => {
						updateOverlaySize();
						scheduleConnectorUpdate();
					})
				: null;

		if (visualizationEl && resizeObserver) {
			resizeObserver.observe(visualizationEl);
		}

		const handleResize = () => {
			updateOverlaySize();
			scheduleConnectorUpdate();
		};
		const handleScroll = () => scheduleConnectorUpdate();
		window.addEventListener('resize', handleResize);
		window.addEventListener('scroll', handleScroll, true);

		last = performance.now();

		const tick = (now: number) => {
			raf = requestAnimationFrame(tick);
			const dt = (now - last) / 1000;
			last = now;

			if (!running) return;

			const nextPhase = phase + speed * dt;

			if (nextPhase >= TAU) {
				turns += Math.floor(nextPhase / TAU);
				phase = nextPhase % TAU;
				resetAndSample(phase);
			} else {
				phase = nextPhase;
				sampleToPhase(phase);
			}

			scheduleConnectorUpdate();
		};

		resetAndSample(phase);
		raf = requestAnimationFrame(tick);

		updateOverlaySize();
		scheduleConnectorUpdate();

		return () => {
			if (typeof window !== 'undefined') {
				cancelAnimationFrame(raf);
				window.removeEventListener('resize', handleResize);
				window.removeEventListener('scroll', handleScroll, true);
				media.removeEventListener('change', updateIsDesktop);
				if (resizeObserver && visualizationEl) {
					resizeObserver.unobserve(visualizationEl);
				}
			}
		};
	});

	onDestroy(() => {
		if (typeof window !== 'undefined') {
			cancelAnimationFrame(raf);
		}
	});

	function handleKeydown(event: KeyboardEvent) {
		const target = event.target as HTMLElement | null;
		if (target && (target.closest('input, textarea, select, button') || target.isContentEditable)) {
			return;
		}

		const baseStep = TAU / 360;
		const step = event.shiftKey ? baseStep * 5 : baseStep;

		switch (event.key) {
			case ' ':
				event.preventDefault();
				running = !running;
				break;
			case 'ArrowLeft':
				event.preventDefault();
				setPhaseAndRebuild(phase - step);
				break;
			case 'ArrowRight':
				event.preventDefault();
				setPhaseAndRebuild(phase + step);
				break;
			default:
				break;
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="flex flex-col gap-6">
	<header class="flex flex-col gap-2">
		<p class="text-sm uppercase tracking-[0.3em] text-slate-300">Unit Circle Visualizer</p>
		<h1 class="text-3xl font-semibold text-white sm:text-4xl">Watch the unit circle draw sin, cos, and tan</h1>
		<p class="max-w-2xl text-sm text-slate-200/80">
			A rotating radius on the unit circle drives the waveforms below. Pause, scrub theta, and explore how the
			projections map into the curves.
		</p>
	</header>

	<ControlsPanel
		{running}
		{speed}
		{phase}
		{turns}
		{showSin}
		{showCos}
		{showTan}
		{tanClamp}
		{showTanConstruction}
		tau={TAU}
		onToggleRunning={() => (running = !running)}
		onReset={() => {
			phase = 0;
			turns = 0;
			resetAndSample(phase);
		}}
		onSpeedChange={(value) => (speed = value)}
		onPhaseChange={setPhaseAndRebuild}
		onToggleShowSin={() => {
			showSin = !showSin;
			toggleSignalUpdates();
		}}
		onToggleShowCos={() => {
			showCos = !showCos;
			toggleSignalUpdates();
		}}
		onToggleShowTan={() => {
			showTan = !showTan;
			toggleSignalUpdates();
		}}
		onTanClampChange={updateTanClamp}
		onToggleTanConstruction={() => (showTanConstruction = !showTanConstruction)}
	/>

	<div class="relative" bind:this={visualizationEl}>
		<section class="grid grid-cols-1 gap-6 lg:grid-cols-2">
			<UnitCircle
				{circleSize}
				{cx}
				{cy}
				{r}
				{pad}
				{tailW}
				{tailH}
				{tailPad}
				{tailMid}
				{tailAmp}
				{tailPath}
				{sinv}
				{cosv}
				{tanv}
				{tanDefined}
				{tanLineX}
				tanIntersection={tanIntersection}
				{showTanConstruction}
				bind:svgEl={circleSvg}
			/>

			{#if isDesktop}
				<CurvesPlot
					{plotW}
					{plotH}
					{pad}
					{midY}
					{plotXTicks}
					{plotYTicks}
					{tanTicks}
					{phase}
					{sinPath}
					{cosPath}
					{tanPath}
					{showSin}
					{showCos}
					{showTan}
					{tanClamp}
					{sinv}
					{cosv}
					{tanv}
					{tanDefined}
					xFromPhase={xFromPhase}
					yFromValue={yFromValue}
					yFromTan={yFromTan}
					tanAsymptotes={[TAU / 4, (TAU * 3) / 4]}
					bind:svgEl={curvesSvg}
				/>
			{:else}
				<SineTraceVertical
					width={verticalTraceW}
					height={verticalTraceH}
					pad={verticalTracePad}
					{tailBuffer}
					{tailHead}
					{tailCount}
					tailMax={tailMax}
					bind:svgEl={verticalSvg}
					bind:currentPoint={verticalSinePoint}
				/>
			{/if}
		</section>

		<svg
			class="pointer-events-none absolute inset-0"
			width={overlayWidth}
			height={overlayHeight}
			viewBox={`0 0 ${overlayWidth} ${overlayHeight}`}
			aria-hidden="true"
			bind:this={overlaySvg}
		>
			{#if connectorPath && overlayWidth > 0 && overlayHeight > 0}
				<path
					d={connectorPath}
					fill="none"
					stroke="rgba(255,255,255,0.5)"
					stroke-width="2"
					stroke-dasharray="6 6"
					stroke-linecap="round"
				/>
			{/if}
		</svg>
	</div>
</div>
