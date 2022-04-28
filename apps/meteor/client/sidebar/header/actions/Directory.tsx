import { Sidebar } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import React, { ComponentProps } from 'react';

import { useLayout } from '../../../contexts/LayoutContext';
import { useRoute } from '../../../contexts/RouterContext';

const Directory = (props: ComponentProps<typeof Sidebar.TopBar.Action>) => {
	const directoryRoute = useRoute('directory');
	const { sidebar } = useLayout();
	const handleDirectory = useMutableCallback(() => {
		sidebar.toggle();
		directoryRoute.push({});
	});

	return <Sidebar.TopBar.Action {...props} icon='globe' onClick={handleDirectory} />;
};

export default Directory;
