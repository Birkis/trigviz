<script lang="ts">
	import { page } from '$app/state';
</script>

<section class="viz-panel mx-auto max-w-lg text-center">
	<p class="font-display text-3xl text-white">Trigviz</p>
	<h1 class="mt-3 text-xl font-semibold text-slate-100">
		{page.status} — {page.error?.message ?? 'Something went wrong'}
	</h1>
	<p class="mt-2 text-sm text-slate-300">
		The visualization hit an unexpected error. Head back home and try again.
	</p>
	<a
		href="/"
		class="mt-6 inline-block rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
	>
		Back to Trigviz
	</a>
</section>
