// @ts-nocheck
import React, { ReactElement, useState } from 'react';

import StepOne from './StepOne';
import StepTwo from './StepTwo';

const ChannelToTeamModal = ({ onClose, onConfirm }): ReactElement => {
	const [step, setStep] = useState(1);
	const [teamId, setTeamId] = useState();

	const nextStep = (): void => setStep(step + 1);

	if (step === 2) {
		return (
			<StepTwo onClose={onClose} onCancel={onClose} onConfirm={(): void => onConfirm(teamId)} />
		);
	}

	return (
		<StepOne
			onClose={onClose}
			onCancel={onClose}
			onConfirm={nextStep}
			onChange={setTeamId}
			teamId={teamId}
		/>
	);
};

export default ChannelToTeamModal;
