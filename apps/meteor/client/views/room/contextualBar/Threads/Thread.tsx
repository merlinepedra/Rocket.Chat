import { IEditedMessage, IMessage, IRoom, IThreadMainMessage, isThreadMainMessage } from '@rocket.chat/core-typings';
import { css } from '@rocket.chat/css-in-js';
import { Box, CheckBox, Modal } from '@rocket.chat/fuselage';
import { useMutableCallback, useLocalStorage } from '@rocket.chat/fuselage-hooks';
import {
	useRoute,
	useToastMessageDispatch,
	useUserId,
	useEndpoint,
	useLayoutContextualBarExpanded,
	useTranslation,
	useUserPreference,
	useMethod,
} from '@rocket.chat/ui-contexts';
import { useQuery, useQueryClient, InfiniteData, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { Mongo } from 'meteor/mongo';
import React, { ReactElement, UIEvent, useEffect, useRef, useState, useCallback, useMemo, FormEvent } from 'react';

import { Messages } from '../../../../../app/models/client';
import { normalizeThreadTitle } from '../../../../../app/threads/client/lib/normalizeThreadTitle';
import { upsertMessageBulk } from '../../../../../app/ui-utils/client/lib/RoomHistoryManager';
import { CommonRoomTemplateInstance } from '../../../../../app/ui/client/views/app/lib/CommonRoomTemplateInstance';
import { getCommonRoomEvents } from '../../../../../app/ui/client/views/app/lib/getCommonRoomEvents';
import { isAtBottom } from '../../../../../app/ui/client/views/app/lib/scrolling';
import { callbacks } from '../../../../../lib/callbacks';
import { isTruthy } from '../../../../../lib/isTruthy';
import { withDebouncing, withThrottling } from '../../../../../lib/utils/highOrderFunctions';
import VerticalBar from '../../../../components/VerticalBar';
import { useReactiveValue } from '../../../../hooks/useReactiveValue';
import { roomCoordinator } from '../../../../lib/rooms/roomCoordinator';
import { mapMessageFromApi } from '../../../../lib/utils/mapMessageFromApi';
import MessageListErrorBoundary from '../../MessageList/MessageListErrorBoundary';
import ThreadMessageList from '../../MessageList/ThreadMessageList';
import DropTargetOverlay from '../../components/body/DropTargetOverlay';
import LoadingMessagesIndicator from '../../components/body/LoadingMessagesIndicator';
import ComposerMessage from '../../components/body/composer/ComposerMessage';
import { useChatMessages } from '../../components/body/useChatMessages';
import { useFileUploadDropTarget } from '../../components/body/useFileUploadDropTarget';
import { useRoom, useRoomSubscription } from '../../contexts/RoomContext';
import { useToolboxContext } from '../../contexts/ToolboxContext';
import LegacyThreadMessageTemplateList from './LegacyThreadMessageTemplateList';
import ThreadSkeleton from './ThreadSkeleton';
import { useThreadMessage } from './hooks/useThreadMessage';

const threadMainMessageQueryKey = (rid: IRoom['_id'], tmid: IMessage['_id']) => ['rooms', rid, 'threads', tmid, 'main-message'] as const;

const useThreadMainMessageQuery = ({
	rid,
	tmid,
	...options
}: { rid: IRoom['_id']; tmid: IMessage['_id'] } & UseQueryOptions<
	IThreadMainMessage,
	Error,
	IThreadMainMessage,
	ReturnType<typeof threadMainMessageQueryKey>
>): UseQueryResult<IThreadMainMessage, Error> => {
	const queryClient = useQueryClient();

	const getMessage = useEndpoint('GET', '/v1/chat.getMessage');

	const queryResult = useQuery(
		threadMainMessageQueryKey(rid, tmid),
		async (): Promise<IThreadMainMessage> => {
			const fromQueryCache = queryClient
				.getQueryData<InfiniteData<IThreadMainMessage[]>>(['rooms', rid, 'threads'], { exact: true })
				?.pages.find((page) => page.some((message) => message._id === tmid))
				?.find((message) => message._id === tmid);

			if (fromQueryCache) return fromQueryCache;

			const fromCachedCollection = (Messages as Mongo.Collection<IMessage>)
				.find({ _id: tmid, rid }, { reactive: false })
				.fetch()
				.filter(isThreadMainMessage)[0] as IThreadMainMessage | undefined;

			if (fromCachedCollection) return fromCachedCollection;

			const { message: rawMessage } = await getMessage({ msgId: tmid });
			const message = mapMessageFromApi(rawMessage);
			if (message.rid === rid && isThreadMainMessage(message)) return message;

			throw new Error('Thread main message not found');
		},
		options,
	);

	return queryResult;
};

type ThreadProps = {
	mid: IMessage['_id'];
};

const Thread = ({ mid: tmid }: ThreadProps): ReactElement => {
	const room = useRoom();

	useThreadMainMessageQuery({ rid: room._id, tmid });

	const useLegacyMessageTemplate = useUserPreference<boolean>('useLegacyMessageTemplate') ?? false;

	const wrapperRef = useRef<HTMLDivElement>(null);
	const atBottomRef = useRef(true);

	const Threads = useRef(
		new Mongo.Collection<Omit<IMessage, '_id'>, IMessage>(null) as Mongo.Collection<Omit<IMessage, '_id'>, IMessage> & {
			direct: Mongo.Collection<Omit<IMessage, '_id'>, IMessage>;
			queries: unknown[];
		},
	);
	const chatMessagesInstance = useChatMessages({ rid: room._id, tmid, wrapperRef, collection: Threads.current });

	const _isAtBottom = useCallback((scrollThreshold = 0) => {
		const wrapper = wrapperRef.current;

		if (!wrapper) {
			return false;
		}

		return isAtBottom(wrapper, scrollThreshold);
	}, []);

	const sendToBottom = useCallback(() => {
		const wrapper = wrapperRef.current;

		wrapper?.scrollTo(30, wrapper.scrollHeight);
	}, []);

	const sendToBottomIfNecessary = useCallback(() => {
		if (atBottomRef.current === true) {
			sendToBottom();
		}
	}, [sendToBottom]);

	const checkIfScrollIsAtBottom = useCallback(() => {
		atBottomRef.current = _isAtBottom(100);
	}, [_isAtBottom]);

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
	const threadMessage = useThreadMessage(tmid);
	const messages = useReactiveValue(
		useCallback(() => Threads.current.find({ tmid, _id: { $ne: tmid } }, { sort: { ts: 1 } }).fetch(), [tmid]),
	);

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
					await followMessage({ mid: tmid });
					return;
				}

				await unfollowMessage({ mid: tmid });
			} catch (error: unknown) {
				dispatchToastMessage({
					type: 'error',
					message: error,
				});
			}
		},
		[dispatchToastMessage, followMessage, unfollowMessage, tmid],
	);

	const handleClose = useCallback(() => {
		channelRoute.push(room.t === 'd' ? { rid: room._id } : { name: room.name || room._id });
	}, [channelRoute, room._id, room.t, room.name]);

	const alsoSendThreadToChannelPreference = useUserPreference<string>('alsoSendThreadToChannel');

	const [sendToChannel, setSendToChannel] = useState(() => {
		switch (alsoSendThreadToChannelPreference) {
			case 'always':
				return true;
			case 'never':
				return false;
			default:
				return !threadMessage?.tcount;
		}
	});

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

	const [fileUploadTriggerProps, fileUploadOverlayProps] = useFileUploadDropTarget(room, tmid);

	const hideUsernames = useUserPreference<boolean>('hideUsernames');

	const handleComposerResize = useCallback((): void => {
		sendToBottomIfNecessary();
	}, [sendToBottomIfNecessary]);

	useEffect(() => {
		const wrapper = wrapperRef.current;

		if (!wrapper) {
			return;
		}

		const handleWheel = withThrottling({ wait: 150 })(() => {
			checkIfScrollIsAtBottom();
		});

		const handleTouchStart = (): void => {
			atBottomRef.current = false;
		};

		let timer1s: ReturnType<typeof setTimeout> | undefined;
		let timer2s: ReturnType<typeof setTimeout> | undefined;

		const handleTouchEnd = (): void => {
			checkIfScrollIsAtBottom();
			timer1s = setTimeout(() => checkIfScrollIsAtBottom(), 1000);
			timer2s = setTimeout(() => checkIfScrollIsAtBottom(), 2000);
		};

		wrapper.addEventListener('mousewheel', handleWheel);
		wrapper.addEventListener('wheel', handleWheel);
		wrapper.addEventListener('scroll', handleWheel);
		wrapper.addEventListener('touchstart', handleTouchStart);
		wrapper.addEventListener('touchend', handleTouchEnd);

		return (): void => {
			if (timer1s) clearTimeout(timer1s);
			if (timer2s) clearTimeout(timer2s);
			wrapper.removeEventListener('mousewheel', handleWheel);
			wrapper.removeEventListener('wheel', handleWheel);
			wrapper.removeEventListener('scroll', handleWheel);
			wrapper.removeEventListener('touchstart', handleTouchStart);
			wrapper.removeEventListener('touchend', handleTouchEnd);
		};
	}, [checkIfScrollIsAtBottom]);

	const toolbox = useToolboxContext();

	useEffect(() => {
		const messageList = wrapperRef.current?.querySelector('ul');

		if (!messageList) {
			return;
		}

		const messageEvents: Record<string, (event: any, template: CommonRoomTemplateInstance) => void> = {
			...getCommonRoomEvents(useLegacyMessageTemplate),
			'click .toggle-hidden'(event: JQuery.ClickEvent) {
				const mid = event.target.dataset.message;
				if (mid) document.getElementById(`#thread-${mid}`)?.classList.toggle('message--ignored');
			},
		};

		const eventHandlers = Object.entries(messageEvents).map(([key, handler]) => {
			const [, event, selector] = key.match(/^(.+?)\s(.+)$/) ?? [key, key];
			return {
				event,
				selector,
				listener: (e: JQuery.TriggeredEvent<HTMLUListElement, undefined>) =>
					handler.call(null, e, { data: { rid: room._id, tabBar: toolbox } }),
			};
		});

		for (const { event, selector, listener } of eventHandlers) {
			$(messageList).on(event, selector, listener);
		}

		return () => {
			for (const { event, selector, listener } of eventHandlers) {
				$(messageList).off(event, selector, listener);
			}
		};
	}, [room._id, sendToBottomIfNecessary, toolbox, useLegacyMessageTemplate]);

	useEffect(() => {
		const messageList = wrapperRef.current?.querySelector('ul');

		if (!messageList) {
			return;
		}

		const observer = new ResizeObserver(sendToBottomIfNecessary);
		observer.observe(messageList);

		return (): void => {
			observer.unobserve(messageList);
		};
	}, [sendToBottomIfNecessary]);

	const [isLoading, setIsLoading] = useState(true);

	const getThreadMessages = useMethod('getThreadMessages');

	const loadMore = useCallback(async () => {
		setIsLoading(true);

		const messages = await getThreadMessages({ tmid });

		if (Threads.current) upsertMessageBulk({ msgs: messages }, Threads.current);

		Tracker.afterFlush(() => {
			setIsLoading(false);
		});
	}, [getThreadMessages, tmid]);

	useEffect(() => {
		const threadsCollection = Threads.current;

		const threadsObserve = Messages.find(
			{ $or: [{ tmid }, { _id: tmid }], _hidden: { $ne: true } },
			{
				fields: {
					collapsed: 0,
					threadMsg: 0,
					repliesCount: 0,
				},
			},
		).observe({
			added: ({ _id, ...message }: IMessage) => {
				threadsCollection.upsert({ _id }, message);
			},
			changed: ({ _id, ...message }: IMessage) => {
				threadsCollection.update({ _id }, message);
			},
			removed: ({ _id }: IMessage) => threadsCollection.remove(_id),
		});

		return (): void => {
			threadsObserve.stop();
			threadsCollection.remove({});
		};
	}, [tmid]);

	useEffect(() => {
		loadMore();
	}, [loadMore]);

	// This was broken before because no elements are identified by the id `#thread-${mid}`
	/*
	this.autorun(() => {
		FlowRouter.watchPathChange();
		const jump = FlowRouter.getQueryParam('jump');
		const { mainMessage } = Template.currentData() as ThreadTemplateInstance['data'];
		this.state.set({
			tmid: mainMessage._id,
			rid: mainMessage.rid,
			jump,
		});
	});

	this.autorun(() => {
		const jump = this.state.get('jump');
		const loading = this.state.get('loading');

		if (jump && this.lastJump !== jump && loading === false) {
			this.lastJump = jump;
			this.state.set('jump', null);
			Tracker.afterFlush(() => {
				const message = this.find(`#thread-${jump}`);
				message.classList.add('highlight');
				const removeClass = () => {
					message.classList.remove('highlight');
					message.removeEventListener('animationend', removeClass);
				};
				message.addEventListener('animationend', removeClass);
				setTimeout(() => {
					message.scrollIntoView();
				}, 300);
			});
		}
	});
	*/

	const readThreads = useMethod('readThreads');

	useEffect(() => {
		callbacks.add(
			'streamNewMessage',
			withDebouncing({ wait: 1000 })((msg: IEditedMessage) => {
				if (Session.get('openedRoom') !== msg.rid || room._id !== msg.rid || msg.editedAt || msg.tmid !== tmid) {
					return;
				}
				readThreads(tmid);
			}),
			callbacks.priority.MEDIUM,
			`thread-${room._id}`,
		);

		return () => {
			callbacks.remove('streamNewMessage', `thread-${room._id}`);
		};
	}, [readThreads, room._id, tmid]);

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
						<VerticalBar.Content flexShrink={1} flexGrow={1} paddingInline={0}>
							<section
								ref={ref}
								className={['contextual-bar__content flex-tab threads', hideUsernames && 'hide-usernames'].filter(isTruthy).join(' ')}
								{...fileUploadTriggerProps}
							>
								<DropTargetOverlay {...fileUploadOverlayProps} />

								<div ref={wrapperRef} className='thread-list js-scroll-thread' style={{ scrollBehavior: 'smooth' }}>
									<MessageListErrorBoundary>
										{useLegacyMessageTemplate ? (
											<ul className='thread' style={useLegacyMessageTemplate ? { height: '100%' } : undefined}>
												{isLoading && (
													<li className='load-more'>
														<LoadingMessagesIndicator />
													</li>
												)}
												<LegacyThreadMessageTemplateList mainMessage={threadMessage} messages={messages} />
											</ul>
										) : (
											<ThreadMessageList rid={room._id} tmid={tmid} />
										)}
									</MessageListErrorBoundary>
								</div>

								<ComposerMessage
									rid={room._id}
									tmid={tmid}
									subscription={subscription}
									chatMessagesInstance={chatMessagesInstance}
									onKeyDown={(event: KeyboardEvent): void => {
										const { key, currentTarget } = event;

										if (key === 'Escape' && !(currentTarget as HTMLTextAreaElement | null)?.value.trim()) {
											channelRoute.push({
												rid: room._id,
												...(room.name && { name: room.name }),
											});
										}
									}}
									onSend={(): void => {
										sendToBottom();
										if (alsoSendThreadToChannelPreference === 'default') {
											setSendToChannel(false);
										}
									}}
									onResize={handleComposerResize}
								/>

								<footer className='thread-footer'>
									<div style={{ display: 'flex' }}>
										<CheckBox
											id='sendAlso'
											checked={sendToChannel}
											onChange={(e: FormEvent<HTMLInputElement>): void => setSendToChannel(e.currentTarget.checked)}
										/>
									</div>
									<label htmlFor='sendAlso' className='thread-footer__text'>
										{t('Also_send_to_channel')}
									</label>
								</footer>
							</section>
						</VerticalBar.Content>
					</VerticalBar>
				</Box>
			) : (
				<ThreadSkeleton expanded={expanded} />
			)}
		</VerticalBar.InnerContent>
	);
};

export default Thread;
