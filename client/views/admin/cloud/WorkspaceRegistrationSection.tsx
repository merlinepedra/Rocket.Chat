// @ts-nocheck
import { Box, Button, ButtonGroup, Field, Margins, TextInput } from '@rocket.chat/fuselage';
import { useSafely, useUniqueId } from '@rocket.chat/fuselage-hooks';
import React, { ReactElement, useState } from 'react';

import { useMethod } from '../../../contexts/ServerContext';
import { useToastMessageDispatch } from '../../../contexts/ToastMessagesContext';
import { useTranslation } from '../../../contexts/TranslationContext';

function WorkspaceRegistrationSection({
	token: initialToken,
	workspaceId: _workspaceId,
	uniqueId: _uniqueId,
	onRegisterStatusChange,
	...props
}): ReactElement {
	const t = useTranslation();
	const dispatchToastMessage = useToastMessageDispatch();

	const connectWorkspace = useMethod('cloud:connectWorkspace');
	const syncWorkspace = useMethod('cloud:syncWorkspace');

	const [isProcessing, setProcessing] = useSafely(useState(false));
	const [token, setToken] = useState(initialToken);

	const handleTokenChange = ({ currentTarget: { value } }): void => {
		setToken(value);
	};

	const handleConnectButtonClick = async (): Promise<void> => {
		setProcessing(true);

		try {
			const isConnected = await connectWorkspace(token);

			if (!isConnected) {
				throw Error(t('An error occured connecting'));
			}

			dispatchToastMessage({ type: 'success', message: t('Connected') });

			const isSynced = await syncWorkspace();

			if (!isSynced) {
				throw Error(t('An error occured syncing'));
			}
		} catch (error) {
			dispatchToastMessage({ type: 'error', message: error });
		} finally {
			await onRegisterStatusChange?.();
			setProcessing(false);
		}
	};

	const tokenInputId = useUniqueId();

	return (
		<Box marginBlock='neg-x24' {...props}>
			<Margins block='x24'>
				<Box withRichContent color='neutral-800'>
					<p>{t('Cloud_token_instructions')}</p>
				</Box>

				<Field>
					<Field.Label htmlFor={tokenInputId}>{t('Token')}</Field.Label>
					<Field.Row>
						<TextInput
							id={tokenInputId}
							disabled={isProcessing}
							value={token}
							onChange={handleTokenChange}
						/>
					</Field.Row>
					<Field.Hint>{t('Cloud_manually_input_token')}</Field.Hint>
				</Field>

				<ButtonGroup>
					<Button primary disabled={isProcessing} onClick={handleConnectButtonClick}>
						{t('Connect')}
					</Button>
				</ButtonGroup>
			</Margins>
		</Box>
	);
}

export default WorkspaceRegistrationSection;
