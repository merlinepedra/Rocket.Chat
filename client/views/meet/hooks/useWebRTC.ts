import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { useEffect, useMemo, useState } from 'react';
import { useSubscription } from 'use-subscription';

import { WebRTC } from '../../../../app/webrtc/client';

type UseWebRTCProps = {
	status: string;
	isRemoteMobileDevice: boolean;
	isRemoteCameraOn: boolean;
	isMicrophoneOn: boolean;
	isCameraOn: boolean;

	toggleMicrophone: () => void;
	toggleCamera: () => void;
};
export const useWebRTC = ({ rid }: { rid: string }): UseWebRTCProps => {
	const [result, setResult] = useState({
		status: '',
		isRemoteMobileDevice: false,
		isRemoteCameraOn: false,
	});

	const webrtcInstance = useMemo(() => WebRTC.getInstanceByRoomId(rid), [rid]);

	const isCameraOn = useSubscription(
		useMemo(
			() => ({
				getCurrentValue: (): boolean => Boolean(webrtcInstance.videoEnabled.get()),

				subscribe: (callback: () => void): (() => void) => {
					webrtcInstance.on('video', callback);
					return (): void => webrtcInstance.off('video', callback);
				},
			}),
			[webrtcInstance],
		),
	);

	const isMicrophoneOn = useSubscription(
		useMemo(
			() => ({
				getCurrentValue: (): boolean => Boolean(webrtcInstance.audioEnabled.get()),
				subscribe: (callback: () => void): (() => void) => {
					webrtcInstance.on('audio', callback);
					return (): void => webrtcInstance.off('audio', callback);
				},
			}),
			[webrtcInstance],
		),
	);

	useEffect(() => {
		// Notifications.notifyRoom(roomId, 'webrtc', 'getDeviceType');
		webrtcInstance.startCall({
			audio: true,
			video: {
				width: { ideal: 1920 },
				height: { ideal: 1080 },
			},
		});

		// const call = webrtcInstance.on('callStatus', (data: unknown) => {
		// 	setResult((prevState) => ({
		// 		...prevState,
		// 		status: data.callStatus,
		// 	}));
		// });

		const device = webrtcInstance.on('deviceType', (data: unknown) => {
			setResult((prevState) => ({
				...prevState,
				isMobileDevice: data.isMobileDevice,
			}));
		});

		const camera = webrtcInstance.on('cameraStatus', (data: unknown) => {
			setResult((prevState) => ({
				...prevState,
				isRemoteCameraOn: data.isRemoteCameraOn,
			}));
		});

		return () => {
			webrtcInstance.stop();
			call.stop();
			device.stop();
			camera.stop();
		};
	}, [webrtcInstance]);

	const toggleMicrophone = useMutableCallback(() => {
		webrtcInstance.setAudioEnabled(!isMicrophoneOn);
	});

	const toggleCamera = useMutableCallback(() => {
		webrtcInstance.setVideoEnabled(!isCameraOn);
	});

	return { ...result, toggleMicrophone, toggleCamera, isCameraOn, isMicrophoneOn };
};
