import React, { ReactElement } from 'react';

import { useTabContext } from '../../contexts/ToolboxContext';
import Thread from './Thread';
import ThreadsList from './ThreadsList';

const Threads = (): ReactElement => {
	const mid = useTabContext();

	if (mid) {
		return <Thread mid={mid} />;
	}

	return <ThreadsList />;
};

export default Threads;
