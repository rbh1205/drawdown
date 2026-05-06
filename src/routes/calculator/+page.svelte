<script lang="ts">
	import { onMount } from 'svelte';
	import { getPreferences, savePreferences } from '$lib/db/preferences.js';

	let ratio = 16;
	let inputValue = '';
	let reverseMode = false;
	let inputError = '';
	let ratioError = '';

	onMount(async () => {
		const prefs = await getPreferences();
		ratio = prefs.defaultRatio;
	});

	function parsePositiveFloat(val: string): number | null {
		if (val.trim() === '') return null;
		const n = parseFloat(val);
		if (isNaN(n) || n <= 0) return null;
		return n;
	}

	function restrictToNumeric(event: InputEvent) {
		if (!event.data) return;
		if (!/^[\d.]*$/.test(event.data)) {
			event.preventDefault();
			return;
		}
		if (event.data.includes('.') && inputValue.includes('.')) {
			event.preventDefault();
		}
	}

	function handleInputChange() {
		if (inputValue === '') {
			inputError = '';
			return;
		}
		const n = parseFloat(inputValue);
		if (isNaN(n) || n <= 0) {
			inputError = 'Enter a positive number';
		} else {
			inputError = '';
		}
	}

	async function handleRatioBlur(event: FocusEvent) {
		const raw = (event.target as HTMLInputElement).value;
		const n = parseInt(raw, 10);
		if (isNaN(n) || n <= 0) {
			ratioError = 'Ratio must be a positive whole number';
			(event.target as HTMLInputElement).value = String(ratio);
			return;
		}
		ratioError = '';
		ratio = n;
		await savePreferences({ defaultRatio: ratio });
	}

	function handleRatioInput(event: Event) {
		const raw = (event.target as HTMLInputElement).value;
		const n = parseInt(raw, 10);
		if (!isNaN(n) && n > 0) {
			ratioError = '';
		}
	}

	function toggleMode() {
		reverseMode = !reverseMode;
		inputValue = '';
		inputError = '';
	}

	function fmt(n: number): string {
		if (n % 1 === 0) return String(n);
		return n.toFixed(1);
	}

	$: inputNum = parsePositiveFloat(inputValue);
	$: result = inputNum !== null ? (reverseMode ? inputNum / ratio : inputNum * ratio) : null;
	$: inputLabel = reverseMode ? 'Water (g)' : 'Dose (g coffee)';
	$: resultLabel = reverseMode ? 'Dose' : 'Water';
	$: resultUnit = reverseMode ? 'g coffee' : 'g water';
	$: placeholder = reverseMode ? 'e.g. 320' : 'e.g. 20';
</script>

<div class="page">
	<header class="page-header">
		<h1>Calculator</h1>
	</header>

	<div class="page-content">
		<div class="card" style="margin-bottom:16px">
			<div class="ratio-row">
				<span class="ratio-label">Default ratio</span>
				<div class="ratio-input-wrap">
					<span class="ratio-prefix">1 :</span>
					<input
						type="number"
						min="1"
						max="100"
						inputmode="numeric"
						value={ratio}
						on:input={handleRatioInput}
						on:blur={handleRatioBlur}
						aria-label="Default brew ratio denominator"
						class="ratio-input"
					/>
				</div>
			</div>
			{#if ratioError}
				<p role="alert" class="field-error" style="margin-top:6px">{ratioError}</p>
			{/if}
		</div>

		<div class="card" style="margin-bottom:16px">
			<div class="form-group" style="margin-bottom:0">
				<label for="main-input">{inputLabel}</label>
				<input
					id="main-input"
					type="text"
					inputmode="decimal"
					{placeholder}
					bind:value={inputValue}
					on:beforeinput={restrictToNumeric}
					on:input={handleInputChange}
					aria-label={inputLabel}
					aria-invalid={inputError ? 'true' : 'false'}
					class="main-input"
				/>
				{#if inputError}
					<p role="alert" class="field-error">{inputError}</p>
				{/if}
			</div>
		</div>

		<div class="result-card card" style="margin-bottom:16px">
			{#if result !== null}
				<div class="result-sublabel">{resultLabel}</div>
				<div class="result-value">{fmt(result)}</div>
				<div class="result-unit">{resultUnit}</div>
			{:else}
				<div class="result-placeholder">
					{reverseMode ? 'Enter water weight above' : 'Enter coffee dose above'}
				</div>
			{/if}
		</div>

		<button class="btn btn-secondary btn-full toggle-btn" on:click={toggleMode}>
			<span class="toggle-icon">⇅</span>
			{reverseMode ? 'Switch to dose → water' : 'Switch to water → dose'}
		</button>
	</div>
</div>

<style>
	.ratio-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}

	.ratio-label {
		font-size: 0.875rem;
		color: var(--text-muted);
	}

	.ratio-input-wrap {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.ratio-prefix {
		color: var(--text-muted);
		font-size: 0.9375rem;
	}

	.ratio-input {
		width: 72px;
		text-align: center;
		padding: 6px 8px;
		font-size: 1rem;
	}

	.main-input {
		font-size: 1.375rem;
		padding: 14px 16px;
	}

	.field-error {
		color: var(--danger);
		font-size: 0.8125rem;
	}

	.result-card {
		text-align: center;
		padding: 32px 16px;
		min-height: 120px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.result-sublabel {
		font-size: 0.8125rem;
		color: var(--text-muted);
		margin-bottom: 4px;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.result-value {
		font-size: 3.5rem;
		font-weight: 700;
		color: var(--accent);
		line-height: 1;
		margin-bottom: 4px;
	}

	.result-unit {
		font-size: 0.875rem;
		color: var(--text-dim);
	}

	.result-placeholder {
		color: var(--text-dim);
		font-size: 0.9375rem;
	}

	.toggle-btn {
		gap: 8px;
	}

	.toggle-icon {
		font-size: 1.125rem;
	}
</style>
