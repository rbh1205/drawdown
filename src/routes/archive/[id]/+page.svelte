<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { getBag, updateBagRating } from '$lib/db/bags.js';
	import { getRoaster } from '$lib/db/roasters.js';
	import { getOrigin } from '$lib/db/origins.js';
	import { getSettingsForBag } from '$lib/db/grind-settings.js';
	import { getGrinder } from '$lib/db/grinders.js';
	import { getBrewMethod } from '$lib/db/brew-methods.js';
	import StarRating from '$lib/components/StarRating.svelte';
	import type { Bag, Roaster, Origin, GrindSetting, Grinder, BrewMethod } from '$lib/types.js';

	type ComboGroup = {
		key: string;
		grinder: Grinder;
		brewMethod: BrewMethod;
		settings: GrindSetting[];
	};

	let bag = $state<Bag | null>(null);
	let roaster = $state<Roaster | null>(null);
	let origin = $state<Origin | null>(null);
	let comboGroups = $state<ComboGroup[]>([]);
	let loading = $state(true);
	let notFound = $state(false);
	let ratingScore = $state<1 | 2 | 3 | 4 | 5 | undefined>(undefined);

	onMount(async () => {
		const id = page.params.id ?? '';
		if (!id) { notFound = true; loading = false; return; }
		const b = await getBag(id);
		if (!b || b.status !== 'archived') { notFound = true; loading = false; return; }
		bag = b;
		ratingScore = b.ratingScore;

		const [r, o, settings] = await Promise.all([
			getRoaster(b.roasterId).then(x => x ?? null),
			getOrigin(b.originId).then(x => x ?? null),
			getSettingsForBag(id)
		]);
		roaster = r;
		origin = o;

		const combos = new Map<string, { grinderId: string; brewMethodId: string; settings: GrindSetting[] }>();
		for (const s of settings) {
			const key = `${s.grinderId}__${s.brewMethodId}`;
			if (!combos.has(key)) combos.set(key, { grinderId: s.grinderId, brewMethodId: s.brewMethodId, settings: [] });
			combos.get(key)!.settings.push(s);
		}

		const groups: ComboGroup[] = [];
		for (const [key, combo] of combos) {
			const [g, m] = await Promise.all([
				getGrinder(combo.grinderId),
				getBrewMethod(combo.brewMethodId)
			]);
			if (g && m) {
				groups.push({
					key,
					grinder: g,
					brewMethod: m,
					settings: combo.settings.sort((a, b) => b.dateLogged.localeCompare(a.dateLogged))
				});
			}
		}
		comboGroups = groups;
		loading = false;
	});

	async function handleRatingChange(score: 1 | 2 | 3 | 4 | 5) {
		ratingScore = score;
		await updateBagRating(bag!.id, score);
	}

	function formatDate(iso: string) {
		return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
	}
</script>

