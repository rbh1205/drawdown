import { get, getMany, set, keys } from 'idb-keyval';
import { roastersStore } from './index.js';
import type { Roaster } from '../types.js';

export async function getRoaster(id: string): Promise<Roaster | undefined> {
	return get<Roaster>(id, roastersStore);
}

export async function getAllRoasters(): Promise<Roaster[]> {
	const allKeys = await keys(roastersStore);
	if (allKeys.length === 0) return [];
	return (await getMany<Roaster>(allKeys as string[], roastersStore)).filter(Boolean) as Roaster[];
}

export async function saveRoaster(roaster: Roaster): Promise<void> {
	await set(roaster.id, roaster, roastersStore);
}
