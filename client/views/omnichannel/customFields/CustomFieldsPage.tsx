// @ts-nocheck
import { Button, Icon } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import React, { ReactElement } from 'react';

import FilterByText from '../../../components/FilterByText';
import GenericTable from '../../../components/GenericTable';
import Page from '../../../components/Page';
import { useRoute } from '../../../contexts/RouterContext';
import { useTranslation } from '../../../contexts/TranslationContext';

const CustomFieldsPage = ({
	data,
	header,
	setParams,
	params,
	title,
	renderRow,
	children,
}): ReactElement => {
	const t = useTranslation();

	const router = useRoute('omnichannel-customfields');

	const onAddNew = useMutableCallback(() => router.push({ context: 'new' }));

	return (
		<Page flexDirection='row'>
			<Page>
				<Page.Header title={title}>
					<Button onClick={onAddNew}>
						<Icon name='plus' size='x16' /> {t('New')}
					</Button>
				</Page.Header>
				<Page.Content>
					<GenericTable
						header={header}
						renderRow={renderRow}
						results={data?.customFields}
						total={data?.total}
						setParams={setParams}
						params={params}
						renderFilter={({ onChange, ...props }): ReactElement => (
							<FilterByText onChange={onChange} {...props} />
						)}
					/>
				</Page.Content>
			</Page>
			{children}
		</Page>
	);
};

export default CustomFieldsPage;
