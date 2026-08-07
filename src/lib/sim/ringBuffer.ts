export type RingBuffer = {
	buffer: Float32Array;
	head: number;
	count: number;
	max: number;
	version: number;
};

export function createRingBuffer(max: number): RingBuffer {
	return {
		buffer: new Float32Array(max),
		head: 0,
		count: 0,
		max,
		version: 0
	};
}

export function resetRingBuffer(rb: RingBuffer) {
	rb.buffer = new Float32Array(rb.max);
	rb.head = 0;
	rb.count = 0;
	rb.version += 1;
}

export function pushRingBuffer(rb: RingBuffer, value: number) {
	rb.buffer[rb.head] = value;
	rb.head = (rb.head + 1) % rb.max;
	rb.count = Math.min(rb.count + 1, rb.max);
	rb.version += 1;
}

export function forEachRingValue(rb: RingBuffer, fn: (value: number, index: number) => void) {
	for (let i = 0; i < rb.count; i += 1) {
		const index = (rb.head - rb.count + i + rb.max) % rb.max;
		fn(rb.buffer[index], i);
	}
}

export function buildRingPath(
	rb: RingBuffer,
	mapPoint: (value: number, index: number, count: number) => { x: number; y: number }
): string {
	if (rb.count === 0) return '';

	const parts: string[] = [];
	forEachRingValue(rb, (value, i) => {
		const { x, y } = mapPoint(value, i, rb.count);
		const segment = `${x.toFixed(2)} ${y.toFixed(2)}`;
		parts.push(parts.length === 0 ? `M ${segment}` : `L ${segment}`);
	});
	return parts.join(' ');
}
