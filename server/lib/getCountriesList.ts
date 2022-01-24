import { countries } from 'countries-list';

type CountryList = Array<{ key: string; i18nLabel: string }>;

export const getCountriesList = (): CountryList => {
	const countryList: CountryList = Object.values(countries).map(({ name }) => {
		const jointName = name.split(/ |\./).join('');
		const key = jointName.charAt(0).toLowerCase() + jointName.slice(1);
		const i18nLabel = `Country_${jointName}`;

		return { key, i18nLabel };
	});

	return countryList;
};
