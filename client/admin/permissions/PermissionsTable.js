import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { Box, Table, TextInput, Icon, CheckBox } from '@rocket.chat/fuselage';
import { useDebouncedValue, useResizeObserver } from '@rocket.chat/fuselage-hooks';

import { GenericTable, Th } from '../../../app/ui/client/components/GenericTable';
import { useTranslation } from '../../contexts/TranslationContext';
import { useRoute } from '../../contexts/RouterContext';
import { useEndpointDataExperimental } from '../../hooks/useEndpointDataExperimental';
import { useFormatDateAndTime } from '../../hooks/useFormatDateAndTime';

const FilterByText = React.memo(({ setFilter, ...props }) => {
	const t = useTranslation();

	const [text, setText] = useState('');

	const handleChange = useCallback((event) => setText(event.currentTarget.value), []);

	useEffect(() => {
		setFilter({ text });
	}, [text]);

	return <Box mb='x16' is='form' display='flex' flexDirection='column' {...props}>
		<TextInput placeholder={t('Search_Integrations')} addon={<Icon name='magnifier' size='x20'/>} onChange={handleChange} value={text} />
	</Box>;
});

const useQuery = (params, sort) => useMemo(() => ({
	query: JSON.stringify({ name: { $regex: params.text || '', $options: 'i' }, type: params.type }),
	sort: JSON.stringify({ [sort[0]]: sort[1] === 'asc' ? 1 : -1 }),
	...params.itemsPerPage && { count: params.itemsPerPage },
	...params.current && { offset: params.current },
}), [JSON.stringify(params), JSON.stringify(sort)]);

// const useResizeInlineBreakpoint = (sizes = [], debounceDelay = 0) => {
// 	const { ref, borderBoxSize } = useResizeObserver({ debounceDelay });
// 	const inlineSize = borderBoxSize ? borderBoxSize.inlineSize : 0;
// 	sizes = useMemo(() => sizes.map((current) => (inlineSize ? inlineSize > current : true)), [inlineSize]);
// 	return [ref, ...sizes];
// };

export default function IntegrationsTableWithData() {
	// const [params, setParams] = useState({ text: '', current: 0, itemsPerPage: 25 });
	// const [sort, setSort] = useState(['name', 'asc']);

	// const debouncedText = useDebouncedValue(params.text, 500);
	// const debouncedSort = useDebouncedValue(sort, 500);
	// const query = useQuery({ ...params, text: debouncedText, type }, debouncedSort);

	const { data } = useEndpointDataExperimental('permissions.listAll', '');
	const { data: roleData } = useEndpointDataExperimental('roles.list', '') || {};

	console.log({
		data,
		roleData,
	});
	if (!roleData || !roleData.roles || !data) {
		return <div></div>;
	}

	return <IntegrationsTable data={data} roles={roleData.roles} />;
}

function IntegrationsTable({
	data,
	roles,
}) {
	const t = useTranslation();

	const router = useRoute('admin-permissions');

	const handleEditRole = useCallback((_id) => () => router.push({ context: 'edit', id: _id }), []);

	const header = useMemo(() => [
		<Th key={'name'} w={'x240'}>{t('Name')}</Th>,
		...roles.map((current) => <Th key={current._id} w='x120'>{current.description || current._id}<Icon name='edit' onClick={handleEditRole(current._id)}/></Th>),
	].filter(Boolean), []);

	const renderRow = useCallback(({ _id, roles: grantedRoles }) => {
		return <Table.Row key={_id} tabIndex={0} role='link' action>
			<Table.Cell withTruncatedText color='default' fontScale='p2'>{t(_id)}</Table.Cell>
			{roles.map((current) => <Table.Cell key={current._id}>
				<CheckBox checked={grantedRoles.includes(current._id)}/>
				{current.description || current._id}
			</Table.Cell>)}
		</Table.Row>;
	}, []);

	return <GenericTable FilterComponent={FilterByText} header={header} renderRow={renderRow} results={data && data.update.slice(0, 30)} total={data && data.total} />;
}
