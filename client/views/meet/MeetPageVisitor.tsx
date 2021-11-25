import React, { FC, useMemo } from 'react';

import { useRouteParameter, useQueryStringParameter } from '../../contexts/RouterContext';
import { useEndpointData } from '../../hooks/useEndpointData';
import { AsyncStatePhase } from '../../lib/asyncState';
import NotFoundPage from '../notFound/NotFoundPage';
import PageLoading from '../root/PageLoading';
import CallPage from './CallPage';
import { MeetPageEnded } from './MeetPageEnded';
import './styles.css';

const MeetPageVisitor: FC = () => {
	const visitorToken = useQueryStringParameter('token');

	const roomId = useRouteParameter('rid');
	const layout = useQueryStringParameter('layout');

	const closeCallTab = (): void => window.close();

	if (!visitorToken) {
		throw new Error('No visitor token provided');
	}

	const result = useEndpointData(
		`livechat/room`,
		useMemo(
			() => ({
				token: visitorToken,
				rid: roomId,
			}),
			[visitorToken, roomId],
		),
	);

	if (result.phase === AsyncStatePhase.LOADING) {
		return <PageLoading />;
	}

	if (result.phase === AsyncStatePhase.REJECTED) {
		return <NotFoundPage />;
	}

	const { room } = result.value;

	const visitorId = room.v._id;
	const visitorName = room.fname;
	const agentName = room.responseBy.username || room.servedBy.username;
	const status = room.callStatus || 'ended';
	const startTime = room.webRtcCallStartTime;

	if (status === 'ended') {
		return (
			<MeetPageEnded username={visitorName} interlocutor={agentName} closeCallTab={closeCallTab} />
		);
	}

	return (
		<CallPage
			roomId={roomId}
			status={status}
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

export default MeetPageVisitor;
