// @ts-nocheck
import React, { ReactElement } from 'react';

import NotAuthorizedPage from '../../../../components/NotAuthorizedPage';
import { usePermission } from '../../../../contexts/AuthorizationContext';
import ContactTable from './ContactTable';

function ContactTab(props): ReactElement {
	const hasAccess = usePermission('view-l-room');

	if (hasAccess) {
		return <ContactTable {...props} />;
	}

	return <NotAuthorizedPage />;
}

export default ContactTab;
