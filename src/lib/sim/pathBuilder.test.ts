import { describe, expect, it } from 'vitest';
import { createPathBuilder, lineTo, moveTo, resetPathBuilder, toPathD } from './pathBuilder';

describe('pathBuilder', () => {
	it('builds move and line segments without quadratic concat cost shape', () => {
		const path = createPathBuilder();
		moveTo(path, 0, 0);
		lineTo(path, 1, 2);
		lineTo(path, 3, 4);
		expect(toPathD(path)).toBe('M 0.00 0.00 L 1.00 2.00 L 3.00 4.00');
	});

	it('treats first lineTo as moveTo', () => {
		const path = createPathBuilder();
		lineTo(path, 5, 6);
		expect(toPathD(path)).toBe('M 5.00 6.00');
	});

	it('resets parts in place', () => {
		const path = createPathBuilder();
		moveTo(path, 1, 1);
		resetPathBuilder(path);
		expect(toPathD(path)).toBe('');
	});
});
