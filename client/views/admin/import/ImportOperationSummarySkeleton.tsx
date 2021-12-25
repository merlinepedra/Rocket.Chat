// @ts-nocheck
import { Skeleton, Table } from '@rocket.chat/fuselage';
import React, { ReactElement } from 'react';

function ImportOperationSummarySkeleton({ small }): ReactElement {
	return (
		<Table.Row>
			<Table.Cell>
				<Skeleton />
			</Table.Cell>
			<Table.Cell>
				<Skeleton />
			</Table.Cell>
			{!small && (
				<>
					<Table.Cell>
						<Skeleton />
					</Table.Cell>
					<Table.Cell>
						<Skeleton />
					</Table.Cell>
					<Table.Cell>
						<Skeleton />
					</Table.Cell>
					<Table.Cell>
						<Skeleton />
					</Table.Cell>
					<Table.Cell>
						<Skeleton />
					</Table.Cell>
					<Table.Cell>
						<Skeleton />
					</Table.Cell>
				</>
			)}
		</Table.Row>
	);
}

export default ImportOperationSummarySkeleton;
