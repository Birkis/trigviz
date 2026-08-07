/** Circle diameter is 1, so circumference equals π. */

export type ArchimedesPoint = { x: number; y: number };

export type ArchimedesBounds = {
	sides: number;
	/** Inscribed (inner) regular polygon perimeter — lower bound for π. */
	inner: number;
	/** Circumscribed (outer) regular polygon perimeter — upper bound for π. */
	outer: number;
	/** Midpoint estimate (inner + outer) / 2. */
	average: number;
	error: number;
};

export const MIN_SIDES = 4;
export const MAX_STEPS = 8; // 4 → 512 sides

/** Side count after `step` doublings from a square (step 0 → 4 sides). */
export function sidesAtStep(step: number): number {
	const clamped = Math.max(0, Math.min(MAX_STEPS, Math.floor(step)));
	return MIN_SIDES * 2 ** clamped;
}

/**
 * Perimeters of regular n-gons for a circle of diameter 1.
 * Inner: n · sin(π/n)   Outer: n · tan(π/n)
 */
export function boundsForSides(sides: number): ArchimedesBounds {
	const n = Math.max(3, Math.floor(sides));
	const halfAngle = Math.PI / n;
	const inner = n * Math.sin(halfAngle);
	const outer = n * Math.tan(halfAngle);
	const average = (inner + outer) / 2;
	return {
		sides: n,
		inner,
		outer,
		average,
		error: Math.abs(average - Math.PI)
	};
}

export function boundsAtStep(step: number): ArchimedesBounds {
	return boundsForSides(sidesAtStep(step));
}

/**
 * Vertices of a regular n-gon.
 * - inscribed: vertices on the circle
 * - circumscribed: sides tangent to the circle
 *
 * Orientation: flat-top outer square / diamond inner square at n = 4
 * (inner rotated 45° relative to outer), matching the classic diagram.
 */
export function regularPolygonVertices(
	sides: number,
	radius: number,
	mode: 'inscribed' | 'circumscribed',
	cx = 0,
	cy = 0
): ArchimedesPoint[] {
	const n = Math.max(3, Math.floor(sides));
	const r = mode === 'inscribed' ? radius : radius / Math.cos(Math.PI / n);
	// Outer square axis-aligned: first vertex at angle π/n from +x (flat top).
	// Inner square: same angular spacing but vertices on axes → rotate by 0
	// for inscribed with startAngle = 0 would put vertex on +x (diamond).
	const startAngle = mode === 'circumscribed' ? Math.PI / n : 0;

	const points: ArchimedesPoint[] = [];
	for (let i = 0; i < n; i++) {
		const angle = startAngle + (i * 2 * Math.PI) / n;
		points.push({
			x: cx + r * Math.cos(angle),
			y: cy - r * Math.sin(angle)
		});
	}
	return points;
}

export function polygonPath(points: ArchimedesPoint[]): string {
	if (points.length === 0) return '';
	const [first, ...rest] = points;
	return `M ${first.x} ${first.y} ${rest.map((p) => `L ${p.x} ${p.y}`).join(' ')} Z`;
}
