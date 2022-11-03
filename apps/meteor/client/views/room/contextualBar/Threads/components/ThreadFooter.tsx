import type { IMessage } from '@rocket.chat/core-typings';
import { CheckBox } from '@rocket.chat/fuselage';
import { useRoute, useTranslation, useUserPreference } from '@rocket.chat/ui-contexts';
import React, { FormEvent, ReactElement, useState } from 'react';

import { ChatMessages } from '../../../../../../app/ui';
import { roomCoordinator } from '../../../../../lib/rooms/roomCoordinator';
import ComposerMessage from '../../../components/body/composer/ComposerMessage';
import { useRoom, useRoomSubscription } from '../../../contexts/RoomContext';

type ThreadFooterProps = {
	tmid: IMessage['_id'];
	chatMessagesInstance: ChatMessages;
	tcount?: number;
	onSend?: () => void;
	onResize?: () => void;
};

const ThreadFooter = ({ tmid, chatMessagesInstance, tcount, onSend, onResize }: ThreadFooterProps): ReactElement => {
	const room = useRoom();
	const subscription = useRoomSubscription();
	const alsoSendThreadToChannelPreference = useUserPreference<string>('alsoSendThreadToChannel');

	const [sendToChannel, setSendToChannel] = useState(() => {
		switch (alsoSendThreadToChannelPreference) {
			case 'always':
				return true;
			case 'never':
				return false;
			default:
				return !tcount;
		}
	});

	const channelRoute = useRoute(roomCoordinator.getRoomTypeConfig(room.t).route.name);

	const t = useTranslation();

	return (
		<>
			<ComposerMessage
				rid={room._id}
				tmid={tmid}
				tshow={sendToChannel}
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
					onSend?.();

					if (alsoSendThreadToChannelPreference === 'default') {
						setSendToChannel(false);
					}
				}}
				onResize={onResize}
			/>

			<footer className='thread-footer'>
				<div style={{ display: 'flex' }}>
					<CheckBox
						id='sendAlso'
						checked={sendToChannel}
						onChange={({ currentTarget: { checked } }: FormEvent<HTMLInputElement>): void => setSendToChannel(checked)}
					/>
				</div>
				<label htmlFor='sendAlso' className='thread-footer__text'>
					{t('Also_send_to_channel')}
				</label>
			</footer>
		</>
	);
};

export default ThreadFooter;
