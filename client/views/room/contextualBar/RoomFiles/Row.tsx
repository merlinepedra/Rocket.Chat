// @ts-nocheck
import React, { memo, ReactElement } from 'react';

import FileItem from './components/FileItem';

const Row = ({ item, data, index }): ReactElement => {
	const { onClickDelete, isDeletionAllowed } = data;

	return (
		item && (
			<FileItem
				index={index}
				fileData={item}
				onClickDelete={onClickDelete}
				isDeletionAllowed={isDeletionAllowed}
			/>
		)
	);
};

export default memo(Row);
