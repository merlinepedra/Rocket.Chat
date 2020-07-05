import { useMediaQuery } from '@rocket.chat/fuselage-hooks';

export const useIsReducedMotionPreferred = (): boolean =>
	useMediaQuery('(prefers-reduced-motion: reduce)');
