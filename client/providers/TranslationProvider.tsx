// @ts-nocheck
import { TAPi18n, TAPi18next } from 'meteor/rocketchat:tap-i18n';
import React, { ReactElement, useMemo } from 'react';

import { TranslationContext } from '../contexts/TranslationContext';
import { useReactiveValue } from '../hooks/useReactiveValue';

const createTranslateFunction = (language): ((...args: unknown[]) => string) => {
	const translate = (key, ...replaces): string => {
		if (typeof replaces[0] === 'object') {
			const [options, langTag = language] = replaces;
			return TAPi18next.t(key, {
				ns: 'project',
				lng: langTag,
				...options,
			});
		}

		if (replaces.length === 0) {
			return TAPi18next.t(key, { ns: 'project', lng: language });
		}

		return TAPi18next.t(key, {
			postProcess: 'sprintf',
			sprintf: replaces,
			ns: 'project',
			lng: language,
		});
	};

	translate.has = (key, { lng = language, ...options } = {}): boolean =>
		!!key && TAPi18next.exists(key, { ns: 'project', lng, ...options });

	return translate;
};

const getLanguages = (): unknown[] => {
	const result = Object.entries(TAPi18n.getLanguages())
		.map(([key, language]) => ({ ...language, key: key.toLowerCase() }))
		.sort((a, b) => a.key - b.key);

	result.unshift({
		name: 'Default',
		en: 'Default',
		key: '',
	});

	return result;
};

const getLanguage = (): string => TAPi18n.getLanguage();

const loadLanguage = (language): void => TAPi18n._loadLanguage(language);

function TranslationProvider({ children }): ReactElement {
	const languages = useReactiveValue(getLanguages);
	const language = useReactiveValue(getLanguage);

	const translate = useMemo(() => createTranslateFunction(language), [language]);

	const value = useMemo(
		() => ({
			languages,
			language,
			loadLanguage,
			translate,
		}),
		[languages, language, translate],
	);

	return <TranslationContext.Provider children={children} value={value} />;
}

export default TranslationProvider;
