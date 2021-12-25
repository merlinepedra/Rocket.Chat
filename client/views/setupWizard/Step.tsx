// @ts-nocheck
import React, { ReactElement } from 'react';

import './Step.css';

export const Step = ({ active, working = false, ...props }): ReactElement => (
	<form
		data-qa={active ? 'active-step' : undefined}
		className={[
			'SetupWizard__Step',
			active && 'SetupWizard__Step--active',
			working && 'SetupWizard__Step--working',
		]
			.filter(Boolean)
			.join(' ')}
		disabled={working}
		{...props}
	/>
);
