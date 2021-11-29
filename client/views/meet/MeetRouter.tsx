import React, { ReactElement, ReactNode, Suspense } from 'react';

import PageSkeleton from '../../components/PageSkeleton';

const MeetRouter = ({ renderRoute }: { renderRoute?: () => ReactNode }): ReactElement => (
	<>
		{renderRoute ? (
			<Suspense fallback={<PageSkeleton />}>{renderRoute()}</Suspense>
		) : (
			<PageSkeleton />
		)}
	</>
);
export default MeetRouter;
