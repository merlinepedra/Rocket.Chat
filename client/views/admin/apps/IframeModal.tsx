// @ts-nocheck
import { Box, Modal } from '@rocket.chat/fuselage';
import React, { ReactElement, useEffect } from 'react';

const iframeMsgListener =
	(confirm, cancel) =>
	(e): void => {
		let data;
		try {
			data = JSON.parse(e.data);
		} catch (e) {
			return;
		}

		data.result ? confirm(data) : cancel();
	};

const IframeModal = ({ url, confirm, cancel, ...props }): ReactElement => {
	useEffect(() => {
		const listener = iframeMsgListener(confirm, cancel);

		window.addEventListener('message', listener);

		return (): void => {
			window.removeEventListener('message', listener);
		};
	}, [confirm, cancel]);

	return (
		<Modal height='x360' {...props}>
			<Box padding='x12' w='full' h='full' flexGrow={1}>
				<iframe style={{ border: 'none', height: '100%', width: '100%' }} src={url} />
			</Box>
		</Modal>
	);
};

export default IframeModal;
