import { TAU, clamp, normalizePhase } from '$lib/math/trig';

export function svgPointFromClient(
	svg: SVGSVGElement,
	clientX: number,
	clientY: number
): { x: number; y: number } | null {
	const matrix = svg.getScreenCTM();
	if (!matrix) return null;
	const point = svg.createSVGPoint();
	point.x = clientX;
	point.y = clientY;
	const local = point.matrixTransform(matrix.inverse());
	return { x: local.x, y: local.y };
}

/** Angle from circle center; screen y is flipped relative to math. */
export function phaseFromCirclePointer(
	svg: SVGSVGElement,
	clientX: number,
	clientY: number,
	cx: number,
	cy: number
): number | null {
	const local = svgPointFromClient(svg, clientX, clientY);
	if (!local) return null;
	const angle = Math.atan2(-(local.y - cy), local.x - cx);
	return normalizePhase(angle);
}

export function phaseFromPlotPointer(
	svg: SVGSVGElement,
	clientX: number,
	clientY: number,
	plotW: number,
	pad: number
): number | null {
	const local = svgPointFromClient(svg, clientX, clientY);
	if (!local) return null;
	const inner = plotW - pad * 2;
	if (inner <= 0) return null;
	const ratio = (local.x - pad) / inner;
	return clamp(ratio * TAU, 0, TAU);
}
