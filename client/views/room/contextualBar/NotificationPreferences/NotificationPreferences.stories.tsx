// @ts-nocheck
import React from 'react';

import VerticalBar from '../../../../components/VerticalBar';
import NotificationsPreferences from './NotificationPreferences';

export default {
	title: 'room/contextualBar/NotificationsPreferences',
	component: NotificationsPreferences,
};

const handleOn = {
	turnOn: true,
	muteGroupMentions: false,
	showCounter: true,
};

const handleSwitch = {
	turnOn: () => undefined,
	muteGroupMentions: () => undefined,
	showCounter: () => undefined,
};

const defaultOption = [
	['default', 'Default'],
	['all', 'All_messages'],
	['mentions', 'Mentions'],
	['nothing', 'Nothing'],
];

const handleOptions = {
	alerts: defaultOption,
	audio: defaultOption,
	sound: [
		['none None', 'None'],
		['0 default', 'Default'],
		['chime', 'Chime'],
	],
};

const handleSelect = { desktop: {}, mobile: {}, email: {} };

handleSelect.desktop.alert = 'default';
handleSelect.desktop.sound = 'chime';

handleSelect.mobile.alert = 'mentions';

handleSelect.email.alert = 'nothing';

export const Default = () => (
	<VerticalBar>
		<NotificationsPreferences
			handleOn={handleOn}
			handleSwitch={handleSwitch}
			handleOptions={handleOptions}
			handleSelect={handleSelect}
			handleChangeOption={{
				desktopAlert: () => undefined,
				mobileAlert: () => undefined,
				emailAlert: () => undefined,
			}}
			handleSoundChange={{ desktopSound: () => undefined }}
		/>
	</VerticalBar>
);
