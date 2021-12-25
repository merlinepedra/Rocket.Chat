// @ts-nocheck
import { useCallback } from 'react';

import { usePermission } from '../../../../../contexts/AuthorizationContext';
import { useSetting } from '../../../../../contexts/SettingsContext';
import { getDifference, MINUTES } from '../lib/getDifference';

export const useMessageDeletionIsAllowed = (rid, uid): unknown => {
	const canForceDelete = usePermission('force-delete-message', rid);
	const deletionIsEnabled = useSetting('Message_AllowDeleting');
	const userHasPermissonToDeleteAny = usePermission('delete-message', rid);
	const userHasPermissonToDeleteOwn = usePermission('delete-own-message');
	const blockDeleteInMinutes = useSetting('Message_AllowDeleting_BlockDeleteInMinutes');

	const isDeletionAllowed = ((): (() => boolean) => {
		if (canForceDelete) {
			return (): boolean => true;
		}

		if (!deletionIsEnabled) {
			return (): boolean => false;
		}

		if (!userHasPermissonToDeleteAny && !userHasPermissonToDeleteOwn) {
			return (): boolean => false;
		}

		const checkTimeframe =
			blockDeleteInMinutes !== 0
				? ({ ts }): boolean => {
						if (!ts) {
							return false;
						}

						const currentTsDiff = getDifference(new Date(), new Date(ts), MINUTES);

						return currentTsDiff < blockDeleteInMinutes;
				  }
				: (): boolean => true;

		if (userHasPermissonToDeleteAny) {
			return checkTimeframe;
		}

		const isOwn = ({ uid: owner }): boolean => owner === uid;

		return (msg): boolean => isOwn(msg) && checkTimeframe(msg);
	})();

	// eslint-disable-next-line react-hooks/exhaustive-deps
	return useCallback(isDeletionAllowed, [
		canForceDelete,
		deletionIsEnabled,
		userHasPermissonToDeleteAny,
		userHasPermissonToDeleteOwn,
		blockDeleteInMinutes,
	]);
};
