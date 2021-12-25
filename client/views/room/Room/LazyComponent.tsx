// @ts-nocheck
import React, { ReactElement, Suspense } from 'react';

import VerticalBar from '../../../components/VerticalBar';

const LazyComponent = ({ template: TabbarTemplate, ...props }): ReactElement => (
	<Suspense fallback={<VerticalBar.Skeleton />}>
		<TabbarTemplate {...props} />
	</Suspense>
);

export default LazyComponent;
