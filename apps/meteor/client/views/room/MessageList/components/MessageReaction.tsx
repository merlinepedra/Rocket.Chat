import { MessageReaction as MessageReactionTemplate, MessageReactionEmoji, MessageReactionCounter } from '@rocket.chat/fuselage';
import React, { FC, useRef } from 'react';

import { useTooltipClose, useTooltipOpen } from '../../../../contexts/TooltipContext';
import { useTranslation } from '../../../../contexts/TranslationContext';
import { getEmojiClassNameAndDataTitle } from '../../../../lib/utils/renderEmoji';

type TranslationRepliesKey =
	| 'You_have_reacted'
	| 'Users_and_more_reacted_with'
	| 'You_users_and_more_Reacted_with'
	| 'Users_reacted_with'
	| 'You_and_users_Reacted_with';

const getTranslationKey = (users: string[], mine: boolean): TranslationRepliesKey => {
	if (users.length === 0) {
		if (mine) {
			return 'You_have_reacted';
		}
	}

	if (users.length > 15) {
		if (mine) {
			return 'You_and_users_Reacted_with';
		}
		return 'Users_and_more_reacted_with';
	}

	if (mine) {
		return 'You_and_users_Reacted_with';
	}
	return 'Users_reacted_with';
};

export const MessageReaction: FC<{
	hasReacted: (name: string) => boolean;
	reactToMessage: (name: string) => void;
	counter: number;
	name: string;
	names: string[];
}> = ({ hasReacted, reactToMessage, counter, name, names, ...props }) => {
	const t = useTranslation();
	const ref = useRef<HTMLDivElement>(null);
	const openTooltip = useTooltipOpen();
	const closeTooltip = useTooltipClose();

	const mine = hasReacted(name);

	const key = getTranslationKey(names, mine);

	const emojiProps = getEmojiClassNameAndDataTitle(name);
	return (
		<MessageReactionTemplate
			ref={ref}
			key={name}
			mine={mine}
			onClick={(): void => reactToMessage(name)}
			tabIndex={0}
			role='button'
			onMouseOver={(e): void => {
				e.stopPropagation();
				e.preventDefault();
				ref.current &&
					openTooltip(
						<>
							{t(key, {
								counter: names.length,
								users: names.join(', '),
								emoji: name,
							})}
						</>,
						ref.current,
					);
			}}
			onMouseLeave={(): void => {
				closeTooltip();
			}}
			{...props}
		>
			<MessageReactionEmoji {...emojiProps} />
			<MessageReactionCounter counter={counter} />
		</MessageReactionTemplate>
	);
};
