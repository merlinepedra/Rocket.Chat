import { Message as MessageTemplate } from '@rocket.chat/fuselage';
import { isSameDay } from 'date-fns';
import React, { FC } from 'react';
import { Virtuoso } from 'react-virtuoso';

import { IRoom } from '../../../../definition/IRoom';
import ScrollableContentWrapper from '../../../components/ScrollableContentWrapper';
import { useFormatDateAndTime } from '../../../hooks/useFormatDateAndTime';
import { useRoom } from '../providers/RoomProvider';
import { Message } from './components/Message';
import { SequentialMessage } from './components/SequentialMessage';
import { useMessages } from './hooks/useMessages';
import { isMessageSequential } from './libs/isMessageSequential';

export const MessageList: FC = () => {
	const room = useRoom() as IRoom;
	const messages = useMessages({ rid: room._id });

	const format = useFormatDateAndTime();

	return (
		<Virtuoso
			overscan={50}
			totalCount={messages.length}
			data={messages}
			components={{ Scroller: ScrollableContentWrapper as any }}
			followOutput={'smooth'}
			itemContent={(index, message) => {
				const previous = messages[index - 1];

				const sequential = isMessageSequential(message, previous);

				const newDay = !previous || !isSameDay(message.ts, previous.ts);

				const Template = sequential ? SequentialMessage : Message;
				return (
					<>
						{newDay && <MessageTemplate.Divider>{format(message.ts)}</MessageTemplate.Divider>}
						<Template message={message} key={message._id} />
					</>
				);
			}}
		/>
	);
};
