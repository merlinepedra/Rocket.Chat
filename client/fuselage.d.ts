declare module '@rocket.chat/css-in-js' {
	type cssFn = (...args: unknown[]) => string;
	export function css(strings: TemplateStringsArray, ...values: unknown[]): cssFn;
	export function toClassName(fn: cssFn): string | undefined;
}

declare module '@rocket.chat/fuselage-hooks' {
	export const useDebouncedCallback: (fn: (...args: any[]) => any, ms: number, deps: any[]) => (...args: any[]) => any;
	export function useMediaQuery(mediaQuery: string): boolean;
	export const useMutableCallback: (fn: (...args: any[]) => any) => (...args: any[]) => any;
	export const useUniqueId: () => string;
}
