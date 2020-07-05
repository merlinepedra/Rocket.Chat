import { useMediaQuery } from '@rocket.chat/fuselage-hooks';

export const useIsLightModePreferred = (): boolean =>
	useMediaQuery('(prefers-color-scheme: light)');
