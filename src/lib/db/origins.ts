import { get, getMany, set, keys } from 'idb-keyval';
import { originsStore } from './index.js';
import type { Origin } from '../types.js';

export async function getOrigin(id: string): Promise<Origin | undefined> {
	return get<Origin>(id, originsStore);
}

export async function getAllOrigins(): Promise<Origin[]> {
	const allKeys = await keys(originsStore);
	if (allKeys.length === 0) return [];
	return (await getMany<Origin>(allKeys as string[], originsStore)).filter(Boolean) as Origin[];
}

export async function saveOrigin(origin: Origin): Promise<void> {
	await set(origin.id, origin, originsStore);
}
