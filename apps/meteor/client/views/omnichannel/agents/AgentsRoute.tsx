import { Box, Pagination } from '@rocket.chat/fuselage';
import { useDebouncedValue, useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { usePermission, useTranslation, useRouteParameter, useRoute } from '@rocket.chat/ui-contexts';
import React, { ReactElement, useMemo, useCallback } from 'react';

import {
	GenericTable,
	GenericTableBody,
	GenericTableCell,
	GenericTableHeader,
	GenericTableHeaderCell,
	GenericTableLoadingTable,
	GenericTableRow,
} from '../../../components/GenericTable';
import { usePagination } from '../../../components/GenericTable/hooks/usePagination';
import { useSort } from '../../../components/GenericTable/hooks/useSort';
import Page from '../../../components/Page';
import VerticalBar from '../../../components/VerticalBar';
import UserAvatar from '../../../components/avatar/UserAvatar';
import { useEndpointData } from '../../../hooks/useEndpointData';
import { AsyncStatePhase } from '../../../lib/asyncState';
import NotAuthorizedPage from '../../notAuthorized/NotAuthorizedPage';
import AddAgent from './AddAgent';
import AgentEditWithData from './AgentEditWithData';
import AgentInfo from './AgentInfo';
import AgentInfoActions from './AgentInfoActions';
import RemoveAgentButton from './RemoveAgentButton';

const AgentsRoute = (): ReactElement => {
	const { sortBy, sortDirection, setSort } = useSort<'name' | 'username' | 'emails.address' | 'statusLivechat'>('name');
	const t = useTranslation();
	const { current, itemsPerPage, setItemsPerPage: onSetItemsPerPage, setCurrent: onSetCurrent, ...paginationProps } = usePagination();

	const query = useDebouncedValue(
		useMemo(
			() => ({
				// text,
				fields: JSON.stringify({ name: 1, username: 1, emails: 1, avatarETag: 1 }),
				sort: `{ "${sortBy}": ${sortDirection === 'asc' ? 1 : -1} }`,
				count: itemsPerPage,
				offset: current,
			}),
			[itemsPerPage, current, sortBy, sortDirection],
		),
		500,
	);

	const { reload, ...result } = useEndpointData('livechat/users/agent', query);

	const canViewAgents = usePermission('manage-livechat-agents');

	const agentsRoute = useRoute('omnichannel-agents');
	const context = useRouteParameter('context');
	const id = useRouteParameter('id');

	const onRowClick = useMutableCallback(
		(id) => () =>
			agentsRoute.push({
				context: 'info',
				id,
			}),
	);

	const EditAgentsTab = useCallback(() => {
		if (!context) {
			return null;
		}
		const handleVerticalBarCloseButtonClick = (): void => {
			agentsRoute.push({});
		};

		return (
			<VerticalBar>
				<VerticalBar.Header>
					{context === 'edit' && t('Edit_User')}
					{context === 'info' && t('User_Info')}
					<VerticalBar.Close onClick={handleVerticalBarCloseButtonClick} />
				</VerticalBar.Header>

				{context === 'edit' && id && <AgentEditWithData uid={id} reload={reload} />}
				{context === 'info' && id && (
					<AgentInfo uid={id}>
						<AgentInfoActions reload={reload} />
					</AgentInfo>
				)}
			</VerticalBar>
		);
	}, [t, context, id, agentsRoute, reload]);

	if (!canViewAgents) {
		return <NotAuthorizedPage />;
	}

	return (
		<Page flexDirection='row'>
			<Page>
				<Page.Header title={t('Agents')} />
				<AddAgent reload={reload} />
				<Page.Content>
					<GenericTable>
						<GenericTableHeader>
							<GenericTableHeaderCell key={'name'} direction={sortDirection} active={sortBy === 'name'} onClick={setSort} sort='name'>
								{t('Name')}
							</GenericTableHeaderCell>
							<GenericTableHeaderCell
								key={'username'}
								direction={sortDirection}
								active={sortBy === 'username'}
								onClick={setSort}
								sort='username'
							>
								{t('Username')}
							</GenericTableHeaderCell>
							<GenericTableHeaderCell
								key={'email'}
								direction={sortDirection}
								active={sortBy === 'emails.address'}
								onClick={setSort}
								sort='emails.address'
							>
								{t('Email')}
							</GenericTableHeaderCell>
							<GenericTableHeaderCell
								key={'statusLivechat'}
								direction={sortDirection}
								active={sortBy === 'statusLivechat'}
								onClick={setSort}
								sort='statusLivechat'
							>
								{t('Livechat_status')}
							</GenericTableHeaderCell>
							<GenericTableHeaderCell key={'remove'} w='x60'>
								{t('Remove')}
							</GenericTableHeaderCell>
						</GenericTableHeader>
						<GenericTableBody>
							{result.phase === AsyncStatePhase.LOADING && <GenericTableLoadingTable headerCells={2} />}
							{result.phase === AsyncStatePhase.RESOLVED &&
								result.value.users.length > 0 &&
								result.value.users.map((user) => (
									<GenericTableRow onClick={onRowClick(user._id)} key={user._id} tabIndex={0} role='link' action qa-user-id={user._id}>
										<GenericTableCell withTruncatedText>
											<Box display='flex' alignItems='center'>
												<UserAvatar size='x28' username={user.username || ''} etag={user.avatarETag} />
												<Box display='flex' withTruncatedText mi='x8'>
													<Box display='flex' flexDirection='column' alignSelf='center' withTruncatedText>
														<Box fontScale='p2m' withTruncatedText color='default'>
															{user.name || user.username}
														</Box>
													</Box>
												</Box>
											</Box>
										</GenericTableCell>
										<GenericTableCell>
											<Box fontScale='p2m' withTruncatedText color='hint'>
												{user.username}
											</Box>
											<Box mi='x4' />
										</GenericTableCell>
										<GenericTableCell withTruncatedText>{user.emails?.length && user.emails[0].address}</GenericTableCell>
										<GenericTableCell withTruncatedText>
											{user.statusLivechat === 'available' ? t('Available') : t('Not_Available')}
										</GenericTableCell>
										<RemoveAgentButton _id={user._id} reload={reload} />
									</GenericTableRow>
								))}
						</GenericTableBody>
					</GenericTable>
					{result.phase === AsyncStatePhase.RESOLVED && (
						<Pagination
							current={current}
							itemsPerPage={itemsPerPage}
							count={result.value.total || 0}
							onSetItemsPerPage={onSetItemsPerPage}
							onSetCurrent={onSetCurrent}
							{...paginationProps}
						/>
					)}
				</Page.Content>
			</Page>
			<EditAgentsTab />
		</Page>
	);
};

export default AgentsRoute;
