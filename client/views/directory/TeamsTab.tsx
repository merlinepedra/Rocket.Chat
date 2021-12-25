// @ts-nocheck
import React, { ReactElement } from 'react';

import NotAuthorizedPage from '../../components/NotAuthorizedPage';
import { usePermission } from '../../contexts/AuthorizationContext';
import TeamsTable from './TeamsTable';

function TeamsTab(props): ReactElement {
	const canViewPublicRooms = usePermission('view-c-room');

	if (canViewPublicRooms) {
		return <TeamsTable {...props} />;
	}

	return <NotAuthorizedPage />;
}

export default TeamsTab;
