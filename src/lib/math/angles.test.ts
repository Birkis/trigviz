import { describe, expect, it } from 'vitest';
import {
	ANGLE_PRESETS,
	explainFrame,
	formatAngle,
	getQuadrant,
	identitySnapshot,
	phaseFromDisplay,
	radToDeg
} from './angles';
import { TAU } from './trig';

describe('angles helpers', () => {
	it('includes common classroom presets', () => {
		expect(ANGLE_PRESETS.map((p) => p.label)).toContain('π/4');
		expect(ANGLE_PRESETS.find((p) => p.id === 'pi2')?.radians).toBeCloseTo(TAU / 4);
	});

	it('formats degrees and radians', () => {
		expect(formatAngle(Math.PI, 'deg', 0)).toBe('180°');
		expect(formatAngle(1.25, 'rad', 2)).toBe('1.25 rad');
		expect(radToDeg(Math.PI)).toBeCloseTo(180);
	});

	it('converts display input back to phase', () => {
		expect(phaseFromDisplay(90, 'deg')).toBeCloseTo(TAU / 4);
		expect(phaseFromDisplay(1, 'rad')).toBeCloseTo(1);
	});

	it('reports quadrant and asymptote explanations', () => {
		expect(getQuadrant(0.2)).toBe(1);
		expect(getQuadrant(2)).toBe(2);
		const asymptote = explainFrame(Math.PI / 2, 0);
		expect(asymptote.title.toLowerCase()).toContain('asymptote');
		const q1 = explainFrame(0.4, Math.cos(0.4));
		expect(q1.title).toBe('Quadrant 1');
	});

	it('computes identity snapshot', () => {
		const snap = identitySnapshot(0.6, 0.8);
		expect(snap.pythagoras).toBeCloseTo(1);
		expect(snap.ratio).toBeCloseTo(0.75);
	});
});
