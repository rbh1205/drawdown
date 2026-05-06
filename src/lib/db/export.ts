import { getAllBags } from './bags.js';
import { getAllRoasters } from './roasters.js';
import { getAllOrigins } from './origins.js';
import { getAllGrinders } from './grinders.js';
import { getAllBrewMethods } from './brew-methods.js';
import { getAllGrindSettings } from './grind-settings.js';
import { getPreferences } from './preferences.js';

export async function exportAllData(): Promise<File> {
	const [bags, roasters, origins, grinders, brewMethods, grindSettings, preferences] =
		await Promise.all([
			getAllBags(),
			getAllRoasters(),
			getAllOrigins(),
			getAllGrinders(),
			getAllBrewMethods(),
			getAllGrindSettings(),
			getPreferences()
		]);

	const payload = {
		exportedAt: new Date().toISOString(),
		version: 1,
		bags,
		roasters,
		origins,
		grinders,
		brewMethods,
		grindSettings,
		preferences
	};

	const json = JSON.stringify(payload, null, 2);
	const date = new Date().toISOString().split('T')[0];
	return new File([json], `coffee-tracker-${date}.json`, { type: 'application/json' });
}
