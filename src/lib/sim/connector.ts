export type Point = { x: number; y: number };

export function toOverlayPoint(
	svg: SVGSVGElement | null,
	overlaySvg: SVGSVGElement | null,
	point: Point
): Point | null {
	if (!svg || !overlaySvg) return null;
	const matrix = svg.getScreenCTM();
	if (!matrix) return null;
	const svgPoint = svg.createSVGPoint();
	svgPoint.x = point.x;
	svgPoint.y = point.y;
	const screen = svgPoint.matrixTransform(matrix);
	const overlayRect = overlaySvg.getBoundingClientRect();
	return { x: screen.x - overlayRect.left, y: screen.y - overlayRect.top };
}

export function horizontalConnectorPath(start: Point, end: Point): string {
	return `M ${start.x.toFixed(1)} ${start.y.toFixed(1)} L ${end.x.toFixed(1)} ${start.y.toFixed(1)}`;
}
