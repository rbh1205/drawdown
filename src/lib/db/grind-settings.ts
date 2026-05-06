import { get, getMany, set, keys } from 'idb-keyval';
import { grindSettingsStore } from './index.js';
import type { GrindSetting } from '../types.js';

export async function getAllGrindSettings(): Promise<GrindSetting[]> {
	const allKeys = await keys(grindSettingsStore);
	if (allKeys.length === 0) return [];
	return (await getMany<GrindSetting>(allKeys as string[], grindSettingsStore)).filter(Boolean) as GrindSetting[];
}

export async function getSettingsForCombo(
	bagId: string,
	grinderId: string,
	brewMethodId: string
): Promise<GrindSetting[]> {
	const all = await getAllGrindSettings();
	return all
		.filter((s) => s.bagId === bagId && s.grinderId === grinderId && s.brewMethodId === brewMethodId)
		.sort((a, b) => b.dateLogged.localeCompare(a.dateLogged));
}

export async function getSettingsForBag(bagId: string): Promise<GrindSetting[]> {
	const all = await getAllGrindSettings();
	return all
		.filter((s) => s.bagId === bagId)
		.sort((a, b) => b.dateLogged.localeCompare(a.dateLogged));
}

export async function addGrindSetting(setting: GrindSetting): Promise<void> {
	await set(setting.id, setting, grindSettingsStore);
}

export async function updateGrindSetting(setting: GrindSetting): Promise<void> {
	await set(setting.id, setting, grindSettingsStore);
}
