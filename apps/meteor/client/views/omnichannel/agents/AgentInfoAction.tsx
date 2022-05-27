import { Button, Icon, IconProps } from '@rocket.chat/fuselage';
import React, { ReactElement, MouseEventHandler } from 'react';

type AgentInfoActionProps = {
	icon: IconProps['name'];
	label: string;
	onClick: MouseEventHandler<HTMLElement>;
};

const AgentInfoAction = ({ icon, label, onClick }: AgentInfoActionProps): ReactElement => (
	<Button title={label} onClick={onClick} mi='x4'>
		<Icon name={icon} size='x20' mie='x4' />
		{label}
	</Button>
);

export default AgentInfoAction;
