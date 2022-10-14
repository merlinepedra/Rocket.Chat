import { IMessage, IRoom, ISubscription } from '@rocket.chat/core-typings';
import { useSetting } from '@rocket.chat/ui-contexts';
import { Blaze } from 'meteor/blaze';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from 'meteor/templating';
import React, { memo, ReactElement, useCallback, useEffect, useRef } from 'react';

import { ChatMessages } from '../../../../../../app/ui';
import { RoomManager } from '../../../../../../app/ui-utils/client';
import { useEmbeddedLayout } from '../../../../../hooks/useEmbeddedLayout';
import { useReactiveValue } from '../../../../../hooks/useReactiveValue';
import ComposerSkeleton from '../../../Room/ComposerSkeleton';

export type ComposerMessageProps = {
	rid: IRoom['_id'];
	tmid?: IMessage['_id'];
	subscription?: ISubscription;
	chatMessagesInstance: ChatMessages;
	onKeyDown?: (event: KeyboardEvent) => void;
	onSend?: () => void;
	onResize?: () => void;
};

const ComposerMessage = ({
	rid,
	tmid,
	subscription,
	chatMessagesInstance,
	onKeyDown,
	onSend,
	onResize,
}: ComposerMessageProps): ReactElement => {
	const isLayoutEmbedded = useEmbeddedLayout();
	const showFormattingTips = useSetting('Message_ShowFormattingTips') as boolean;

	const messageBoxViewRef = useRef<Blaze.View>();
	const messageBoxViewDataRef = useRef(
		new ReactiveVar({
			rid,
			tmid,
			subscription,
			isEmbedded: isLayoutEmbedded,
			showFormattingTips: showFormattingTips && !isLayoutEmbedded,
			onKeyDown,
			onSend,
			onResize,
		}),
	);

	useEffect(() => {
		messageBoxViewDataRef.current.set({
			rid,
			tmid,
			subscription,
			isEmbedded: isLayoutEmbedded,
			showFormattingTips: showFormattingTips && !isLayoutEmbedded,
			onKeyDown,
			onSend,
			onResize,
		});
	}, [isLayoutEmbedded, onSend, onResize, rid, showFormattingTips, subscription, tmid, onKeyDown]);

	const footerRef = useCallback(
		(footer: HTMLElement | null) => {
			if (footer) {
				messageBoxViewRef.current = Blaze.renderWithData(
					Template.messageBox,
					() => ({
						...messageBoxViewDataRef.current.get(),
						onInputChanged: (input: HTMLTextAreaElement): void => {
							chatMessagesInstance.initializeInput(input, { rid, tmid });
						},
						onKeyUp: (
							event: KeyboardEvent,
							{
								rid,
								tmid,
							}: {
								rid: string;
								tmid?: string | undefined;
							},
						) => chatMessagesInstance.keyup(event, { rid, tmid }),
						onKeyDown: (event: KeyboardEvent): void => {
							const handled = chatMessagesInstance.keydown(event);

							if (handled) {
								return;
							}

							messageBoxViewDataRef.current.get().onKeyDown?.(event);
						},
						onSend: (
							event: Event,
							params: {
								rid: string;
								tmid?: string;
								value: string;
								tshow?: boolean;
							},
							done?: () => void,
						): void => {
							messageBoxViewDataRef.current.get().onSend?.();
							chatMessagesInstance.send(event, params, done);
						},
					}),
					footer,
				);
				return;
			}

			if (messageBoxViewRef.current) {
				Blaze.remove(messageBoxViewRef.current);
				messageBoxViewRef.current = undefined;
			}
		},
		[chatMessagesInstance, rid, tmid],
	);

	const publicationReady = useReactiveValue(useCallback(() => RoomManager.getOpenedRoomByRid(rid)?.streamActive ?? false, [rid]));

	if (!publicationReady) {
		return (
			<footer className='footer'>
				<ComposerSkeleton />
			</footer>
		);
	}

	return <footer ref={footerRef} className='footer' />;
};

export default memo(ComposerMessage);
