import React from 'react';

import BackgroundImage from './BackgroundImage';
import { useAutoToggle } from '../../../.storybook/hooks';

export default {
	title: 'views/notFound/BackgroundImage',
	component: BackgroundImage,
};

export const Default = () =>
	<BackgroundImage />;

export const Dark = () =>
	<BackgroundImage dark />;

export const Light = () =>
	<BackgroundImage dark={false} />;

export const Transitioning = () =>
	<BackgroundImage dark={useAutoToggle(true)} />;
