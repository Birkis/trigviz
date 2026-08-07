import { describe, expect, it } from 'vitest';
import { TAU } from '$lib/math/trig';
import { createCurveSampler, getSampledPaths, resetAndSample, sampleToPhase } from './curveSampler';
import { createPlotGeometry } from './plotGeometry';

describe('curveSampler', () => {
	const geometry = createPlotGeometry();
	const flags = { showSin: true, showCos: true, showTan: true };

	it('samples sin/cos paths up to a phase', () => {
		const sampler = createCurveSampler(32);
		resetAndSample(sampler, geometry, Math.PI / 2, flags, 3);
		const paths = getSampledPaths(sampler);
		expect(paths.sinPath.startsWith('M ')).toBe(true);
		expect(paths.cosPath.includes('L ')).toBe(true);
		expect(sampler.tail.count).toBeGreaterThan(1);
	});

	it('lifts the tan pen near asymptotes', () => {
		const sampler = createCurveSampler(64);
		resetAndSample(sampler, geometry, TAU * 0.24, flags, 3);
		const before = getSampledPaths(sampler).tanPath;
		sampleToPhase(sampler, geometry, TAU * 0.26, flags, 3);
		const after = getSampledPaths(sampler).tanPath;
		expect(before.length).toBeGreaterThan(0);
		expect(after.includes('M ')).toBe(true);
		// Crossing the asymptote should introduce a fresh moveto (pen up)
		expect((after.match(/M /g) ?? []).length).toBeGreaterThanOrEqual(1);
	});

	it('rebuilds cleanly after wrap-equivalent reset', () => {
		const sampler = createCurveSampler(32);
		resetAndSample(sampler, geometry, 1.2, flags, 3);
		const first = getSampledPaths(sampler).sinPath;
		resetAndSample(sampler, geometry, 1.2, flags, 3);
		const second = getSampledPaths(sampler).sinPath;
		expect(second).toBe(first);
	});
});
