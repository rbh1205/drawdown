<script lang="ts">
	import { onMount } from 'svelte';
	import { getArchivedBags } from '$lib/db/bags.js';
	import { getRoaster } from '$lib/db/roasters.js';
	import { getOrigin } from '$lib/db/origins.js';
	import { base } from '$app/paths';
	import StarRating from '$lib/components/StarRating.svelte';
	import type { Bag } from '$lib/types.js';

	type EnrichedBag = Bag & { roasterName: string; originName: string };

	let allBags = $state<EnrichedBag[]>([]);
	let loading = $state(true);

	let filterOrigin = $state('');
	let filterProcessing = $state('');
	let filterRoaster = $state('');

	onMount(async () => {
		const archived = await getArchivedBags();
		const enriched = await Promise.all(
			archived.map(async (bag) => {
				const [roaster, origin] = await Promise.all([
					getRoaster(bag.roasterId),
					getOrigin(bag.originId)
				]);
				return {
					...bag,
					roasterName: roaster?.name ?? 'Unknown roaster',
					originName: origin?.name ?? 'Unknown origin'
				};
			})
		);
		allBags = enriched;
		loading = false;
	});

	let filteredBags = $derived(allBags.filter((bag) => {
		if (filterOrigin && bag.originName.toLowerCase() !== filterOrigin.toLowerCase()) return false;
		if (filterProcessing && bag.processingMethod !== filterProcessing) return false;
		if (filterRoaster && bag.roasterName.toLowerCase() !== filterRoaster.toLowerCase()) return false;
		return true;
	}));

	let uniqueOrigins = $derived([...new Set(allBags.map((b) => b.originName))].sort());
	let uniqueRoasters = $derived([...new Set(allBags.map((b) => b.roasterName))].sort());

	function formatDate(iso: string) {
		return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
	}

	function clearFilters() {
		filterOrigin = '';
		filterProcessing = '';
		filterRoaster = '';
	}

	let hasFilters = $derived(filterOrigin !== '' || filterProcessing !== '' || filterRoaster !== '');
</script>

<div class="page">
	<header class="page-header">
		<h1>Archive</h1>
	</header>

	<div class="page-content">
		{#if loading}
			<div class="empty-state"><p>Loading…</p></div>
		{:else if allBags.length === 0}
			<div class="empty-state">
				<span class="icon">📦</span>
				<p>No finished bags yet.</p>
				<p class="hint">Mark a bag as finished from its detail screen.</p>
			</div>
		{:else}
			<div class="filter-bar">
				<select
					bind:value={filterOrigin}
					aria-label="Filter by origin"
					class="filter-select"
				>
					<option value="">All origins</option>
					{#each uniqueOrigins as origin}
						<option value={origin}>{origin}</option>
					{/each}
				</select>

				<select
					bind:value={filterProcessing}
					aria-label="Filter by processing method"
					class="filter-select"
				>
					<option value="">All processes</option>
					<option value="washed">Washed</option>
					<option value="natural">Natural</option>
					<option value="honey">Honey</option>
					<option value="anaerobic">Anaerobic</option>
				</select>

				<select
					bind:value={filterRoaster}
					aria-label="Filter by roaster"
					class="filter-select"
				>
					<option value="">All roasters</option>
					{#each uniqueRoasters as roaster}
						<option value={roaster}>{roaster}</option>
					{/each}
				</select>

				{#if hasFilters}
					<button type="button" class="clear-btn" onclick={clearFilters} aria-label="Clear filters">
						✕ Clear
					</button>
				{/if}
			</div>

			{#if filteredBags.length === 0}
				<div class="empty-state">
					<span class="icon">🔍</span>
					<p>No bags match these filters.</p>
					<button type="button" class="btn btn-secondary" onclick={clearFilters}>Clear filters</button>
				</div>
			{:else}
				<ul class="bag-list">
					{#each filteredBags as bag (bag.id)}
						<li>
							<a href="{base}/archive/{bag.id}" class="bag-card">
								<div class="bag-info">
									<span class="bag-name">{bag.name}</span>
									<span class="bag-meta">{bag.roasterName} · {bag.originName}</span>
									{#if bag.dateFinished}
										<span class="bag-date">Finished {formatDate(bag.dateFinished)}</span>
									{/if}
								</div>
								<div class="bag-right">
									<span class="chip {bag.processingMethod}">{bag.processingMethod}</span>
									{#if bag.ratingScore !== undefined}
										<div class="rating-display">
											<StarRating value={bag.ratingScore} readonly />
										</div>
									{/if}
									<span class="chevron" aria-hidden="true">›</span>
								</div>
							</a>
						</li>
					{/each}
				</ul>
			{/if}
		{/if}
	</div>
</div>

<style>
	.filter-bar {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
		margin-bottom: 16px;
		align-items: center;
	}

	.filter-select {
		flex: 1;
		min-width: 120px;
		min-height: 44px;
		font-size: 0.875rem;
		padding: 8px 32px 8px 10px;
		width: auto;
	}

	.clear-btn {
		min-height: 44px;
		padding: 8px 14px;
		font-size: 0.875rem;
		color: var(--text-muted);
		white-space: nowrap;
		border: 1px solid var(--border);
		border-radius: 8px;
	}

	.bag-list {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.bag-card {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 12px;
		padding: 14px 16px;
		background: var(--surface);
		border-radius: 12px;
		border: 1px solid var(--border);
		min-height: 64px;
		text-decoration: none;
		transition: background 0.12s;
	}

	.bag-card:active {
		background: var(--surface-raised);
	}

	.bag-info {
		display: flex;
		flex-direction: column;
		gap: 3px;
		min-width: 0;
		flex: 1;
	}

	.bag-name {
		font-weight: 600;
		font-size: 1rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.bag-meta {
		font-size: 0.8125rem;
		color: var(--text-muted);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.bag-date {
		font-size: 0.75rem;
		color: var(--text-dim);
	}

	.bag-right {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 6px;
		flex-shrink: 0;
	}

	.rating-display {
		font-size: 0.75rem;
	}

	.chevron {
		font-size: 1.25rem;
		color: var(--text-dim);
	}

	.hint {
		font-size: 0.875rem;
	}
</style>
