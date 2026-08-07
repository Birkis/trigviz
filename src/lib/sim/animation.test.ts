import { describe, expect, it } from 'vitest';
import { TAU } from '$lib/math/trig';
import { MAX_DT_SECONDS, advancePhase, scrubPhase } from './animation';

describe('animation', () => {
	it('advances phase without wrapping under TAU', () => {
		const result = advancePhase(1, 2, 0.04);
		expect(result.phase).toBeCloseTo(1.08);
		expect(result.wrapped).toBe(false);
		expect(result.turnsDelta).toBe(0);
	});

	it('wraps and counts turns', () => {
		const result = advancePhase(TAU - 0.1, 2, 0.2);
		expect(result.wrapped).toBe(true);
		expect(result.turnsDelta).toBe(1);
		expect(result.phase).toBeGreaterThanOrEqual(0);
		expect(result.phase).toBeLessThan(TAU);
	});

	it('clamps large dt spikes', () => {
		const uncapped = advancePhase(0, 10, 5, Number.POSITIVE_INFINITY);
		const capped = advancePhase(0, 10, 5, MAX_DT_SECONDS);
		expect(capped.phase).toBeLessThan(uncapped.phase);
		expect(capped.phase).toBeCloseTo(10 * MAX_DT_SECONDS);
	});

	it('scrubs phase into [0, TAU]', () => {
		expect(scrubPhase(-1)).toBe(0);
		expect(scrubPhase(100)).toBe(TAU);
		expect(scrubPhase(1.25)).toBe(1.25);
	});
});
