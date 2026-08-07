import { TAU } from '$lib/math/trig';

export type PlotGeometry = {
	plotW: number;
	plotH: number;
	pad: number;
	amp: number;
	midY: number;
	sampleStep: number;
	xFromPhase: (p: number) => number;
	yFromValue: (v: number) => number;
	yFromTan: (v: number, tanClamp: number) => number;
};

export type CircleGeometry = {
	circleSize: number;
	cx: number;
	cy: number;
	r: number;
	pad: number;
	tanLineX: number;
};

export type TailGeometry = {
	tailW: number;
	tailH: number;
	tailPad: number;
	tailMid: number;
	tailAmp: number;
	tailMax: number;
};

export function createPlotGeometry(plotW = 560, plotH = 380, pad = 18): PlotGeometry {
	const amp = (plotH - pad * 2) * 0.48;
	const midY = plotH / 2;
	const sampleStep = TAU / (plotW - pad * 2);

	return {
		plotW,
		plotH,
		pad,
		amp,
		midY,
		sampleStep,
		xFromPhase: (p: number) => pad + (p / TAU) * (plotW - pad * 2),
		yFromValue: (v: number) => midY - v * amp,
		yFromTan: (v: number, tanClamp: number) => midY - (v / tanClamp) * amp
	};
}

export function createCircleGeometry(circleSize = 340, pad = 18): CircleGeometry {
	const cx = circleSize / 2;
	const cy = circleSize / 2;
	const r = circleSize * 0.38;
	return {
		circleSize,
		cx,
		cy,
		r,
		pad,
		tanLineX: cx + r
	};
}

export function createTailGeometry(circleSize = 340, tailMax = 220): TailGeometry {
	const tailW = 240;
	const tailH = circleSize;
	const tailPad = 18;
	return {
		tailW,
		tailH,
		tailPad,
		tailMid: tailH / 2,
		tailAmp: (tailH - tailPad * 2) * 0.4,
		tailMax
	};
}

export const PLOT_X_TICKS = [
	{ label: '0', value: 0 },
	{ label: 'π/2', value: TAU / 4 },
	{ label: 'π', value: TAU / 2 },
	{ label: '3π/2', value: (TAU * 3) / 4 },
	{ label: '2π', value: TAU }
];

export const PLOT_Y_TICKS = [
	{ label: '1', value: 1 },
	{ label: '0', value: 0 },
	{ label: '-1', value: -1 }
];

export const TAN_ASYMPTOTES = [TAU / 4, (TAU * 3) / 4];
