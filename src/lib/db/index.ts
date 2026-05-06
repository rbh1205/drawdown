import { createStore } from 'idb-keyval';

// Each store gets its own database so idb-keyval's createStore doesn't race
// during onupgradeneeded when opening multiple stores from the same db name.
export const bagsStore = createStore('ct-bags', 'bags');
export const roastersStore = createStore('ct-roasters', 'roasters');
export const originsStore = createStore('ct-origins', 'origins');
export const grindersStore = createStore('ct-grinders', 'grinders');
export const brewMethodsStore = createStore('ct-brew-methods', 'brew-methods');
export const grindSettingsStore = createStore('ct-grind-settings', 'grind-settings');
export const preferencesStore = createStore('ct-preferences', 'preferences');
