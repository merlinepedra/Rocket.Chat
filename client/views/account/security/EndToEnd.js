import { Box, Margins, PasswordInput, Field, FieldGroup, Button } from '@rocket.chat/fuselage';
import { useLocalStorage } from '@rocket.chat/fuselage-hooks';
import React, { useCallback, useEffect } from 'react';

import { e2e } from '../../../../app/e2e/client/rocketchat.e2e';
import { useEndpoint } from '../../../contexts/ServerContext';
import { useToastMessageDispatch } from '../../../contexts/ToastMessagesContext';
import { useTranslation } from '../../../contexts/TranslationContext';
import { useUserId } from '../../../contexts/UserContext';
import { useForm } from '../../../hooks/useForm';

const EndToEnd = (props) => {
	const t = useTranslation();
	const dispatchToastMessage = useToastMessageDispatch();

	const publicKey = useLocalStorage('public_key');
	const privateKey = useLocalStorage('private_key');

	const resetE2EEKeyRequest = useEndpoint('POST', 'users.resetE2EKey');

	const { values, handlers, reset } = useForm({ password: '', passwordConfirm: '' });
	const { password, passwordConfirm } = values;
	const { handlePassword, handlePasswordConfirm } = handlers;

	const keysExist = publicKey && privateKey;

	const hasTypedPassword = password.trim().length > 0;
	const passwordError =
		password !== passwordConfirm && passwordConfirm.length > 0
			? t('Passwords_do_not_match')
			: undefined;
	const canSave = keysExist && !passwordError && passwordConfirm.length > 0;

	const saveNewPassword = useCallback(async () => {
		try {
			await e2e.changePassword(password);
			reset();
			dispatchToastMessage({ type: 'success', message: t('Encryption_key_saved_successfully') });
		} catch (error) {
			dispatchToastMessage({ type: 'error', message: error });
		}
	}, [dispatchToastMessage, password, reset, t]);

	const userId = useUserId();

	const handleResetE2eKey = useCallback(async () => {
		try {
			await resetE2EEKeyRequest({ userId });
			dispatchToastMessage({ type: 'success', message: t('User_e2e_key_was_reset') });
		} catch (error) {
			dispatchToastMessage({ type: 'error', message: error });
		}
	}, [dispatchToastMessage, resetE2EEKeyRequest, t, userId]);

	useEffect(() => {
		if (password.trim() === '') {
			handlePasswordConfirm('');
		}
	}, [handlePasswordConfirm, password]);

	return (
		<Box display='flex' flexDirection='column' alignItems='flex-start' mbs='x16' {...props}>
			<Margins blockEnd='x8'>
				<Box fontScale='s2'>{t('E2E_Encryption_Password_Change')}</Box>
				<Box dangerouslySetInnerHTML={{ __html: t('E2E_Encryption_Password_Explanation') }} />
				<FieldGroup w='full'>
					<Field>
						<Field.Label>{t('New_encryption_password')}</Field.Label>
						<Field.Row>
							<PasswordInput
								value={password}
								onChange={handlePassword}
								placeholder={t('New_Password_Placeholder')}
								disabled={!keysExist}
							/>
						</Field.Row>
						{!keysExist && <Field.Hint>{t('EncryptionKey_Change_Disabled')}</Field.Hint>}
					</Field>
					{hasTypedPassword && (
						<Field>
							<Field.Label>{t('Confirm_new_encryption_password')}</Field.Label>
							<PasswordInput
								error={passwordError}
								value={passwordConfirm}
								onChange={handlePasswordConfirm}
								placeholder={t('Confirm_New_Password_Placeholder')}
							/>
							<Field.Error>{passwordError}</Field.Error>
						</Field>
					)}
				</FieldGroup>
				<Button primary disabled={!canSave} onClick={saveNewPassword}>
					{t('Save_changes')}
				</Button>
				<Box fontScale='s2' mbs='x16'>
					{t('Reset_E2E_Key')}
				</Box>
				<Box dangerouslySetInnerHTML={{ __html: t('E2E_Reset_Key_Explanation') }} />
				<Button onClick={handleResetE2eKey}>{t('Reset_E2E_Key')}</Button>
			</Margins>
		</Box>
	);
};

export default EndToEnd;
