// @ts-nocheck
import { Box, Tag } from '@rocket.chat/fuselage';
import React, { ReactElement } from 'react';

const Role = ({ children }): ReactElement => (
	<Box m='x2' fontScale='c2'>
		<Tag disabled children={children} />
	</Box>
);

export default Role;
