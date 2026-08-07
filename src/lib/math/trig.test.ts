import { describe, expect, it } from 'vitest';
import { DEFAULT_TAN_EPSILON, TAU, clamp, isNearAsymptote, normalizePhase, safeTan } from './trig';

describe('trig helpers', () => {
	it('clamps values into range', () => {
		expect(clamp(5, 0, 3)).toBe(3);
		expect(clamp(-1, 0, 3)).toBe(0);
		expect(clamp(1.5, 0, 3)).toBe(1.5);
	});

	it('normalizes phase into [0, TAU)', () => {
		expect(normalizePhase(0)).toBe(0);
		expect(normalizePhase(TAU)).toBe(0);
		expect(normalizePhase(TAU + 0.5)).toBeCloseTo(0.5);
		expect(normalizePhase(-0.25)).toBeCloseTo(TAU - 0.25);
	});

	it('detects asymptotes from cosine', () => {
		expect(isNearAsymptote(0, DEFAULT_TAN_EPSILON)).toBe(true);
		expect(isNearAsymptote(0.01, DEFAULT_TAN_EPSILON)).toBe(true);
		expect(isNearAsymptote(0.5, DEFAULT_TAN_EPSILON)).toBe(false);
	});

	it('returns null for undefined or clamped-out tan', () => {
		expect(safeTan(Math.PI / 2, 3)).toBeNull();
		expect(safeTan(1.4, 1)).toBeNull();
		expect(safeTan(0.5, 3)).toBeCloseTo(Math.tan(0.5));
	});
});
