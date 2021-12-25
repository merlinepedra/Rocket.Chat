// @ts-nocheck
import React, { ReactElement } from 'react';

import { renderEmoji } from '../lib/utils/renderEmoji';

function Emoji({ emojiHandle, className = undefined }): ReactElement {
	const markup = { __html: `${renderEmoji(emojiHandle)}` };
	return <span className={className} dangerouslySetInnerHTML={markup} />;
}

export default Emoji;
