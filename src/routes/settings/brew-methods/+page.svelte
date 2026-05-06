<script lang="ts">
	import { onMount } from 'svelte';
	import { getAllBrewMethods, saveBrewMethod, safeDeleteBrewMethod } from '$lib/db/brew-methods.js';
	import type { BrewMethod } from '$lib/types.js';

	let methods = $state<BrewMethod[]>([]);
	let loading = $state(true);

	let newName = $state('');
	let adding = $state(false);
	let nameError = $state('');

	let deleteError = $state<Record<string, string>>({});
	let confirmDelete = $state<string | null>(null);

	onMount(async () => {
		methods = await getAllBrewMethods();
		loading = false;
	});

	async function handleAdd(e: Event) {
		e.preventDefault();
		nameError = '';
		if (!newName.trim()) { nameError = 'Name is required'; return; }
		adding = true;
		const method: BrewMethod = { id: crypto.randomUUID(), name: newName.trim() };
		await saveBrewMethod(method);
		methods = [...methods, method];
		newName = '';
		adding = false;
	}

	async function handleDelete(id: string) {
		const result = await safeDeleteBrewMethod(id);
		if (result.success) {
			methods = methods.filter((m) => m.id !== id);
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
			<a href="/settings" class="back-btn" aria-label="Back">‹ Back</a>
			<h1>Brew methods</h1>
			<div style="width:56px"></div>
		</div>
	</header>

	<div class="page-content">
		{#if loading}
			<div class="empty-state"><p>Loading…</p></div>
		{:else}
			<section class="add-section card">
				<h2>Add brew method</h2>
				<form onsubmit={handleAdd} class="add-form">
					<div class="form-group">
						<label for="method-name">Name *</label>
						<input id="method-name" type="text" bind:value={newName}
							placeholder="e.g. Moka Pot" autocomplete="off" />
						{#if nameError}<span class="error">{nameError}</span>{/if}
					</div>
					<button type="submit" class="btn btn-primary btn-full" disabled={adding}>
						{adding ? 'Adding…' : 'Add method'}
					</button>
				</form>
			</section>

			<section class="list-section">
				<h2 class="section-title">Brew methods</h2>
				{#if methods.length === 0}
					<div class="empty-state grind-empty">
						<p>No brew methods. Add one above.</p>
					</div>
				{:else}
					<ul class="item-list">
						{#each methods as method (method.id)}
							<li class="item-row card">
								<div class="item-info">
									<span class="item-name">{method.name}</span>
								</div>
								<div class="item-actions">
									{#if confirmDelete === method.id}
										<span class="confirm-text">Delete?</span>
										<button class="btn btn-danger btn-sm" onclick={() => handleDelete(method.id)}>
											Yes
										</button>
										<button class="btn btn-secondary btn-sm" onclick={() => (confirmDelete = null)}>
											No
										</button>
									{:else}
										<button class="btn btn-secondary btn-sm"
											onclick={() => { confirmDelete = method.id; deleteError = {}; }}>
											Delete
										</button>
									{/if}
								</div>
								{#if deleteError[method.id]}
									<p class="delete-error">{deleteError[method.id]}</p>
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
		min-width: 0;
	}

	.item-name {
		font-weight: 600;
		font-size: 0.9375rem;
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
</style>
