# Quickstart: Specialty Coffee Grind Tracker

**Date**: 2026-05-06 | **Stack**: SvelteKit + TypeScript + idb-keyval + vite-plugin-pwa

---

## Prerequisites

- Node.js 20+
- A Chromium-based browser (Chrome 110+) for development and testing
- Android device or Chrome DevTools mobile emulation (360×780 dp) for UI verification

---

## Project Initialisation

```bash
# Create SvelteKit project (select TypeScript + no linting/testing prompts — add manually)
npm create svelte@latest . -- --template skeleton --type typescript

# Install runtime dependencies
npm install idb-keyval

# Install dev dependencies
npm install -D vite-plugin-pwa @vite-pwa/sveltekit
```

---

## Key Configuration

### `svelte.config.js` — static adapter

```js
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({ fallback: 'index.html' }),
  },
};
```

`fallback: 'index.html'` enables client-side routing for all tab destinations.

### `vite.config.ts` — PWA plugin

```ts
import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    sveltekit(),
    SvelteKitPWA({
      manifest: {
        name: 'Coffee Tracker',
        short_name: 'Coffee',
        start_url: '/',
        display: 'standalone',
        background_color: '#1a1a1a',
        theme_color: '#c8a96e',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
    }),
  ],
});
```

---

## Development

```bash
npm run dev          # start dev server at http://localhost:5173
npm run build        # production build (static output in /build)
npm run preview      # preview production build locally
```

### Mobile verification

1. Open Chrome DevTools → Toggle device toolbar → select a 360×780 viewport (or "Pixel 7").
2. Verify all tap targets are ≥44×44 dp.
3. Check layout shifts by enabling "Layout Shift Regions" in Rendering tab.

### PWA install (local)

1. `npm run build && npm run preview`
2. Open `http://localhost:4173` in Chrome.
3. Click the install icon in the address bar.
4. Verify the app opens standalone (no browser chrome).

---

## Testing

```bash
npm install -D vitest @testing-library/svelte jsdom
npx vitest run          # unit tests
npx vitest              # watch mode
```

Test files live in `tests/unit/` and `tests/integration/`.

---

## Source Layout

```
src/
├── lib/
│   ├── db/
│   │   ├── index.ts           # store exports (createStore calls)
│   │   ├── bags.ts            # CRUD + query helpers for bags
│   │   ├── roasters.ts
│   │   ├── grinders.ts
│   │   ├── brew-methods.ts
│   │   ├── grind-settings.ts
│   │   └── preferences.ts
│   ├── stores/
│   │   └── bags.svelte.ts     # reactive Svelte store for active bags
│   └── utils/
│       └── barcode.ts         # BarcodeDetector wrapper with fallback
├── routes/
│   ├── +layout.svelte         # bottom tab bar
│   ├── +page.svelte           # Home — active rotation
│   ├── add-bag/
│   │   └── +page.svelte
│   ├── bag/[id]/
│   │   └── +page.svelte       # bag detail + grind settings
│   ├── archive/
│   │   └── +page.svelte
│   ├── calculator/
│   │   └── +page.svelte
│   └── stats/
│       └── +page.svelte
└── app.html

static/
└── icons/
    ├── icon-192.png
    └── icon-512.png

tests/
├── unit/
└── integration/
```
