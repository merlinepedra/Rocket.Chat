// @ts-nocheck
import React, { ReactElement } from 'react';

import NotAuthorizedPage from '../../../components/NotAuthorizedPage';
import { usePermission } from '../../../contexts/AuthorizationContext';
import OAuthAppsPage from './OAuthAppsPage';

export default function MailerRoute(): ReactElement {
	const canAccessOAuthApps = usePermission('manage-oauth-apps');

	if (!canAccessOAuthApps) {
		return <NotAuthorizedPage />;
	}

	return <OAuthAppsPage />;
}
