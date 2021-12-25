// @ts-nocheck
import { Box, Button, Margins, Avatar } from '@rocket.chat/fuselage';
import React, { ReactElement, useCallback } from 'react';

function UserAvatarSuggestions({
	suggestions,
	setAvatarObj,
	setNewAvatarSource,
	disabled,
	...props
}): ReactElement {
	const handleClick = useCallback(
		(suggestion) => (): void => {
			setAvatarObj(suggestion);
			setNewAvatarSource(suggestion.blob);
		},
		[setAvatarObj, setNewAvatarSource],
	);

	return (
		<Margins inline='x4' {...props}>
			{Object.values(suggestions).map((suggestion) => (
				<Button
					key={suggestion.service}
					disabled={disabled}
					square
					onClick={handleClick(suggestion)}
				>
					<Box mie='x4'>
						<Avatar title={suggestion.service} url={suggestion.blob} />
					</Box>
				</Button>
			))}
		</Margins>
	);
}

export default UserAvatarSuggestions;
