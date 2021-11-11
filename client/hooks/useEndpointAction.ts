import { useCallback } from 'react';

import { Serialized } from '../../definition/Serialized';
import { useEndpoint } from '../contexts/ServerContext';
import { Method, Params, PathFor, Return } from '../contexts/ServerContext/endpoints';
import { useToastMessageDispatch } from '../contexts/ToastMessagesContext';

const isAcceptingParams = (_f: (() => any) | ((params: any) => any), params: any): _f is ((params: any) => any) => params !== undefined;



export const useEndpointAction = <M extends Method, P extends PathFor<M>>(
	method: M,
	path: P,
	params?: Params<M, P>[0],
	successMessage?: string,
): ((extraParams?: Params<M, P>[1]) => Promise<Serialized<Return<M, P>>>) => {
	const sendData = useEndpoint(method, path);
	const dispatchToastMessage = useToastMessageDispatch();
	
	return useCallback(async () => {
		try {
			let data;
			data = await sendData(params);
			if (isAcceptingParams(sendData, params)) {
			} else {
				data = await sendData(params);
			}
			// if (Array.isArray(params)) {
			// 	if ()
			// } else if (isAcceptingParams(sendData, params)) {
			// 	data = await sendData(params);
			// }
		
			// if (isAcceptingParams(sendData, params)) {
			// } else {
			// 	data = await sendData();
			// }

			if (successMessage) {
				dispatchToastMessage({ type: 'success', message: successMessage });
			}

			return data;
		} catch (error) {
			if (error instanceof Error || typeof error === 'string') {
				dispatchToastMessage({ type: 'error', message: error });
			}
			throw error;
		}
	}, [dispatchToastMessage, params, sendData, successMessage]);
};

