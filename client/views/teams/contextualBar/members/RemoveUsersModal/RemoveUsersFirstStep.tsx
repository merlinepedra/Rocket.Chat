// @ts-nocheck
import { Box } from '@rocket.chat/fuselage';
import React, { ReactElement } from 'react';

import GenericModal from '../../../../../components/GenericModal';
import { useTranslation } from '../../../../../contexts/TranslationContext';
import ChannelDesertionTable from '../../../ChannelDesertionTable';

const RemoveUsersFirstStep = ({
	onClose,
	onCancel,
	onConfirm,
	username: _username,
	results: _results,
	rooms,
	onToggleAllRooms,
	onChangeRoomSelection,
	selectedRooms,
	eligibleRoomsLength,
	...props
}): ReactElement => {
	const t = useTranslation();

	return (
		<GenericModal
			variant='warning'
			icon='warning'
			title={t('Teams_removing_member')}
			cancelText={t('Cancel')}
			confirmText={t('Continue')}
			onClose={onClose}
			onCancel={onCancel}
			onConfirm={onConfirm}
			{...props}
		>
			<Box mbe='x24' fontScale='p3'>
				{t('Select_the_channels_you_want_the_user_to_be_removed_from')}
			</Box>
			<ChannelDesertionTable
				lastOwnerWarning={t('Teams_channels_last_owner_leave_channel_warning')}
				onToggleAllRooms={onToggleAllRooms}
				rooms={rooms}
				params={{}}
				onChangeParams={(): void => undefined}
				onChangeRoomSelection={onChangeRoomSelection}
				selectedRooms={selectedRooms}
				eligibleRoomsLength={eligibleRoomsLength}
			/>
		</GenericModal>
	);
};

export default RemoveUsersFirstStep;
