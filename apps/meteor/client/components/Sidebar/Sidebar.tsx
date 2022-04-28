import { Box } from '@rocket.chat/fuselage';
import React, { ComponentProps } from 'react';

const Sidebar = (props: ComponentProps<typeof Box>) => (
	<Box display='flex' flexDirection='column' h='full' justifyContent='stretch' {...props} />
);

export default Sidebar;
