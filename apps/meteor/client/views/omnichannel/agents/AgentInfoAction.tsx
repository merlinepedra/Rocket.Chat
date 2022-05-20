import { Button, Icon, IconProps } from '@rocket.chat/fuselage';
import React, { ReactElement } from 'react';

type AgentInfoActionProps = {
	icon: IconProps['name'];
	label: string;
};

const AgentInfoAction = ({ icon, label }: AgentInfoActionProps): ReactElement => (
	<Button title={label} mi='x4'>
		<Icon name={icon} size='x20' mie='x4' />
		{label}
	</Button>
);

export default AgentInfoAction;
