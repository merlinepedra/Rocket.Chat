import { Box } from '@rocket.chat/fuselage';
import React, { ReactElement } from 'react';

import UserAvatar from '../../../components/avatar/UserAvatar';
import { useTranslation } from '../../../contexts/TranslationContext';

const CallPageInCalling = (): ReactElement => {
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
					backgroundColor='#2F343D'
					alignItems='center'
				>
					<UserAvatar
						style={{
							display: 'block',
							margin: 'auto',
						}}
						username={agentName}
						className='rcx-message__avatar'
						size={isLocalMobileDevice ? 'x32' : 'x48'}
					/>
				</Box>
				<Box
					position='absolute'
					zIndex={1}
					style={{
						top: '20%',
						display: 'flex',
						justifyContent: 'center',
						flexDirection: 'column',
					}}
					alignItems='center'
				>
					<UserAvatar
						style={{
							display: 'block',
							margin: 'auto',
						}}
						username={visitorName}
						className='rcx-message__avatar'
						size='x124'
					/>
					<Box color='white' fontSize={16} margin={15}>
						{t('Calling')}
					</Box>
					<Box
						style={{
							color: 'white',
							fontSize: isLocalMobileDevice ? 15 : 22,
						}}
					>
						{visitorName}
					</Box>
				</Box>
			</Box>
		</Box>
	);
};

export default CallPageInCalling;
