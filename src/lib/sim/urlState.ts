import { TAU, clamp, normalizePhase } from '$lib/math/trig';
import type { AngleUnit } from '$lib/math/angles';

export type VizUrlState = {
	phase: number;
	speed: number;
	unit: AngleUnit;
	showSin: boolean;
	showCos: boolean;
	showTan: boolean;
	tanClamp: number;
	showTanConstruction: boolean;
	running: boolean;
};

export const DEFAULT_VIZ_URL_STATE: VizUrlState = {
	phase: 0,
	speed: 1.6,
	unit: 'rad',
	showSin: true,
	showCos: true,
	showTan: true,
	tanClamp: 3,
	showTanConstruction: false,
	running: true
};

function parseBool(value: string | null, fallback: boolean) {
	if (value === null) return fallback;
	if (value === '1' || value === 'true') return true;
	if (value === '0' || value === 'false') return false;
	return fallback;
}

function parseShowFlags(
	value: string | null,
	fallback: Pick<VizUrlState, 'showSin' | 'showCos' | 'showTan'>
) {
	if (!value) return fallback;
	const parts = new Set(
		value
			.split(',')
			.map((part) => part.trim().toLowerCase())
			.filter(Boolean)
	);
	if (parts.size === 0) return fallback;
	return {
		showSin: parts.has('sin'),
		showCos: parts.has('cos'),
		showTan: parts.has('tan')
	};
}

export function parseVizSearchParams(
	search: string | URLSearchParams,
	fallback: VizUrlState = DEFAULT_VIZ_URL_STATE
): VizUrlState {
	const params = typeof search === 'string' ? new URLSearchParams(search) : search;

	const thetaRaw = params.get('theta') ?? params.get('t');
	const theta = thetaRaw === null ? fallback.phase : Number(thetaRaw);
	const speedRaw = params.get('speed');
	const speed = speedRaw === null ? fallback.speed : Number(speedRaw);
	const clampRaw = params.get('tanClamp') ?? params.get('clamp');
	const tanClamp = clampRaw === null ? fallback.tanClamp : Number(clampRaw);
	const unitRaw = params.get('unit');
	const unit: AngleUnit = unitRaw === 'deg' || unitRaw === 'rad' ? unitRaw : fallback.unit;

	const show = parseShowFlags(params.get('show'), {
		showSin: fallback.showSin,
		showCos: fallback.showCos,
		showTan: fallback.showTan
	});

	return {
		phase: Number.isFinite(theta)
			? clamp(normalizePhase(theta === TAU ? TAU : theta), 0, TAU)
			: fallback.phase,
		speed: Number.isFinite(speed) ? clamp(speed, 0, 8) : fallback.speed,
		unit,
		showSin: show.showSin,
		showCos: show.showCos,
		showTan: show.showTan,
		tanClamp: Number.isFinite(tanClamp) ? clamp(tanClamp, 1, 6) : fallback.tanClamp,
		showTanConstruction: parseBool(params.get('construct'), fallback.showTanConstruction),
		running: parseBool(params.get('run'), fallback.running)
	};
}

export function serializeVizSearchParams(state: VizUrlState): string {
	const params = new URLSearchParams();
	params.set('theta', state.phase.toFixed(4));
	params.set('speed', state.speed.toFixed(2));
	params.set('unit', state.unit);

	const show: string[] = [];
	if (state.showSin) show.push('sin');
	if (state.showCos) show.push('cos');
	if (state.showTan) show.push('tan');
	params.set('show', show.join(',') || 'none');

	params.set('tanClamp', state.tanClamp.toFixed(1));
	if (state.showTanConstruction) params.set('construct', '1');
	params.set('run', state.running ? '1' : '0');
	return params.toString();
}

export function replaceUrlSearch(search: string) {
	if (typeof window === 'undefined') return;
	const url = `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`;
	window.history.replaceState(window.history.state, '', url);
}
