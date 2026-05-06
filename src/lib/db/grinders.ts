import { get, getMany, set, del, keys } from 'idb-keyval';
import { grindersStore } from './index.js';
import { getAllGrindSettings } from './grind-settings.js';
import type { Grinder } from '../types.js';

export async function getAllGrinders(): Promise<Grinder[]> {
	const allKeys = await keys(grindersStore);
	if (allKeys.length === 0) return [];
	return (await getMany<Grinder>(allKeys as string[], grindersStore)).filter(Boolean) as Grinder[];
}

export async function getGrinder(id: string): Promise<Grinder | undefined> {
	return get<Grinder>(id, grindersStore);
}

export async function saveGrinder(grinder: Grinder): Promise<void> {
	await set(grinder.id, grinder, grindersStore);
}

export async function safeDeleteGrinder(id: string): Promise<{ success: boolean; reason?: string }> {
	const settings = await getAllGrindSettings();
	const inUse = settings.some((s) => s.grinderId === id);
	if (inUse) {
		return {
			success: false,
			reason: 'This grinder has logged settings and cannot be deleted. Rename it instead if needed.'
		};
	}
	await del(id, grindersStore);
	return { success: true };
}
