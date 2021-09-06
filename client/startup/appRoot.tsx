import { Meteor } from 'meteor/meteor';
import React from 'react';
import { render } from 'react-dom';

import AppRoot from '../views/root/AppRoot';

const createContainer = (): Element => {
	const container = document.getElementById('react-root');

	if (!container) {
		throw new Error('could not find the element #react-root on DOM tree');
	}

	document.body.insertBefore(container, document.body.firstChild);

	return container;
};

Meteor.startup(async () => {
	const container = createContainer();

	if (window.BUGSNAG_API_KEY_CLIENT === undefined) {
		return render(<AppRoot />, container);
	}

	const Bugsnag = (await import('@bugsnag/js')).default;
	const BugsnagPluginReact = (await import('@bugsnag/plugin-react')).default;

	const ErrorBoundary = Bugsnag.getPlugin('react')?.createErrorBoundary(React);

	Bugsnag.start({
		apiKey: window.BUGSNAG_API_KEY_CLIENT,
		plugins: [new BugsnagPluginReact()],
	});

	render(
		ErrorBoundary ? (
			<ErrorBoundary>
				<AppRoot />
			</ErrorBoundary>
		) : (
			<AppRoot />
		),
		container,
	);
});
