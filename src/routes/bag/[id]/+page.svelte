<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { getBag, archiveBag } from '$lib/db/bags.js';
	import { getRoaster } from '$lib/db/roasters.js';
	import { getOrigin } from '$lib/db/origins.js';
	import { getSettingsForBag, updateGrindSetting } from '$lib/db/grind-settings.js';
	import { getGrinder } from '$lib/db/grinders.js';
	import { getBrewMethod } from '$lib/db/brew-methods.js';
	import StarRatingPrompt from '$lib/components/StarRatingPrompt.svelte';
	import type { Bag, Roaster, Origin, GrindSetting, Grinder, BrewMethod } from '$lib/types.js';

	type GrinderGroup = {
		key: string;
		grinder: Grinder;
		settings: GrindSetting[];
	};

	type BrewMethodGroup = {
		brewMethod: BrewMethod;
		grinderGroups: GrinderGroup[];
		latestDate: string;
		latestValue: string;
		latestGrinder: string;
		latestNextAdjustment: 'coarser' | 'finer' | 'perfect' | undefined;
		totalEntries: number;
	};

	let bag = $state<Bag | null>(null);
	let roaster = $state<Roaster | null>(null);
	let origin = $state<Origin | null>(null);
	let brewMethodGroups = $state<BrewMethodGroup[]>([]);
	let selectedBrewMethodId = $state<string | null>(null);
	let loading = $state(true);
	let notFound = $state(false);
	let showFinishConfirm = $state(false);
	let showRatingPrompt = $state(false);
	let finishing = $state(false);

	let selectedGroup = $derived(
		brewMethodGroups.find(g => g.brewMethod.id === selectedBrewMethodId) ?? null
	);

	onMount(async () => {
		const id = page.params.id ?? '';
		if (!id) { notFound = true; loading = false; return; }
		const b = await getBag(id);
		if (!b) { notFound = true; loading = false; return; }
		bag = b;

		const [r, o, settings] = await Promise.all([
			getRoaster(b.roasterId).then(x => x ?? null),
			getOrigin(b.originId).then(x => x ?? null),
			getSettingsForBag(id)
		]);
		roaster = r;
		origin = o;

		// Group settings by brewMethod, then by grinder within each method
		const byMethod = new Map<string, { brewMethodId: string; byGrinder: Map<string, { grinderId: string; settings: GrindSetting[] }> }>();
		for (const s of settings) {
			if (!byMethod.has(s.brewMethodId)) {
				byMethod.set(s.brewMethodId, { brewMethodId: s.brewMethodId, byGrinder: new Map() });
			}
			const methodEntry = byMethod.get(s.brewMethodId)!;
			if (!methodEntry.byGrinder.has(s.grinderId)) {
				methodEntry.byGrinder.set(s.grinderId, { grinderId: s.grinderId, settings: [] });
			}
			methodEntry.byGrinder.get(s.grinderId)!.settings.push(s);
		}

		const groups: BrewMethodGroup[] = [];
		for (const [, methodEntry] of byMethod) {
			const brewMethod = await getBrewMethod(methodEntry.brewMethodId);
			if (!brewMethod) continue;

			const grinderGroups: GrinderGroup[] = [];
			for (const [, grinderEntry] of methodEntry.byGrinder) {
				const grinder = await getGrinder(grinderEntry.grinderId);
				if (!grinder) continue;
				grinderGroups.push({
					key: `${methodEntry.brewMethodId}__${grinderEntry.grinderId}`,
					grinder,
					settings: grinderEntry.settings.sort((a, b) => b.dateLogged.localeCompare(a.dateLogged))
				});
			}

			const allSettings = grinderGroups.flatMap(g => g.settings);
			const sorted = [...allSettings].sort((a, b) => b.dateLogged.localeCompare(a.dateLogged));
			const latestSetting = sorted[0];
			const latestGrinderGroup = latestSetting
				? grinderGroups.find(g => g.settings.some(s => s.id === latestSetting.id))
				: undefined;
			groups.push({
				brewMethod,
				grinderGroups,
				latestDate: latestSetting?.dateLogged ?? '',
				latestValue: latestSetting?.settingValue ?? '',
				latestGrinder: latestGrinderGroup?.grinder.name ?? '',
				latestNextAdjustment: latestSetting?.nextAdjustment as 'coarser' | 'finer' | 'perfect' | undefined,
				totalEntries: allSettings.length
			});
		}

		brewMethodGroups = groups;
		loading = false;
	});

	function formatDate(iso: string) {
		return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
	}

	async function handleRatingConfirm(score: 1 | 2 | 3 | 4 | 5 | null) {
		showRatingPrompt = false;
		finishing = true;
		await archiveBag(bag!.id, score ?? undefined);
		goto('/');
	}

	async function setNextAdjustment(setting: GrindSetting, value: GrindSetting['nextAdjustment'] | null) {
		const updated = { ...setting, nextAdjustment: value ?? undefined };
		await updateGrindSetting(updated);
		for (const group of brewMethodGroups) {
			for (const gg of group.grinderGroups) {
				const idx = gg.settings.findIndex(s => s.id === setting.id);
				if (idx !== -1) {
					gg.settings[idx] = updated;
					const allSettings = group.grinderGroups.flatMap(g => g.settings);
					const latest = [...allSettings].sort((a, b) => b.dateLogged.localeCompare(a.dateLogged))[0];
					group.latestNextAdjustment = latest?.nextAdjustment;
					brewMethodGroups = [...brewMethodGroups];
					return;
				}
			}
		}
	}
