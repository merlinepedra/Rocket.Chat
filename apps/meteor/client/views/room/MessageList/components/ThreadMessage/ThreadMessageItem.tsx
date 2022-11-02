import { IThreadMessage, ISubscription, IThreadMainMessage } from '@rocket.chat/core-typings';
import { MessageDivider } from '@rocket.chat/fuselage';
import { useTranslation } from '@rocket.chat/ui-contexts';
import React, { Fragment, ReactElement } from 'react';

import { WithRequiredProperty } from '../../../../../../definition/WithRequiredProperty';
import { useFormatDate } from '../../../../../hooks/useFormatDate';
import { isMessageFirstUnread } from '../../lib/isMessageFirstUnread';
import { isMessageNewDay } from '../../lib/isMessageNewDay';
import { isOwnUserMessage } from '../../lib/isOwnUserMessage';
import { isThreadMessageSequential } from '../../lib/isThreadMessageSequential';
import ThreadMessage from './ThreadMessage';

type ThreadMessageItemProps = {
	message: WithRequiredProperty<IThreadMessage | IThreadMainMessage, 'md'>;
	previous: WithRequiredProperty<IThreadMessage | IThreadMainMessage, 'md'>;
	subscription: ISubscription | undefined;
	messageGroupingPeriod: number;
	format: ReturnType<typeof useFormatDate>;
};

const ThreadMessageItem = ({ message, previous, subscription, messageGroupingPeriod, format }: ThreadMessageItemProps): ReactElement => {
	const t = useTranslation();
	const isSequential = isThreadMessageSequential(message, previous, messageGroupingPeriod);

	const isNewDay = isMessageNewDay(message, previous);
	const isFirstUnread = isMessageFirstUnread(subscription, message, previous);
	const isUserOwnMessage = isOwnUserMessage(message, subscription);
	const shouldShowDivider = isNewDay || isFirstUnread;

	const shouldShowAsSequential = isSequential && !isNewDay;

	return (
		<Fragment key={message._id}>
			{shouldShowDivider && (
				<MessageDivider unreadLabel={isFirstUnread ? t('Unread_Messages').toLowerCase() : undefined}>
					{isNewDay && format(message.ts)}
				</MessageDivider>
			)}

			<ThreadMessage
				id={message._id}
				data-id={message._id}
				data-system-message={Boolean(message.t)}
				data-mid={message._id}
				data-unread={isFirstUnread}
				data-sequential={isSequential}
				data-own={isUserOwnMessage}
				data-qa-type='message'
				sequential={shouldShowAsSequential}
				message={message}
				subscription={subscription}
			/>
		</Fragment>
	);
};

export default ThreadMessageItem;
