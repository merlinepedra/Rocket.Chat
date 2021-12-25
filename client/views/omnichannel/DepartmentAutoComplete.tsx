// @ts-nocheck
import { AutoComplete, Option, Icon } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import React, { memo, ReactElement, useMemo, useState } from 'react';

import { useEndpointData } from '../../hooks/useEndpointData';

const query = (term = '', enabled = false, onlyMyDepartments = false): unknown => ({
	selector: JSON.stringify({
		term,
		...(enabled && { conditions: { enabled } }),
	}),
	onlyMyDepartments,
});

const DepartmentAutoComplete = (props): ReactElement => {
	const { enabled, onlyMyDepartments = false } = props;
	const [filter, setFilter] = useState('');
	const { value: data } = useEndpointData(
		'livechat/department.autocomplete',
		useMemo(() => query(filter, enabled, onlyMyDepartments), [onlyMyDepartments, enabled, filter]),
	);

	const options = useMemo(
		() =>
			data?.items.map((department) => ({ value: department._id, label: department.name })) || [],
		[data],
	);
	const onClickRemove = useMutableCallback(() => props.onChange(''));
	return (
		<AutoComplete
			{...props}
			filter={filter}
			setFilter={setFilter}
			renderSelected={({ value, label, ...props }): ReactElement => (
				<Option key={value} {...props} onClick={onClickRemove}>
					{label}
					<Icon name='cross' />
				</Option>
			)}
			renderItem={({ value, label, ...props }): ReactElement => (
				<Option key={value} {...props}>
					{label}
				</Option>
			)}
			options={options}
		/>
	);
};

export default memo(DepartmentAutoComplete);
