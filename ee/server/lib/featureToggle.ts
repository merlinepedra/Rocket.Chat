import { Meteor } from 'meteor/meteor';

export interface IToggleableFeature {
	isEnabled(): boolean;
	initialize(): void;
	attach(): void;
	detach(): void;
}

export const registerToggleableFeature = (feature: IToggleableFeature): (() => void) => {
	let enabled = false;

	const update = (): void => {
		if (!feature.isEnabled()) {
			if (enabled) {
				feature.detach();
			}
			enabled = false;
			return;
		}

		if (enabled) {
			return;
		}

		feature.attach();
		enabled = true;
	};

	Meteor.startup(() => {
		feature.initialize();

		if (feature.isEnabled()) {
			feature.attach();
		}
	});

	return update;
};
