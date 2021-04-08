import { Message as TemplateMessage, ThreadMessage } from '@rocket.chat/fuselage';
import React, { FC } from 'react';

import { IMessage } from '../../../../../definition/IMessage';
import Attachments from '../../../../components/Message/Attachments';
import Discussion from '../../../../components/Message/Metrics/Discussion';
import UserAvatar from '../../../../components/avatar/UserAvatar';
import { useFormatTime } from '../../../../hooks/useFormatTime';
import MessageBlock from '../../../blocks/MessageBlock';
import MessageLocation from '../../../location/MessageLocation';

export const Message: FC<{ message: IMessage }> = ({ message }) => {
	const format = useFormatTime();

	return (
		<TemplateMessage>
			<TemplateMessage.LeftContainer>
				{message.u.username && <UserAvatar username={message.u.username} size={'x36'} />}
			</TemplateMessage.LeftContainer>
			<TemplateMessage.Container>
				<TemplateMessage.Header>
					<TemplateMessage.Name>{message.u.username}</TemplateMessage.Name>
					{/* <TemplateMessage.Username>@haylie.george</TemplateMessage.Username> */}
					{/* <TemplateMessage.Role>Admin</TemplateMessage.Role>
			<TemplateMessage.Role>User</TemplateMessage.Role>
			<TemplateMessage.Role>Owner</TemplateMessage.Role> */}
					<TemplateMessage.Timestamp>{format(message.ts)}</TemplateMessage.Timestamp>
				</TemplateMessage.Header>
				<TemplateMessage.Body>{!message.blocks && message.msg}</TemplateMessage.Body>
				{message.blocks && (
					<MessageBlock mid={message.mid} blocks={message.blocks} appId rid={message.rid} />
				)}
				{message.attachments && (
					<Attachments attachments={message.attachments} file={message.file} />
				)}

				{message.tcount && <ThreadMessage counter={message.tcount} />}
				{/* //following={following} lm={message.tlm} rid={message.rid} mid={message._id} unread={unread} mention={mention all={all openThread={actions.openThread }} */}

				{message.drid && <Discussion count={message.dcount} drid={message.drid} lm={message.dlm} />}
				{message.location && <MessageLocation location={message.location} />}
			</TemplateMessage.Container>
			{/* <TemplateMessage.Toolbox>
		  <TemplateMessage.Toolbox.Item icon='quote' />
		  <TemplateMessage.Toolbox.Item icon='clock' />
		  <TemplateMessage.Toolbox.Item icon='thread' />
		</TemplateMessage.Toolbox> */}
		</TemplateMessage>
	);
};
