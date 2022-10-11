import type { IMessage, IRoom } from '@rocket.chat/core-typings';
import { Box, Icon, TextInput, Select, Margins, Callout, Throbber } from '@rocket.chat/fuselage';
import { useResizeObserver, useMutableCallback, useAutoFocus, useLocalStorage, useDebouncedValue } from '@rocket.chat/fuselage-hooks';
import { useRoute, useCurrentRoute, useSetting, useTranslation, useUserSubscription, useUserId } from '@rocket.chat/ui-contexts';
import React, { ReactElement, useCallback, useMemo, useState } from 'react';
import { Virtuoso } from 'react-virtuoso';

import ScrollableContentWrapper from '../../../../components/ScrollableContentWrapper';
import VerticalBar from '../../../../components/VerticalBar';
import { useRecordList } from '../../../../hooks/lists/useRecordList';
import { AsyncStatePhase } from '../../../../lib/asyncState';
import { useTabBarClose } from '../../contexts/ToolboxContext';
import ThreadRow from './ThreadRow';
import { useThreadsList } from './hooks/useThreadsList';

type ThreadsListProps = {
	room: IRoom;
};

const subscriptionFields = { tunread: true, tunreadUser: true, tunreadGroup: true };

const ThreadsList = ({ room }: ThreadsListProps): ReactElement => {
	const subscription = useUserSubscription(room._id, subscriptionFields);
	const subscribed = !!subscription;

	const t = useTranslation();
	const onClose = useTabBarClose();
	const userId = useUserId();

	const typeOptions: [type: 'all' | 'following' | 'unread', label: string][] = useMemo(
		() => [
			['all', t('All')],
			['following', t('Following')],
			['unread', t('Unread')],
		],
		[t],
	);

	const [type, setType] = useLocalStorage<'all' | 'following' | 'unread'>('thread-list-type', 'all');

	const handleChangeType = useCallback(
		(type: string) => {
			setType(type as 'all' | 'following' | 'unread');
		},
		[setType],
	);

	const [text, setText] = useState('');
	const debouncedText = useDebouncedValue(text, 400);
	const handleTextChange = useCallback((event) => {
		setText(event.currentTarget.value);
	}, []);

	const options = useDebouncedValue(
		useMemo(() => {
			if (type === 'all' || !subscribed || !userId) {
				return {
					rid: room._id,
					text: debouncedText,
					type: 'all',
				} as const;
			}
			switch (type) {
				case 'following':
					return {
						rid: room._id,
						text: debouncedText,
						type,
						uid: userId,
					} as const;
				case 'unread':
					return {
						rid: room._id,
						text: debouncedText,
						type,
						tunread: subscription?.tunread,
					} as const;
			}
		}, [type, subscribed, userId, room._id, debouncedText, subscription?.tunread]),
		300,
	);

	const { threadsList, loadMoreItems } = useThreadsList(options, userId as string);
	const { phase, error, items: threads, itemCount: total } = useRecordList(threadsList);

	const showRealNames = Boolean(useSetting('UI_Use_Real_Name'));

	const inputRef = useAutoFocus<HTMLInputElement>(true);
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

	const { ref, contentBoxSize: { inlineSize = 378, blockSize = 1 } = {} } = useResizeObserver<HTMLElement>({
		debounceDelay: 200,
	});

	return (
		<>
			<VerticalBar.Header>
				<VerticalBar.Icon name='thread' />
				<VerticalBar.Text>{t('Threads')}</VerticalBar.Text>
				<VerticalBar.Close onClick={onClose} />
			</VerticalBar.Header>

			<VerticalBar.Content paddingInline={0} ref={ref}>
				<Box
					display='flex'
					flexDirection='row'
					p='x24'
					borderBlockEndWidth='x2'
					borderBlockEndStyle='solid'
					borderBlockEndColor='neutral-200'
					flexShrink={0}
				>
					<Box display='flex' flexDirection='row' flexGrow={1} mi='neg-x4'>
						<Margins inline='x4'>
							<TextInput
								placeholder={t('Search_Messages')}
								value={text}
								onChange={handleTextChange}
								addon={<Icon name='magnifier' size='x20' />}
								ref={inputRef}
							/>
							<Select flexGrow={0} width='110px' onChange={handleChangeType} value={type} options={typeOptions} />
						</Margins>
					</Box>
				</Box>

				{phase === AsyncStatePhase.LOADING && (
					<Box pi='x24' pb='x12'>
						<Throbber size='x12' />
					</Box>
				)}

				{error && (
					<Callout mi='x24' type='danger'>
						{error.toString()}
					</Callout>
				)}

				{phase !== AsyncStatePhase.LOADING && total === 0 && (
					<Box p='x24' color='neutral-600' textAlign='center' width='full'>
						{t('No_Threads')}
					</Box>
				)}

				<Box flexGrow={1} flexShrink={1} overflow='hidden' display='flex'>
					{!error && total > 0 && threads.length > 0 && (
						<Virtuoso
							style={{
								height: blockSize,
								width: inlineSize,
							}}
							totalCount={total}
							endReached={
								phase === AsyncStatePhase.LOADING
									? (): void => undefined
									: (start): unknown => loadMoreItems(start, Math.min(50, total - start))
							}
							overscan={25}
							data={threads}
							components={{ Scroller: ScrollableContentWrapper }}
							itemContent={(_index, data: IMessage): ReactElement => (
								<ThreadRow
									thread={data}
									showRealNames={showRealNames}
									unread={subscription?.tunread ?? []}
									unreadUser={subscription?.tunreadUser ?? []}
									unreadGroup={subscription?.tunreadGroup ?? []}
									userId={userId || ''}
									onClick={onClick}
								/>
							)}
						/>
					)}
				</Box>
			</VerticalBar.Content>
		</>
	);
};

export default ThreadsList;
