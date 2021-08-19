import React, { FC, useMemo, memo, useEffect } from 'react';

import { OmnichannelCustomFieldContext } from '../../contexts/OmnichannelContext/OmnichannelCustomFieldsContext';
import { useStream } from '../../contexts/ServerContext';
import { useEndpointData } from '../../hooks/useEndpointData';

export const OmnichannelCustomFieldProvider: FC = ({ children }) => {
	const { value = { customFields: [] } /* phase, reload */ } =
		useEndpointData('livechat/custom-fields');

	const omnichannelCustomFieldsStream = useStream('omnichannel-customFields');

	useEffect(() => {
		return omnichannelCustomFieldsStream('*', console.log);
	}, [omnichannelCustomFieldsStream]);
	const context = useMemo(() => ({ customFields: value.customFields }), [value.customFields]);

	return <OmnichannelCustomFieldContext.Provider children={children} value={context} />;
};

export default memo(OmnichannelCustomFieldProvider);
