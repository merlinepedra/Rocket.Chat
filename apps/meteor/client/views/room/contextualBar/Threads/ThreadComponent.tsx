import type { IRoom } from '@rocket.chat/core-typings';
import { useLocalStorage } from '@rocket.chat/fuselage-hooks';
import { useToastMessageDispatch, useRoute, useUserId, useUserSubscription, useEndpoint } from '@rocket.chat/ui-contexts';
import { Blaze } from 'meteor/blaze';
import { Template } from 'meteor/templating';
import React, { useEffect, useRef, useState, useCallback, useMemo, FC } from 'react';

import { normalizeThreadTitle } from '../../../../../app/threads/client/lib/normalizeThreadTitle';
import { roomCoordinator } from '../../../../lib/rooms/roomCoordinator';
import { useTabBarOpenUserInfo } from '../../contexts/ToolboxContext';
import ThreadSkeleton from './ThreadSkeleton';
import ThreadView from './ThreadView';
import { useThreadMessage } from './hooks/useThreadMessage';

const subscriptionFields = {};

const ThreadComponent: FC<{
	mid: string;
	jump: unknown;
	room: IRoom;
	onClickBack: (e: unknown) => void;
}> = ({ mid, jump, room, onClickBack }) => {
	const subscription = useUserSubscription(room._id, subscriptionFields);
	const channelRoute = useRoute(roomCoordinator.getRoomTypeConfig(room.t).route.name);
	const threadMessage = useThreadMessage(mid);

	const openUserInfo = useTabBarOpenUserInfo();

	const ref = useRef<HTMLElement>(null);
	const uid = useUserId();

	const headerTitle = useMemo(() => (threadMessage ? normalizeThreadTitle(threadMessage) : null), [threadMessage]);
	const [expanded, setExpand] = useLocalStorage('expand-threads', false);
	const following = !uid ? false : threadMessage?.replies?.includes(uid) ?? false;

	const dispatchToastMessage = useToastMessageDispatch();
	const followMessage = useEndpoint('POST', '/v1/chat.followMessage');
	const unfollowMessage = useEndpoint('POST', '/v1/chat.unfollowMessage');

	const setFollowing = useCallback<(following: boolean) => void>(
		async (following) => {
			try {
				if (following) {
					await followMessage({ mid });
					return;
				}

				await unfollowMessage({ mid });
			} catch (error: unknown) {
				dispatchToastMessage({
					type: 'error',
					message: error,
				});
			}
		},
		[dispatchToastMessage, followMessage, unfollowMessage, mid],
	);

	const handleClose = useCallback(() => {
		channelRoute.push(room.t === 'd' ? { rid: room._id } : { name: room.name || room._id });
	}, [channelRoute, room._id, room.t, room.name]);

	const [viewData, setViewData] = useState(() => ({
		mainMessage: threadMessage,
		jump,
		following,
		subscription,
		rid: room._id,
		tabBar: { openUserInfo },
	}));

	useEffect(() => {
		setViewData((viewData) => {
			if (!threadMessage || viewData.mainMessage?._id === threadMessage._id) {
				return viewData;
			}

			return {
				mainMessage: threadMessage,
				jump,
				following,
				subscription,
				rid: room._id,
				tabBar: { openUserInfo },
			};
		});
	}, [following, jump, openUserInfo, room._id, subscription, threadMessage]);

	useEffect(() => {
		if (!ref.current || !viewData.mainMessage) {
			return;
		}
		const view = Blaze.renderWithData(Template.thread, viewData, ref.current);

		return (): void => {
			Blaze.remove(view);
		};
	}, [viewData]);

	if (!threadMessage) {
		return <ThreadSkeleton expanded={expanded} onClose={handleClose} />;
	}

	return (
		<ThreadView
			ref={ref}
			title={headerTitle}
			expanded={expanded}
			following={following}
			onToggleExpand={(expanded): void => setExpand(!expanded)}
			onToggleFollow={(following): void => setFollowing(!following)}
			onClose={handleClose}
			onClickBack={onClickBack}
		/>
	);
};

export default ThreadComponent;
