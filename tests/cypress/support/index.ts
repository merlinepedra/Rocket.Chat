import './commands';

// Cypress.Cookies.debug(true);

Cypress.Cookies.defaults({
	whitelist: ['rc_uid', 'rc_token'],
});

Cypress.LocalStorage.clear = () => undefined;

Cypress.on('fail', (error) => {
	// @ts-ignore
	Cypress.stop();
	throw error;
});
