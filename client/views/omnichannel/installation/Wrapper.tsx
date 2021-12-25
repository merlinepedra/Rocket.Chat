// @ts-nocheck
import { Box } from '@rocket.chat/fuselage';
import React, { ReactElement } from 'react';

const Wrapper = (text): ReactElement => (
	<Box
		fontFamily='mono'
		alignSelf='center'
		fontScale='p3'
		style={{ wordBreak: 'break-all' }}
		mie='x4'
		flexGrow={1}
		withRichContent
	>
		<pre>
			<code>{text}</code>
		</pre>
	</Box>
);

export default Wrapper;
