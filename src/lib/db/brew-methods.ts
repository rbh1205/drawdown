import { get, getMany, set, del, keys } from 'idb-keyval';
import { brewMethodsStore } from './index.js';
import { getAllGrindSettings } from './grind-settings.js';
import type { BrewMethod } from '../types.js';

export async function getAllBrewMethods(): Promise<BrewMethod[]> {
	const allKeys = await keys(brewMethodsStore);
	if (allKeys.length === 0) return [];
	return (await getMany<BrewMethod>(allKeys as string[], brewMethodsStore)).filter(Boolean) as BrewMethod[];
}

export async function getBrewMethod(id: string): Promise<BrewMethod | undefined> {
	return get<BrewMethod>(id, brewMethodsStore);
}

export async function saveBrewMethod(method: BrewMethod): Promise<void> {
	await set(method.id, method, brewMethodsStore);
}

export async function safeDeleteBrewMethod(id: string): Promise<{ success: boolean; reason?: string }> {
	const settings = await getAllGrindSettings();
	const inUse = settings.some((s) => s.brewMethodId === id);
	if (inUse) {
		return {
			success: false,
			reason: 'This brew method has logged settings and cannot be deleted.'
		};
	}
	await del(id, brewMethodsStore);
	return { success: true };
}
