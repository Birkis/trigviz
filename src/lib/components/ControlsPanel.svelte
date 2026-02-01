<script lang="ts">
	type ControlsProps = {
		running: boolean;
		speed: number;
		phase: number;
		turns: number;
		showSin: boolean;
		showCos: boolean;
		showTan: boolean;
		tanClamp: number;
		showTanConstruction: boolean;
		tau: number;
		onToggleRunning: () => void;
		onReset: () => void;
		onSpeedChange: (value: number) => void;
		onPhaseChange: (value: number) => void;
		onToggleShowSin: () => void;
		onToggleShowCos: () => void;
		onToggleShowTan: () => void;
		onTanClampChange: (value: number) => void;
		onToggleTanConstruction: () => void;
	};

	let {
		running,
		speed,
		phase,
		turns,
		showSin,
		showCos,
		showTan,
		tanClamp,
		showTanConstruction,
		tau,
		onToggleRunning,
		onReset,
		onSpeedChange,
		onPhaseChange,
		onToggleShowSin,
		onToggleShowCos,
		onToggleShowTan,
		onTanClampChange,
		onToggleTanConstruction
	}: ControlsProps = $props();

	function handleSpeedInput(event: Event) {
		onSpeedChange(Number((event.currentTarget as HTMLInputElement).value));
	}

	function handlePhaseInput(event: Event) {
		onPhaseChange(Number((event.currentTarget as HTMLInputElement).value));
	}

	function handleTanClampInput(event: Event) {
		onTanClampChange(Number((event.currentTarget as HTMLInputElement).value));
	}
</script>

<section class="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-xl shadow-black/30 backdrop-blur">
	<div class="flex flex-wrap items-center gap-3">
		<button
			type="button"
			class="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
			onclick={onToggleRunning}
		>
			{running ? 'Pause' : 'Run'}
		</button>

		<button
			type="button"
			class="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10"
			onclick={onReset}
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
				value={speed}
				oninput={handleSpeedInput}
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
			<input class="accent-emerald-400" type="checkbox" checked={showSin} onclick={onToggleShowSin} />
			<span class="text-emerald-200">sin</span>
		</label>
		<label class="flex items-center gap-2">
			<input class="accent-sky-400" type="checkbox" checked={showCos} onclick={onToggleShowCos} />
			<span class="text-sky-200">cos</span>
		</label>
		<label class="flex items-center gap-2">
			<input class="accent-amber-400" type="checkbox" checked={showTan} onclick={onToggleShowTan} />
			<span class="text-amber-200">tan (scaled)</span>
		</label>
		<label class="flex items-center gap-2">
			<input class="accent-amber-400" type="checkbox" checked={showTanConstruction} onclick={onToggleTanConstruction} />
			<span class="text-amber-200">tan construction</span>
		</label>
	</div>

	<div class="mt-4 grid grid-cols-1 gap-4 text-sm text-slate-200 lg:grid-cols-2">
		<label class="flex items-center gap-2">
			<span class="w-24 text-slate-400">Tan clamp</span>
			<input
				class="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-amber-300"
				type="range"
				min="1"
				max="6"
				step="0.1"
				value={tanClamp}
				oninput={handleTanClampInput}
			/>
			<span class="tabular-nums text-white/80">{tanClamp.toFixed(1)}</span>
		</label>

		<label class="flex items-center gap-2">
			<span class="w-24 text-slate-400">Theta</span>
			<input
				class="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-white"
				type="range"
				min="0"
				max={tau}
				step="0.0005"
				value={phase}
				oninput={handlePhaseInput}
			/>
		</label>
	</div>

	<p class="mt-3 text-xs text-slate-400">
		Keyboard: Space to pause/run, arrows to scrub θ (hold Shift for larger steps).
	</p>
</section>
