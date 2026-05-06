import { get, getMany, set, keys } from 'idb-keyval';
import { bagsStore } from './index.js';
import type { Bag } from '../types.js';

export async function getBag(id: string): Promise<Bag | undefined> {
	return get<Bag>(id, bagsStore);
}

export async function getAllBags(): Promise<Bag[]> {
	const allKeys = await keys(bagsStore);
	if (allKeys.length === 0) return [];
	return (await getMany<Bag>(allKeys as string[], bagsStore)).filter(Boolean) as Bag[];
}

export async function getActiveBags(): Promise<Bag[]> {
	const all = await getAllBags();
	return all.filter((b) => b.status === 'active');
}

export async function saveBag(bag: Bag): Promise<void> {
	await set(bag.id, bag, bagsStore);
}

export async function getArchivedBags(): Promise<Bag[]> {
	const all = await getAllBags();
	return all
		.filter((b) => b.status === 'archived')
		.sort((a, b) => (b.dateFinished ?? '').localeCompare(a.dateFinished ?? ''));
}

export async function archiveBag(id: string, ratingScore?: 1 | 2 | 3 | 4 | 5): Promise<void> {
	const bag = await getBag(id);
	if (!bag) return;
	const updated: Bag = {
		...bag,
		status: 'archived',
		dateFinished: new Date().toISOString().split('T')[0],
		...(ratingScore !== undefined ? { ratingScore } : {})
	};
	await saveBag(updated);
}

export async function updateBagRating(id: string, ratingScore: 1 | 2 | 3 | 4 | 5): Promise<void> {
	const bag = await getBag(id);
	if (!bag) return;
	await saveBag({ ...bag, ratingScore });
}
