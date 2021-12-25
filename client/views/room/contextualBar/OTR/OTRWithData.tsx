// @ts-nocheck
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import React, { useEffect, useMemo, useCallback, ReactElement } from 'react';

import { OTR as ORTInstance } from '../../../../../app/otr/client/rocketchat.otr';
import { useSetModal } from '../../../../contexts/ModalContext';
import { usePresence } from '../../../../hooks/usePresence';
import { useReactiveValue } from '../../../../hooks/useReactiveValue';
import OTR from './OTR';
import OTRModal from './OTRModal';

const OTRWithData = ({ rid, tabBar }): ReactElement => {
	const onClickClose = useMutableCallback(() => tabBar?.close());

	const setModal = useSetModal();
	const closeModal = useMutableCallback(() => setModal());
	const otr = useMemo(() => ORTInstance.getInstanceByRoomId(rid), [rid]);

	const [isEstablished, isEstablishing] = useReactiveValue(
		useCallback(
			() => (otr ? [otr.established.get(), otr.establishing.get()] : [false, false]),
			[otr],
		),
	);

	const userStatus = usePresence(otr.peerId)?.status;

	const isOnline = !['offline', 'loading'].includes(userStatus);

	const handleStart = (): void => {
		otr.handshake();
	};

	const handleEnd = (): void => otr?.end();

	const handleReset = (): void => {
		otr.reset();
		otr.handshake(true);
	};

	useEffect(() => {
		if (isEstablished) {
			return closeModal();
		}

		if (!isEstablishing) {
			return;
		}

		const timeout = setTimeout(() => {
			otr.establishing.set(false);
			setModal(<OTRModal onConfirm={closeModal} onCancel={closeModal} />);
		}, 10000);

		return (): void => clearTimeout(timeout);
	}, [closeModal, isEstablished, isEstablishing, setModal, otr]);

	return (
		<OTR
			isOnline={isOnline}
			isEstablishing={isEstablishing}
			isEstablished={isEstablished}
			onClickClose={onClickClose}
			onClickStart={handleStart}
			onClickEnd={handleEnd}
			onClickRefresh={handleReset}
		/>
	);
};

export default OTRWithData;
