<script lang="ts">
	import { onMount } from 'svelte';
	import {
		getProcessingBreakdown,
		getOriginsCount,
		getVarietiesList,
		getAltitudeRange,
		getRoastersCount,
		getBagsPerMonth
	} from '$lib/db/stats.js';
	import type {
		ProcessingBreakdown,
		OriginCount,
		RoasterCount,
		BagsPerMonth
	} from '$lib/db/stats.js';

	let loading = $state(true);
	let processingBreakdown = $state<ProcessingBreakdown[]>([]);
	let originsCount = $state<OriginCount[]>([]);
	let varietiesList = $state<string[]>([]);
	let altitudeList = $state<string[]>([]);
	let roastersCount = $state<RoasterCount[]>([]);
	let bagsPerMonth = $state<BagsPerMonth[]>([]);

	onMount(async () => {
		[processingBreakdown, originsCount, varietiesList, altitudeList, roastersCount, bagsPerMonth] =
			await Promise.all([
				getProcessingBreakdown(),
				getOriginsCount(),
				getVarietiesList(),
				getAltitudeRange(),
				getRoastersCount(),
				getBagsPerMonth()
			]);
		loading = false;
	});

	const methodLabel: Record<string, string> = {
		washed: 'Washed',
		natural: 'Natural',
		honey: 'Honey',
		anaerobic: 'Anaerobic'
	};

	let totalBags = $derived(processingBreakdown.reduce((s, x) => s + x.count, 0));

	function barWidth(count: number): string {
		if (totalBags === 0) return '0%';
		return `${Math.round((count / totalBags) * 100)}%`;
	}
</script>

<div class="page">
	<header class="page-header">
		<h1>Stats</h1>
	</header>

	<div class="page-content">
		{#if loading}
			<div class="empty-state"><p>Loading…</p></div>
		{:else}
			<!-- Processing Method Breakdown -->
			<section class="stat-section">
				<h2 class="section-title">Processing Methods</h2>
				{#if processingBreakdown.length === 0}
					<div class="section-empty">No bags yet.</div>
				{:else}
					<div class="card">
						{#each processingBreakdown as item}
							<div class="bar-row">
								<span class="bar-label chip {item.method}">{methodLabel[item.method] ?? item.method}</span>
								<div class="bar-track">
									<div class="bar-fill {item.method}" style="width: {barWidth(item.count)}"></div>
								</div>
								<span class="bar-count">{item.count}</span>
							</div>
						{/each}
					</div>
				{/if}
			</section>

			<div class="divider"></div>

			<!-- Origins -->
			<section class="stat-section">
				<h2 class="section-title">Origins</h2>
				{#if originsCount.length === 0}
					<div class="section-empty">No bags yet.</div>
				{:else}
					<ul class="count-list">
						{#each originsCount as item}
							<li class="count-row">
								<span class="count-name">{item.name}</span>
								<span class="count-badge">{item.count}</span>
							</li>
						{/each}
					</ul>
				{/if}
			</section>

			<div class="divider"></div>

			<!-- Varieties -->
			<section class="stat-section">
				<h2 class="section-title">Varieties</h2>
				{#if varietiesList.length === 0}
					<div class="section-empty">No varieties recorded.</div>
				{:else}
					<div class="tag-cloud">
						{#each varietiesList as v}
							<span class="tag">{v}</span>
						{/each}
					</div>
				{/if}
			</section>

			<div class="divider"></div>

			<!-- Altitude -->
			<section class="stat-section">
				<h2 class="section-title">Altitudes</h2>
				{#if altitudeList.length === 0}
					<div class="section-empty">No altitude data recorded.</div>
				{:else}
					<div class="tag-cloud">
						{#each altitudeList as a}
							<span class="tag">{a}</span>
						{/each}
					</div>
				{/if}
			</section>

			<div class="divider"></div>

			<!-- Roasters -->
			<section class="stat-section">
				<h2 class="section-title">Roasters</h2>
				{#if roastersCount.length === 0}
					<div class="section-empty">No bags yet.</div>
				{:else}
					<ul class="count-list">
						{#each roastersCount as item}
							<li class="count-row">
								<span class="count-name">{item.name}</span>
								<span class="count-badge">{item.count}</span>
							</li>
						{/each}
					</ul>
				{/if}
			</section>

			<div class="divider"></div>

			<!-- Bags per Month -->
			<section class="stat-section">
				<h2 class="section-title">Bags Added per Month</h2>
				{#if bagsPerMonth.length === 0}
					<div class="section-empty">No bags yet.</div>
				{:else}
					<div class="card">
						{#each bagsPerMonth as item}
							<div class="bar-row">
								<span class="month-label">{item.month}</span>
								<div class="bar-track">
									<div
										class="bar-fill accent"
										style="width: {barWidth(item.count)}"
									></div>
								</div>
								<span class="bar-count">{item.count}</span>
							</div>
						{/each}
					</div>
				{/if}
			</section>
		{/if}
	</div>
</div>

<style>
	.stat-section {
		margin-bottom: 4px;
	}

	.section-title {
		font-size: 0.8125rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-muted);
		margin-bottom: 10px;
	}

	.section-empty {
		font-size: 0.875rem;
		color: var(--text-dim);
		padding: 8px 0;
	}

	/* Bar chart rows */
	.bar-row {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 8px 0;
	}

	.bar-row + .bar-row {
		border-top: 1px solid var(--border);
	}

	.bar-label {
		flex-shrink: 0;
		width: 88px;
	}

	.month-label {
		flex-shrink: 0;
		width: 88px;
		font-size: 0.8125rem;
		color: var(--text-muted);
	}

	.bar-track {
		flex: 1;
		height: 10px;
		background: var(--surface-raised);
		border-radius: 99px;
		overflow: hidden;
	}

	.bar-fill {
		height: 100%;
		border-radius: 99px;
		transition: width 0.3s ease;
		background: var(--text-dim);
	}

	.bar-fill.washed    { background: #6ee7b7; }
	.bar-fill.natural   { background: #fbbf24; }
	.bar-fill.honey     { background: #fcd34d; }
	.bar-fill.anaerobic { background: #c084fc; }
	.bar-fill.accent    { background: var(--accent); }

	.bar-count {
		flex-shrink: 0;
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--text-muted);
		width: 24px;
		text-align: right;
	}

	/* Count list */
	.count-list {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0;
		background: var(--surface);
		border-radius: 12px;
		border: 1px solid var(--border);
		overflow: hidden;
	}

	.count-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px 16px;
		min-height: 48px;
	}

	.count-row + .count-row {
		border-top: 1px solid var(--border);
	}

	.count-name {
		font-size: 0.9375rem;
	}

	.count-badge {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--accent);
		background: color-mix(in srgb, var(--accent) 15%, transparent);
		padding: 2px 10px;
		border-radius: 99px;
		min-width: 28px;
		text-align: center;
	}

	/* Tag cloud */
	.tag-cloud {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.tag {
		padding: 6px 12px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 99px;
		font-size: 0.875rem;
		color: var(--text-muted);
	}
</style>
