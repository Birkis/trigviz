<script lang="ts">
	import { explainFrame, formatAngle, identitySnapshot, type AngleUnit } from '$lib/math/angles';

	type Props = {
		phase: number;
		sinv: number;
		cosv: number;
		tanv: number | null;
		unit: AngleUnit;
	};

	let { phase, sinv, cosv, tanv, unit }: Props = $props();

	const explanation = $derived(explainFrame(phase, cosv));
	const identities = $derived(identitySnapshot(sinv, cosv));
</script>

<section class="viz-panel" aria-label="Trigonometric identities and explanation">
	<div class="mb-3 flex items-center justify-between gap-3">
		<span class="font-semibold tracking-[0.2em] text-slate-200 uppercase">This frame</span>
		<span class="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">
			θ = {formatAngle(phase, unit)}
		</span>
	</div>

	<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
		<div>
			<p class="text-sm font-semibold text-white">{explanation.title}</p>
			<p class="mt-1 text-sm text-slate-300">{explanation.detail}</p>
		</div>

		<div class="space-y-2 text-sm text-slate-200">
			<p class="text-xs tracking-[0.2em] text-slate-400 uppercase">Identities</p>
			<p class="tabular-nums">
				sin²θ + cos²θ =
				<span class="text-white">{identities.pythagoras.toFixed(4)}</span>
				<span class="text-slate-400"> (≈ 1)</span>
			</p>
			<p class="tabular-nums">
				tanθ = sinθ / cosθ =
				<span class="text-white">
					{identities.ratio === null || tanv === null ? 'undefined' : identities.ratio.toFixed(4)}
				</span>
			</p>
			<p class="text-xs text-slate-400">
				Live values: sin {sinv.toFixed(3)}, cos {cosv.toFixed(3)}, tan
				{tanv === null ? 'undefined' : tanv.toFixed(3)}
			</p>
		</div>
	</div>
</section>
