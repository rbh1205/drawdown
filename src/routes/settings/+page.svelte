<script lang="ts">
	import { exportAllData } from '$lib/db/export.js';

	let exporting = $state(false);
	let exportError = $state('');

	async function handleExport() {
		exporting = true;
		exportError = '';
		try {
			const file = await exportAllData();
			if (navigator.canShare?.({ files: [file] })) {
				await navigator.share({ files: [file], title: 'Coffee Tracker backup' });
			} else {
				const url = URL.createObjectURL(file);
				const a = document.createElement('a');
				a.href = url;
				a.download = file.name;
				a.click();
				URL.revokeObjectURL(url);
			}
		} catch (err) {
			if (err instanceof Error && err.name !== 'AbortError') {
				exportError = 'Export failed. Try again.';
			}
		} finally {
			exporting = false;
		}
	}
</script>

<div class="page">
	<header class="page-header">
		<div class="header-row">
			<a href="/" class="back-btn" aria-label="Back">‹ Back</a>
			<h1>Settings</h1>
			<div style="width:56px"></div>
		</div>
	</header>

	<div class="page-content">
		<ul class="settings-list">
			<li>
				<a href="/settings/grinders" class="settings-row card">
					<span class="settings-label">Grinders</span>
					<span class="chevron" aria-hidden="true">›</span>
				</a>
			</li>
			<li>
				<a href="/settings/brew-methods" class="settings-row card">
					<span class="settings-label">Brew methods</span>
					<span class="chevron" aria-hidden="true">›</span>
				</a>
			</li>
		</ul>

		<section class="settings-section">
			<h2 class="section-heading">Data</h2>
			<ul class="settings-list">
				<li>
					<button class="settings-row card" onclick={handleExport} disabled={exporting}>
						<span class="settings-label">{exporting ? 'Preparing…' : 'Export all data'}</span>
						<span class="export-hint">JSON backup</span>
					</button>
				</li>
			</ul>
			{#if exportError}
				<p class="export-error">{exportError}</p>
			{/if}
			<p class="export-note">
				Saves all bags, grind settings, and preferences to a JSON file. Share to Google Drive,
				email, or Files to keep a backup.
			</p>
		</section>
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

	.settings-list {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.settings-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px;
		min-height: 56px;
	}

	.settings-label {
		font-size: 1rem;
		font-weight: 500;
	}

	.chevron {
		font-size: 1.25rem;
		color: var(--text-dim);
	}

	.settings-section {
		margin-top: 24px;
	}

	.section-heading {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-muted);
		padding: 0 4px 8px;
	}

	button.settings-row {
		width: 100%;
		background: var(--surface-raised);
		border: none;
		cursor: pointer;
		text-align: left;
	}

	button.settings-row:disabled {
		opacity: 0.6;
		cursor: default;
	}

	.export-hint {
		font-size: 0.8125rem;
		color: var(--text-muted);
	}

	.export-error {
		font-size: 0.875rem;
		color: var(--error, #d32f2f);
		padding: 8px 4px 0;
	}

	.export-note {
		font-size: 0.8125rem;
		color: var(--text-muted);
		padding: 8px 4px 0;
		line-height: 1.5;
	}
</style>
