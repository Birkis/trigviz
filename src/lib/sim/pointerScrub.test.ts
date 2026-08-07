import { describe, expect, it } from 'vitest';
import { TAU } from '$lib/math/trig';

// Pure math mirrors of pointer helpers (DOM CTM tested via integration/manual).
function phaseFromCircleLocal(x: number, y: number, cx: number, cy: number) {
	const angle = Math.atan2(-(y - cy), x - cx);
	const wrapped = angle % TAU;
	return wrapped < 0 ? wrapped + TAU : wrapped;
}

function phaseFromPlotLocal(x: number, plotW: number, pad: number) {
	const inner = plotW - pad * 2;
	const ratio = (x - pad) / inner;
	return Math.max(0, Math.min(TAU, ratio * TAU));
}

describe('pointer scrub math', () => {
	it('maps circle tip in Q1 to a small positive angle', () => {
		const phase = phaseFromCircleLocal(170, 70, 100, 100);
		expect(phase).toBeGreaterThan(0);
		expect(phase).toBeLessThan(TAU / 4);
	});

	it('maps plot x at mid-width to about π', () => {
		const phase = phaseFromPlotLocal(280, 560, 18);
		expect(phase).toBeCloseTo(Math.PI, 1);
	});
});
