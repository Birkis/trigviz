import { describe, expect, it } from 'vitest';
import {
	buildRingPath,
	createRingBuffer,
	forEachRingValue,
	pushRingBuffer,
	resetRingBuffer
} from './ringBuffer';

describe('ringBuffer', () => {
	it('pushes values and wraps capacity', () => {
		const rb = createRingBuffer(3);
		pushRingBuffer(rb, 1);
		pushRingBuffer(rb, 2);
		pushRingBuffer(rb, 3);
		pushRingBuffer(rb, 4);

		expect(rb.count).toBe(3);
		const values: number[] = [];
		forEachRingValue(rb, (value) => values.push(value));
		expect(values).toEqual([2, 3, 4]);
	});

	it('resets contents and bumps version', () => {
		const rb = createRingBuffer(2);
		pushRingBuffer(rb, 9);
		const version = rb.version;
		resetRingBuffer(rb);
		expect(rb.count).toBe(0);
		expect(rb.version).toBe(version + 1);
	});

	it('builds an SVG path from mapped points', () => {
		const rb = createRingBuffer(4);
		pushRingBuffer(rb, 0);
		pushRingBuffer(rb, 1);
		const path = buildRingPath(rb, (value, i) => ({ x: i * 10, y: value * 5 }));
		expect(path.startsWith('M ')).toBe(true);
		expect(path.includes('L ')).toBe(true);
	});
});
