import React, { ReactElement } from 'react';

import { renderEmoji } from '../lib/utils/renderEmoji';

type EmojiProps = {
	emojiHandle: string;
	className?: string | undefined;
};

function Emoji({ emojiHandle, className = undefined }: EmojiProps): ReactElement {
	const markup = { __html: `${renderEmoji(emojiHandle)}` };
	return <span className={className} dangerouslySetInnerHTML={markup} />;
}

export default Emoji;
