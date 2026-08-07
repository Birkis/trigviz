export const TAU = Math.PI * 2;

export const DEFAULT_TAN_EPSILON = 0.02;

export function clamp(value: number, min: number, max: number) {
	return Math.max(min, Math.min(max, value));
}

export function normalizePhase(phase: number) {
	const wrapped = phase % TAU;
	return wrapped < 0 ? wrapped + TAU : wrapped;
}

export function isNearAsymptote(cosValue: number, epsilon: number = DEFAULT_TAN_EPSILON) {
	return Math.abs(cosValue) < epsilon;
}

/** Finite tan within clamp and away from asymptotes; otherwise null. */
export function safeTan(
	phase: number,
	tanClamp: number,
	epsilon: number = DEFAULT_TAN_EPSILON
): number | null {
	const cosValue = Math.cos(phase);
	if (isNearAsymptote(cosValue, epsilon)) return null;
	const t = Math.tan(phase);
	if (!Number.isFinite(t) || Math.abs(t) > tanClamp) return null;
	return t;
}
