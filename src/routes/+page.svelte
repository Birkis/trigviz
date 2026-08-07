<script lang="ts">
	import { onMount } from 'svelte';
	import ConnectorOverlay from '$lib/components/ConnectorOverlay.svelte';
	import ControlsPanel from '$lib/components/ControlsPanel.svelte';
	import CurvesPlot from '$lib/components/CurvesPlot.svelte';
	import UnitCircle from '$lib/components/UnitCircle.svelte';
	import { TAU } from '$lib/math/trig';
	import { Visualizer } from '$lib/sim/visualizer.svelte';

	const viz = new Visualizer();

	onMount(() => viz.mount());

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
				viz.running = !viz.running;
				break;
			case 'ArrowLeft':
				event.preventDefault();
				viz.setPhaseAndRebuild(viz.phase - step, { pause: true });
				break;
			case 'ArrowRight':
				event.preventDefault();
				viz.setPhaseAndRebuild(viz.phase + step, { pause: true });
				break;
			default:
				break;
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="flex flex-col gap-6">
	<header class="flex flex-col gap-2">
		<p class="font-display text-2xl tracking-tight text-white sm:text-3xl">Trigviz</p>
		<h1 class="text-xl font-medium text-slate-100 sm:text-2xl">
			Watch the unit circle draw sin, cos, and tan
		</h1>
		<p class="max-w-2xl text-sm text-slate-200/80">
			A rotating radius on the unit circle drives the waveforms. Pause, scrub theta, and explore how
			the projections map into the curves — on any screen size.
		</p>
		<nav class="mt-1 flex flex-wrap gap-3 text-sm">
			<span class="rounded-xl bg-white/10 px-3 py-1.5 text-slate-100">Unit circle</span>
			<a
				href="/pi"
				class="rounded-xl border border-teal-300/30 bg-teal-400/10 px-3 py-1.5 text-teal-100 transition hover:bg-teal-400/20"
			>
				π from polygons →
			</a>
		</nav>
	</header>

	<div class="sr-only" aria-live="polite" aria-atomic="true">
		theta {viz.phase.toFixed(2)} radians, sin {viz.sinv.toFixed(3)}, cos {viz.cosv.toFixed(3)}, tan
		{viz.tanv === null ? 'undefined' : viz.tanv.toFixed(3)}
	</div>

	<ControlsPanel
		running={viz.running}
		speed={viz.speed}
		phase={viz.phase}
		turns={viz.turns}
		showSin={viz.showSin}
		showCos={viz.showCos}
		showTan={viz.showTan}
		tanClamp={viz.tanClamp}
		showTanConstruction={viz.showTanConstruction}
		tau={TAU}
		onToggleRunning={() => (viz.running = !viz.running)}
		onReset={() => viz.reset()}
		onSpeedChange={(value) => (viz.speed = value)}
		onPhaseChange={(value) => viz.setPhaseAndRebuild(value, { pause: true })}
		onShowSinChange={(value) => viz.updateFlagsAndRebuild(() => (viz.showSin = value))}
		onShowCosChange={(value) => viz.updateFlagsAndRebuild(() => (viz.showCos = value))}
		onShowTanChange={(value) => viz.updateFlagsAndRebuild(() => (viz.showTan = value))}
		onTanClampChange={(value) => {
			viz.tanClamp = value;
			viz.rebuildFromPhase(viz.phase);
		}}
		onTanConstructionChange={(value) => (viz.showTanConstruction = value)}
	/>

	<div class="relative" bind:this={viz.visualizationEl}>
		<section class="grid grid-cols-1 gap-6 lg:grid-cols-2">
			<UnitCircle
				phase={viz.phase}
				sinv={viz.sinv}
				cosv={viz.cosv}
				tanv={viz.tanv}
				tailPath={viz.tailPath}
				showTanConstruction={viz.showTanConstruction}
				bind:svgEl={viz.circleSvg}
			/>

			<CurvesPlot
				phase={viz.phase}
				sinPath={viz.sinPath}
				cosPath={viz.cosPath}
				tanPath={viz.tanPath}
				showSin={viz.showSin}
				showCos={viz.showCos}
				showTan={viz.showTan}
				tanClamp={viz.tanClamp}
				sinv={viz.sinv}
				cosv={viz.cosv}
				tanv={viz.tanv}
				bind:svgEl={viz.curvesSvg}
			/>
		</section>

		<ConnectorOverlay
			width={viz.overlayWidth}
			height={viz.overlayHeight}
			path={viz.connectorPath}
			bind:svgEl={viz.overlaySvg}
		/>
	</div>
</div>
