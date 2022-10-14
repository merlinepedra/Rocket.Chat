import { IMessage } from '@rocket.chat/core-typings';
import { Blaze } from 'meteor/blaze';
import { Template } from 'meteor/templating';
import React, { memo, ReactElement, useCallback, useRef } from 'react';

import { useThreadMessages } from '../../MessageList/hooks/useThreadMessages';
import { useThreadMessageContext } from './useThreadMessageContext';

type LegacyThreadMessageTemplateListProps = {
	mainMessage: IMessage;
	messages: IMessage[];
};

const LegacyThreadMessageTemplateList = ({ mainMessage }: LegacyThreadMessageTemplateListProps): ReactElement => {
	const messageContext = useThreadMessageContext();
	const messagesHistory = useThreadMessages({ tmid: mainMessage._id });

	const viewsRef = useRef<Map<string, Blaze.View>>(new Map());

	const mainMessageRef = useCallback(
		(node: HTMLLIElement | null) => {
			if (node?.parentElement) {
				const view = Blaze.renderWithData(
					Template.message,
					() => ({
						groupable: false,
						showRoles: false,
						index: -1,
						shouldCollapseReplies: true,
						msg: mainMessage,
						customClass: 'thread-main',
						templatePrefix: 'thread-',
						ignored: false,
						...messageContext,
					}),
					node.parentElement,
					node,
				);

				viewsRef.current.set(mainMessage._id, view);
			}

			if (!node && viewsRef.current.has(mainMessage._id)) {
				const view = viewsRef.current.get(mainMessage._id);
				if (view) {
					Blaze.remove(view);
				}
				viewsRef.current.delete(mainMessage._id);
			}
		},
		[mainMessage, messageContext],
	);

	const messageRef = useCallback(
		(message: IMessage, index: number) => (node: HTMLLIElement | null) => {
			if (node?.parentElement) {
				const view = Blaze.renderWithData(
					Template.message,
					() => ({
						showRoles: false,
						index: index + 1,
						shouldCollapseReplies: true,
						msg: message,
						templatePrefix: 'thread-',
						context: 'threads',
						...messageContext,
					}),
					node.parentElement,
					node,
				);

				viewsRef.current.set(message._id, view);
			}

			if (!node && viewsRef.current.has(message._id)) {
				const view = viewsRef.current.get(message._id);
				if (view) {
					Blaze.remove(view);
				}
				viewsRef.current.delete(message._id);
			}
		},
		[messageContext],
	);

	return (
		<>
			<li ref={mainMessageRef} />
			{messagesHistory.map((message, index) => (
				<li key={message._id} ref={messageRef(message, index)} />
			))}
		</>
	);
};

export default memo(LegacyThreadMessageTemplateList);
