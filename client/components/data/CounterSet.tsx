// @ts-nocheck
import { Grid } from '@rocket.chat/fuselage';
import React, { ReactElement } from 'react';

import Counter from './Counter';

type CounterSetProps = {
	counters?: {
		count: ReactNode;
		variation?: ReactNode;
		description: ReactNode;
	}[];
};

function CounterSet({ counters = [] }: CounterSetProps): ReactElement {
	return (
		<Grid>
			{counters.map(({ count, variation, description }, i) => (
				<Grid.Item key={i}>
					<Counter count={count} variation={variation} description={description} />
				</Grid.Item>
			))}
		</Grid>
	);
}

export default CounterSet;
