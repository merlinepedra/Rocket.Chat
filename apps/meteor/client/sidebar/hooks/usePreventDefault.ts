import { RefObject, useEffect } from 'react';

export const usePreventDefault = <T extends HTMLElement>(ref: RefObject<T>) => {
	// Flowrouter uses an addEventListener on the document to capture any clink link, since the react synthetic event use an addEventListener on the document too,
	// it is impossible/hard to determine which one will happen before and prevent/stop propagation, so feel free to remove this effect after remove flow router :)

	useEffect(() => {
		const { current } = ref;
		if (!current) {
			return;
		}
		const stopPropagation: Parameters<T['addEventListener']>[1] = (e) => {
			if (!e.target) {
				return;
			}
			const target = e.target as T;
			if ([target.nodeName, target.parentElement?.nodeName].includes('BUTTON')) {
				e.preventDefault();
			}
		};
		current.addEventListener('click', stopPropagation);

		return () => current.addEventListener('click', stopPropagation);
	}, [ref]);

	return { ref };
};
