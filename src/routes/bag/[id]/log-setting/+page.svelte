<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { getBag } from '$lib/db/bags.js';
	import { getAllGrinders } from '$lib/db/grinders.js';
	import { getAllBrewMethods } from '$lib/db/brew-methods.js';
	import { getSettingsForCombo, addGrindSetting } from '$lib/db/grind-settings.js';
	import type { Bag, Grinder, BrewMethod, GrindSetting } from '$lib/types.js';

	let bag = $state<Bag | null>(null);
	let grinders = $state<Grinder[]>([]);
	let brewMethods = $state<BrewMethod[]>([]);
	let loading = $state(true);
	let notFound = $state(false);

	let selectedGrinderId = $state('');
	let selectedBrewMethodId = $state('');
	let settingValue = $state('');
	let notes = $state('');
	let saving = $state(false);
	let errors = $state<Record<string, string>>({});

	let existingHistory = $state<GrindSetting[]>([]);
	let historyGrinder = $state<Grinder | null>(null);
	let historyMethod = $state<BrewMethod | null>(null);

	let selectedGrinder = $derived(grinders.find((g) => g.id === selectedGrinderId) ?? null);

	onMount(async () => {
		const id = page.params.id ?? '';
		if (!id) { notFound = true; loading = false; return; }
		const [b, gs, bms] = await Promise.all([getBag(id), getAllGrinders(), getAllBrewMethods()]);
		if (!b) { notFound = true; loading = false; return; }
		bag = b;
		grinders = gs;
		brewMethods = bms;
		loading = false;
	});

	async function loadHistory() {
		if (!bag || !selectedGrinderId || !selectedBrewMethodId) {
			existingHistory = [];
			historyGrinder = null;
			historyMethod = null;
			return;
		}
		existingHistory = await getSettingsForCombo(bag.id, selectedGrinderId, selectedBrewMethodId);
		historyGrinder = grinders.find((g) => g.id === selectedGrinderId) ?? null;
		historyMethod = brewMethods.find((m) => m.id === selectedBrewMethodId) ?? null;
	}

	$effect(() => {
		if (selectedGrinderId && selectedBrewMethodId) loadHistory();
	});

	function validate(): boolean {
		const e: Record<string, string> = {};
		if (!selectedGrinderId) e.grinder = 'Select a grinder';
		if (!selectedBrewMethodId) e.brewMethod = 'Select a brew method';
		if (!settingValue.trim()) e.settingValue = 'Setting value is required';
		errors = e;
		return Object.keys(e).length === 0;
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!validate() || !bag) return;
		saving = true;
		const setting: GrindSetting = {
			id: crypto.randomUUID(),
			bagId: bag.id,
			grinderId: selectedGrinderId,
			brewMethodId: selectedBrewMethodId,
			settingValue: settingValue.trim(),
			notes: notes.trim() || undefined,
			dateLogged: new Date().toISOString().slice(0, 10)
		};
		await addGrindSetting(setting);
		await goto(`${base}/bag/${bag.id}`);
	}

	function formatDate(iso: string) {
		return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
	}
</script>

