// @ts-nocheck
import React, { ReactElement } from 'react';

import NotAuthorizedPage from '../../../../components/NotAuthorizedPage';
import { usePermission } from '../../../../contexts/AuthorizationContext';
import ChatTable from './ChatTable';

function ChatTab(props): ReactElement {
	const hasAccess = usePermission('view-l-room');

	if (hasAccess) {
		return <ChatTable {...props} />;
	}

	return <NotAuthorizedPage />;
}

export default ChatTab;
