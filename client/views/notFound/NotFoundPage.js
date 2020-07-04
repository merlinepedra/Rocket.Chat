import { Box, Button, ButtonGroup, Margins } from '@rocket.chat/fuselage';
import React from 'react';

import ConnectionStatusAlert from '../../components/connectionStatus/ConnectionStatusAlert';
import { useRoute } from '../../contexts/RouterContext';
import { useTranslation } from '../../contexts/TranslationContext';
import { useWipeInitialPageLoading } from '../../hooks/useWipeInitialPageLoading';
import BackgroundImage from './BackgroundImage';

function NotFoundPage() {
	useWipeInitialPageLoading();

	const t = useTranslation();
	const homeRoute = useRoute('home');

	const handleGoToPreviousPageClick = () => {
		window.history.back();
	};

	const handleGoHomeClick = () => {
		homeRoute.push();
	};

	return <>
		<ConnectionStatusAlert />
		<Box
			is='section'
			display='flex'
			flexDirection='column'
			justifyContent='center'
			alignItems='center'
			width='sw'
			height='sh'
		>
			<BackgroundImage />
			<Box zIndex='1'>
				<Margins block='x12'>
					<Box fontWeight='p2' fontSize='x64' color='alternative' textAlign='center'>404</Box>

					<Box fontScale='h1' color='alternative' textAlign='center'>
						{t('Oops_page_not_found')}
					</Box>

					<Box fontScale='p1' color='alternative' textAlign='center'>
						{t('Sorry_page_you_requested_does_not_exist_or_was_deleted')}
					</Box>
				</Margins>

				<Margins block='x64'>
					<ButtonGroup align='center'>
						<Button type='button' primary onClick={handleGoToPreviousPageClick}>{t('Return_to_previous_page')}</Button>
						<Button type='button' primary onClick={handleGoHomeClick}>{t('Return_to_home')}</Button>
					</ButtonGroup>
				</Margins>
			</Box>
		</Box>
	</>;
}

export default NotFoundPage;
