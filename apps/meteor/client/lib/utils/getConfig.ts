import { Meteor } from 'meteor/meteor';

export const getConfig = (key: string): string | null => {
	const searchParams = new URLSearchParams(window.location.search);
	return searchParams.get(key) || Meteor._localStorage.getItem(`rc-config-${key}`);
};

export const getIntegerConfig = (key: string, defaultValue: number): number => {
	const value = getConfig(key);
	return value ? parseInt(value, 10) : defaultValue;
};
