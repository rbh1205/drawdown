<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { saveBag } from '$lib/db/bags.js';
	import { getAllRoasters, saveRoaster } from '$lib/db/roasters.js';
	import { getAllOrigins, saveOrigin } from '$lib/db/origins.js';
	import type { Bag, Roaster, Origin, ProcessingMethod } from '$lib/types.js';

	const PROCESSING_METHODS: ProcessingMethod[] = ['washed', 'natural', 'honey', 'anaerobic'];

	let roasters = $state<Roaster[]>([]);
	let origins = $state<Origin[]>([]);

	// Required fields
	let name = $state('');
	let processingMethod = $state<ProcessingMethod>('washed');
	let processDetail = $state('');

	let selectedRoasterId = $state('');
	let newRoasterName = $state('');
	let showNewRoaster = $state(false);

	let selectedOriginId = $state('');
	let newOriginName = $state('');
	let showNewOrigin = $state(false);

	// Optional fields
	let variety = $state('');
	let altitude = $state('');
	let roastDate = $state('');

	let showOptional = $state(false);
	let saving = $state(false);
	let errors = $state<Record<string, string>>({});

	onMount(async () => {
		[roasters, origins] = await Promise.all([getAllRoasters(), getAllOrigins()]);
	});

	function toggleNewRoaster() {
		showNewRoaster = !showNewRoaster;
		if (showNewRoaster) selectedRoasterId = '';
		else newRoasterName = '';
	}

	function toggleNewOrigin() {
		showNewOrigin = !showNewOrigin;
		if (showNewOrigin) selectedOriginId = '';
		else newOriginName = '';
	}

	function validate(): boolean {
		const e: Record<string, string> = {};
		if (!name.trim()) e.name = 'Name is required';
		if (!showNewOrigin && !selectedOriginId) e.origin = 'Select or add an origin';
		if (showNewOrigin && !newOriginName.trim()) e.origin = 'Origin name is required';
		if (!showNewRoaster && !selectedRoasterId) e.roaster = 'Select or add a roaster';
		if (showNewRoaster && !newRoasterName.trim()) e.roaster = 'Roaster name is required';
		errors = e;
		return Object.keys(e).length === 0;
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!validate()) return;
		saving = true;

		let roasterId = selectedRoasterId;
		if (showNewRoaster) {
			const r: Roaster = { id: crypto.randomUUID(), name: newRoasterName.trim() };
			await saveRoaster(r);
			roasterId = r.id;
		}

		let originId = selectedOriginId;
		if (showNewOrigin) {
			const o: Origin = { id: crypto.randomUUID(), name: newOriginName.trim() };
			await saveOrigin(o);
			originId = o.id;
		}

		const bag: Bag = {
			id: crypto.randomUUID(),
			name: name.trim(),
			roasterId,
			originId,
			processingMethod,
			...(processDetail.trim() && { processDetail: processDetail.trim() }),
			...(variety.trim() && { variety: variety.trim() }),
			...(altitude.trim() && { altitude: altitude.trim() }),
			...(roastDate && { roastDate }),
			status: 'active',
			dateAdded: new Date().toISOString().slice(0, 10)
		};
		await saveBag(bag);
		await goto(base + '/');
	}
</script>

