<script lang="ts">
	import './layout.css';

	let { children } = $props();

	const title = 'Trigviz — Unit Circle Visualizer';
	const description =
		'Interactive unit circle visualization that draws sine, cosine, and tangent curves in real time.';
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="icon" href="/favicon/favicon.ico" sizes="any" />
	<link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
	<link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png" />
	<link rel="apple-touch-icon" href="/favicon/apple-touch-icon.png" />
	<link rel="manifest" href="/favicon/site.webmanifest" />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,650&family=Source+Sans+3:wght@400;500;600;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-teal-950 text-slate-100">
	<div class="mx-auto max-w-6xl px-6 py-10">
		{@render children()}
	</div>
</div>
