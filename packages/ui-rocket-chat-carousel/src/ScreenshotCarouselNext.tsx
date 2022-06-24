import { Button, Icon } from '@rocket.chat/fuselage';
import colors from '@rocket.chat/fuselage-tokens/colors';
import React, { ReactNode } from 'react';

type ScreenshotCarouselRightProps = {
	isLastSlide: boolean;
	handleNextSlide: () => void;
	nextArrow: ReactNode;
};

const ScreenshotCarouselNext = ({ isLastSlide, handleNextSlide, nextArrow }: ScreenshotCarouselRightProps): JSX.Element => (
	<>
		{!isLastSlide && (
			<Button
				onClick={handleNextSlide}
				display='flex'
				alignItems='center'
				justifyContent='center'
				style={{ top: '50%', right: '10px', cursor: 'pointer', transform: 'translateY(-50%)' }}
				position='absolute'
				zIndex={3}
				borderRadius='x2'
				w='x28'
				h='x28'
				margin='0'
				bg={colors.n600}
				borderColor={colors.n600}
			>
				{nextArrow || <Icon name='chevron-left' size='x24' color='alternative' />}
			</Button>
		)}
	</>
);

export default ScreenshotCarouselNext;
