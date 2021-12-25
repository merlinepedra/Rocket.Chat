// @ts-nocheck
import { ComponentType, useMemo } from 'react';

import { useUserPreference } from '../../contexts/UserContext';
import Condensed from '../Item/Condensed';
import Extended from '../Item/Extended';
import Medium from '../Item/Medium';

export const useTemplateByViewMode = (): ComponentType => {
	const sidebarViewMode = useUserPreference('sidebarViewMode');
	return useMemo(() => {
		switch (sidebarViewMode) {
			case 'extended':
				return Extended;
			case 'medium':
				return Medium;
			case 'condensed':
			default:
				return Condensed;
		}
	}, [sidebarViewMode]);
};
