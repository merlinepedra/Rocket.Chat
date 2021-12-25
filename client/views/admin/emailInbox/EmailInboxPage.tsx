// @ts-nocheck
import { Button, Icon } from '@rocket.chat/fuselage';
import React, { ReactElement } from 'react';

import Page from '../../../components/Page';
import { useRoute, useRouteParameter } from '../../../contexts/RouterContext';
import { useTranslation } from '../../../contexts/TranslationContext';
import EmailInboxEditWithData from './EmailInboxEditWithData';
import EmailInboxForm from './EmailInboxForm';
import EmailInboxTable from './EmailInboxTable';

export function EmailInboxPage(): ReactElement {
	const t = useTranslation();

	const context = useRouteParameter('context');
	const id = useRouteParameter('_id');

	const emailInboxRoute = useRoute('admin-email-inboxes');

	const handleNewButtonClick = (): void => {
		emailInboxRoute.push({ context: 'new' });
	};

	return (
		<Page flexDirection='row'>
			<Page>
				<Page.Header title={t('Email_Inboxes')}>
					{context && (
						<Button alignSelf='flex-end' onClick={(): void => emailInboxRoute.push({})}>
							<Icon name='back' />
							{t('Back')}
						</Button>
					)}
					{!context && (
						<Button primary onClick={handleNewButtonClick}>
							<Icon name='plus' /> {t('New_Email_Inbox')}
						</Button>
					)}
				</Page.Header>
				<Page.Content>
					{!context && <EmailInboxTable />}
					{context === 'new' && <EmailInboxForm />}
					{context === 'edit' && <EmailInboxEditWithData id={id} />}
				</Page.Content>
			</Page>
		</Page>
	);
}

export default EmailInboxPage;
