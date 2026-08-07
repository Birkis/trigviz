import { TAU, clamp, isNearAsymptote, normalizePhase } from './trig';

export type AngleUnit = 'rad' | 'deg';

export type AnglePreset = {
	id: string;
	label: string;
	radians: number;
};

export const ANGLE_PRESETS: AnglePreset[] = [
	{ id: '0', label: '0', radians: 0 },
	{ id: 'pi6', label: 'π/6', radians: TAU / 12 },
	{ id: 'pi4', label: 'π/4', radians: TAU / 8 },
	{ id: 'pi3', label: 'π/3', radians: TAU / 6 },
	{ id: 'pi2', label: 'π/2', radians: TAU / 4 },
	{ id: '2pi3', label: '2π/3', radians: TAU / 3 },
	{ id: '3pi4', label: '3π/4', radians: (3 * TAU) / 8 },
	{ id: 'pi', label: 'π', radians: TAU / 2 },
	{ id: '3pi2', label: '3π/2', radians: (3 * TAU) / 4 },
	{ id: '2pi', label: '2π', radians: TAU }
];

export function radToDeg(radians: number) {
	return (radians * 180) / Math.PI;
}

export function degToRad(degrees: number) {
	return (degrees * Math.PI) / 180;
}

export function formatAngle(radians: number, unit: AngleUnit, digits = 2) {
	if (unit === 'deg') {
		return `${radToDeg(radians).toFixed(digits)}°`;
	}
	return `${radians.toFixed(digits)} rad`;
}

export function phaseFromDisplay(value: number, unit: AngleUnit) {
	const radians = unit === 'deg' ? degToRad(value) : value;
	if (!Number.isFinite(radians)) return 0;
	return clamp(radians, 0, TAU);
}

export function displayFromPhase(radians: number, unit: AngleUnit) {
	return unit === 'deg' ? radToDeg(radians) : radians;
}

export type Quadrant = 1 | 2 | 3 | 4;

export function getQuadrant(phase: number): Quadrant {
	const p = normalizePhase(phase);
	if (p < TAU / 4) return 1;
	if (p < TAU / 2) return 2;
	if (p < (3 * TAU) / 4) return 3;
	return 4;
}

export type FrameExplanation = {
	quadrant: Quadrant;
	title: string;
	detail: string;
};

export function explainFrame(phase: number, cosValue: number, tanEpsilon = 0.02): FrameExplanation {
	const quadrant = getQuadrant(phase);

	if (isNearAsymptote(cosValue, tanEpsilon)) {
		return {
			quadrant,
			title: 'Approaching a vertical asymptote',
			detail:
				'cos(θ) is near zero, so the radius is nearly vertical and tan(θ) = sin(θ)/cos(θ) blows up — the curve lifts its pen.'
		};
	}

	const signs =
		quadrant === 1
			? 'sin and cos are both positive'
			: quadrant === 2
				? 'sin is positive, cos is negative'
				: quadrant === 3
					? 'sin and cos are both negative'
					: 'sin is negative, cos is positive';

	return {
		quadrant,
		title: `Quadrant ${quadrant}`,
		detail: `${signs}. The height of the tip is sin(θ); its horizontal reach is cos(θ); tan(θ) is the slope of the radius.`
	};
}

export function identitySnapshot(sinValue: number, cosValue: number) {
	const pythagoras = sinValue * sinValue + cosValue * cosValue;
	const ratio = Math.abs(cosValue) < 1e-8 ? null : sinValue / cosValue;
	return { pythagoras, ratio };
}
