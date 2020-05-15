import React, { useCallback } from 'react';
import { Button, Icon } from '@rocket.chat/fuselage';

import Page from '../../components/basic/Page';
// import VerticalBar from '../../components/basic/VerticalBar';
import { useTranslation } from '../../contexts/TranslationContext';
import { useRouteParameter, useRoute } from '../../contexts/RouterContext';
import PermissionsTable from './PermissionsTable';

export function RoomsPage() {
	const t = useTranslation();

	const context = useRouteParameter('context');
	const id = useRouteParameter('id');

	const router = useRoute('admin-permissions');

	// const handleVerticalBarCloseButtonClick = () => {
	// 	roomsRoute.push({});
	// };

	const handleAddRole = useCallback(() => router.push({ context: 'new' }), []);
	const handleReturn = useCallback(() => router.push({}), []);

	return <Page>
		<Page.Header title={t('Permissions')} >
			{!context && <Button onClick={handleAddRole}>
				<Icon name='plus'/>{t('Add_Role')}
			</Button>}
			{context && <Button onClick={handleReturn}>
				<Icon name='back'/>{t('Back')}
			</Button>}
		</Page.Header>
		<Page.Content>
			{!context && <PermissionsTable />}
			{/* {context === 'new' && <AddRole />}
			{context === 'edit' && <EditRoleWithData _id={id} />} */}
		</Page.Content>
	</Page>;
}

export default RoomsPage;
