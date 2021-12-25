// @ts-nocheck
import { useRef, useEffect, Ref } from 'react';

export const useBlockRendered = (): { className: string; ref: Ref } => {
	const ref = useRef();
	useEffect(() => {
		ref.current.dispatchEvent(new Event('rendered'));
	}, []);
	return { className: 'js-block-wrapper', ref };
};
