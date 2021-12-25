// @ts-nocheck
import React, { useMemo } from 'react';

import RoomAvatar from '../../components/avatar/RoomAvatar';
import { useUserPreference } from '../../contexts/UserContext';

export const useAvatarTemplate = (): ((room: unknown) => ReactElement) | null => {
	const sidebarViewMode = useUserPreference('sidebarViewMode');
	const sidebarDisplayAvatar = useUserPreference('sidebarDisplayAvatar');
	return useMemo(() => {
		if (!sidebarDisplayAvatar) {
			return null;
		}

		const size = ((): string => {
			switch (sidebarViewMode) {
				case 'extended':
					return 'x36';
				case 'medium':
					return 'x28';
				case 'condensed':
				default:
					return 'x16';
			}
		})();

		const renderRoomAvatar = (room): ReactElement => (
			<RoomAvatar size={size} room={{ ...room, _id: room.rid || room._id, type: room.t }} />
		);

		return renderRoomAvatar;
	}, [sidebarDisplayAvatar, sidebarViewMode]);
};
