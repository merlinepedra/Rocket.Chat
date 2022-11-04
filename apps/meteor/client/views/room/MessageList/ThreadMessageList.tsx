import { IThreadMessage, IRoom } from '@rocket.chat/core-typings';
import { Box } from '@rocket.chat/fuselage';
import { useUserSubscription, useSetting, useTranslation } from '@rocket.chat/ui-contexts';
import React, { forwardRef, memo, ReactElement, Ref } from 'react';
import { Virtuoso } from 'react-virtuoso';

import ScrollableContentWrapper from '../../../components/ScrollableContentWrapper';
import { useFormatDate } from '../../../hooks/useFormatDate';
import { MessageProvider } from '../providers/MessageProvider';
import { SelectedMessagesProvider } from '../providers/SelectedMessagesProvider';
import MessageListErrorBoundary from './MessageListErrorBoundary';
import ThreadMessageItem from './components/ThreadMessage/ThreadMessageItem';
import { useThreadMessages } from './hooks/useThreadMessages';
import MessageHighlightProvider from './providers/MessageHighlightProvider';
import { MessageListProvider } from './providers/MessageListProvider';

type ThreadMessageListProps = {
	rid: IRoom['_id'];
	tmid: IThreadMessage['tmid'];
};

const ThreadMessageList = forwardRef(function ThreadMessageList({ rid, tmid }: ThreadMessageListProps, wrapperRef: Ref<HTMLDivElement>) {
	const subscription = useUserSubscription(rid);
	const isBroadcast = Boolean(subscription?.broadcast);
	const messageGroupingPeriod = Number(useSetting('Message_GroupingPeriod'));
	const format = useFormatDate();
	const messages = useThreadMessages({ tmid });
	const t = useTranslation();

	return (
		<Box ref={wrapperRef} flexGrow={1} flexShrink={1} role='list' aria-label={t('Thread_messages')}>
			<MessageListErrorBoundary>
				<MessageListProvider rid={rid}>
					<MessageProvider rid={rid} broadcast={isBroadcast}>
						<SelectedMessagesProvider>
							<MessageHighlightProvider>
								<Virtuoso
									style={{ height: '100%', width: '100%' }}
									totalCount={messages?.length}
									data={messages}
									components={{ Scroller: ScrollableContentWrapper }}
									followOutput='smooth'
									itemContent={(index, data): ReactElement => (
										<ThreadMessageItem
											previous={messages[index - 1]}
											message={data}
											messageGroupingPeriod={messageGroupingPeriod}
											subscription={subscription}
											format={format}
										/>
									)}
								/>
							</MessageHighlightProvider>
						</SelectedMessagesProvider>
					</MessageProvider>
				</MessageListProvider>
			</MessageListErrorBoundary>
		</Box>
	);
});

export default memo(ThreadMessageList);
