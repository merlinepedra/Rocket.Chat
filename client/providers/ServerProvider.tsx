import { Meteor } from 'meteor/meteor';
import React, { FC, ContextType } from 'react';

import { Info as info, APIClient } from '../../app/utils/client';
import {
	ServerContext,
	ServerMethodReturn,
} from '../contexts/ServerContext';

const absoluteUrl = (path: string): string => Meteor.absoluteUrl(path);

const callMethod: ContextType<typeof ServerContext>['callMethod'] = (
	methodName,
	...args
) =>
	new Promise((resolve, reject) => {
		Meteor.call(methodName, ...args, (error: Error, result: ServerMethodReturn<typeof methodName>) => {
			if (error) {
				reject(error);
				return;
			}

			resolve(result);
		});
	});

const callEndpoint: ContextType<typeof ServerContext>['callEndpoint'] = (
	method,
	path,
	...params
) => {
	const api = path[0] === '/' ? APIClient : APIClient.v1;
	const endpointPath = path[0] === '/' ? path.slice(1) : path;

	const shiftedParams = params.shift();
	switch (method) {
		case 'GET':
			return api.get(endpointPath, shiftedParams);

		case 'POST':
			return api.post(endpointPath, {}, shiftedParams);

		case 'DELETE':
			return api.delete(endpointPath, shiftedParams);

		default:
			throw new Error('Invalid HTTP method');
	}
};

const uploadToEndpoint: ContextType<typeof ServerContext>['uploadToEndpoint'] = (endpoint, params, formData) => {
	if (endpoint[0] === '/') {
		return APIClient.upload(endpoint.slice(1), params, formData).promise;
	}

	return APIClient.v1.upload(endpoint, params, formData).promise;
};

const getStream: ContextType<typeof ServerContext>['getStream'] = (
	streamName,
	options = {},
) => {
	const streamer = Meteor.StreamerCentral.instances[streamName]
		? Meteor.StreamerCentral.instances[streamName]
		: new Meteor.Streamer(streamName, options);

	return (eventName, callback): (() => void) => {
		streamer.on(eventName, callback);
		return (): void => {
			streamer.removeListener(eventName, callback);
		};
	};
};

const contextValue = {
	info,
	absoluteUrl,
	callMethod,
	callEndpoint,
	uploadToEndpoint,
	getStream,
};

const ServerProvider: FC = ({ children }) => (
	<ServerContext.Provider children={children} value={contextValue} />
);

export default ServerProvider;
