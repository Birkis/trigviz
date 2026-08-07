import { TAU, clamp, normalizePhase } from '$lib/math/trig';

/** Cap dt so background tabs don't jump many turns in one frame. */
export const MAX_DT_SECONDS = 1 / 20;

export type PhaseAdvance = {
	phase: number;
	turnsDelta: number;
	wrapped: boolean;
};

export function advancePhase(
	phase: number,
	speed: number,
	dtSeconds: number,
	maxDt: number = MAX_DT_SECONDS
): PhaseAdvance {
	const dt = Math.min(Math.max(dtSeconds, 0), maxDt);
	const nextPhase = phase + speed * dt;

	if (nextPhase >= TAU) {
		const turnsDelta = Math.floor(nextPhase / TAU);
		return {
			phase: normalizePhase(nextPhase),
			turnsDelta,
			wrapped: true
		};
	}

	if (nextPhase < 0) {
		const turnsDelta = Math.ceil(nextPhase / TAU) - 1;
		return {
			phase: normalizePhase(nextPhase),
			turnsDelta,
			wrapped: true
		};
	}

	return {
		phase: nextPhase,
		turnsDelta: 0,
		wrapped: false
	};
}

export function scrubPhase(value: number) {
	return clamp(value, 0, TAU);
}

export type RafLoop = {
	start: (onFrame: (dtSeconds: number, now: number) => void) => void;
	stop: () => void;
	get running(): boolean;
};

export function createRafLoop(): RafLoop {
	let raf = 0;
	let last = 0;
	let active = false;

	const stop = () => {
		active = false;
		if (raf) {
			cancelAnimationFrame(raf);
			raf = 0;
		}
	};

	const start = (onFrame: (dtSeconds: number, now: number) => void) => {
		stop();
		active = true;
		last = performance.now();

		const tick = (now: number) => {
			if (!active) return;
			raf = requestAnimationFrame(tick);
			const dt = (now - last) / 1000;
			last = now;
			onFrame(dt, now);
		};

		raf = requestAnimationFrame(tick);
	};

	return {
		start,
		stop,
		get running() {
			return active;
		}
	};
}

export type ScheduledFrame = {
	schedule: (fn: () => void) => void;
	cancel: () => void;
};

/** Coalesce work onto the next animation frame; cancelable on teardown. */
export function createScheduledFrame(): ScheduledFrame {
	let id = 0;

	const cancel = () => {
		if (id) {
			cancelAnimationFrame(id);
			id = 0;
		}
	};

	const schedule = (fn: () => void) => {
		if (id) return;
		id = requestAnimationFrame(() => {
			id = 0;
			fn();
		});
	};

	return { schedule, cancel };
}
