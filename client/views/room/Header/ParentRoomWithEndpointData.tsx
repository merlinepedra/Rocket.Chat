// @ts-nocheck
import React, { ReactElement, useEffect } from 'react';

import Header from '../../../components/Header';
import { useEndpoint } from '../../../contexts/ServerContext';
import { AsyncStatePhase, useAsyncState } from '../../../hooks/useAsyncState';
import ParentRoom from './ParentRoom';

const ParentRoomWithEndpointData = ({ rid }): ReactElement => {
	const { resolve, reject, reset, phase, value } = useAsyncState();
	const getData = useEndpoint('GET', 'rooms.info');

	useEffect(() => {
		(async (): Promise<void> => {
			reset();
			getData({ roomId: rid })
				.then(resolve)
				.catch((error) => {
					reject(error);
				});
		})();
	}, [reset, getData, rid, resolve, reject]);

	if (AsyncStatePhase.LOADING === phase) {
		return <Header.Tag.Skeleton />;
	}

	if (AsyncStatePhase.ERROR === phase || !value?.room) {
		return null;
	}

	return <ParentRoom room={value.room} />;
};

export default ParentRoomWithEndpointData;
