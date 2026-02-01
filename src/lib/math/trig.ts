export const TAU = Math.PI * 2;

export function clamp(value: number, min: number, max: number) {
	return Math.max(min, Math.min(max, value));
}

export function isNearAsymptote(cosValue: number, epsilon: number) {
	return Math.abs(cosValue) < epsilon;
}
