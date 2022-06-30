import { css } from '@rocket.chat/css-in-js';
import { Table, IconButton } from '@rocket.chat/fuselage';
import { useDebouncedValue, useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { useRoute, useTranslation } from '@rocket.chat/ui-contexts';
import React, { useState, useMemo, useCallback, useEffect, ReactElement, MouseEvent } from 'react';

import { useHasLicense } from '../../../../../ee/client/hooks/useHasLicense';
import FilterByText from '../../../../components/FilterByText';
import GenericTable from '../../../../components/GenericTable';
import { GenericTableParams } from '../../../../components/GenericTable/GenericTable';
import { useCallerState } from '../../../../contexts/CallContext';
import { useDialModal } from '../../../../hooks/useDialModal';
import { useEndpointData } from '../../../../hooks/useEndpointData';
import { useFormatDate } from '../../../../hooks/useFormatDate';
import { useVoipAgent } from '../../../../sidebar/sections/hooks/useVoipAgent';

type Query = {
	offset?: number;
	count?: number;
	term: string;
	sort: string;
};

type ContactTableProps = {
	setContactReload(fn: () => void): void;
};

interface IUseQueryHook {
	(params: GenericTableParams, columnDirection: [string, string]): Query;
}

const noop = (): void => {
	/* noop */
};

const rowClass = css`
	.contact-table__call-button {
		display: none;
	}
	&:hover .contact-table__call-button {
		display: block !important;
	}
`;

const useQuery: IUseQueryHook = ({ text, itemsPerPage, current }, [column, direction]) =>
	useMemo(
		() => ({
			term: text || '',
			sort: JSON.stringify({ [column]: direction === 'asc' ? 1 : -1 }),
			...(itemsPerPage && { count: itemsPerPage }),
			...(current && { offset: current }),
		}),
		[column, current, direction, itemsPerPage, text],
	);

function ContactTable({ setContactReload }: ContactTableProps): ReactElement {
	const [params, setParams] = useState<GenericTableParams>({ text: '', current: 0, itemsPerPage: 25 });
	const [sort, setSort] = useState<[string, 'asc' | 'desc']>(['username', 'asc']);
	const t = useTranslation();

	const debouncedParams = useDebouncedValue(params, 500);
	const debouncedSort = useDebouncedValue(sort, 500) as [string, string];
	const query = useQuery(debouncedParams, debouncedSort);
	const directoryRoute = useRoute('omnichannel-directory');
	const formatDate = useFormatDate();
	const callState = useCallerState();
	const { agentEnabled, registered } = useVoipAgent();
	const isInCall = callState === 'IN_CALL';
	const isEnterprise = useHasLicense('voip-enterprise') === true;
	const { openDialModal } = useDialModal();

	const onHeaderClick = useMutableCallback((id) => {
		const [sortBy, sortDirection] = sort;

		if (sortBy === id) {
			return setSort([id, sortDirection === 'asc' ? 'desc' : 'asc']);
		}
		setSort([id, 'asc']);
	});

	const onButtonNewClick = useMutableCallback(() =>
		directoryRoute.push({
			page: 'contacts',
			bar: 'new',
		}),
	);

	const onRowClick = useMutableCallback(
		(id) => (): void =>
			directoryRoute.push({
				page: 'contacts',
				id,
				bar: 'info',
			}),
	);

	const handleDial = useCallback(
		(initialValue = '') =>
			(event: MouseEvent<HTMLButtonElement>): void => {
				event.stopPropagation();
				openDialModal({ initialValue });
			},
		[openDialModal],
	);

	const { value: data, reload } = useEndpointData('/v1/livechat/visitors.search', query);

	useEffect(() => {
		setContactReload(() => reload);
	}, [reload, setContactReload]);

	const header = useMemo(
		() =>
			[
				<GenericTable.HeaderCell
					key={'username'}
					direction={sort[1]}
					active={sort[0] === 'username'}
					onClick={onHeaderClick}
					sort='username'
				>
					{t('Username')}
				</GenericTable.HeaderCell>,
				<GenericTable.HeaderCell key={'name'} direction={sort[1]} active={sort[0] === 'name'} onClick={onHeaderClick} sort='name'>
					{t('Name')}
				</GenericTable.HeaderCell>,
				<GenericTable.HeaderCell key={'phone'} direction={sort[1]} active={sort[0] === 'phone'} onClick={onHeaderClick} sort='phone'>
					{t('Phone')}
				</GenericTable.HeaderCell>,
				<GenericTable.HeaderCell
					key={'email'}
					direction={sort[1]}
					active={sort[0] === 'visitorEmails.address'}
					onClick={onHeaderClick}
					sort='visitorEmails.address'
				>
					{t('Email')}
				</GenericTable.HeaderCell>,
				<GenericTable.HeaderCell
					key={'lastchat'}
					direction={sort[1]}
					active={sort[0] === 'lastchat'}
					onClick={onHeaderClick}
					sort='visitorEmails.address'
				>
					{t('Last_Chat')}
				</GenericTable.HeaderCell>,
				<GenericTable.HeaderCell key='call' width={44} />,
			].filter(Boolean),
		[sort, onHeaderClick, t],
	);

	const renderRow = useCallback(
		({ _id, username, name, visitorEmails, phone, lastChat }) => {
			const phoneNumber = phone?.length && phone[0].phoneNumber;
			const visitorEmail = visitorEmails?.length && visitorEmails[0].address;
			const isCallDisabled = !agentEnabled || !registered || !isEnterprise || isInCall || !phoneNumber;

			return (
				<Table.Row key={_id} tabIndex={0} role='link' onClick={onRowClick(_id)} action qa-user-id={_id} className={rowClass} height='40px'>
					<Table.Cell withTruncatedText>{username}</Table.Cell>
					<Table.Cell withTruncatedText>{name}</Table.Cell>
					<Table.Cell withTruncatedText>{phoneNumber}</Table.Cell>
					<Table.Cell withTruncatedText>{visitorEmail}</Table.Cell>
					<Table.Cell withTruncatedText>{lastChat && formatDate(lastChat.ts)}</Table.Cell>
					<Table.Cell>
						<IconButton
							disabled={isCallDisabled}
							title={isEnterprise ? t('Call_number') : t('Call_number_enterprise_only')}
							tiny
							square
							icon='phone'
							className='contact-table__call-button'
							onClick={handleDial(phoneNumber)}
						/>
					</Table.Cell>
				</Table.Row>
			);
		},
		[formatDate, agentEnabled, registered, isEnterprise, isInCall, onRowClick, t, handleDial],
	);

	return (
		<GenericTable
			header={header}
			renderRow={renderRow}
			results={data?.visitors}
			total={data?.total}
			setParams={setParams}
			params={params}
			renderFilter={({ onChange, ...props }): ReactElement => (
				<FilterByText displayButton textButton={t('New_Contact')} onButtonClick={onButtonNewClick} onChange={onChange || noop} {...props} />
			)}
		/>
	);
}

export default ContactTable;
