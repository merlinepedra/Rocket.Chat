import { toClassName, cssFn } from '@rocket.chat/css-in-js';
import { useMemo } from 'react';

export const useStyle = (fn: cssFn): string | undefined => useMemo(() => {
	if (!fn) {
		return;
	}

	return fn ? toClassName(fn) : undefined;
}, [fn]);
