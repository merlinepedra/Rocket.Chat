import type { IMessage } from '@rocket.chat/core-typings';
import React, { memo, MouseEvent, ReactElement, UIEvent } from 'react';

import { useDecryptedMessage } from '../../../../hooks/useDecryptedMessage';
import { normalizeThreadMessage } from '../../../../lib/normalizeThreadMessage';
import { callWithErrorHandling } from '../../../../lib/utils/callWithErrorHandling';
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
	thread: IMessage;
	showRealNames: boolean;
	unread: string[];
	unreadUser: string[];
	unreadGroup: string[];
	userId: string;
	onClick: (event: UIEvent<HTMLElement>) => void;
};

function ThreadsListItem({ thread, showRealNames, unread, unreadUser, unreadGroup, userId, onClick }: ThreadsListItemProps): ReactElement {
	const decryptedMsg = useDecryptedMessage(thread);
	const msg = normalizeThreadMessage({ ...thread, msg: decryptedMsg });

	const { name = thread.u.username } = thread.u;

	return (
		<ThreadListMessage
			_id={thread._id}
			tlm={thread.tlm}
			ts={thread.ts}
			replies={thread.tcount}
			participants={thread.replies?.length}
			name={showRealNames ? name : thread.u.username}
			username={thread.u.username}
			unread={unread.includes(thread._id)}
			mention={unreadUser.includes(thread._id)}
			all={unreadGroup.includes(thread._id)}
			following={thread.replies?.includes(userId) ?? false}
			data-id={thread._id}
			msg={msg ?? ''}
			handleFollowButton={(e: MouseEvent<HTMLElement>): unknown => handleFollowButton(e, thread._id)}
			onClick={onClick}
		/>
	);
}

export default memo(ThreadsListItem);
