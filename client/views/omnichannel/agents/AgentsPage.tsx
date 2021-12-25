// @ts-nocheck
import React, { ReactElement } from 'react';

import FilterByText from '../../../components/FilterByText';
import GenericTable from '../../../components/GenericTable';
import Page from '../../../components/Page';
import AddAgent from './AddAgent';

function AgentsPage({
	data,
	reload,
	header,
	setParams,
	params,
	title,
	renderRow,
	children,
}): ReactElement {
	return (
		<Page flexDirection='row'>
			<Page>
				<Page.Header title={title} />
				<AddAgent reload={reload} pi='x24' />
				<Page.Content>
					<GenericTable
						header={header}
						renderRow={renderRow}
						results={data?.users}
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
}

export default AgentsPage;
