import { Message as TemplateMessage } from '@rocket.chat/fuselage';
import React, { FC } from 'react';

import { IMessage } from '../../../../../definition/IMessage';
import { IUser } from '../../../../../definition/IUser';
import Attachments from '../../../../components/Message/Attachments';
import BroadcastMetric from '../../../../components/Message/Metrics/Broadcast';
import DiscussionMetric from '../../../../components/Message/Metrics/Discussion';
import ThreadMetric from '../../../../components/Message/Metrics/Thread';
import { useTranslation } from '../../../../contexts/TranslationContext';
import { useFormatTime } from '../../../../hooks/useFormatTime';
import { useUserData } from '../../../../hooks/useUserData';
import MessageBlock from '../../../blocks/MessageBlock';
import MessageLocation from '../../../location/MessageLocation';
import { useRoomActions } from '../../providers/RoomProvider';
import { Avatar } from './Avatar';

export const Message: FC<{ message: IMessage }> = ({ message }) => {
	const t = useTranslation();
	const format = useFormatTime();
	const user: Partial<IUser> = useUserData(message.u._id) || message.u;

	const actions = useRoomActions();

	return (
		<TemplateMessage data-id={message._id} data-username={user.username} data-date={message.ts}>
			<TemplateMessage.LeftContainer>
				<Avatar user={user} message={message} />
			</TemplateMessage.LeftContainer>
			<TemplateMessage.Container>
				<TemplateMessage.Header>
					<TemplateMessage.Name onClick={actions.openUserCard}>
						{user.name || user.username}
					</TemplateMessage.Name>
					{user.name && user.name !== user.username && (
						<TemplateMessage.Username onClick={actions.openUserCard}>
							@{user.username}
						</TemplateMessage.Username>
					)}
					{user.roles && (
						<TemplateMessage.Roles>
							{user.roles?.map((role: string) => (
								<TemplateMessage.Role data-role={role} key={role}>
									{role}
								</TemplateMessage.Role>
							))}
							{message.bot && (
								<TemplateMessage.Role data-role={'bot'}>{t('Bot')}</TemplateMessage.Role>
							)}
							{/* preference UI_DisplayRoles */}
						</TemplateMessage.Roles>
					)}
					<TemplateMessage.Timestamp title={message.ts}>
						{format(message.ts)}
					</TemplateMessage.Timestamp>
					{message.private && <TemplateMessage.Badge name='lock' />}
					{message.pinned && <TemplateMessage.Badge name='pin' />}
					{message.edited && <TemplateMessage.Badge name='pin' />}
					{message.sentByEmail && <TemplateMessage.Badge name='mail' />}
					{/* following {message.sentByEmail && <TemplateMessage.Badge name='language' />} */}
					{/* autotranslate {message.sentByEmail && <TemplateMessage.Badge name='language' />} */}
				</TemplateMessage.Header>
				<TemplateMessage.Body>{!message.blocks && message.msg}</TemplateMessage.Body>
				{message.blocks && (
					<MessageBlock mid={message.mid} blocks={message.blocks} appId rid={message.rid} />
				)}
				{message.attachments && (
					<Attachments attachments={message.attachments} file={message.file} />
				)}
				{/* {room.broadcast} */}
				{message.u.username !== undefined && false && (
					<BroadcastMetric
						replyBroadcast={actions.replyBroadcast}
						mid={message._id}
						username={message.u.username}
					/>
				)}

				{message.tcount && message.tlm && (
					<ThreadMetric
						rid={message.rid}
						mid={message._id}
						openThread={actions.openThread}
						following={true}
						unread={false}
						mention={true}
						all={false}
						counter={message.tcount}
						lm={message.tlm}
						participants={0}
					/>
				)}
				{message.drid && (
					<DiscussionMetric
						rid={message.rid}
						openDiscussion={actions.openDiscussion}
						count={message.dcount || 0}
						drid={message.drid}
						lm={message.dlm}
					/>
				)}
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
