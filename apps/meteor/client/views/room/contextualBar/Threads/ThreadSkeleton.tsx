import { Box } from '@rocket.chat/fuselage';
import React, { ReactElement, useMemo } from 'react';

import VerticalBar from '../../../../components/VerticalBar';

type ThreadSkeletonProps = {
	expanded: boolean;
};

const ThreadSkeleton = ({ expanded }: ThreadSkeletonProps): ReactElement => {
	const style = useMemo(
		() =>
			document.dir === 'rtl'
				? {
						left: 0,
						borderTopRightRadius: 4,
				  }
				: {
						right: 0,
						borderTopLeftRadius: 4,
				  },
		[],
	);

	return (
		<Box flexGrow={1} position={expanded ? 'static' : 'relative'}>
			<VerticalBar.Skeleton
				className='rcx-thread-view'
				position='absolute'
				display='flex'
				flexDirection='column'
				width={'full'}
				maxWidth={855}
				overflow='hidden'
				zIndex={100}
				insetBlock={0}
				style={style}
			/>
		</Box>
	);
};

export default ThreadSkeleton;
