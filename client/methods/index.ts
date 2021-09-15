import { Meteor } from 'meteor/meteor';

import type { MethodName, MethodParams, MethodReturn } from '../../server/methods';

export const call = <M extends MethodName>(
	methodName: M,
	...params: MethodParams<M>
): Promise<MethodReturn<M>> =>
	new Promise((resolve, reject) => {
		Meteor.call(methodName, ...params, (error: Meteor.Error | null, result: MethodReturn<M>) => {
			if (error) {
				reject(error);
				return;
			}

			resolve(result);
		});
	});
