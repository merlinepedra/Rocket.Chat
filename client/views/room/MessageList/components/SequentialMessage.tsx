import { Message } from '@rocket.chat/fuselage';
import React, { FC } from 'react';

import { IMessage } from '../../../../../definition/IMessage';
import Attachments from '../../../../components/Message/Attachments';
import Discussion from '../../../../components/Message/Metrics/Discussion';
import MessageBlock from '../../../blocks/MessageBlock';
import MessageLocation from '../../../location/MessageLocation';

export const SequentialMessage: FC<{ message: IMessage }> = ({ message }) => {
	return (
		<Message>
			<Message.LeftContainer></Message.LeftContainer>
			<Message.Container>
				<Message.Body>{message.msg}</Message.Body>
				{message.blocks && (
					<MessageBlock mid={message.mid} blocks={message.blocks} appId rid={message.rid} />
				)}
				{message.attachments && (
					<Attachments attachments={message.attachments} file={message.file} />
				)}

				{message.drid && <Discussion count={message.dcount} drid={message.drid} lm={message.dlm} />}
				{message.location && <MessageLocation location={message.location} />}
			</Message.Container>
		</Message>
	);
};
