import { getAllBags } from './bags.js';
import { getAllOrigins } from './origins.js';
import { getAllRoasters } from './roasters.js';
import type { ProcessingMethod } from '../types.js';

export interface ProcessingBreakdown {
	method: ProcessingMethod;
	count: number;
}

export interface OriginCount {
	name: string;
	count: number;
}

export interface RoasterCount {
	name: string;
	count: number;
}

export interface BagsPerMonth {
	month: string;
	count: number;
}

export async function getProcessingBreakdown(): Promise<ProcessingBreakdown[]> {
	const bags = await getAllBags();
	const counts = new Map<string, number>();
	for (const bag of bags) {
		counts.set(bag.processingMethod, (counts.get(bag.processingMethod) ?? 0) + 1);
	}
	return ([...counts.entries()] as [ProcessingMethod, number][])
		.map(([method, count]) => ({ method, count }))
		.sort((a, b) => b.count - a.count);
}

export async function getOriginsCount(): Promise<OriginCount[]> {
	const [bags, origins] = await Promise.all([getAllBags(), getAllOrigins()]);
	const originMap = new Map(origins.map((o) => [o.id, o.name]));
	const counts = new Map<string, number>();
	for (const bag of bags) {
		const name = originMap.get(bag.originId) ?? 'Unknown';
		counts.set(name, (counts.get(name) ?? 0) + 1);
	}
	return [...counts.entries()]
		.map(([name, count]) => ({ name, count }))
		.sort((a, b) => b.count - a.count);
}

export async function getVarietiesList(): Promise<string[]> {
	const bags = await getAllBags();
	const seen = new Set<string>();
	for (const bag of bags) {
		if (bag.variety?.trim()) seen.add(bag.variety.trim());
	}
	return [...seen].sort();
}

export async function getAltitudeRange(): Promise<string[]> {
	const bags = await getAllBags();
	const seen = new Set<string>();
	for (const bag of bags) {
		if (bag.altitude?.trim()) seen.add(bag.altitude.trim());
	}
	return [...seen].sort();
}

export async function getRoastersCount(): Promise<RoasterCount[]> {
	const [bags, roasters] = await Promise.all([getAllBags(), getAllRoasters()]);
	const roasterMap = new Map(roasters.map((r) => [r.id, r.name]));
	const counts = new Map<string, number>();
	for (const bag of bags) {
		const name = roasterMap.get(bag.roasterId) ?? 'Unknown';
		counts.set(name, (counts.get(name) ?? 0) + 1);
	}
	return [...counts.entries()]
		.map(([name, count]) => ({ name, count }))
		.sort((a, b) => b.count - a.count);
}

export async function getBagsPerMonth(): Promise<BagsPerMonth[]> {
	const bags = await getAllBags();
	const rawToDisplay = new Map<string, string>(); // "YYYY-MM" → "Jan 2026"
	const counts = new Map<string, number>(); // "YYYY-MM" → count
	for (const bag of bags) {
		const raw = bag.dateAdded.substring(0, 7);
		const display = new Date(bag.dateAdded + 'T00:00:00').toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'short'
		});
		rawToDisplay.set(raw, display);
		counts.set(raw, (counts.get(raw) ?? 0) + 1);
	}
	return [...counts.entries()]
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([raw, count]) => ({ month: rawToDisplay.get(raw)!, count }));
}
