import { ILivechatDepartment, ILivechatAgent } from '@rocket.chat/core-typings';
import { Box } from '@rocket.chat/fuselage';
import { useTranslation } from '@rocket.chat/ui-contexts';
import React, { ReactElement } from 'react';

import { FormSkeleton } from '../../../components/Skeleton';
import { AsyncStatePhase } from '../../../hooks/useAsyncState';
import { useEndpointData } from '../../../hooks/useEndpointData';
import AgentEdit from './AgentEdit';

type AgentEditWithDataProps = {
	uid: string;
	reload: () => void;
};

const AgentEditWithData = ({ uid, reload }: AgentEditWithDataProps): ReactElement => {
	const t = useTranslation();
	const { value: data, phase: state, error } = useEndpointData(`livechat/users/agent/${uid}`);
	const {
		value: userDepartments,
		phase: userDepartmentsState,
		error: userDepartmentsError,
	} = useEndpointData(`livechat/agents/${uid}/departments`);
	const {
		value: availableDepartments,
		phase: availableDepartmentsState,
		error: availableDepartmentsError,
	} = useEndpointData('livechat/department');

	if ([state, availableDepartmentsState, userDepartmentsState].includes(AsyncStatePhase.LOADING)) {
		return <FormSkeleton />;
	}

	if (error || userDepartmentsError || availableDepartmentsError || !data || !data.user) {
		return <Box mbs='x16'>{t('User_not_found')}</Box>;
	}

	return (
		<AgentEdit
			uid={uid}
			data={data as { user: ILivechatAgent }}
			userDepartments={userDepartments as { departments: ILivechatDepartment[] }}
			availableDepartments={availableDepartments as { departments: ILivechatDepartment[] }}
			reset={reload}
		/>
	);
};

export default AgentEditWithData;
