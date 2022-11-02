import { IThreadMessage, IRoom } from '@rocket.chat/core-typings';
import { useUserSubscription, useSetting } from '@rocket.chat/ui-contexts';
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

	return (
		<div ref={wrapperRef} className='thread-list js-scroll-thread' style={{ scrollBehavior: 'smooth' }}>
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
		</div>
	);
});

export default memo(ThreadMessageList);
