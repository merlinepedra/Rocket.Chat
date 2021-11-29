import React, { FC, useMemo } from 'react';

import { isOmnichannelRoom } from '../../../definition/IRoom';
import { useRouteParameter, useQueryStringParameter } from '../../contexts/RouterContext';
import { useEndpointData } from '../../hooks/useEndpointData';
import { AsyncStatePhase } from '../../lib/asyncState';
import { mapRoomFromApi } from '../../lib/utils/mapRoomFromApi';
import NotFoundPage from '../notFound/NotFoundPage';
import PageLoading from '../root/PageLoading';
import CallPage from './CallPage/CallPage';
import { MeetPageEnded } from './MeetPageEnded';
// import './styles.css';

export const MeetPage: FC = () => {
	const visitorToken = useQueryStringParameter('token');

	const rid = useRouteParameter('rid');
	const layout = useQueryStringParameter('layout');

	const closeCallTab = (): void => window.close();

	if (!visitorToken && !rid) {
		throw new Error('No visitor token or room id provided');
	}

	const result = useEndpointData(
		`rooms.info`,
		useMemo(
			() => ({
				roomId: rid,
			}),
			[rid],
		),
	);

	if (result.phase === AsyncStatePhase.LOADING) {
		return <PageLoading />;
	}

	if (result.phase === AsyncStatePhase.REJECTED) {
		return <NotFoundPage />;
	}

	const room = mapRoomFromApi(result.value.room);

	if (!isOmnichannelRoom(room)) {
		throw new Error('Room is not an omnichannel room');
	}

	const visitorName = room.fname;
	const visitorId = room.v._id;
	const agentName = room.responseBy?.username || room.servedBy?.username;
	const status = room.callStatus || 'ended';
	const startTime = room.webRtcCallStartTime;

	if (status === 'ended') {
		return (
			<MeetPageEnded username={agentName} interlocutor={visitorName} closeCallTab={closeCallTab} />
		);
	}

	return (
		<CallPage
			rid={rid}
			visitorToken={visitorToken}
			visitorId={visitorId}
			setStatus={startTime}
			visitorName={visitorName}
			agentName={agentName}
			layout={layout}
			callStartTime={startTime}
		/>
	);
};

export default MeetPage;
