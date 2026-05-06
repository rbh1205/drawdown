<script lang="ts">
	import { onMount } from 'svelte';
	import { getAllGrinders, saveGrinder, safeDeleteGrinder } from '$lib/db/grinders.js';
	import type { Grinder } from '$lib/types.js';
	import { base } from '$app/paths';

	let grinders = $state<Grinder[]>([]);
	let loading = $state(true);

	let newName = $state('');
	let newType = $state<'hand' | 'electric'>('hand');
	let adding = $state(false);
	let nameError = $state('');

	let deleteError = $state<Record<string, string>>({});
	let confirmDelete = $state<string | null>(null);

	let editingSettingId = $state<string | null>(null);
	let editingSettingValue = $state('');

	onMount(async () => {
		grinders = await getAllGrinders();
		loading = false;
	});

	async function handleAdd(e: Event) {
		e.preventDefault();
		nameError = '';
		if (!newName.trim()) { nameError = 'Name is required'; return; }
		adding = true;
		const grinder: Grinder = { id: crypto.randomUUID(), name: newName.trim(), type: newType };
		await saveGrinder(grinder);
		grinders = [...grinders, grinder];
		newName = '';
		newType = 'hand';
		adding = false;
	}

	function startEditSetting(grinder: Grinder) {
		editingSettingId = grinder.id;
		editingSettingValue = grinder.currentSetting ?? '';
	}

	function cancelEditSetting() {
		editingSettingId = null;
		editingSettingValue = '';
	}

	async function saveCurrentSetting(id: string) {
		const grinder = grinders.find((g) => g.id === id);
		if (!grinder) return;
		const updated: Grinder = { ...grinder, currentSetting: editingSettingValue.trim() || undefined };
		await saveGrinder(updated);
		grinders = grinders.map((g) => (g.id === id ? updated : g));
		editingSettingId = null;
		editingSettingValue = '';
	}

	async function handleDelete(id: string) {
		const result = await safeDeleteGrinder(id);
		if (result.success) {
			grinders = grinders.filter((g) => g.id !== id);
			confirmDelete = null;
			const errs = { ...deleteError };
			delete errs[id];
			deleteError = errs;
		} else {
			deleteError = { ...deleteError, [id]: result.reason ?? 'Cannot delete' };
			confirmDelete = null;
		}
	}
</script>

<div class="page">
	<header class="page-header">
		<div class="header-row">
			<a href="{base}/settings" class="back-btn" aria-label="Back">‹ Back</a>
			<h1>Grinders</h1>
			<div style="width:56px"></div>
		</div>
	</header>

	<div class="page-content">
		{#if loading}
			<div class="empty-state"><p>Loading…</p></div>
		{:else}
			<section class="add-section card">
				<h2>Add grinder</h2>
				<form onsubmit={handleAdd} class="add-form">
					<div class="form-group">
						<label for="grinder-name">Name *</label>
						<input id="grinder-name" type="text" bind:value={newName}
							placeholder="e.g. Comandante C40" autocomplete="off" />
						{#if nameError}<span class="error">{nameError}</span>{/if}
					</div>
					<div class="form-group">
						<label for="grinder-type">Type</label>
						<select id="grinder-type" bind:value={newType}>
							<option value="hand">Hand grinder</option>
							<option value="electric">Electric grinder</option>
						</select>
					</div>
					<button type="submit" class="btn btn-primary btn-full" disabled={adding}>
						{adding ? 'Adding…' : 'Add grinder'}
					</button>
				</form>
			</section>

			<section class="list-section">
				<h2 class="section-title">My grinders</h2>
				{#if grinders.length === 0}
					<div class="empty-state grind-empty">
						<span class="icon">⚙️</span>
						<p>No grinders yet. Add one above.</p>
					</div>
				{:else}
					<ul class="item-list">
						{#each grinders as grinder (grinder.id)}
							<li class="item-row card">
								<div class="item-info">
									<span class="item-name">{grinder.name}</span>
									<span class="item-meta">{grinder.type === 'hand' ? 'Hand' : 'Electric'}</span>
									<button class="position-btn" onclick={() => startEditSetting(grinder)}>
										{#if grinder.currentSetting}
											Position: {grinder.currentSetting}
										{:else}
											Set position
										{/if}
									</button>
								</div>
								<div class="item-actions">
									{#if confirmDelete === grinder.id}
										<span class="confirm-text">Delete?</span>
										<button class="btn btn-danger btn-sm" onclick={() => handleDelete(grinder.id)}>
											Yes
										</button>
										<button class="btn btn-secondary btn-sm" onclick={() => (confirmDelete = null)}>
											No
										</button>
									{:else}
										<button class="btn btn-secondary btn-sm"
											onclick={() => { confirmDelete = grinder.id; deleteError = {}; }}>
											Delete
										</button>
									{/if}
								</div>
								{#if editingSettingId === grinder.id}
									<div class="position-edit-form">
										<input
											type="text"
											bind:value={editingSettingValue}
											placeholder="e.g. 28, 3.5, coarse"
											autocomplete="off"
										/>
										<div class="position-edit-actions">
											<button class="btn btn-primary btn-sm" onclick={() => saveCurrentSetting(grinder.id)}>
												Save
											</button>
											<button class="btn btn-secondary btn-sm" onclick={cancelEditSetting}>
												Cancel
											</button>
										</div>
									</div>
								{/if}
								{#if deleteError[grinder.id]}
									<p class="delete-error">{deleteError[grinder.id]}</p>
								{/if}
							</li>
						{/each}
					</ul>
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

	.back-btn {
		min-width: 56px;
		min-height: 44px;
		display: flex;
		align-items: center;
		font-size: 1.125rem;
		color: var(--accent);
	}

	.add-section {
		margin-bottom: 24px;
	}

	.add-section h2 {
		margin-bottom: 12px;
	}

	.add-form {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.section-title {
		margin-bottom: 12px;
	}

	.item-list {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.item-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px;
		padding: 12px 16px;
	}

	.item-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}

	.item-name {
		font-weight: 600;
		font-size: 0.9375rem;
	}

	.item-meta {
		font-size: 0.8125rem;
		color: var(--text-muted);
	}

	.item-actions {
		display: flex;
		align-items: center;
		gap: 6px;
		flex-shrink: 0;
	}

	.confirm-text {
		font-size: 0.875rem;
		color: var(--text-muted);
	}

	.btn-sm {
		min-height: 44px;
		padding: 6px 14px;
		font-size: 0.875rem;
	}

	.btn-danger {
		background: var(--danger);
		color: var(--bg);
	}

	.delete-error {
		width: 100%;
		font-size: 0.8125rem;
		color: var(--danger);
		margin-top: 2px;
	}

	.error {
		font-size: 0.8125rem;
		color: var(--danger);
	}

	.grind-empty {
		padding: 32px 16px;
	}

	.position-btn {
		background: none;
		border: none;
		padding: 0;
		font-size: 0.8125rem;
		color: var(--accent);
		cursor: pointer;
		text-align: left;
		min-height: 0;
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.position-edit-form {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding-top: 8px;
		border-top: 1px solid var(--border);
		margin-top: 4px;
	}

	.position-edit-actions {
		display: flex;
		gap: 8px;
	}
</style>
