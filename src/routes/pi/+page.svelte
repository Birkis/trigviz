<script lang="ts">
	import PiArchimedes from '$lib/components/PiArchimedes.svelte';

	let step = $state(0);
</script>

<div class="flex flex-col gap-8">
	<header class="flex flex-col gap-3">
		<p class="font-display text-2xl tracking-tight text-white sm:text-3xl">Trigviz</p>
		<h1 class="max-w-3xl text-xl font-medium text-slate-100 sm:text-2xl">
			How cutting corners finds π
		</h1>
		<p class="max-w-2xl text-sm leading-relaxed text-slate-200/80">
			Draw a circle of diameter 1. Trap it between an outer square (perimeter 4) and a tilted inner
			square (sides ≈ 0.707, perimeter ≈ 2.828). Cut the outer corners and add corners to the inner
			shape — double the sides each time — and the two perimeters squeeze toward the circumference.
			Their average approaches π.
		</p>
		<nav class="flex flex-wrap gap-3 text-sm">
			<a
				href="/"
				class="rounded-xl border border-white/15 px-3 py-1.5 text-slate-200 transition hover:bg-white/10"
			>
				← Unit circle
			</a>
			<span class="rounded-xl bg-teal-400/15 px-3 py-1.5 text-teal-100">π from polygons</span>
		</nav>
	</header>

	<PiArchimedes bind:step />

	<section class="grid gap-6 md:grid-cols-3">
		<article class="space-y-2">
			<h2 class="font-display text-lg text-white">1. Start with squares</h2>
			<p class="text-sm leading-relaxed text-slate-300/85">
				The circle’s circumference is exactly π. The outer square is longer; the diamond inside is
				shorter. π must sit between them.
			</p>
		</article>
		<article class="space-y-2">
			<h2 class="font-display text-lg text-white">2. Cut and grow</h2>
			<p class="text-sm leading-relaxed text-slate-300/85">
				Slice off each outer corner so the new edges graze the circle. On the inside, push a new
				vertex out from the middle of every side until it touches the circle. Squares become
				octagons, then 16-gons, and so on.
			</p>
		</article>
		<article class="space-y-2">
			<h2 class="font-display text-lg text-white">3. Average the bounds</h2>
			<p class="text-sm leading-relaxed text-slate-300/85">
				With diameter 1, each perimeter estimates π. Combining them as
				<code class="text-teal-200">(inner + outer) / 2</code> tightens the guess quickly — a few dozen
				sides already nails several digits.
			</p>
		</article>
	</section>
</div>
