<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<div class="min-h-screen bg-linear-to-br from-slate-950 via-indigo-950 to-sky-900 text-slate-100">
	<div class="mx-auto max-w-6xl px-6 py-10">
		{@render children()}
	</div>
</div>
