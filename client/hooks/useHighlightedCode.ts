// @ts-nocheck
import hljs from 'highlight.js';
import { useMemo } from 'react';

export function useHighlightedCode(language, text): string {
	return useMemo(() => hljs.highlight(language, text).value, [language, text]);
}