</script>

<div class="page">
	<header class="page-header">
		<div class="header-row">
			<a href="/" class="back-btn" aria-label="Back to home">‹ Back</a>
			<h1 class="header-title">{bag?.name ?? '…'}</h1>
			{#if bag}
				<div class="header-actions">
					<a href="/settings" class="icon-btn" aria-label="Settings">⚙</a>
					<a href="/bag/{bag.id}/edit" class="edit-btn" aria-label="Edit bag">Edit</a>
				</div>
			{:else}
				<div style="width:80px"></div>
			{/if}
		</div>
	</header>

	<div class="page-content">
		{#if loading}
			<div class="empty-state"><p>Loading…</p></div>
		{:else if notFound || !bag}
			<div class="empty-state">
				<span class="icon">❓</span>
				<p>Bag not found.</p>
				<a href="/" class="btn btn-secondary">Go home</a>
			</div>
		{:else}
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

			{#if bag.status === 'active'}
				<div class="finish-section">
					{#if showFinishConfirm}
						<div class="confirm-box card">
							<p class="confirm-text">Mark <strong>{bag.name}</strong> as finished?</p>
							<div class="confirm-actions">
								<button
									type="button"
									class="btn btn-secondary"
									onclick={() => showFinishConfirm = false}
									disabled={finishing}
								>Cancel</button>
								<button
									type="button"
									class="btn btn-primary"
									onclick={() => { showFinishConfirm = false; showRatingPrompt = true; }}
									disabled={finishing}
								>Yes, finish</button>
							</div>
						</div>
					{:else}
						<button
							type="button"
							class="btn btn-finish btn-full"
							onclick={() => showFinishConfirm = true}
						>
							✓ Mark as Finished
						</button>
					{/if}
				</div>
			{/if}

			<section class="grind-section">
				<div class="section-header">
					{#if selectedGroup}
						<button
							type="button"
							class="back-methods-btn"
							onclick={() => selectedBrewMethodId = null}
						>‹ Brew methods</button>
					{:else}
						<h2 class="section-title">Grind settings</h2>
					{/if}
					<a href="/bag/{bag.id}/log-setting" class="btn btn-primary btn-sm">
						＋ Log setting
					</a>
				</div>

				{#if brewMethodGroups.length === 0}
					<div class="empty-state grind-empty">
						<span class="icon">⚙️</span>
						<p>No grind settings yet.</p>
						<a href="/bag/{bag.id}/log-setting" class="btn btn-primary">Log first setting</a>
					</div>
				{:else if !selectedGroup}
					<ul class="method-list">
						{#each brewMethodGroups as group (group.brewMethod.id)}
							<li>
								<button
									type="button"
									class="method-card"
									onclick={() => selectedBrewMethodId = group.brewMethod.id}
								>
									<div class="method-info">
										<span class="method-name">{group.brewMethod.name}</span>
										<span class="method-meta">
											{group.totalEntries} {group.totalEntries === 1 ? 'entry' : 'entries'}
											{#if group.latestDate}· last {formatDate(group.latestDate)}{/if}
										</span>
										{#if group.latestGrinder}
											<span class="method-grinder">{group.latestGrinder}</span>
										{/if}
									</div>
									<div class="method-right">
										{#if group.latestNextAdjustment}
											<span class="adj-hint adj-hint--{group.latestNextAdjustment.replace(' ', '-')}">
												{group.latestNextAdjustment === 'perfect' ? 'perfect' : group.latestNextAdjustment}
											</span>
										{/if}
										{#if group.latestValue}
											<span class="method-latest">{group.latestValue}</span>
										{/if}
										<span class="chevron" aria-hidden="true">›</span>
									</div>
								</button>
							</li>
						{/each}
					</ul>
				{:else}
					<h3 class="method-heading">{selectedGroup.brewMethod.name}</h3>
					{#each selectedGroup.grinderGroups as gg (gg.key)}
						<div class="combo-group card">
							<div class="combo-header">
								<span class="combo-label">{gg.grinder.name}</span>
							</div>
							<ul class="settings-list">
								{#each gg.settings as s, i (s.id)}
									<li class="setting-entry">
										<span class="setting-value">{s.settingValue}</span>
										<span class="setting-date">{formatDate(s.dateLogged)}</span>
										{#if s.notes}
											<p class="setting-notes">{s.notes}</p>
										{/if}
										{#if i === 0}
											<button
												type="button"
												class="perfect-btn {s.nextAdjustment === 'perfect' ? 'perfect-btn--active' : ''}"
												onclick={() => setNextAdjustment(s, s.nextAdjustment === 'perfect' ? null : 'perfect')}
											>Perfect — use again</button>
											<div class="adj-controls">
												<button
													type="button"
													class="adj-btn {s.nextAdjustment === 'way coarser' ? 'adj-btn--active adj-btn--way-coarser' : ''}"
													onclick={() => setNextAdjustment(s, s.nextAdjustment === 'way coarser' ? null : 'way coarser')}
												>Way coarser</button>
												<button
													type="button"
													class="adj-btn {s.nextAdjustment === 'coarser' ? 'adj-btn--active adj-btn--coarser' : ''}"
													onclick={() => setNextAdjustment(s, s.nextAdjustment === 'coarser' ? null : 'coarser')}
												>Coarser</button>
												<button
													type="button"
													class="adj-btn {s.nextAdjustment === 'try again' ? 'adj-btn--active adj-btn--try-again' : ''}"
													onclick={() => setNextAdjustment(s, s.nextAdjustment === 'try again' ? null : 'try again')}
												>Try again</button>
												<button
													type="button"
													class="adj-btn {s.nextAdjustment === 'finer' ? 'adj-btn--active adj-btn--finer' : ''}"
													onclick={() => setNextAdjustment(s, s.nextAdjustment === 'finer' ? null : 'finer')}
												>Finer</button>
												<button
													type="button"
													class="adj-btn {s.nextAdjustment === 'way finer' ? 'adj-btn--active adj-btn--way-finer' : ''}"
													onclick={() => setNextAdjustment(s, s.nextAdjustment === 'way finer' ? null : 'way finer')}
												>Way finer</button>
											</div>
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

{#if showRatingPrompt}
	<StarRatingPrompt onconfirm={handleRatingConfirm} />
{/if}

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
		min-width: 56px;
		min-height: 44px;
		display: flex;
		align-items: center;
		font-size: 1.125rem;
		color: var(--accent);
	}

	.header-actions {
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

	.edit-btn {
		min-width: 44px;
		min-height: 44px;
		display: flex;
		align-items: center;
		justify-content: flex-end;
		font-size: 0.9375rem;
		font-weight: 500;
		color: var(--accent);
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

	.finish-section {
		margin-top: 16px;
	}

	.btn-finish {
		background: transparent;
		border: 1px solid var(--border);
		color: var(--text-muted);
		font-size: 0.9375rem;
	}

	.confirm-box {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	.confirm-text {
		font-size: 0.9375rem;
		text-align: center;
	}

	.confirm-actions {
		display: flex;
		gap: 10px;
	}

	.confirm-actions .btn {
		flex: 1;
	}

	.grind-section {
		margin-top: 24px;
	}

	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 12px;
	}

	.section-title {
		font-size: 1rem;
		font-weight: 600;
	}

	.btn-sm {
		min-height: 44px;
		padding: 6px 14px;
		font-size: 0.875rem;
	}

	.grind-empty {
		padding: 32px 16px;
	}

	.back-methods-btn {
		min-height: 44px;
		display: flex;
		align-items: center;
		background: transparent;
		border: none;
		font-size: 1rem;
		font-weight: 500;
		color: var(--accent);
		cursor: pointer;
		padding: 0;
	}

	.method-list {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.method-card {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 14px 16px;
		background: var(--surface);
		border-radius: 12px;
		border: 1px solid var(--border);
		min-height: 64px;
		width: 100%;
		text-align: left;
		cursor: pointer;
		transition: background 0.12s;
	}

	.method-card:active {
		background: var(--surface-raised);
	}

	.method-info {
		display: flex;
		flex-direction: column;
		gap: 3px;
		min-width: 0;
	}

	.method-name {
		font-weight: 600;
		font-size: 1rem;
	}

	.method-meta {
		font-size: 0.8125rem;
		color: var(--text-muted);
	}

	.method-grinder {
		font-size: 0.8125rem;
		color: var(--text-dim);
	}

	.method-right {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-shrink: 0;
	}

	.method-latest {
		font-weight: 600;
		font-size: 1rem;
		color: var(--accent);
	}

	.adj-hint {
		font-size: 0.75rem;
		font-weight: 700;
		padding: 2px 8px;
		border-radius: 99px;
		letter-spacing: 0.01em;
		white-space: nowrap;
	}

	.adj-hint--way-coarser {
		background: #a0742a;
		color: #fff8f0;
	}

	.adj-hint--coarser {
		background: #c8a96e;
		color: #1c1917;
	}

	.adj-hint--try-again {
		background: #6b7280;
		color: #f9fafb;
	}

	.adj-hint--perfect {
		background: #16a34a;
		color: #f0fdf4;
	}

	.adj-hint--finer {
		background: #6ea8c8;
		color: #1c1917;
	}

	.adj-hint--way-finer {
		background: #2a6ea0;
		color: #f0f8ff;
	}

	.chevron {
		font-size: 1.25rem;
		color: var(--text-dim);
	}

	.method-heading {
		font-size: 1rem;
		font-weight: 600;
		margin-bottom: 12px;
		color: var(--text-muted);
	}

	.combo-group {
		margin-bottom: 12px;
		padding: 12px 16px;
	}

	.combo-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
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

	.perfect-btn {
		width: 100%;
		min-height: 38px;
		margin-top: 8px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: transparent;
		color: var(--text-muted);
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		letter-spacing: 0.01em;
		transition: background 0.15s, color 0.15s, border-color 0.15s;
	}

	.perfect-btn--active {
		background: #16a34a;
		color: #f0fdf4;
		border-color: #16a34a;
	}

	.adj-controls {
		display: flex;
		gap: 6px;
		width: 100%;
		margin-top: 6px;
	}

	.adj-btn {
		flex: 1;
		min-height: 38px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: transparent;
		color: var(--text-muted);
		font-size: 0.8125rem;
		font-weight: 600;
		cursor: pointer;
		letter-spacing: 0.01em;
		transition: background 0.15s, color 0.15s, border-color 0.15s;
	}

	.adj-btn--active.adj-btn--way-coarser {
		background: #a0742a;
		color: #fff8f0;
		border-color: #a0742a;
	}

	.adj-btn--active.adj-btn--coarser {
		background: #c8a96e;
		color: #1c1917;
		border-color: #c8a96e;
	}

	.adj-btn--active.adj-btn--try-again {
		background: #6b7280;
		color: #f9fafb;
		border-color: #6b7280;
	}

	.adj-btn--active.adj-btn--finer {
		background: #6ea8c8;
		color: #1c1917;
		border-color: #6ea8c8;
	}

	.adj-btn--active.adj-btn--way-finer {
		background: #2a6ea0;
		color: #f0f8ff;
		border-color: #2a6ea0;
	}
</style>
