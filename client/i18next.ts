import i18n, { ReadCallback } from 'i18next';
import { initReactI18next } from 'react-i18next';

export const loadResource = async (lng: string): Promise<string> => {
	const { default: translation } = await import(`../i18n/${lng}.json`);

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
					console.error(reason);
					callback(reason, null);
				});
		},
	})
	.use(initReactI18next)
	.init({
		lng: 'pt-BR',
		fallbackLng: 'en',
	});
