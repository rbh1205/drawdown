export type ProcessingMethod = 'washed' | 'natural' | 'honey' | 'anaerobic';

export interface Bag {
	id: string;
	name: string;
	roasterId: string;
	originId: string;
	processingMethod: ProcessingMethod;
	processDetail?: string;
	variety?: string;
	altitude?: string;
	roastDate?: string;
	status: 'active' | 'archived';
	dateAdded: string;
	dateFinished?: string;
	ratingScore?: 1 | 2 | 3 | 4 | 5;
}

export interface Roaster {
	id: string;
	name: string;
	website?: string;
}

export interface Origin {
	id: string;
	name: string;
}

export interface Grinder {
	id: string;
	name: string;
	type: 'hand' | 'electric';
	currentSetting?: string;
}

export interface BrewMethod {
	id: string;
	name: string;
}

export interface GrindSetting {
	id: string;
	bagId: string;
	grinderId: string;
	brewMethodId: string;
	settingValue: string;
	notes?: string;
	dateLogged: string;
	nextAdjustment?: 'way coarser' | 'coarser' | 'try again' | 'perfect' | 'finer' | 'way finer';
}

export interface AppPreferences {
	defaultRatio: number;
}
