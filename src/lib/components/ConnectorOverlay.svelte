<script lang="ts">
	type Props = {
		width: number;
		height: number;
		path: string;
		svgEl?: SVGSVGElement | null;
	};

	let { width, height, path, svgEl = $bindable<SVGSVGElement | null>(null) }: Props = $props();
</script>

<svg
	class="pointer-events-none absolute inset-0"
	{width}
	{height}
	viewBox={`0 0 ${width} ${height}`}
	aria-hidden="true"
	bind:this={svgEl}
>
	{#if path && width > 0 && height > 0}
		<path
			d={path}
			fill="none"
			stroke="var(--color-sin)"
			stroke-opacity="0.7"
			stroke-width="2.5"
			stroke-dasharray="6 6"
			stroke-linecap="round"
		/>
	{/if}
</svg>
