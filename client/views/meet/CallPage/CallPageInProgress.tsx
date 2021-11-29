import { Box, ButtonGroup, Button, Icon } from '@rocket.chat/fuselage';
import React, { FC } from 'react';

import UserAvatar from '../../../components/avatar/UserAvatar';
import { useTranslation } from '../../../contexts/TranslationContext';
import OngoingCallDuration from '../OngoingCallDuration';

type CallPageInProgressProps = {
	isCameraOn: boolean;
};

const CallPageInProgress: FC<CallPageInProgressProps> = ({ isCameraOn }) => {
	const t = useTranslation();

	return (
		<Box display='flex' direction='column' justifyContent='center'>
			<Box
				width='full'
				minHeight='sh'
				alignItems='center'
				backgroundColor='neutral-900'
				overflow='hidden'
				position='relative'
			>
				<Box
					position='absolute'
					zIndex={1}
					style={{
						top: '5%',
						right: '2%',
					}}
					className='Self_Video'
					alignItems='center'
					backgroundColor='#2F343D'
				>
					<video
						id='localVideo'
						autoPlay
						playsInline
						muted
						style={{
							width: '100%',
							transform: 'scaleX(-1)',
							display: isCameraOn ? 'block' : 'none',
						}}
					/>
					<UserAvatar
						style={{
							display: isCameraOn ? 'none' : 'block',
							margin: 'auto',
						}}
						username={localAvatar}
						className='rcx-message__avatar'
						size={isLocalMobileDevice || callInIframe ? 'x32' : 'x48'}
					/>
				</Box>
				<ButtonGroup
					position='absolute'
					zIndex={1}
					style={{
						bottom: '5%',
					}}
				>
					<Button
						id='mic'
						square
						data-title={isMicOn ? t('Mute_microphone') : t('Unmute_microphone')}
						onClick={(): any => toggleButton('mic')}
						className={isMicOn ? 'On' : 'Off'}
						size={Number(buttonSize)}
					>
						{isMicOn ? (
							<Icon name='mic' size={iconSize} />
						) : (
							<Icon name='mic-off' size={iconSize} />
						)}
					</Button>
					<Button
						id='camera'
						square
						data-title={isCameraOn ? t('Turn_off_video') : t('Turn_on_video')}
						onClick={(): void => toggleButton('camera')}
						className={isCameraOn ? 'On' : 'Off'}
						size={parseInt(buttonSize)}
					>
						{isCameraOn ? (
							<Icon name='video' size={iconSize} />
						) : (
							<Icon name='video-off' size={iconSize} />
						)}
					</Button>
					{layout === 'embedded' && (
						<Button
							square
							backgroundColor='#2F343D'
							borderColor='#2F343D'
							data-title={t('Expand_view')}
							onClick={(): void => (parent as any)?.expandCall()}
							size={parseInt(buttonSize)}
						>
							<Icon name='arrow-expand' size={iconSize} color='white' />
						</Button>
					)}
					<Button
						square
						primary
						danger
						data-title={t('End_call')}
						onClick={closeWindow}
						size={parseInt(buttonSize)}
					>
						<Icon name='phone-off' size={iconSize} color='white' />
					</Button>
				</ButtonGroup>
				<video
					id='remoteVideo'
					autoPlay
					playsInline
					style={{
						width: isRemoteMobileDevice ? '45%' : '100%',
						transform: 'scaleX(-1)',
						display: isRemoteCameraOn ? 'block' : 'none',
					}}
				></video>
				<Box
					position='absolute'
					zIndex={1}
					display={isRemoteCameraOn ? 'none' : 'flex'}
					justifyContent='center'
					flexDirection='column'
					alignItems='center'
					style={{
						top: isRemoteMobileDevice || isLocalMobileDevice ? '10%' : '30%',
					}}
				>
					<UserAvatar
						style={{
							display: 'block',
							margin: 'auto',
						}}
						username={remoteAvatar}
						className='rcx-message__avatar'
						size={!callInIframe ? 'x124' : avatarSize}
					/>
					<Box color='white' fontSize={callInIframe ? 12 : 18} textAlign='center' margin={3}>
						<OngoingCallDuration start={callStartTime} />
					</Box>
					<Box
						style={{
							color: 'white',
							fontSize: callInIframe ? 12 : 22,
							margin: callInIframe ? 5 : 9,
							...(callInIframe && { marginTop: 0 }),
						}}
					>
						{remoteAvatar}
					</Box>
				</Box>
			</Box>
		</Box>
	);
};

export default CallPageInProgress;
