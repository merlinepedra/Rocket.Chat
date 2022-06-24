import { Box } from '@rocket.chat/fuselage';
import colors from '@rocket.chat/fuselage-tokens/colors';
import React from 'react';

type ScreenshotCarouselOverlayProps = {
	isOverlayVisible?: boolean;
};

const ScreenshotCarouselOverlay = ({ isOverlayVisible = true }: ScreenshotCarouselOverlayProps): JSX.Element => (
	<>{isOverlayVisible && <Box position='fixed' w='100%' h='100vh' bg={colors.n800} opacity='0.7' zIndex='2' marginBlock='-0.75px' />}</>
);

export default ScreenshotCarouselOverlay;
