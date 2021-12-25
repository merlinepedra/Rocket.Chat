// @ts-nocheck
import { Button, Icon } from '@rocket.chat/fuselage';
import React, { ReactElement } from 'react';

const Action = ({ icon, label, ...props }): ReactElement => (
	<Button title={label} {...props} mi='x4'>
		<Icon name={icon} size='x20' mie='x4' />
		{label}
	</Button>
);

export default Action;
