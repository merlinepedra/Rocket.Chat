import { useEffect, RefObject } from 'react';
import tinykeys from 'tinykeys';

// used to open the menu option by keyboard
export const useShortcutOpenMenu = <T extends HTMLElement>(ref: RefObject<T>) => {
	useEffect(() => {
		if (!ref.current) {
			return;
		}
		const unsubscribe = tinykeys(ref.current, {
			Alt: (event) => {
				if (!event.target) {
					return;
				}

				const target = event.target as T;
				if (target.className.includes('rcx-sidebar-item')) {
					return;
				}
				event.preventDefault();
				target.querySelector('button')?.click();
			},
		});
		return () => {
			unsubscribe();
		};
	}, [ref]);
};
