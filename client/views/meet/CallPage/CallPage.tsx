import { Box, Flex, ButtonGroup, Button, Icon } from '@rocket.chat/fuselage';
import React, { FC, useEffect, useState } from 'react';

import { Notifications } from '../../../../app/notifications/client';
import { WebRTC } from '../../../../app/webrtc/client';
import { WEB_RTC_EVENTS } from '../../../../app/webrtc/index';
import UserAvatar from '../../../components/avatar/UserAvatar';
import { useTranslation } from '../../../contexts/TranslationContext';
import { useWebRTC } from '../../room/hooks/useWebRTC';
import CallPageInCalling from './CallPageInCalling';
import CallPageEnded from './CallPageEnded';
import CallPageInProgress from './CallPageInProgress';
import OngoingCallDuration from './OngoingCallDuration';

type CallPageProps = {
	rid: string;
	visitorToken: any;
	visitorId: any;
	setStatus: any;
	layout: any;
	visitorName: any;
	agentName: any;
	callStartTime: Date;
};

const CallPage: FC<CallPageProps> = ({
	rid,
	visitorToken,
	visitorId,
	setStatus,
	layout,
	visitorName,
	agentName,
	callStartTime,
}) => {
	const {
		status,
		isRemoteMobileDevice,
		isRemoteCameraOn,
		isMicrophoneOn,
		isCameraOn,

		toggleMicrophone,
		toggleCamera,
	} = useWebRTC(rid);

	const [callInIframe, setCallInIframe] = useState(false);

	let iconSize = 'x21';
	let buttonSize = 'x40';
	const avatarSize = 'x48';
	if (layout === 'embedded') {
		iconSize = 'x19';
		buttonSize = 'x35';
	}

	return (
		<>
			{status === 'ringing' && <CallPageInCalling />}
			{status === 'declined' && <CallPageEnded />}
			{status === 'inProgress' && (
				<Flex.Container direction='column' justifyContent='center'>
					{visitorToken && <CallPageInProgress />}
					{!visitorToken && <CallPageInProgress />}
				</Flex.Container>
			)}
		</>
	);
};

export default CallPage;

// useEffect(() => {
// 	const webrtcInstance = WebRTC.getInstanceByRoomId(roomId, visitorId);
// 	if (visitorToken) {
// 		const isMobileDevice = (): boolean => {
// 			if (layout === 'embedded') {
// 				setCallInIframe(true);
// 			}
// 			if (window.innerWidth <= 450 && window.innerHeight >= 629 && window.innerHeight <= 900) {
// 				setIsLocalMobileDevice(true);
// 				webrtcInstance.media = {
// 					audio: true,
// 					video: {
// 						width: { ideal: 440 },
// 						height: { ideal: 580 },
// 					},
// 				};
// 				return true;
// 			}
// 			return false;
// 		};
// 		Notifications.onUser(
// 			WEB_RTC_EVENTS.WEB_RTC,
// 			(type: any, data: any) => {
// 				if (data.room == null) {
// 					return;
// 				}
// 				webrtcInstance.onUserStream(type, data);
// 			},
// 			visitorId,
// 		);
// 		Notifications.onRoom(roomId, 'webrtc', (type: any, data: any) => {
// 			if (type === 'callStatus' && data.callStatus === 'ended') {
// 				webrtcInstance.stop();
// 				setStatus(data.callStatus);
// 			} else if (type === 'getDeviceType') {
// 				Notifications.notifyRoom(roomId, 'webrtc', 'deviceType', {
// 					isMobileDevice: isMobileDevice(),
// 				});
// 			} else if (type === 'cameraStatus') {
// 				setIsRemoteCameraOn(data.isCameraOn);
// 			}
// 		});
// 		Notifications.notifyRoom(roomId, 'webrtc', 'deviceType', {
// 			isMobileDevice: isMobileDevice(),
// 		});
// 		Notifications.notifyRoom(roomId, 'webrtc', 'callStatus', { callStatus: 'inProgress' });
// 	}
// }, [isAgentActive, status, setStatus, visitorId, roomId, visitorToken, layout]);
