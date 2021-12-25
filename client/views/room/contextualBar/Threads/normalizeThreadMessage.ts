// @ts-nocheck
import { escapeHTML } from '@rocket.chat/string-helpers';

import { renderMessageBody } from '../../../../lib/utils/renderMessageBody';

export const normalizeThreadMessage = ({ ...message }): string | undefined => {
	if (message.msg) {
		return renderMessageBody(message).replace(/<br\s?\\?>/g, ' ');
	}

	if (message.attachments) {
		const attachment = message.attachments.find(
			(attachment) => attachment.title || attachment.description,
		);

		if (attachment?.description) {
			return escapeHTML(attachment.description);
		}

		if (attachment?.title) {
			return escapeHTML(attachment.title);
		}
	}
};
