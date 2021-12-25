// @ts-nocheck
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import React, { memo, ReactElement } from 'react';

import KeyboardShortcuts from './KeyboardShortcuts';

const KeyboardShortcutsWithClose = ({ tabBar }): ReactElement => {
	const handleClose = useMutableCallback(() => tabBar?.close());
	return <KeyboardShortcuts handleClose={handleClose} />;
};

export default memo(KeyboardShortcutsWithClose);
