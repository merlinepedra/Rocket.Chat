import { AppScreenshot } from '@rocket.chat/core-typings';
import { Box } from '@rocket.chat/fuselage';
import React from 'react';

type ScreenshotCarouselListProps = {
	ScreenshotsList: Array<AppScreenshot>;
	currentSlideIndex: number;
	setViewCarousel: (state: boolean) => void;
};

const ScreenshotCarouselList = ({ ScreenshotsList, currentSlideIndex, setViewCarousel }: ScreenshotCarouselListProps): JSX.Element => {
	const handleScreenshotRender = (): JSX.Element[] =>
		ScreenshotsList.map((currentScreenshot, index) => {
			const isCurrentImageOnScreen = index === currentSlideIndex;
			const screenshotWrapperStyle = isCurrentImageOnScreen
				? {
						opacity: '1',
						transitionDuration: '1s',
						transform: 'scale(1.08)',
				  }
				: {
						opacity: '0',
						transitionDuration: '1s ease',
				  };

			return (
				<Box style={screenshotWrapperStyle} key={currentScreenshot.id}>
					{isCurrentImageOnScreen && (
						<Box is='img' src={currentScreenshot.accessUrl} alt='Carousel image' maxWidth='x1200' maxHeight='x600' w='100%' height='100%' />
					)}
				</Box>
			);
		});

	return (
		<>
			<Box
				onClick={(): void => setViewCarousel(false)}
				position='fixed'
				width='100%'
				height='100vh'
				display='flex'
				justifyContent='center'
				alignItems='center'
				zIndex='2'
				mi='x38'
			>
				{handleScreenshotRender()}
			</Box>
		</>
	);
};

export default ScreenshotCarouselList;
