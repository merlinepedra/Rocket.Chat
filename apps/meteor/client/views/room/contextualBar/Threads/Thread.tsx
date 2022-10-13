import type { IMessage } from '@rocket.chat/core-typings';
import { css } from '@rocket.chat/css-in-js';
import { Box, Modal } from '@rocket.chat/fuselage';
import { useMutableCallback, useLocalStorage } from '@rocket.chat/fuselage-hooks';
import {
	useRoute,
	useToastMessageDispatch,
	useUserId,
	useEndpoint,
	useLayoutContextualBarExpanded,
	useTranslation,
} from '@rocket.chat/ui-contexts';
import { Blaze } from 'meteor/blaze';
import { Template } from 'meteor/templating';
import React, { ReactElement, UIEvent, useEffect, useRef, useState, useCallback, useMemo } from 'react';

import { normalizeThreadTitle } from '../../../../../app/threads/client/lib/normalizeThreadTitle';
import VerticalBar from '../../../../components/VerticalBar';
import { roomCoordinator } from '../../../../lib/rooms/roomCoordinator';
import { useRoom, useRoomSubscription } from '../../contexts/RoomContext';
import { useTabBarOpenUserInfo } from '../../contexts/ToolboxContext';
import ThreadSkeleton from './ThreadSkeleton';
import { useThreadMessage } from './hooks/useThreadMessage';

type ThreadProps = {
	mid: IMessage['_id'];
	jump?: IMessage['_id'];
};

const Thread = ({ mid, jump }: ThreadProps): ReactElement => {
	const room = useRoom();

	const channelRoute = useRoute(roomCoordinator.getRoomTypeConfig(room.t).route.name);

	const onBackButtonClick = useMutableCallback((e: UIEvent<HTMLOrSVGElement>) => {
		const { id: context = '' } = e.currentTarget.dataset;
		channelRoute.push({
			tab: 'thread',
			context,
			rid: room._id,
			...(room.name && { name: room.name }),
		});
	});

	const subscription = useRoomSubscription();
	const threadMessage = useThreadMessage(mid);

	const openUserInfo = useTabBarOpenUserInfo();

	const ref = useRef<HTMLElement>(null);
	const uid = useUserId();

	const title = useMemo(() => (threadMessage ? normalizeThreadTitle(threadMessage) : null), [threadMessage]);
	const hasExpand = useLayoutContextualBarExpanded();
	const [expanded, setExpand] = useLocalStorage('expand-threads', hasExpand);

	const dispatchToastMessage = useToastMessageDispatch();
	const followMessage = useEndpoint('POST', '/v1/chat.followMessage');
	const unfollowMessage = useEndpoint('POST', '/v1/chat.unfollowMessage');

	const following = !uid ? false : threadMessage?.replies?.includes(uid) ?? false;
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

	const handleFollowActionClick = useMutableCallback(() => {
		setFollowing(!following);
	});

	const handleExpandActionClick = useCallback(() => {
		setExpand((expanded) => !expanded);
	}, [setExpand]);

	const expandedThreadStyle =
		hasExpand && expanded
			? css`
					max-width: 855px !important;
					@media (min-width: 780px) and (max-width: 1135px) {
						max-width: calc(100% - var(--sidebar-width)) !important;
					}
			  `
			: undefined;

	const style = useMemo(
		() =>
			document.dir === 'rtl'
				? {
						left: 0,
						borderTopRightRadius: 4,
				  }
				: {
						right: 0,
						borderTopLeftRadius: 4,
				  },
		[],
	);

	const t = useTranslation();

	return (
		<VerticalBar.InnerContent>
			{hasExpand && expanded && <Modal.Backdrop onClick={handleClose} />}
			{threadMessage ? (
				<Box flexGrow={1} position={expanded ? 'static' : 'relative'}>
					<VerticalBar
						rcx-thread-view
						className={expandedThreadStyle}
						position={hasExpand && expanded ? 'fixed' : 'absolute'}
						display='flex'
						flexDirection='column'
						width={'full'}
						overflow='hidden'
						zIndex={100}
						insetBlock={0}
						style={style}
					>
						<VerticalBar.Header>
							{onBackButtonClick && <VerticalBar.Action onClick={onBackButtonClick} title={t('Back_to_threads')} name='arrow-back' />}
							<VerticalBar.Text dangerouslySetInnerHTML={{ __html: title }} />
							{hasExpand && (
								<VerticalBar.Action
									title={expanded ? t('Collapse') : t('Expand')}
									name={expanded ? 'arrow-collapse' : 'arrow-expand'}
									onClick={handleExpandActionClick}
								/>
							)}
							<VerticalBar.Actions>
								<VerticalBar.Action
									title={following ? t('Following') : t('Not_Following')}
									name={following ? 'bell' : 'bell-off'}
									onClick={handleFollowActionClick}
								/>
								<VerticalBar.Close onClick={handleClose} />
							</VerticalBar.Actions>
						</VerticalBar.Header>
						<VerticalBar.Content ref={ref} flexShrink={1} flexGrow={1} paddingInline={0} />
					</VerticalBar>
				</Box>
			) : (
				<ThreadSkeleton expanded={expanded} />
			)}
		</VerticalBar.InnerContent>
	);
};

export default Thread;
