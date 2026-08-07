export type PathBuilder = {
	parts: string[];
};

export function createPathBuilder(): PathBuilder {
	return { parts: [] };
}

export function resetPathBuilder(path: PathBuilder) {
	path.parts.length = 0;
}

export function moveTo(path: PathBuilder, x: number, y: number) {
	path.parts.push(`M ${x.toFixed(2)} ${y.toFixed(2)}`);
}

export function lineTo(path: PathBuilder, x: number, y: number) {
	if (path.parts.length === 0) {
		moveTo(path, x, y);
		return;
	}
	path.parts.push(`L ${x.toFixed(2)} ${y.toFixed(2)}`);
}

export function toPathD(path: PathBuilder): string {
	return path.parts.join(' ');
}
