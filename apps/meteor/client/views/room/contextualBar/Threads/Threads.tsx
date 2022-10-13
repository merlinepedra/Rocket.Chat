import { useQueryStringParameter } from '@rocket.chat/ui-contexts';
import React, { ReactElement } from 'react';

import { useTabContext } from '../../contexts/ToolboxContext';
import Thread from './Thread';
import ThreadsList from './ThreadsList';

const Threads = (): ReactElement => {
	const mid = useTabContext() as string;
	const jump = useQueryStringParameter('jump');

	if (mid) {
		return <Thread mid={mid} jump={jump} />;
	}

	return <ThreadsList />;
};

export default Threads;
