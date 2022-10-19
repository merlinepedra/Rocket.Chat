import { IThreadMainMessage } from '@rocket.chat/core-typings';
import { useMethod, useUserId } from '@rocket.chat/ui-contexts';
import { useMutation, useQueryClient, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';

export const useToggleFollowThreadMutation = (
	options?: Omit<
		UseMutationOptions<void, Error, Pick<IThreadMainMessage, '_id' | 'rid' | 'replies'>, () => void | undefined>,
		'mutationFn'
	>,
): UseMutationResult<void, Error, Pick<IThreadMainMessage, '_id' | 'rid' | 'replies'>, () => void> => {
	const unfollowMessage = useMethod('unfollowMessage');
	const followMessage = useMethod('followMessage');
	const uid = useUserId();

	if (!uid) {
		throw new Error('User is not logged in');
	}

	const queryClient = useQueryClient();

	return useMutation<void, Error, Pick<IThreadMainMessage, '_id' | 'rid' | 'replies'>, () => void>(
		async ({ _id: mid, replies }) => {
			const following = uid && replies?.includes(uid);

			if (following) {
				unfollowMessage({ mid });
				return;
			}

			followMessage({ mid });
		},
		{
			...options,
			onSuccess: (_data, { rid }) => {
				queryClient.invalidateQueries(['rooms', rid, 'threads'], { exact: false });
			},
		},
	);
};
