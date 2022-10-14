import { useMemo } from 'react';

import { useMessageContext } from '../../components/body/useMessageContext';
import { useRoom } from '../../contexts/RoomContext';

export const useThreadMessageContext = (): ReturnType<typeof useMessageContext> => {
	const room = useRoom();
	const roomMessageContext = useMessageContext(room);

	return useMemo(
		() => ({
			...roomMessageContext,
			showreply: false,
			showReplyButton: false,
		}),
		[roomMessageContext],
	);
};
