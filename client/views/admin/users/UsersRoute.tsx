// @ts-nocheck
import React, { ReactElement } from 'react';

import NotAuthorizedPage from '../../../components/NotAuthorizedPage';
import { usePermission } from '../../../contexts/AuthorizationContext';
import UsersPage from './UsersPage';

function UsersRoute(): ReactElement {
	const canViewUserAdministration = usePermission('view-user-administration');

	if (!canViewUserAdministration) {
		return <NotAuthorizedPage />;
	}

	return <UsersPage />;
}

export default UsersRoute;
