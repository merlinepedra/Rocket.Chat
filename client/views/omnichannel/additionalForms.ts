// @ts-nocheck
const createFormSubscription = (): unknown => {
	let forms = {};
	let updateCb = (): void => undefined;

	const formsSubscription = {
		subscribe: (cb): (() => void) => {
			updateCb = cb;
			return (): void => {
				updateCb = (): void => undefined;
			};
		},
		getCurrentValue: (): unknown => forms,
	};
	const registerForm = (newForm): void => {
		forms = { ...forms, ...newForm };
		updateCb();
	};
	const unregisterForm = (form): void => {
		delete forms[form];
		updateCb();
	};

	return { registerForm, unregisterForm, formsSubscription };
};

export const { registerForm, unregisterForm, formsSubscription } = createFormSubscription();
