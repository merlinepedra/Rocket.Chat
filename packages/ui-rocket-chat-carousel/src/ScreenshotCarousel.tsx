import { AppScreenshot } from '@rocket.chat/core-typings';
import React, { ReactElement, ReactNode } from 'react';

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
	prevArrow?: ReactNode;
	nextArrow?: ReactNode;
	isOverlayVisible?: boolean;
};

const ScreenshotCarousel = ({
	ScreenshotsList,
	setViewCarousel,
	handleNextSlide,
	handlePrevSlide,
	isFirstSlide,
	isLastSlide,
	currentSlideIndex,
	prevArrow,
	nextArrow,
	isOverlayVisible,
}: ScreenshotCarouselProps): ReactElement => (
	<>
		<ScreenshotCarouselOverlay isOverlayVisible={isOverlayVisible} />

		<ScreenshotCarouselPrev isFirstSlide={isFirstSlide} handlePrevSlide={handlePrevSlide} prevArrow={prevArrow} />

		<ScreenshotCarouselNext isLastSlide={isLastSlide} handleNextSlide={handleNextSlide} nextArrow={nextArrow} />

		<ScreenshotCarouselList ScreenshotsList={ScreenshotsList} setViewCarousel={setViewCarousel} currentSlideIndex={currentSlideIndex} />
	</>
);

export default ScreenshotCarousel;