<div class="page">
	<header class="page-header">
		<div class="header-row">
			<a href="{base}/" class="back-btn" aria-label="Back">‹ Back</a>
			<h1>Add bag</h1>
			<div style="width:56px"></div>
		</div>
	</header>

	<div class="page-content">
		<form onsubmit={handleSubmit}>

			<div class="form-group">
				<label for="name">Coffee name *</label>
				<input id="name" type="text" bind:value={name}
					placeholder="e.g. Yirgacheffe Natural" autocomplete="off" />
				{#if errors.name}<span class="error">{errors.name}</span>{/if}
			</div>

			<div class="form-group">
				<label for="origin-select">Origin *</label>
				{#if !showNewOrigin}
					{#if origins.length > 0}
						<select id="origin-select" bind:value={selectedOriginId}>
							<option value="">— Choose an origin —</option>
							{#each origins as o}
								<option value={o.id}>{o.name}</option>
							{/each}
						</select>
					{/if}
					<button type="button" class="btn btn-secondary" onclick={toggleNewOrigin}>
						+ Add new origin
					</button>
				{:else}
					<input id="origin-select" type="text" bind:value={newOriginName}
						placeholder="e.g. Ethiopia" autocomplete="off" />
					{#if origins.length > 0}
						<button type="button" class="link-btn" onclick={toggleNewOrigin}>
							Choose existing instead
						</button>
					{/if}
				{/if}
				{#if errors.origin}<span class="error">{errors.origin}</span>{/if}
			</div>

			<div class="form-group">
				<label for="roaster-select">Roaster *</label>
				{#if !showNewRoaster}
					{#if roasters.length > 0}
						<select id="roaster-select" bind:value={selectedRoasterId}>
							<option value="">— Choose a roaster —</option>
							{#each roasters as r}
								<option value={r.id}>{r.name}</option>
							{/each}
						</select>
					{/if}
					<button type="button" class="btn btn-secondary" onclick={toggleNewRoaster}>
						+ Add new roaster
					</button>
				{:else}
					<input type="text" bind:value={newRoasterName}
						placeholder="Roaster name" autocomplete="off" />
					{#if roasters.length > 0}
						<button type="button" class="link-btn" onclick={toggleNewRoaster}>
							Choose existing instead
						</button>
					{/if}
				{/if}
				{#if errors.roaster}<span class="error">{errors.roaster}</span>{/if}
			</div>

			<div class="form-group">
				<label for="processing">Processing method *</label>
				<select id="processing" bind:value={processingMethod}>
					{#each PROCESSING_METHODS as method}
						<option value={method}>{method.charAt(0).toUpperCase() + method.slice(1)}</option>
					{/each}
				</select>
			</div>

			<div class="form-group">
				<label for="roast-date">Roast date</label>
				<input id="roast-date" type="date" bind:value={roastDate} />
			</div>

			<div class="divider"></div>

			<button type="button" class="optional-toggle" onclick={() => (showOptional = !showOptional)}>
				{showOptional ? '▾' : '▸'} More details (process detail, variety, altitude)
			</button>

			{#if showOptional}
				<div class="optional-fields">
					<div class="form-group">
						<label for="process-detail">Process detail</label>
						<input id="process-detail" type="text" bind:value={processDetail}
							placeholder="e.g. 72H anaerobic, yeast inoculation" autocomplete="off" />
						<span class="hint">Experimental techniques, fermentation time, etc.</span>
					</div>

					<div class="form-group">
						<label for="variety">Variety</label>
						<input id="variety" type="text" bind:value={variety}
							placeholder="e.g. Heirloom, Gesha, SL28" autocomplete="off" />
					</div>

					<div class="form-group">
						<label for="altitude">Altitude</label>
						<input id="altitude" type="text" bind:value={altitude}
							placeholder="e.g. 1800–2200m" autocomplete="off" />
					</div>

				</div>
			{/if}

			<div class="divider"></div>

			<button type="submit" class="btn btn-primary btn-full" disabled={saving}>
				{saving ? 'Saving…' : 'Add to rotation'}
			</button>
		</form>
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

	.error {
		font-size: 0.8125rem;
		color: var(--danger);
	}

	.link-btn {
		font-size: 0.875rem;
		color: var(--accent);
		padding: 8px 0;
		min-height: 44px;
		display: flex;
		align-items: center;
	}

	.optional-toggle {
		width: 100%;
		text-align: left;
		padding: 12px 0;
		font-size: 0.9rem;
		color: var(--text-muted);
		min-height: 44px;
	}

	.optional-fields {
		padding-top: 8px;
	}

</style>
