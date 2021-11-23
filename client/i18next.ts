import i18n, { ReadCallback } from 'i18next';
import { initReactI18next } from 'react-i18next';

export const loadResource = async (lng: string): Promise<string> => {
	const translation = await require(`../i18n/en.i18n.json`);

	console.log(`../i18n/${lng}.i18n.json`);
	console.log(translation);
	return translation;
};

i18n
	.use({
		type: 'backend',
		read: (language: string, _namespace: string, callback: ReadCallback) => {
			loadResource(language)
				.then((resource) => {
					callback(null, resource);
				})
				.catch((reason) => {
					callback(reason, null);
				});
		},
	})
	.use(initReactI18next)
	.init({
		lng: 'pt-BR',
		fallbackLng: 'en',
	});
