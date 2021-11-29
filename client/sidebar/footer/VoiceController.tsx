import { Box, Sidebar, SidebarItem, SidebarTopBar, SidebarSection } from '@rocket.chat/fuselage';
import React, { FC, ReactElement } from 'react';

import VoiceRoomManager, {
	isMediasoupState,
	useVoiceChannel,
	useVoiceChannelDeafen,
	useVoiceChannelMic,
} from '../../../app/voice-channel/client/VoiceChannelManager';
import { IRoom } from '../../../definition/IRoom';
import { useUserRoom } from '../../contexts/UserContext';
import SidebarIcon from '../RoomList/SidebarIcon';
import { useAvatarTemplate } from '../hooks/useAvatarTemplate';

const VoiceController: FC = (): ReactElement | null => {
	const state = useVoiceChannel();
	const rid = (state.state === 'connected' && state.rid) || '';
	const room = useUserRoom(rid);
	const roomAvatar = useAvatarTemplate({
		sidebarViewMode: 'extended',
	});
	const muted = useVoiceChannelMic();
	const deafen = useVoiceChannelDeafen();

	if (!isMediasoupState(state)) {
		return null;
	}

	const handleDisconnect = (): void => {
		VoiceRoomManager.disconnect();
		// @TODO: handle establishing websocket reconnection using VoiceRoomManager.connect(rid, room);
	};

	const toggleMic = (): void => {
		VoiceRoomManager.toggleMic();
	};

	const toggleDeafen = (): void => {
		VoiceRoomManager.toggleDeafen();
	};

	return (
		<Box mb='x16' elevation='2'>
			<SidebarSection.Title>
				Voice Channel
				<Sidebar.TopBar.Actions>
					{muted ? (
						<SidebarTopBar.Action icon='mic-off' onClick={toggleMic} />
					) : (
						<SidebarTopBar.Action icon='mic' onClick={toggleMic} />
					)}

					{deafen ? (
						<SidebarTopBar.Action icon='headphone-off' onClick={toggleDeafen} />
					) : (
						<SidebarTopBar.Action icon='headphone' onClick={toggleDeafen} />
					)}
				</Sidebar.TopBar.Actions>
			</SidebarSection.Title>
			<SidebarItem>
				{roomAvatar && (
					<SidebarItem.Avatar>{roomAvatar(room as IRoom & { rid: string })}</SidebarItem.Avatar>
				)}
				<SidebarItem.Content>
					<SidebarItem.Content>
						<SidebarItem.Wrapper>
							{room && <SidebarIcon room={room} highlighted={null} />}
							<SidebarItem.Title>{state.mediasoupClient.roomName}</SidebarItem.Title>
						</SidebarItem.Wrapper>
					</SidebarItem.Content>
					<SidebarItem.Content>
						<SidebarItem.Wrapper>
							<SidebarItem.Subtitle>
								ddsfoasdhfiuashd ousadhfiuasdhfiuashd soduhfiuasdhfia ishdfiuashdfiuas iuashdfiausdh
							</SidebarItem.Subtitle>
						</SidebarItem.Wrapper>
					</SidebarItem.Content>
				</SidebarItem.Content>
				<SidebarItem.Container>
					<SidebarItem.Actions>
						<SidebarItem.Action danger primary icon='phone-off' onClick={handleDisconnect} />
					</SidebarItem.Actions>
				</SidebarItem.Container>
			</SidebarItem>
		</Box>
	);
};

export default VoiceController;
