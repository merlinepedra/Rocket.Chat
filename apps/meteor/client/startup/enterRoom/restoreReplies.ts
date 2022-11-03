import { ISubscription } from '@rocket.chat/core-typings';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { getChatMessagesFor } from '../../../app/ui';
import { callbacks } from '../../../lib/callbacks';

callbacks.add('enter-room', (sub?: ISubscription) => {
	if (!sub) {
		return;
	}

	const isAReplyInDMFromChannel = FlowRouter.getQueryParam('reply') && sub.t === 'd';
	if (isAReplyInDMFromChannel) getChatMessagesFor({ rid: sub.rid })?.restoreReplies();
});
