// @ts-nocheck
import { Box } from '@rocket.chat/fuselage';
import React, { ReactElement } from 'react';

const Sidebar = ({ children, ...props }): ReactElement => (
	<Box display='flex' flexDirection='column' h='full' justifyContent='stretch' {...props}>
		{children}
	</Box>
);

export default Sidebar;
