import type { IMessage, IRoom } from '@rocket.chat/core-typings';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { useRoute, useCurrentRoute } from '@rocket.chat/ui-contexts';
import React, { ReactElement } from 'react';

import VerticalBar from '../../../../components/VerticalBar';
import ThreadComponent from './ThreadComponent';

type ThreadProps = {
	room: IRoom;
	mid: IMessage['_id'];
	jump?: IMessage['_id'];
};

const Thread = ({ room, mid, jump }: ThreadProps): ReactElement => {
	const [name] = useCurrentRoute();

	if (!name) {
		throw new Error('No route name');
	}

	const channelRoute = useRoute(name);

	const onClick = useMutableCallback((e) => {
		const { id: context } = e.currentTarget.dataset;
		channelRoute.push({
			tab: 'thread',
			context,
			rid: room._id,
			...(room.name && { name: room.name }),
		});
	});

	return (
		<VerticalBar.InnerContent>
			<ThreadComponent onClickBack={onClick} mid={mid} jump={jump} room={room} />
		</VerticalBar.InnerContent>
	);
};

export default Thread;
