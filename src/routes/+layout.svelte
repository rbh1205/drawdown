<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { base } from '$app/paths';

	let { children } = $props();

	onMount(() => {
		navigator.storage?.persist?.();
	});

	const tabs = [
		{ href: `${base}/`,           label: 'Home'       },
		{ href: `${base}/archive`,    label: 'Archive'    },
		{ href: `${base}/calculator`, label: 'Calculator' },
		{ href: `${base}/stats`,      label: 'Stats'      }
	];

	function isActive(href: string) {
		const pathname = page.url.pathname;
		if (href === `${base}/` || href === base) {
			return pathname === `${base}/` || pathname === base || pathname === '';
		}
		return pathname.startsWith(href);
	}
</script>

<div class="app">
	{@render children()}
</div>

<nav class="tab-bar" aria-label="Main navigation">
	{#each tabs as tab}
		<a
			href={tab.href}
			class="tab"
			class:active={isActive(tab.href)}
			aria-label={tab.label}
			aria-current={isActive(tab.href) ? 'page' : undefined}
		>
			<span class="tab-label">{tab.label}</span>
		</a>
	{/each}
</nav>

<style>
	.app {
		min-height: 100dvh;
	}

	.tab-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		display: flex;
		background: var(--surface);
		border-top: 1px solid var(--border);
		padding-bottom: var(--safe-bottom);
		z-index: 100;
	}

	.tab {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 60px;
		padding: 8px 4px;
		color: var(--text-muted);
		transition: color 0.15s;
		-webkit-tap-highlight-color: transparent;
	}

	.tab:active {
		background: var(--surface-raised);
	}

	.tab.active {
		color: var(--accent);
	}

	.tab-label {
		font-size: 0.6875rem;
		font-weight: 500;
		letter-spacing: 0.01em;
	}
</style>
