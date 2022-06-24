import { Button, Icon } from '@rocket.chat/fuselage';
import colors from '@rocket.chat/fuselage-tokens/colors';
import React, { ReactNode } from 'react';

type ScreenshotCarouselLeftProps = {
	isFirstSlide: boolean;
	handlePrevSlide: () => void;
	prevArrow: ReactNode;
};

const ScreenshotCarouselPrev = ({ isFirstSlide, handlePrevSlide, prevArrow }: ScreenshotCarouselLeftProps): JSX.Element => (
	<>
		{!isFirstSlide && (
			<Button
				onClick={handlePrevSlide}
				display='flex'
				alignItems='center'
				justifyContent='center'
				style={{ top: '50%', left: '10px', cursor: 'pointer', transform: 'translateY(-50%)' }}
				position='absolute'
				zIndex={3}
				borderRadius='x2'
				w='x28'
				h='x28'
				margin='0'
				bg={colors.n600}
				borderColor={colors.n600}
			>
				{prevArrow || <Icon name='chevron-right' size='x24' color='alternative' />}
			</Button>
		)}
	</>
);

export default ScreenshotCarouselPrev;
