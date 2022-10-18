import { IThreadMainMessage } from '@rocket.chat/core-typings';
import { Box, Icon, TextInput, Select, Margins, Callout, Throbber } from '@rocket.chat/fuselage';
import { useResizeObserver, useMutableCallback, useAutoFocus } from '@rocket.chat/fuselage-hooks';
import { useRoute, useTranslation } from '@rocket.chat/ui-contexts';
import React, { ReactElement, UIEvent } from 'react';
import { Virtuoso } from 'react-virtuoso';

import ScrollableContentWrapper from '../../../../components/ScrollableContentWrapper';
import VerticalBar from '../../../../components/VerticalBar';
import { roomCoordinator } from '../../../../lib/rooms/roomCoordinator';
import { useRoom } from '../../contexts/RoomContext';
import { useTabBarClose } from '../../contexts/ToolboxContext';
import ThreadsListItem from './ThreadsListItem';
import { useThreadFilterOptions } from './hooks/useThreadFilterOptions';
import { useThreadsQuery } from './hooks/useThreadsQuery';

const ThreadsList = (): ReactElement => {
	const room = useRoom();

	const {
		type,
		typeOptions,
		onTypeChange: handleTypeChange,
		messageText,
		onMessageTextChange: handleMessageTextChange,
		searchParameters,
	} = useThreadFilterOptions();

	const threadsQueryResult = useThreadsQuery(searchParameters);

	const inputRef = useAutoFocus<HTMLInputElement>(true);

	const channelRoute = useRoute(roomCoordinator.getRoomTypeConfig(room.t).route.name);
	const onClick = useMutableCallback((e: UIEvent<HTMLElement>) => {
		const { id: context = '' } = e.currentTarget.dataset;
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

	const t = useTranslation();
	const handleClose = useTabBarClose();

	return (
		<>
			<VerticalBar.Header>
				<VerticalBar.Icon name='thread' />
				<VerticalBar.Text>{t('Threads')}</VerticalBar.Text>
				<VerticalBar.Close onClick={handleClose} />
			</VerticalBar.Header>

			<VerticalBar.Content paddingInline={0} ref={ref}>
				<Box
					display='flex'
					flexDirection='row'
					p='x24'
					borderBlockEndWidth='x2'
					borderBlockEndStyle='solid'
					borderBlockEndColor='extra-light'
					flexShrink={0}
				>
					<Box display='flex' flexDirection='row' flexGrow={1} mi='neg-x4'>
						<Margins inline='x4'>
							<TextInput
								placeholder={t('Search_Messages')}
								value={messageText}
								onChange={handleMessageTextChange}
								addon={<Icon name='magnifier' size='x20' />}
								ref={inputRef}
							/>
							<Select flexGrow={0} width='110px' onChange={handleTypeChange} value={type} options={typeOptions} />
						</Margins>
					</Box>
				</Box>

				{threadsQueryResult.isLoading && (
					<Box pi='x24' pb='x12'>
						<Throbber size='x12' />
					</Box>
				)}

				{threadsQueryResult.isError && (
					<Callout mi='x24' type='danger'>
						{threadsQueryResult.error.toString()}
					</Callout>
				)}

				{threadsQueryResult.isSuccess && threadsQueryResult.data.pages.length === 0 && (
					<Box p='x24' color='annotation' textAlign='center' width='full'>
						{t('No_Threads')}
					</Box>
				)}

				<Box flexGrow={1} flexShrink={1} overflow='hidden' display='flex'>
					{threadsQueryResult.isSuccess && threadsQueryResult.data.pages.length > 0 && (
						<Virtuoso
							style={{
								height: blockSize,
								width: inlineSize,
							}}
							endReached={(): void => {
								threadsQueryResult.fetchNextPage();
							}}
							overscan={25}
							data={threadsQueryResult.data.pages.flat()}
							components={{ Scroller: ScrollableContentWrapper }}
							itemContent={(_index, mainMessage: IThreadMainMessage): ReactElement => (
								<ThreadsListItem key={mainMessage._id} mainMessage={mainMessage} onClick={onClick} />
							)}
						/>
					)}
				</Box>
			</VerticalBar.Content>
		</>
	);
};

export default ThreadsList;
