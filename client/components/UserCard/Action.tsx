// @ts-nocheck
import { ActionButton } from '@rocket.chat/fuselage';
import React, { ReactElement } from 'react';

const Action = ({ label, ...props }): ReactElement => (
	<ActionButton small title={label} {...props} mi='x2' />
);

export default Action;
