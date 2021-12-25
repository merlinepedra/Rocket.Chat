// @ts-nocheck
import React, { ReactElement } from 'react';

import NotAuthorizedPage from '../../../components/NotAuthorizedPage';
import { usePermission } from '../../../contexts/AuthorizationContext';
import CloudPage from './CloudPage';

function CloudRoute(): ReactElement {
	const canManageCloud = usePermission('manage-cloud');

	if (!canManageCloud) {
		return <NotAuthorizedPage />;
	}

	return <CloudPage />;
}

export default CloudRoute;
