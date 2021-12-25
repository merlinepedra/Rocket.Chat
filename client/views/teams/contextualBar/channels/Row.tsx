// @ts-nocheck
import React, { memo, ReactElement } from 'react';

import TeamsChannelItem from './TeamsChannelItem';

function Row({ room, onClickView, reload }): ReactElement {
	if (!room) {
		return <TeamsChannelItem.Skeleton />;
	}

	return (
		<TeamsChannelItem room={room} onClickView={(): void => onClickView(room)} reload={reload} />
	);
}

export default memo(Row);
