import { useQueryStringParameter, useUserRoom } from '@rocket.chat/ui-contexts';
import React, { ReactElement } from 'react';

import { useTabContext } from '../../contexts/ToolboxContext';
import Thread from './Thread';
import ThreadsList from './ThreadsList';

type ThreadsProps = {
	rid: string;
};

const roomFields = { t: true, name: true };

const Threads = ({ rid }: ThreadsProps): ReactElement => {
	const room = useUserRoom(rid, roomFields);
	if (!room) {
		throw new Error('No room available');
	}

	const mid = useTabContext() as string;
	const jump = useQueryStringParameter('jump');

	if (mid) {
		return <Thread room={room} mid={mid} jump={jump} />;
	}

	return <ThreadsList room={room} />;
};

export default Threads;
