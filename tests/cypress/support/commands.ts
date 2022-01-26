import type { FlowRouter } from 'meteor/kadira:flow-router';
import type { Meteor } from 'meteor/meteor';

declare global {
	interface Window {
		Meteor: typeof Meteor;
		FlowRouter: typeof FlowRouter;
	}

	namespace browser {
		function element(attr: string): Cypress.Chainable<JQuery<HTMLElement>>;
	}

	namespace Cypress {
		interface Chainable {
			login(email: string, password: string): Chainable<void>;
		}
	}
}

Cypress.Commands.add('login', (email, password) =>
	cy.window().then(
		({ Meteor }): Promise<void> =>
			new Promise((resolve, reject) => {
				Meteor.loginWithPassword(email, password, (error) => {
					if (error) {
						reject(error);
						return;
					}

					resolve();
				});
			}),
	),
);

Cypress.Commands.add('logout', () =>
	cy.window().then(
		({ Meteor, FlowRouter }): Promise<void> =>
			new Promise((resolve) => {
				Meteor.startup(() => {
					setTimeout(() => {
						const user = Meteor.user();
						if (!user) {
							return resolve();
						}

						Meteor.logout(() => {
							Meteor.call('logoutCleanUp', user);
							FlowRouter.go('home');
							resolve();
						});
					}, 500);
				});
			}),
	),
);

//
// -- This is a child command --
Cypress.Commands.add('getLocation', { prevSubject: 'element' }, (subject) => subject.get(0).getBoundingClientRect());

// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })

// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

global.browser = {
	element: (attr) => cy.get(attr),
};
