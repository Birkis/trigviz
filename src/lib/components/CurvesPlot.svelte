<script lang="ts">
	type Tick = { label: string; value: number };

	type CurvesPlotProps = {
		plotW: number;
		plotH: number;
		pad: number;
		midY: number;
		plotXTicks: Tick[];
		plotYTicks: Tick[];
		tanTicks: Tick[];
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
		tanv: number;
		tanDefined: boolean;
		xFromPhase: (value: number) => number;
		yFromValue: (value: number) => number;
		yFromTan: (value: number) => number;
		tanAsymptotes: number[];
	};

	let {
		plotW,
		plotH,
		pad,
		midY,
		plotXTicks,
		plotYTicks,
		tanTicks,
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
		tanDefined,
		xFromPhase,
		yFromValue,
		yFromTan,
		tanAsymptotes
	}: CurvesPlotProps = $props();
</script>

<div class="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/30 backdrop-blur">
	<div class="mb-4 flex items-center justify-between text-sm text-slate-200">
		<span class="font-semibold uppercase tracking-[0.2em]">Curves</span>
		<span class="text-xs text-slate-400">theta 0 to 2pi</span>
	</div>

	<svg viewBox={`0 0 ${plotW} ${plotH}`} class="h-auto w-full" role="img" aria-label="Sine cosine tangent curves">
		<rect x="1" y="1" width={plotW - 2} height={plotH - 2} rx="12" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="2" />
		<line x1={pad} y1={midY} x2={plotW - pad} y2={midY} stroke="rgba(255,255,255,0.14)" stroke-width="2" />
		<line x1={pad} y1={pad} x2={pad} y2={plotH - pad} stroke="rgba(255,255,255,0.14)" stroke-width="2" />

		{#each plotXTicks as tick (tick.label)}
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

		{#each plotYTicks as tick (tick.label)}
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
			{#each tanAsymptotes as asymptote (asymptote)}
				<line
					x1={xFromPhase(asymptote)}
					y1={pad}
					x2={xFromPhase(asymptote)}
					y2={plotH - pad}
					stroke="rgba(245,158,11,0.35)"
					stroke-width="2"
					stroke-dasharray="6 6"
				/>
			{/each}

			{#each tanTicks as tick (tick.label)}
				<line
					x1={plotW - pad}
					y1={yFromTan(tick.value)}
					x2={plotW - pad + 6}
					y2={yFromTan(tick.value)}
					stroke="rgba(245,158,11,0.6)"
					stroke-width="2"
				/>
				<text
					x={plotW - pad + 10}
					y={yFromTan(tick.value) + 4}
					font-size="12"
					fill="rgba(245,158,11,0.7)"
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

		<text x={pad} y={pad - 6} font-size="12" fill="rgba(255,255,255,0.55)">
			y = sin/cos/tan(θ)
		</text>
		{#if showTan}
			<text x={plotW - pad} y={pad - 6} font-size="12" fill="rgba(245,158,11,0.7)" text-anchor="end">
				tan scaled to ±{tanClamp.toFixed(1)}
			</text>
		{/if}
	</svg>

	<div class="mt-4 grid grid-cols-1 gap-3 text-sm text-white/90 sm:grid-cols-3">
		<div class="rounded-xl bg-emerald-500/10 px-3 py-2 text-emerald-100">
			sin: <span class="tabular-nums">{sinv.toFixed(4)}</span>
		</div>
		<div class="rounded-xl bg-sky-500/10 px-3 py-2 text-sky-100">
			cos: <span class="tabular-nums">{cosv.toFixed(4)}</span>
		</div>
		<div class="rounded-xl bg-amber-500/10 px-3 py-2 text-amber-100">
			tan: <span class="tabular-nums">{tanDefined ? tanv.toFixed(4) : 'undefined'}</span>
		</div>
	</div>
</div>
