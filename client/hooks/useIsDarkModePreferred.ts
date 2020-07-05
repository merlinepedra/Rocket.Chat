import { useMediaQuery } from '@rocket.chat/fuselage-hooks';

export const useIsDarkModePreferred = (): boolean =>
	useMediaQuery('(prefers-color-scheme: dark)');
