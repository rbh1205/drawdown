<script lang="ts">
	import StarRating from './StarRating.svelte';

	interface Props {
		onconfirm: (score: 1 | 2 | 3 | 4 | 5 | null) => void;
	}
	let { onconfirm }: Props = $props();

	let selected = $state<1 | 2 | 3 | 4 | 5 | undefined>(undefined);

	function handleSave() {
		onconfirm(selected ?? null);
	}

	function handleSkip() {
		onconfirm(null);
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div class="overlay" onclick={(e) => { if (e.target === e.currentTarget) handleSkip(); }}>
	<div class="sheet" role="dialog" aria-modal="true" aria-label="Rate this bag">
		<div class="handle" aria-hidden="true"></div>
		<h2 class="title">How was this bag?</h2>
		<p class="subtitle">Rate it now, or skip and add a rating later from the archive.</p>

		<div class="stars-wrap">
			<StarRating value={selected} onchange={(s) => { selected = s; }} />
		</div>

		<div class="actions">
			<button
				type="button"
				class="btn btn-primary btn-full"
				onclick={handleSave}
				disabled={selected === undefined}
			>
				{selected !== undefined ? `Save ${selected}-star rating` : 'Select a rating'}
			</button>
			<button type="button" class="btn btn-secondary btn-full" onclick={handleSkip}>
				Skip
			</button>
		</div>
	</div>
</div>

<style>
	.overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.6);
		z-index: 150;
		display: flex;
		align-items: flex-end;
		justify-content: center;
	}

	.sheet {
		background: var(--surface);
		border-radius: 20px 20px 0 0;
		padding: 12px 20px calc(28px + env(safe-area-inset-bottom, 0px));
		width: 100%;
		max-width: 480px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 14px;
	}

	.handle {
		width: 36px;
		height: 4px;
		border-radius: 2px;
		background: var(--border);
		margin-bottom: 6px;
	}

	.title {
		font-size: 1.125rem;
		font-weight: 600;
	}

	.subtitle {
		font-size: 0.875rem;
		color: var(--text-muted);
		text-align: center;
		line-height: 1.4;
	}

	.stars-wrap {
		padding: 8px 0;
	}

	.actions {
		display: flex;
		flex-direction: column;
		gap: 10px;
		width: 100%;
	}

	.btn:disabled {
		opacity: 0.45;
		pointer-events: none;
	}
</style>
