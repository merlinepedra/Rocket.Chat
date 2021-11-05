import { getConfig } from '../../../client/lib/utils/getConfig';

type DebugLogger = {
	log: (...msg: unknown[]) => void;
	logError: (...msg: unknown[]) => void;
}

let debug: boolean | undefined = undefined;

const isDebugEnabled = (): boolean => {
	if (debug === undefined) {
		debug = getConfig('debug') === 'true' || getConfig('debug-e2e') === 'true';
	}

	return debug;
};

let colorIndex = 0;

const getRandomColor = (): string => {
	const color = `hsl(${ 30 * colorIndex }, 75%, 50%);`;
	colorIndex++;
	return color;
};

export const createDebugLogger = (namespace: string, extraData?: () => unknown[]): DebugLogger => {
	if (!isDebugEnabled()) {
		return {
			log: (): void => undefined,
			logError: (): void => undefined,
		};
	}

	const color = getRandomColor();

	if (!extraData) {
		return {
			log: (...msg: unknown[]): void => console.log(`%c${ namespace }`, `font-weight: bold; color: ${ color }`, ...msg),
			logError: (...msg: unknown[]): void => console.error(`%c${ namespace }`, `font-weight: bold; color: ${ color }`, ...msg),
		};
	}

	return {
		log: (...msg: unknown[]): void => console.log(`%c${ namespace }`, `font-weight: bold; color: ${ color }`, ...extraData(), ...msg),
		logError: (...msg: unknown[]): void => console.error(`%c${ namespace }`, `font-weight: bold; color: ${ color }`, ...extraData(), ...msg),
	};
};