<div class="page">
	<header class="page-header">
		<div class="header-row">
			<a href="{base}/bag/{bag?.id ?? ''}" class="back-btn" aria-label="Back">‹ Back</a>
			<h1>Log setting</h1>
			<div style="width:56px"></div>
		</div>
	</header>

	<div class="page-content">
		{#if loading}
			<div class="empty-state"><p>Loading…</p></div>
		{:else if notFound || !bag}
			<div class="empty-state">
				<span class="icon">❓</span>
				<p>Bag not found.</p>
				<a href="{base}/" class="btn btn-secondary">Go home</a>
			</div>
		{:else}
			{#if grinders.length === 0 || brewMethods.length === 0}
				<div class="setup-notice card">
					<p class="setup-msg">
						{#if grinders.length === 0 && brewMethods.length === 0}
							You need a grinder and a brew method to log a setting.
						{:else if grinders.length === 0}
							You need a grinder to log a setting.
						{:else}
							You need a brew method to log a setting.
						{/if}
					</p>
					<div class="setup-links">
						{#if grinders.length === 0}
							<a href="{base}/settings/grinders" class="btn btn-primary">Add grinder</a>
						{/if}
						{#if brewMethods.length === 0}
							<a href="{base}/settings/brew-methods" class="btn btn-secondary">Add brew method</a>
						{/if}
					</div>
				</div>
			{:else}
				<form onsubmit={handleSubmit} class="log-form">
					<div class="form-group">
						<label for="grinder-select">Grinder *</label>
						<select id="grinder-select" bind:value={selectedGrinderId}>
							<option value="">— Choose grinder —</option>
							{#each grinders as g}
								<option value={g.id}>{g.name} ({g.type})</option>
							{/each}
						</select>
						{#if errors.grinder}<span class="error">{errors.grinder}</span>{/if}
						{#if selectedGrinder?.currentSetting}
							<p class="grinder-position-hint">
								Currently at: <strong>{selectedGrinder.currentSetting}</strong>
							</p>
						{/if}
					</div>

					<div class="form-group">
						<label for="method-select">Brew method *</label>
						<select id="method-select" bind:value={selectedBrewMethodId}>
							<option value="">— Choose method —</option>
							{#each brewMethods as m}
								<option value={m.id}>{m.name}</option>
							{/each}
						</select>
						{#if errors.brewMethod}<span class="error">{errors.brewMethod}</span>{/if}
					</div>

					{#if existingHistory.length > 0 && historyGrinder && historyMethod}
						<div class="history-preview card">
							<p class="history-label">
								Previous: {historyGrinder.name} + {historyMethod.name}
							</p>
							{#if existingHistory[0].nextAdjustment}
								<p class="adjustment-hint adjustment-hint--{existingHistory[0].nextAdjustment.replace(' ', '-')}">
									{existingHistory[0].nextAdjustment === 'perfect'
										? 'Last setting was perfect — use it again'
										: `Wanted to try ${existingHistory[0].nextAdjustment} →`}
								</p>
							{/if}
							<ul class="history-list">
								{#each existingHistory.slice(0, 5) as entry (entry.id)}
									<li class="history-entry">
										<span class="history-value">{entry.settingValue}</span>
										<span class="history-date">{formatDate(entry.dateLogged)}</span>
										{#if entry.notes}
											<span class="history-notes">{entry.notes}</span>
										{/if}
									</li>
								{/each}
							</ul>
						</div>
					{/if}

					<div class="form-group">
						<label for="setting-value">Setting value *</label>
						<input id="setting-value" type="text" bind:value={settingValue}
							placeholder="e.g. 15, 3.5, coarse" autocomplete="off" />
						{#if errors.settingValue}<span class="error">{errors.settingValue}</span>{/if}
					</div>

					<div class="form-group">
						<label for="notes">Notes</label>
						<textarea id="notes" rows="2" bind:value={notes}
							placeholder="Optional: taste notes, extraction comments…"></textarea>
					</div>

					<button type="submit" class="btn btn-primary btn-full" disabled={saving}>
						{saving ? 'Saving…' : 'Log setting'}
					</button>
				</form>
			{/if}
		{/if}
	</div>
</div>

<style>
	.header-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.back-btn {
		min-width: 56px;
		min-height: 44px;
		display: flex;
		align-items: center;
		font-size: 1.125rem;
		color: var(--accent);
	}

	.log-form {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.setup-notice {
		padding: 20px;
	}

	.setup-msg {
		margin-bottom: 16px;
		color: var(--text-muted);
	}

	.setup-links {
		display: flex;
		gap: 10px;
		flex-wrap: wrap;
	}

	.history-preview {
		padding: 12px;
	}

	.history-label {
		font-size: 0.8125rem;
		color: var(--text-muted);
		margin-bottom: 8px;
		font-weight: 500;
	}

	.history-list {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.history-entry {
		display: flex;
		align-items: baseline;
		gap: 10px;
		flex-wrap: wrap;
	}

	.history-value {
		font-weight: 600;
		font-size: 1rem;
		color: var(--accent);
	}

	.history-date {
		font-size: 0.8125rem;
		color: var(--text-dim);
	}

	.history-notes {
		font-size: 0.8125rem;
		color: var(--text-muted);
		width: 100%;
	}

	.adjustment-hint {
		font-size: 0.8125rem;
		font-weight: 700;
		margin-bottom: 8px;
		padding: 5px 10px;
		border-radius: 6px;
		display: inline-block;
		letter-spacing: 0.01em;
	}

	.adjustment-hint--coarser {
		background: #c8a96e;
		color: #1c1917;
	}

	.adjustment-hint--perfect {
		background: #16a34a;
		color: #f0fdf4;
	}

	.adjustment-hint--finer {
		background: #6ea8c8;
		color: #1c1917;
	}

	.error {
		font-size: 0.8125rem;
		color: var(--danger);
	}

	.grinder-position-hint {
		font-size: 0.8125rem;
		color: var(--text-muted);
		margin-top: 6px;
	}

	.grinder-position-hint strong {
		color: var(--text);
	}

	textarea {
		resize: vertical;
		min-height: 64px;
	}
</style>
