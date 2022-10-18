import type { IMessage } from '@rocket.chat/core-typings';
import { useSetting, useUserId } from '@rocket.chat/ui-contexts';
import React, { memo, MouseEvent, ReactElement, UIEvent } from 'react';

import { useDecryptedMessage } from '../../../../hooks/useDecryptedMessage';
import { normalizeThreadMessage } from '../../../../lib/normalizeThreadMessage';
import { callWithErrorHandling } from '../../../../lib/utils/callWithErrorHandling';
import { useRoomSubscription } from '../../contexts/RoomContext';
import ThreadListMessage from './components/ThreadListMessage';

const handleFollowButton = (e: MouseEvent<HTMLElement>, threadId: string): void => {
	e.preventDefault();
	e.stopPropagation();
	const { following } = e.currentTarget.dataset;

	following &&
		callWithErrorHandling(![true, 'true'].includes(following) ? 'followMessage' : 'unfollowMessage', {
			mid: threadId,
		});
};

type ThreadsListItemProps = {
	mainMessage: IMessage;
	onClick: (event: UIEvent<HTMLElement>) => void;
};

function ThreadsListItem({ mainMessage, onClick }: ThreadsListItemProps): ReactElement {
	const uid = useUserId();
	const showRealNames = useSetting('UI_Use_Real_Name') as boolean;
	const subscription = useRoomSubscription();

	const decryptedMsg = useDecryptedMessage(mainMessage);
	const msg = normalizeThreadMessage({ ...mainMessage, msg: decryptedMsg });

	const { name = mainMessage.u.username } = mainMessage.u;

	return (
		<ThreadListMessage
			_id={mainMessage._id}
			tlm={mainMessage.tlm}
			ts={mainMessage.ts}
			replies={mainMessage.tcount}
			participants={mainMessage.replies?.length}
			name={showRealNames ? name : mainMessage.u.username}
			username={mainMessage.u.username}
			unread={subscription?.tunread?.includes(mainMessage._id)}
			mention={subscription?.tunreadUser?.includes(mainMessage._id)}
			all={subscription?.tunreadGroup?.includes(mainMessage._id)}
			following={uid && mainMessage.replies?.includes(uid)}
			data-id={mainMessage._id}
			msg={msg ?? ''}
			handleFollowButton={(e: MouseEvent<HTMLElement>): unknown => handleFollowButton(e, mainMessage._id)}
			onClick={onClick}
		/>
	);
}

export default memo(ThreadsListItem);
