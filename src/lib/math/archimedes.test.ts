import { describe, expect, it } from 'vitest';
import {
	MAX_STEPS,
	boundsAtStep,
	boundsForSides,
	polygonPath,
	regularPolygonVertices,
	sidesAtStep
} from './archimedes';

describe('Archimedes π bounds', () => {
	it('starts with square side counts', () => {
		expect(sidesAtStep(0)).toBe(4);
		expect(sidesAtStep(1)).toBe(8);
		expect(sidesAtStep(3)).toBe(32);
		expect(sidesAtStep(MAX_STEPS)).toBe(4 * 2 ** MAX_STEPS);
	});

	it('matches the classic square bounds for diameter 1', () => {
		const square = boundsForSides(4);
		expect(square.outer).toBeCloseTo(4, 10);
		expect(square.inner).toBeCloseTo(2 * Math.SQRT2, 10);
		expect(square.average).toBeCloseTo((4 + 2 * Math.SQRT2) / 2, 10);
	});

	it('squeezes toward π as sides double', () => {
		let prevWidth = Infinity;
		for (let step = 0; step <= 6; step++) {
			const { inner, outer, average, error } = boundsAtStep(step);
			expect(inner).toBeLessThan(Math.PI);
			expect(outer).toBeGreaterThan(Math.PI);
			expect(outer - inner).toBeLessThan(prevWidth);
			prevWidth = outer - inner;
			expect(error).toBeLessThan(outer - inner);
			expect(average).toBeGreaterThan(inner);
			expect(average).toBeLessThan(outer);
		}
		expect(boundsAtStep(6).error).toBeLessThan(1e-4);
	});

	it('builds closed polygon paths with the right vertex counts', () => {
		const outer = regularPolygonVertices(4, 100, 'circumscribed', 0, 0);
		const inner = regularPolygonVertices(4, 100, 'inscribed', 0, 0);
		expect(outer).toHaveLength(4);
		expect(inner).toHaveLength(4);
		// Outer square is axis-aligned: equal |x| and |y| at corners
		expect(Math.abs(outer[0]!.x)).toBeCloseTo(Math.abs(outer[0]!.y), 8);
		// Inner diamond has a vertex on +x
		expect(inner[0]!.y).toBeCloseTo(0, 8);
		expect(inner[0]!.x).toBeCloseTo(100, 8);

		const path = polygonPath(outer);
		expect(path.startsWith('M ')).toBe(true);
		expect(path.endsWith(' Z')).toBe(true);
	});
});
