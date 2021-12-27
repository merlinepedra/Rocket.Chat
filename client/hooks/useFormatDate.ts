// @ts-nocheck
import moment, { MomentInput } from 'moment';
import { useCallback } from 'react';

import { useSetting } from '../contexts/SettingsContext';

export const useFormatDate = (): ((input: MomentInput) => string) => {
	const format = useSetting('Message_DateFormat');
	return useCallback((time) => moment(time).format(format), [format]);
};
