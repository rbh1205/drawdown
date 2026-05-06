<script lang="ts">
	import { onMount } from 'svelte';
	import { getActiveBags, getAllBags } from '$lib/db/bags.js';
	import { getRoaster } from '$lib/db/roasters.js';
	import { getOrigin } from '$lib/db/origins.js';
	import type { Bag } from '$lib/types.js';

	type EnrichedBag = Bag & { roasterName: string; originName: string };

	function getDaysRested(roastDate: string): number {
		return Math.floor((Date.now() - new Date(roastDate).getTime()) / 86_400_000);
	}

	function lerp(a: number, b: number, t: number): number {
		return a + (b - a) * Math.min(Math.max(t, 0), 1);
	}

	function getRestColor(days: number): { bg: string; text: string } {
		if (days <= 14) {
			const t = days / 14;
			const h = lerp(30, 142, t);
			const s = lerp(5, 50, t);
			const l = lerp(54, 52, t);
			return { bg: `hsla(${h}, ${s}%, ${l}%, 0.18)`, text: `hsl(${h}, ${s}%, ${l + 4}%)` };
		} else if (days <= 41) {
			const t = (days - 14) / 27;
			const h = lerp(142, 142, t);
			const s = lerp(50, 45, t);
			const l = lerp(52, 48, t);
			return { bg: `hsla(${h}, ${s}%, ${l}%, 0.18)`, text: `hsl(${h}, ${s}%, ${l + 4}%)` };
		} else {
			return { bg: 'rgba(229, 115, 115, 0.15)', text: '#e57373' };
		}
	}

	let bags = $state<EnrichedBag[]>([]);
	let hasArchivedBags = $state(false);
	let loading = $state(true);

	async function load() {
		loading = true;
		const [activeBags, allBags] = await Promise.all([getActiveBags(), getAllBags()]);
		hasArchivedBags = allBags.some((b) => b.status === 'archived');
		const enriched = await Promise.all(
			activeBags.map(async (bag) => {
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
		bags = enriched;
		loading = false;
	}

	onMount(load);
</script>

<div class="page">
	<header class="page-header">
		<div class="header-row">
			<h1>My Rotation</h1>
			<div class="header-right">
				<a href="/settings" class="icon-btn" aria-label="Settings">⚙</a>
				<a href="/add-bag" class="btn btn-primary add-btn" aria-label="Add new bag">
					＋ Add bag
				</a>
			</div>
		</div>
	</header>

	<div class="page-content">
		{#if loading}
			<div class="empty-state">
				<p>Loading…</p>
			</div>
		{:else if bags.length === 0}
			<div class="empty-state">
				<span class="icon">☕</span>
				{#if hasArchivedBags}
					<p>All bags finished — add a new one.</p>
				{:else}
					<p>No bags in rotation yet.</p>
				{/if}
				<a href="/add-bag" class="btn btn-primary btn-full">
					{hasArchivedBags ? 'Add a new bag' : 'Add your first bag'}
				</a>
			</div>
		{:else}
			<ul class="bag-list">
				{#each bags as bag (bag.id)}
					<li>
						<a href="/bag/{bag.id}" class="bag-card">
							<div class="bag-info">
								<span class="bag-name">{bag.name}</span>
								<span class="bag-meta">{bag.roasterName} · {bag.originName}</span>
							</div>
							<div class="bag-right">
								{#if bag.roastDate}
									{@const days = getDaysRested(bag.roastDate)}
									{@const color = getRestColor(days)}
									<span class="rest-badge" style="background: {color.bg}; color: {color.text};">{days}d</span>
								{/if}
								<span class="chip {bag.processingMethod}">{bag.processingMethod}</span>
								<span class="chevron" aria-hidden="true">›</span>
							</div>
						</a>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>

<style>
	.header-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.icon-btn {
		min-width: 44px;
		min-height: 44px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.125rem;
		color: var(--text-muted);
	}

	.add-btn {
		font-size: 0.9rem;
		padding: 8px 16px;
		white-space: nowrap;
	}

	.bag-list {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.bag-card {
		display: flex;
		align-items: center;
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

	.bag-right {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-shrink: 0;
	}

	.chevron {
		font-size: 1.25rem;
		color: var(--text-dim);
	}

	.rest-badge {
		font-size: 0.6875rem;
		font-weight: 600;
		padding: 2px 8px;
		border-radius: 99px;
		letter-spacing: 0.01em;
	}

</style>
