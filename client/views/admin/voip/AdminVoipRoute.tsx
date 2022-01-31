import { Tabs } from '@rocket.chat/fuselage';
import React, { ReactElement, useEffect, useState } from 'react';

import NotAuthorizedPage from '../../../components/NotAuthorizedPage';
import Page from '../../../components/Page';
import PageSkeleton from '../../../components/PageSkeleton';
import { useRoute, useRouteParameter } from '../../../contexts/RouterContext';
import { useSetting } from '../../../contexts/SettingsContext';
import { useTranslation } from '../../../contexts/TranslationContext';
import { AdminVoipSettingsPage } from './AdminVoipSettingsPage';

const AdminVoipRoute = (): ReactElement => {
	const t = useTranslation();
	const [isLoading, setLoading] = useState(true);
	const canViewVoipPage = useSetting('Livechat_enabled');
	const adminVoipRoute = useRoute('admin-voip');
	const context = useRouteParameter('context');

	useEffect(() => {
		let mounted = true;

		const initialize = async (): Promise<void> => {
			if (!canViewVoipPage) {
				return;
			}

			adminVoipRoute.push({ context: 'settings' });

			if (!mounted) {
				return;
			}

			setLoading(false);
		};

		initialize();

		return (): void => {
			mounted = false;
		};
	}, [adminVoipRoute, canViewVoipPage]);

	if (!canViewVoipPage) {
		return <NotAuthorizedPage />;
	}

	if (isLoading) {
		return <PageSkeleton />;
	}

	return (
		<Page>
			<Page.Header title={t('VoIP')} />
			<Tabs>
				<Tabs.Item onClick={(): void => adminVoipRoute.push({ context: 'settings' })} selected={context === 'settings'}>
					{t('Settings')}
				</Tabs.Item>
				<Tabs.Item onClick={(): void => adminVoipRoute.push({ context: 'extensions' })} selected={context === 'extensions'}>
					{t('Extensions')}
				</Tabs.Item>
			</Tabs>
			<Page.ScrollableContentWithShadow>
				{(context === 'settings' && <AdminVoipSettingsPage />) || (context === 'extensions' && <div></div>)}
			</Page.ScrollableContentWithShadow>
		</Page>
	);
};

export default AdminVoipRoute;
