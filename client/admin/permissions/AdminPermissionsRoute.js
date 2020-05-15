import React from 'react';
import toastr from 'toastr';

import { useAtLeastOnePermission } from '../../contexts/AuthorizationContext';
import { useMethod } from '../../contexts/ServerContext';
import { useTranslation } from '../../contexts/TranslationContext';
import AdminPermissionsPage from './AdminPermissionsPage';
import NotAuthorizedPage from '../NotAuthorizedPage';


export default function AdminPermissionsRoute() {
	const canAccessPermissions = useAtLeastOnePermission(['access-permissions', 'access-setting-permissions']);

	if (!canAccessPermissions) {
		return <NotAuthorizedPage/>;
	}

	return <AdminPermissionsPage />;
}
