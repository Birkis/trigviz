import { DEFAULT_TAN_EPSILON, isNearAsymptote, safeTan } from '$lib/math/trig';
import {
	createPathBuilder,
	lineTo,
	moveTo,
	resetPathBuilder,
	toPathD,
	type PathBuilder
} from './pathBuilder';
import { createRingBuffer, pushRingBuffer, resetRingBuffer, type RingBuffer } from './ringBuffer';
import type { PlotGeometry } from './plotGeometry';

export type SamplerFlags = {
	showSin: boolean;
	showCos: boolean;
	showTan: boolean;
};

export type CurveSampler = {
	sin: PathBuilder;
	cos: PathBuilder;
	tan: PathBuilder;
	tanPenDown: boolean;
	lastSamplePhase: number;
	tail: RingBuffer;
};

export type SampledPaths = {
	sinPath: string;
	cosPath: string;
	tanPath: string;
};

export function createCurveSampler(tailMax: number): CurveSampler {
	return {
		sin: createPathBuilder(),
		cos: createPathBuilder(),
		tan: createPathBuilder(),
		tanPenDown: false,
		lastSamplePhase: 0,
		tail: createRingBuffer(tailMax)
	};
}

export function resetTraces(sampler: CurveSampler) {
	resetPathBuilder(sampler.sin);
	resetPathBuilder(sampler.cos);
	resetPathBuilder(sampler.tan);
	sampler.tanPenDown = false;
}

export function getSampledPaths(sampler: CurveSampler): SampledPaths {
	return {
		sinPath: toPathD(sampler.sin),
		cosPath: toPathD(sampler.cos),
		tanPath: toPathD(sampler.tan)
	};
}

export function sampleAt(
	sampler: CurveSampler,
	geometry: PlotGeometry,
	phase: number,
	flags: SamplerFlags,
	tanClamp: number,
	tanEpsilon: number = DEFAULT_TAN_EPSILON
) {
	const x = geometry.xFromPhase(phase);

	if (flags.showSin) {
		lineTo(sampler.sin, x, geometry.yFromValue(Math.sin(phase)));
	}
	if (flags.showCos) {
		lineTo(sampler.cos, x, geometry.yFromValue(Math.cos(phase)));
	}

	if (flags.showTan) {
		const cosValue = Math.cos(phase);
		if (isNearAsymptote(cosValue, tanEpsilon)) {
			sampler.tanPenDown = false;
		} else {
			const t = safeTan(phase, tanClamp, tanEpsilon);
			if (t !== null) {
				const y = geometry.yFromTan(t, tanClamp);
				if (!sampler.tanPenDown) {
					moveTo(sampler.tan, x, y);
					sampler.tanPenDown = true;
				} else {
					lineTo(sampler.tan, x, y);
				}
			} else {
				sampler.tanPenDown = false;
			}
		}
	}

	pushRingBuffer(sampler.tail, Math.sin(phase));
}

export function sampleToPhase(
	sampler: CurveSampler,
	geometry: PlotGeometry,
	targetPhase: number,
	flags: SamplerFlags,
	tanClamp: number,
	tanEpsilon: number = DEFAULT_TAN_EPSILON
) {
	while (sampler.lastSamplePhase + geometry.sampleStep <= targetPhase) {
		sampler.lastSamplePhase += geometry.sampleStep;
		sampleAt(sampler, geometry, sampler.lastSamplePhase, flags, tanClamp, tanEpsilon);
	}

	if (targetPhase !== sampler.lastSamplePhase) {
		sampler.lastSamplePhase = targetPhase;
		sampleAt(sampler, geometry, sampler.lastSamplePhase, flags, tanClamp, tanEpsilon);
	}
}

export function resetAndSample(
	sampler: CurveSampler,
	geometry: PlotGeometry,
	targetPhase: number,
	flags: SamplerFlags,
	tanClamp: number,
	tanEpsilon: number = DEFAULT_TAN_EPSILON
) {
	resetTraces(sampler);
	resetRingBuffer(sampler.tail);
	sampler.lastSamplePhase = 0;
	sampleAt(sampler, geometry, 0, flags, tanClamp, tanEpsilon);
	sampleToPhase(sampler, geometry, targetPhase, flags, tanClamp, tanEpsilon);
}
