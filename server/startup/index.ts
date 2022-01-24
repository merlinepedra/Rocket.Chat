import './migrations';
import './appcache';
import './callbacks';
import './cron';
import './initialData';
import './instance';
import './presence';
import './serverRunning';
import './coreApps';
import '../hooks';

import { countries } from 'countries-list';
import { capitalize } from '@rocket.chat/string-helpers';

import { Rooms, Settings } from '../../app/models/server/raw';

type CountryList = Array<{ key: string; i18nLabel: string }>;

export const getCountriesList = (): CountryList => {
	const countryList: CountryList = Object.values(countries).map(({ name }) => {
		const jointName = name
			.split(/ |\./gi)
			.map((s) => capitalize(s))
			.join('')
			.replace(/\[|\]/gi, '');

		const key = jointName.charAt(0).toLowerCase() + jointName.slice(1);
		const i18nLabel = `Country_${jointName}`;

		return { key, i18nLabel };
	});

	return countryList;
};

const getDiscrepancy = async () => {
	const list = getCountriesList();

	const countrySetting = await Settings.findOneById('Country');

	const discrepancy: Array<{ ours: any; theirs: any }> = countrySetting?.values?.reduce((prev, current): any => {
		const theirs = list.find(({ key }) => current.key === key);

		if (!theirs) {
			return [...prev, current];
		}
		return prev;
	}, []);

	console.log(discrepancy);
	return discrepancy;
};

const getDiscrepancy2 = async () => {
	const list = getCountriesList();

	const countrySetting = await Settings.findOneById('Country');

	const discrepancy: Array<{ ours: any; theirs: any }> = list.reduce((prev, current): any => {
		const theirs = countrySetting.values.find(({ key }) => current.key === key);

		if (!theirs) {
			return [...prev, current];
		}
		return prev;
	}, []);

	console.log(discrepancy);
	return discrepancy;
};
getDiscrepancy();
getDiscrepancy2();
