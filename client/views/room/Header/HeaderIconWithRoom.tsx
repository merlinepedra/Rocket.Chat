// @ts-nocheck
import React, { ReactElement } from 'react';

import Header from '../../../components/Header';
import { useRoomIcon } from '../../../hooks/useRoomIcon';

const HeaderIconWithRoom = ({ room }): ReactElement => {
	const icon = useRoomIcon(room);

	return <Header.Icon icon={icon} />;
};
export default HeaderIconWithRoom;