<div class="page">
	<header class="page-header">
		<div class="header-row">
			<a href="/archive" class="back-btn" aria-label="Back to archive">‹ Archive</a>
			<h1 class="header-title">{bag?.name ?? '…'}</h1>
			<div style="min-width:72px"></div>
		</div>
	</header>

	<div class="page-content">
		{#if loading}
			<div class="empty-state"><p>Loading…</p></div>
		{:else if notFound || !bag}
			<div class="empty-state">
				<span class="icon">❓</span>
				<p>Bag not found.</p>
				<a href="/archive" class="btn btn-secondary">Back to archive</a>
			</div>
		{:else}
			<div class="archived-badge">
				<span class="badge-dot" aria-hidden="true">✓</span>
				<span>Finished {bag.dateFinished ? formatDate(bag.dateFinished) : ''}</span>
			</div>

			<section class="rating-section card">
				<p class="rating-label">Your rating</p>
				<StarRating value={ratingScore} onchange={handleRatingChange} />
				{#if ratingScore === undefined}
					<p class="rating-hint">Tap stars to rate this bag</p>
				{/if}
			</section>

			<section class="bag-details card">
				<dl class="detail-grid">
					<div class="detail-row">
						<dt>Roaster</dt>
						<dd>{roaster?.name ?? '—'}</dd>
					</div>
					<div class="detail-row">
						<dt>Origin</dt>
						<dd>{origin?.name ?? '—'}</dd>
					</div>
					<div class="detail-row">
						<dt>Processing</dt>
						<dd><span class="chip {bag.processingMethod}">{bag.processingMethod}</span></dd>
					</div>
					{#if bag.processDetail}
					<div class="detail-row">
						<dt>Process detail</dt>
						<dd>{bag.processDetail}</dd>
					</div>
					{/if}
					{#if bag.variety}
					<div class="detail-row">
						<dt>Variety</dt>
						<dd>{bag.variety}</dd>
					</div>
					{/if}
					{#if bag.altitude}
					<div class="detail-row">
						<dt>Altitude</dt>
						<dd>{bag.altitude}</dd>
					</div>
					{/if}
					{#if bag.roastDate}
					<div class="detail-row">
						<dt>Roast date</dt>
						<dd>{formatDate(bag.roastDate)}</dd>
					</div>
					{/if}
					<div class="detail-row">
						<dt>Added</dt>
						<dd>{formatDate(bag.dateAdded)}</dd>
					</div>
				</dl>
			</section>

			<section class="grind-section">
				<h2 class="section-title">Grind history</h2>

				{#if comboGroups.length === 0}
					<div class="empty-state grind-empty">
						<span class="icon">⚙️</span>
						<p>No grind settings were logged for this bag.</p>
					</div>
				{:else}
					{#each comboGroups as group (group.key)}
						<div class="combo-group card">
							<div class="combo-header">
								<span class="combo-label">{group.grinder.name} · {group.brewMethod.name}</span>
							</div>
							<ul class="settings-list">
								{#each group.settings as s (s.id)}
									<li class="setting-entry">
										<span class="setting-value">{s.settingValue}</span>
										<span class="setting-date">{formatDate(s.dateLogged)}</span>
										{#if s.notes}
											<p class="setting-notes">{s.notes}</p>
										{/if}
									</li>
								{/each}
							</ul>
						</div>
					{/each}
				{/if}
			</section>
		{/if}
	</div>
</div>

<style>
	.header-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.header-title {
		font-size: 1rem;
		font-weight: 600;
		flex: 1;
		text-align: center;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		padding: 0 8px;
	}

	.back-btn {
		min-width: 72px;
		min-height: 44px;
		display: flex;
		align-items: center;
		font-size: 0.9375rem;
		color: var(--accent);
		white-space: nowrap;
	}

	.archived-badge {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 0.875rem;
		color: var(--text-muted);
		margin-bottom: 14px;
	}

	.badge-dot {
		color: #6ee7b7;
		font-size: 1rem;
	}

	.rating-section {
		margin-bottom: 12px;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.rating-label {
		font-size: 0.875rem;
		color: var(--text-muted);
		font-weight: 500;
	}

	.rating-hint {
		font-size: 0.8125rem;
		color: var(--text-dim);
	}

	.detail-grid {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.detail-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}

	dt {
		font-size: 0.875rem;
		color: var(--text-muted);
		flex-shrink: 0;
	}

	dd {
		font-size: 0.9375rem;
		font-weight: 500;
		text-align: right;
	}

	.grind-section {
		margin-top: 24px;
	}

	.section-title {
		font-size: 1rem;
		font-weight: 600;
		margin-bottom: 12px;
	}

	.grind-empty {
		padding: 32px 16px;
	}

	.combo-group {
		margin-bottom: 12px;
		padding: 12px 16px;
	}

	.combo-header {
		margin-bottom: 10px;
	}

	.combo-label {
		font-weight: 600;
		font-size: 0.9375rem;
	}

	.settings-list {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.setting-entry {
		display: flex;
		align-items: baseline;
		gap: 10px;
		flex-wrap: wrap;
		padding: 6px 0;
		border-top: 1px solid var(--border);
	}

	.setting-entry:first-child {
		border-top: none;
	}

	.setting-value {
		font-weight: 600;
		font-size: 1.0625rem;
		color: var(--accent);
	}

	.setting-date {
		font-size: 0.8125rem;
		color: var(--text-dim);
	}

	.setting-notes {
		font-size: 0.8125rem;
		color: var(--text-muted);
		width: 100%;
		margin-top: 2px;
	}
</style>
