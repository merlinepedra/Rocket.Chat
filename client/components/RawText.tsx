// @ts-nocheck
import React, { ReactElement } from 'react';

const RawText = ({ children }): ReactElement => (
	<span dangerouslySetInnerHTML={{ __html: children }} />
);

export default RawText;
