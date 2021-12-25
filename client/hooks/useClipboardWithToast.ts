// @ts-nocheck
import { useClipboard, useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { ReactElement } from 'react';

import { useToastMessageDispatch } from '../contexts/ToastMessagesContext';
import { useTranslation } from '../contexts/TranslationContext';

export default function useClipboardWithToast(text): ReactElement {
	const t = useTranslation();
	const dispatchToastMessage = useToastMessageDispatch();

	return useClipboard(text, {
		onCopySuccess: useMutableCallback(() =>
			dispatchToastMessage({ type: 'success', message: t('Copied') }),
		),
		onCopyError: useMutableCallback((e) => dispatchToastMessage({ type: 'error', message: e })),
	});
}
