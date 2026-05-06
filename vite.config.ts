import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { defineConfig } from 'vite';

const base = process.env.BASE_PATH ?? '';

export default defineConfig({
	plugins: [
		sveltekit(),
		SvelteKitPWA({
			strategies: 'generateSW',
			registerType: 'autoUpdate',
			manifest: {
				id: `${base}/`,
				scope: `${base}/`,
				name: 'Coffee Tracker',
				short_name: 'Coffee',
				description: 'Personal specialty coffee grind tracker',
				start_url: `${base}/`,
				display: 'standalone',
				background_color: '#1c1917',
				theme_color: '#c8a96e',
				icons: [
					{
						src: `${base}/icons/icon-192.png`,
						sizes: '192x192',
						type: 'image/png',
						purpose: 'any'
					},
					{
						src: `${base}/icons/icon-192.png`,
						sizes: '192x192',
						type: 'image/png',
						purpose: 'maskable'
					},
					{
						src: `${base}/icons/icon-512.png`,
						sizes: '512x512',
						type: 'image/png',
						purpose: 'any'
					},
					{
						src: `${base}/icons/icon-512.png`,
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable'
					}
				]
			},
			workbox: {
				globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
			},
			devOptions: {
				enabled: false
			}
		})
	]
});
