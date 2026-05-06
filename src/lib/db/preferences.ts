import { get, set } from 'idb-keyval';
import { preferencesStore } from './index.js';
import type { AppPreferences } from '../types.js';

const PREFS_KEY = 'prefs';

export async function getPreferences(): Promise<AppPreferences> {
	const stored = await get<AppPreferences>(PREFS_KEY, preferencesStore);
	if (stored) return stored;
	const defaults: AppPreferences = { defaultRatio: 16 };
	await set(PREFS_KEY, defaults, preferencesStore);
	return defaults;
}

export async function savePreferences(prefs: AppPreferences): Promise<void> {
	await set(PREFS_KEY, prefs, preferencesStore);
}
