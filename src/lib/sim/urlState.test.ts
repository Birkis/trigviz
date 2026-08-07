import { describe, expect, it } from 'vitest';
import { DEFAULT_VIZ_URL_STATE, parseVizSearchParams, serializeVizSearchParams } from './urlState';

describe('urlState', () => {
	it('round-trips viz state through search params', () => {
		const state = {
			...DEFAULT_VIZ_URL_STATE,
			phase: 1.2345,
			speed: 2.5,
			unit: 'deg' as const,
			showCos: false,
			showTanConstruction: true,
			running: false,
			tanClamp: 4.2
		};
		const encoded = serializeVizSearchParams(state);
		const parsed = parseVizSearchParams(encoded);
		expect(parsed.phase).toBeCloseTo(1.2345, 3);
		expect(parsed.speed).toBeCloseTo(2.5);
		expect(parsed.unit).toBe('deg');
		expect(parsed.showSin).toBe(true);
		expect(parsed.showCos).toBe(false);
		expect(parsed.showTan).toBe(true);
		expect(parsed.showTanConstruction).toBe(true);
		expect(parsed.running).toBe(false);
		expect(parsed.tanClamp).toBeCloseTo(4.2);
	});

	it('falls back safely on junk input', () => {
		const parsed = parseVizSearchParams('theta=nope&speed=999&unit=grads&show=');
		expect(parsed.phase).toBe(DEFAULT_VIZ_URL_STATE.phase);
		expect(parsed.speed).toBe(8);
		expect(parsed.unit).toBe('rad');
	});
});
