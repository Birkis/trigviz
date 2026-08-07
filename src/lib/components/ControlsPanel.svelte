<script lang="ts">
	import {
		ANGLE_PRESETS,
		displayFromPhase,
		formatAngle,
		phaseFromDisplay,
		type AngleUnit
	} from '$lib/math/angles';
	import { TAU } from '$lib/math/trig';

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
		unit: AngleUnit;
		onToggleRunning: () => void;
		onReset: () => void;
		onSpeedChange: (value: number) => void;
		onPhaseChange: (value: number) => void;
		onShowSinChange: (value: boolean) => void;
		onShowCosChange: (value: boolean) => void;
		onShowTanChange: (value: boolean) => void;
		onTanClampChange: (value: number) => void;
		onTanConstructionChange: (value: boolean) => void;
		onUnitChange: (value: AngleUnit) => void;
		onCopyLink: () => void;
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
		unit,
		onToggleRunning,
		onReset,
		onSpeedChange,
		onPhaseChange,
		onShowSinChange,
		onShowCosChange,
		onShowTanChange,
		onTanClampChange,
		onTanConstructionChange,
		onUnitChange,
		onCopyLink
	}: ControlsProps = $props();

	let copyLabel = $state('Copy link');

	const phaseDisplay = $derived(displayFromPhase(phase, unit));
	const phaseMax = $derived(unit === 'deg' ? 360 : TAU);
	const phaseStep = $derived(unit === 'deg' ? 0.1 : 0.0005);

	function readNumber(event: Event) {
		const value = Number((event.currentTarget as HTMLInputElement).value);
		return Number.isFinite(value) ? value : null;
	}

	function handleSpeedInput(event: Event) {
		const value = readNumber(event);
		if (value !== null) onSpeedChange(value);
	}

	function handlePhaseInput(event: Event) {
		const value = readNumber(event);
		if (value !== null) onPhaseChange(phaseFromDisplay(value, unit));
	}

	function handleTanClampInput(event: Event) {
		const value = readNumber(event);
		if (value !== null) onTanClampChange(value);
	}

	async function handleCopyLink() {
		onCopyLink();
		copyLabel = 'Copied';
		window.setTimeout(() => {
			copyLabel = 'Copy link';
		}, 1500);
	}
</script>

<section class="viz-panel">
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

		<button
			type="button"
			class="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10"
			onclick={handleCopyLink}
		>
			{copyLabel}
		</button>

		<div class="flex items-center gap-1 rounded-xl border border-white/15 p-1 text-sm">
			<button
				type="button"
				class="rounded-lg px-3 py-1.5 font-semibold transition {unit === 'rad'
					? 'bg-white text-slate-900'
					: 'text-white/80 hover:bg-white/10'}"
				aria-pressed={unit === 'rad'}
				onclick={() => onUnitChange('rad')}
			>
				rad
			</button>
			<button
				type="button"
				class="rounded-lg px-3 py-1.5 font-semibold transition {unit === 'deg'
					? 'bg-white text-slate-900'
					: 'text-white/80 hover:bg-white/10'}"
				aria-pressed={unit === 'deg'}
				onclick={() => onUnitChange('deg')}
			>
				deg
			</button>
		</div>

		<label class="flex items-center gap-2 text-sm text-slate-200">
			<span class="w-14 text-slate-400">Speed</span>
			<input
				class="h-2 w-40 cursor-pointer appearance-none rounded-full bg-white/20 accent-white sm:w-56"
				type="range"
				min="0"
				max="8"
				step="0.05"
				value={speed}
				oninput={handleSpeedInput}
			/>
			<span class="text-white/80 tabular-nums">{speed.toFixed(2)} rad/s</span>
		</label>

		<div class="ml-auto flex flex-wrap items-center gap-2 text-sm text-slate-300">
			<span class="rounded-full bg-white/10 px-3 py-1">Turns: {turns}</span>
			<span class="rounded-full bg-white/10 px-3 py-1">Theta: {formatAngle(phase, unit, 3)}</span>
		</div>
	</div>

	<div class="mt-4">
		<p class="mb-2 text-xs tracking-[0.2em] text-slate-400 uppercase">Angle presets</p>
		<div class="flex flex-wrap gap-2">
			{#each ANGLE_PRESETS as preset (preset.id)}
				<button
					type="button"
					class="rounded-lg border border-white/15 px-2.5 py-1 text-xs font-semibold text-white/90 transition hover:bg-white/10"
					onclick={() => onPhaseChange(preset.radians)}
				>
					{preset.label}
				</button>
			{/each}
		</div>
	</div>

	<div class="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-200">
		<label class="flex items-center gap-2">
			<input
				class="accent-emerald-400"
				type="checkbox"
				checked={showSin}
				onchange={(event) => onShowSinChange((event.currentTarget as HTMLInputElement).checked)}
			/>
			<span class="text-emerald-200">sin</span>
		</label>
		<label class="flex items-center gap-2">
			<input
				class="accent-sky-400"
				type="checkbox"
				checked={showCos}
				onchange={(event) => onShowCosChange((event.currentTarget as HTMLInputElement).checked)}
			/>
			<span class="text-sky-200">cos</span>
		</label>
		<label class="flex items-center gap-2">
			<input
				class="accent-amber-400"
				type="checkbox"
				checked={showTan}
				onchange={(event) => onShowTanChange((event.currentTarget as HTMLInputElement).checked)}
			/>
			<span class="text-amber-200">tan (scaled)</span>
		</label>
		<label class="flex items-center gap-2">
			<input
				class="accent-amber-400"
				type="checkbox"
				checked={showTanConstruction}
				onchange={(event) =>
					onTanConstructionChange((event.currentTarget as HTMLInputElement).checked)}
			/>
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
			<span class="text-white/80 tabular-nums">{tanClamp.toFixed(1)}</span>
		</label>

		<label class="flex items-center gap-2">
			<span class="w-24 text-slate-400">Theta</span>
			<input
				class="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-white"
				type="range"
				min="0"
				max={phaseMax}
				step={phaseStep}
				value={phaseDisplay}
				oninput={handlePhaseInput}
			/>
		</label>
	</div>

	<p class="mt-3 text-xs text-slate-400">
		Drag the radius tip or the curve's phase line to scrub θ. Keyboard: Space to pause/run, arrows
		to nudge (Shift for larger steps). Scrubbing auto-pauses.
	</p>
</section>
