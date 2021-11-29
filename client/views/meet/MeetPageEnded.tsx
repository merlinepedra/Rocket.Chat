import { Button, Box, Icon, Flex } from '@rocket.chat/fuselage';
import React, { FC } from 'react';

import UserAvatar from '../../components/avatar/UserAvatar';
import { useLayout } from '../../contexts/LayoutContext';
// import './styles.css';

export const MeetPageEnded: FC<{
	username: string;
	interlocutor: string;
	closeCallTab: () => void;
}> = ({ username, interlocutor, closeCallTab }) => {
	const { isMobile } = useLayout();

	return (
		<Flex.Container direction='column' justifyContent='center'>
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
						username={username}
						className='rcx-message__avatar'
						size={isMobile ? 'x32' : 'x48'}
					/>
				</Box>
				<Box
					position='absolute'
					zIndex={1}
					style={{
						top: isMobile ? '30%' : '20%',
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
						username={interlocutor}
						className='rcx-message__avatar'
						size='x124'
					/>
					<p style={{ color: 'white', fontSize: 16, margin: 15 }}>{'Call Ended!'}</p>
					<p
						style={{
							color: 'white',
							fontSize: isMobile ? 15 : 22,
						}}
					>
						{interlocutor}
					</p>
				</Box>
				<Box position='absolute' alignItems='center' style={{ bottom: '20%' }}>
					<Button
						square
						title='Close Window'
						onClick={closeCallTab}
						backgroundColor='#2F343D'
						borderColor='#2F343D'
					>
						<Icon name='cross' size='x16' color='white' />
					</Button>
				</Box>
			</Box>
		</Flex.Container>
	);
};
