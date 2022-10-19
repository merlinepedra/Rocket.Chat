import type { IThreadMainMessage } from '@rocket.chat/core-typings';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { useRoute, useSetting, useUserId } from '@rocket.chat/ui-contexts';
import React, { memo, ReactElement, UIEvent, useCallback } from 'react';

import { useDecryptedMessage } from '../../../../hooks/useDecryptedMessage';
import { normalizeThreadMessage } from '../../../../lib/normalizeThreadMessage';
import { roomCoordinator } from '../../../../lib/rooms/roomCoordinator';
import { useRoom, useRoomSubscription } from '../../contexts/RoomContext';
import ThreadListMessage from './components/ThreadListMessage';
import { useToggleFollowThreadMutation } from './hooks/useToggleFollowThreadMutation';

type ThreadsListItemProps = {
	mainMessage: IThreadMainMessage;
};

const ThreadsListItem = ({ mainMessage }: ThreadsListItemProps): ReactElement => {
	const uid = useUserId();
	const room = useRoom();
	const subscription = useRoomSubscription();
	const showRealNames = useSetting('UI_Use_Real_Name') as boolean;

	const msg = normalizeThreadMessage({ ...mainMessage, msg: useDecryptedMessage(mainMessage) });

	const channelRoute = useRoute(roomCoordinator.getRoomTypeConfig(room.t).route.name);

	const handleClick = useMutableCallback(() => {
		channelRoute.push({
			tab: 'thread',
			context: mainMessage._id,
			rid: room._id,
			...(room.name && { name: room.name }),
		});
	});

	const toggleFollowThreadMutation = useToggleFollowThreadMutation();

	const handleToggleFollowButtonClick = useCallback(
		(event: UIEvent<HTMLElement>): void => {
			event.preventDefault();
			event.stopPropagation();

			toggleFollowThreadMutation.mutate(mainMessage);
		},
		[mainMessage, toggleFollowThreadMutation],
	);

	return (
		<ThreadListMessage
			mid={mainMessage._id}
			tlm={mainMessage.tlm}
			ts={mainMessage.ts}
			replies={mainMessage.tcount}
			participants={mainMessage.replies.length}
			name={showRealNames ? mainMessage.u.name ?? mainMessage.u.username : mainMessage.u.username}
			username={mainMessage.u.username}
			unread={subscription?.tunread?.includes(mainMessage._id) ?? false}
			mention={subscription?.tunreadUser?.includes(mainMessage._id) ?? false}
			all={subscription?.tunreadGroup?.includes(mainMessage._id) ?? false}
			following={uid ? mainMessage.replies?.includes(uid) : false}
			data-id={mainMessage._id}
			msg={msg ?? ''}
			onClick={handleClick}
			onToggleFollowButtonClick={handleToggleFollowButtonClick}
		/>
	);
};

export default memo(ThreadsListItem);
