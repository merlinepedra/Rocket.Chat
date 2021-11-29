import React, { ReactElement, ReactNode, useMemo } from 'react';

import { IRoom } from '../../../definition/IRoom';
import RoomAvatar from '../../components/avatar/RoomAvatar';
import { useUserPreference } from '../../contexts/UserContext';

type UseAvatarTemplateProps = {
	sidebarViewMode?: 'extended' | 'medium' | 'condensed';
	sidebarDisplayAvatar?: boolean;
};

export const useAvatarTemplate = ({
	sidebarViewMode,
	sidebarDisplayAvatar,
}: UseAvatarTemplateProps = {}): ((room: IRoom & { rid: string }) => ReactNode) => {
	const sidebarViewModeFromSetting = useUserPreference('sidebarViewMode');
	const sidebarDisplayAvatarFromSetting = useUserPreference('sidebarDisplayAvatar');
	return useMemo(() => {
		if (
			!(sidebarDisplayAvatar !== undefined ? sidebarDisplayAvatar : sidebarDisplayAvatarFromSetting)
		) {
			return (): ReactNode => null;
		}

		const size = ((): 'x36' | 'x28' | 'x16' => {
			switch (sidebarViewMode || sidebarViewModeFromSetting) {
				case 'extended':
					return 'x36';
				case 'medium':
					return 'x28';
				case 'condensed':
				default:
					return 'x16';
			}
		})();

		const renderRoomAvatar = (room: IRoom & { rid: string }): ReactNode => (
			<RoomAvatar size={size} room={{ ...room, _id: room.rid || room._id, type: room.t }} />
		);

		return renderRoomAvatar;
	}, [
		sidebarDisplayAvatar,
		sidebarDisplayAvatarFromSetting,
		sidebarViewMode,
		sidebarViewModeFromSetting,
	]);
};
