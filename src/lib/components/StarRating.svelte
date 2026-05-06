<script lang="ts">
	interface Props {
		value: number | undefined;
		onchange?: (score: 1 | 2 | 3 | 4 | 5) => void;
		readonly?: boolean;
	}
	let { value, onchange, readonly = false }: Props = $props();

	const stars = [1, 2, 3, 4, 5] as const;
</script>

<div
	class="star-rating"
	role={readonly ? undefined : 'group'}
	aria-label={readonly ? undefined : 'Star rating'}
>
	{#each stars as star}
		{#if readonly}
			<span
				class="star"
				class:filled={value !== undefined && star <= value}
				aria-hidden="true"
			>{star <= (value ?? 0) ? '★' : '☆'}</span>
		{:else}
			<button
				type="button"
				class="star-btn"
				class:filled={value !== undefined && star <= value}
				aria-label="{star} star{star > 1 ? 's' : ''}"
				aria-pressed={value === star}
				onclick={() => onchange?.(star)}
			>{star <= (value ?? 0) ? '★' : '☆'}</button>
		{/if}
	{/each}
</div>

<style>
	.star-rating {
		display: flex;
		gap: 2px;
	}

	.star {
		font-size: 1.5rem;
		color: var(--text-dim);
		line-height: 1;
	}

	.star.filled {
		color: var(--accent);
	}

	.star-btn {
		min-width: 44px;
		min-height: 44px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.5rem;
		color: var(--text-dim);
		transition: color 0.1s, transform 0.1s;
	}

	.star-btn.filled {
		color: var(--accent);
	}

	.star-btn:active {
		transform: scale(0.88);
	}
</style>
