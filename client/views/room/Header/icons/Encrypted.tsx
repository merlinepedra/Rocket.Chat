// @ts-nocheck
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import colors from '@rocket.chat/fuselage-tokens/colors';
import React, { memo, ReactElement } from 'react';

import Header from '../../../../components/Header';
import { useMethod } from '../../../../contexts/ServerContext';
import { useSetting } from '../../../../contexts/SettingsContext';
import { useTranslation } from '../../../../contexts/TranslationContext';

const Encrypted = ({ room }): ReactElement => {
	const t = useTranslation();
	const e2eEnabled = useSetting('E2E_Enable');
	const toggleE2E = useMethod('saveRoomSettings');
	const encryptedLabel = t('Encrypted');
	const handleE2EClick = useMutableCallback(() => {
		toggleE2E(room._id, 'encrypted', !room?.encrypted);
	});
	return e2eEnabled && room?.encrypted ? (
		<Header.State
			title={encryptedLabel}
			icon='key'
			onClick={handleE2EClick}
			color={colors.g500}
			tiny
			ghost
		/>
	) : null;
};

export default memo(Encrypted);
