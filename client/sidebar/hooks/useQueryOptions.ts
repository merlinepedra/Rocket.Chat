// @ts-nocheck
import { useMemo } from 'react';

import { useSetting } from '../../contexts/SettingsContext';
import { FindOptions, useUserPreference } from '../../contexts/UserContext';

export const useQueryOptions = (): FindOptions => {
	const sortBy = useUserPreference('sidebarSortby');
	const showRealName = useSetting('UI_Use_Real_Name');

	return useMemo(
		() => ({
			sort: {
				...(sortBy === 'activity' && { lm: -1 }),
				...(sortBy !== 'activity' && {
					...(showRealName && { lowerCaseFName: /descending/.test(sortBy) ? -1 : 1 }),
					...(!showRealName && { lowerCaseName: /descending/.test(sortBy) ? -1 : 1 }),
				}),
			},
		}),
		[sortBy, showRealName],
	);
};
