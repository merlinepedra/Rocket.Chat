import { AppScreenshot } from '@rocket.chat/core-typings';
import React, { ReactElement } from 'react';

import ScreenshotCarouselList from './ScreenshotCarouselList';
import ScreenshotCarouselNext from './ScreenshotCarouselNext';
import ScreenshotCarouselOverlay from './ScreenshotCarouselOverlay';
import ScreenshotCarouselPrev from './ScreenshotCarouselPrev';

type ScreenshotCarouselProps = {
	ScreenshotsList: Array<AppScreenshot>;
	setViewCarousel: (state: boolean) => void;
	handleNextSlide: () => void;
	handlePrevSlide: () => void;
	isFirstSlide: boolean;
	isLastSlide: boolean;
	currentSlideIndex: number;
};

const ScreenshotCarousel = ({
	ScreenshotsList,
	setViewCarousel,
	handleNextSlide,
	handlePrevSlide,
	isFirstSlide,
	isLastSlide,
	currentSlideIndex,
}: ScreenshotCarouselProps): ReactElement => (
	<>
		<ScreenshotCarouselOverlay />

		<ScreenshotCarouselPrev isFirstSlide={isFirstSlide} handlePrevSlide={handlePrevSlide} />

		<ScreenshotCarouselNext isLastSlide={isLastSlide} handleNextSlide={handleNextSlide} />

		<ScreenshotCarouselList ScreenshotsList={ScreenshotsList} setViewCarousel={setViewCarousel} currentSlideIndex={currentSlideIndex} />
	</>
);

export default ScreenshotCarousel;
