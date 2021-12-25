// @ts-nocheck
import { Icon } from '@rocket.chat/fuselage';
import React, { ReactElement, useEffect, useRef, useState } from 'react';

import { useConnectionStatus } from '../../contexts/ConnectionStatusContext';
import { useTranslation } from '../../contexts/TranslationContext';
import './ConnectionStatusBar.css';

const getReconnectCountdown = (retryTime): number => {
	const timeDiff = retryTime - Date.now();
	return (timeDiff > 0 && Math.round(timeDiff / 1000)) || 0;
};

const useReconnectCountdown = (retryTime, status): number => {
	const reconnectionTimerRef = useRef();
	const [reconnectCountdown, setReconnectCountdown] = useState(() =>
		getReconnectCountdown(retryTime),
	);

	useEffect(() => {
		if (status === 'waiting') {
			if (reconnectionTimerRef.current) {
				return;
			}

			reconnectionTimerRef.current = setInterval(() => {
				setReconnectCountdown(getReconnectCountdown(retryTime));
			}, 500);
			return;
		}

		clearInterval(reconnectionTimerRef.current);
		reconnectionTimerRef.current = null;
	}, [retryTime, status]);

	useEffect(
		() => (): void => {
			clearInterval(reconnectionTimerRef.current);
		},
		[],
	);

	return reconnectCountdown;
};

function ConnectionStatusBar(): ReactElement {
	const { connected, retryTime, status, reconnect } = useConnectionStatus();
	const reconnectCountdown = useReconnectCountdown(retryTime, status);
	const t = useTranslation();

	if (connected) {
		return null;
	}

	const handleRetryClick = (event): void => {
		event.preventDefault();
		reconnect?.();
	};

	return (
		<div className='ConnectionStatusBar' role='alert'>
			<strong>
				<Icon name='warning' /> {t('meteor_status', { context: status })}
			</strong>

			{status === 'waiting' && (
				<> {t('meteor_status_reconnect_in', { count: reconnectCountdown })}</>
			)}

			{['waiting', 'offline'].includes(status) && (
				<>
					{' '}
					<a className='ConnectionStatusBar__retry-link' href='#' onClick={handleRetryClick}>
						{t('meteor_status_try_now', { context: status })}
					</a>
				</>
			)}
		</div>
	);
}

export default ConnectionStatusBar;
