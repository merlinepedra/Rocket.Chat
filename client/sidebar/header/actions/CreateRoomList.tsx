// @ts-nocheck
import { OptionTitle } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import React, { ReactElement } from 'react';

import { popover } from '../../../../app/ui-utils/client';
import CreateDiscussion from '../../../components/CreateDiscussion';
import ListItem from '../../../components/Sidebar/ListItem';
import { useAtLeastOnePermission } from '../../../contexts/AuthorizationContext';
import { useSetModal } from '../../../contexts/ModalContext';
import { useSetting } from '../../../contexts/SettingsContext';
import { useTranslation } from '../../../contexts/TranslationContext';
import CreateTeamModal from '../../../views/teams/CreateTeamModal';
import CreateChannelWithData from '../CreateChannelWithData';
import CreateDirectMessage from '../CreateDirectMessage';

const CREATE_CHANNEL_PERMISSIONS = ['create-c', 'create-p'];
const CREATE_TEAM_PERMISSIONS = ['create-team'];
const CREATE_DIRECT_PERMISSIONS = ['create-d'];
const CREATE_DISCUSSION_PERMISSIONS = ['start-discussion', 'start-discussion-other-user'];

const style = {
	textTransform: 'uppercase',
};

const useReactModal = (Component): (() => void) => {
	const setModal = useSetModal();

	return useMutableCallback((e) => {
		popover.close();

		e.preventDefault();

		const handleClose = (): void => {
			setModal(null);
		};

		setModal(() => <Component onClose={handleClose} />);
	});
};

function CreateRoomList({ closeList }): ReactElement {
	const t = useTranslation();

	const canCreateChannel = useAtLeastOnePermission(CREATE_CHANNEL_PERMISSIONS);
	const canCreateTeam = useAtLeastOnePermission(CREATE_TEAM_PERMISSIONS);
	const canCreateDirectMessages = useAtLeastOnePermission(CREATE_DIRECT_PERMISSIONS);
	const canCreateDiscussion = useAtLeastOnePermission(CREATE_DISCUSSION_PERMISSIONS);

	const createChannel = useReactModal(CreateChannelWithData);
	const createTeam = useReactModal(CreateTeamModal);
	const createDiscussion = useReactModal(CreateDiscussion);
	const createDirectMessage = useReactModal(CreateDirectMessage);

	const discussionEnabled = useSetting('Discussion_enabled');

	return (
		<>
			<OptionTitle pb='x8' style={style}>
				{t('Create_new')}
			</OptionTitle>
			<ul className='rc-popover__list'>
				{canCreateChannel && (
					<ListItem
						icon='hashtag'
						text={t('Channel')}
						action={(e): void => {
							createChannel(e);
							closeList();
						}}
					/>
				)}
				{canCreateTeam && (
					<ListItem
						icon='team'
						text={t('Team')}
						action={(e): void => {
							createTeam(e);
							closeList();
						}}
					/>
				)}
				{canCreateDirectMessages && (
					<ListItem
						icon='balloon'
						text={t('Direct_Messages')}
						action={(e): void => {
							createDirectMessage(e);
							closeList();
						}}
					/>
				)}
				{discussionEnabled && canCreateDiscussion && (
					<ListItem
						icon='discussion'
						text={t('Discussion')}
						action={(e): void => {
							createDiscussion(e);
							closeList();
						}}
					/>
				)}
			</ul>
		</>
	);
}

export default CreateRoomList;
