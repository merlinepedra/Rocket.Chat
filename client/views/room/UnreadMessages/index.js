import React from 'react';
import { Box } from '@rocket.chat/fuselage';
import { useBreakpoints } from '@rocket.chat/fuselage-hooks';
import { createClassName } from '@rocket.chat/css-in-js';

import { useTranslation } from '../../../contexts/TranslationContext';

const action = createClassName('cursor: pointer;');

const UnreadMessages = ({ count, onJump, onMarkRead, unreadSince }) => {
	const isLgScreen = useBreakpoints().includes('lg');
	const isSmScreen = useBreakpoints().includes('sm');
	const t = useTranslation();
	return <Box display='flex' justifyContent='space-between' color='primary-500' backgroundColor='neutral-200' textTransform='uppercase' pi='x8' fontWeight='normal'>
		<span className={action} onClick={onJump}>{t(isSmScreen ? 'Jump_to_first_unread' : 'Jump')}</span>
		<b>{isLgScreen ? t('S_new_messages_since_s', count, unreadSince) : t('N_new_messages', count)}</b>
		<span className={action} onClick={onMarkRead}>{t('Mark_as_read')}</span>
	</Box>;
};

export default UnreadMessages;
