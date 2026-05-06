<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { getRoaster, saveRoaster } from '$lib/db/roasters.js';
	import type { Roaster } from '$lib/types.js';
	import { base } from '$app/paths';

	let roaster = $state<Roaster | null>(null);
	let loading = $state(true);
	let notFound = $state(false);
	let editing = $state(false);
	let saving = $state(false);

	let name = $state('');
	let website = $state('');
	let errors = $state<Record<string, string>>({});

	onMount(async () => {
		const id = page.params.id ?? '';
		if (!id) { notFound = true; loading = false; return; }
		const r = await getRoaster(id);
		if (!r) { notFound = true; loading = false; return; }
		roaster = r;
		name = r.name;
		website = r.website ?? '';
		loading = false;
	});

	function startEdit() {
		editing = true;
	}

	function cancelEdit() {
		if (!roaster) return;
		name = roaster.name;
		website = roaster.website ?? '';
		errors = {};
		editing = false;
	}

	function validate(): boolean {
		const e: Record<string, string> = {};
		if (!name.trim()) e.name = 'Name is required';
		errors = e;
		return Object.keys(e).length === 0;
	}

	async function handleSave(e: Event) {
		e.preventDefault();
		if (!validate() || !roaster) return;
		saving = true;
		const updated: Roaster = {
			...roaster,
			name: name.trim(),
			website: website.trim() || undefined
		};
		await saveRoaster(updated);
		roaster = updated;
		editing = false;
		saving = false;
	}
</script>

<div class="page">
	<header class="page-header">
		<div class="header-row">
			<button type="button" class="back-btn" onclick={() => history.back()}
				aria-label="Back">‹ Back</button>
			<h1 class="header-title">{roaster?.name ?? '…'}</h1>
			{#if roaster && !editing}
				<button type="button" class="edit-btn" onclick={startEdit}>Edit</button>
			{:else}
				<div style="width:56px"></div>
			{/if}
		</div>
	</header>

	<div class="page-content">
		{#if loading}
			<div class="empty-state"><p>Loading…</p></div>
		{:else if notFound || !roaster}
			<div class="empty-state">
				<span class="icon">❓</span>
				<p>Roaster not found.</p>
				<a href="{base}/" class="btn btn-secondary">Go home</a>
			</div>
		{:else if editing}
			<form onsubmit={handleSave}>
				<div class="form-group">
					<label for="name">Name *</label>
					<input id="name" type="text" bind:value={name}
						placeholder="Roaster name" autocomplete="off" />
					{#if errors.name}<span class="error">{errors.name}</span>{/if}
				</div>

				<div class="form-group">
					<label for="website">Website</label>
					<input id="website" type="url" bind:value={website}
						placeholder="https://example.com" autocomplete="off" />
				</div>

				<div class="divider"></div>

				<div class="action-row">
					<button type="button" class="btn btn-secondary" onclick={cancelEdit}>
						Cancel
					</button>
					<button type="submit" class="btn btn-primary" disabled={saving}>
						{saving ? 'Saving…' : 'Save'}
					</button>
				</div>
			</form>
		{:else}
			<section class="card">
				<dl class="detail-grid">
					<div class="detail-row">
						<dt>Name</dt>
						<dd>{roaster.name}</dd>
					</div>
					{#if roaster.website}
					<div class="detail-row">
						<dt>Website</dt>
						<dd>
							<a href={roaster.website} target="_blank" rel="noopener noreferrer"
								class="website-link">
								{roaster.website.replace(/^https?:\/\//, '')}
							</a>
						</dd>
					</div>
					{/if}
				</dl>
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
		min-width: 56px;
		min-height: 44px;
		display: flex;
		align-items: center;
		font-size: 1.125rem;
		color: var(--accent);
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
	}

	.edit-btn {
		min-width: 56px;
		min-height: 44px;
		display: flex;
		align-items: center;
		justify-content: flex-end;
		font-size: 0.9375rem;
		font-weight: 500;
		color: var(--accent);
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
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

	.website-link {
		color: var(--accent);
		font-size: 0.875rem;
		word-break: break-all;
	}

	.error {
		font-size: 0.8125rem;
		color: var(--danger);
	}

	.action-row {
		display: flex;
		gap: 12px;
	}

	.action-row .btn {
		flex: 1;
	}
</style>
