// @ts-nocheck
import { useCallback } from 'react';

import { Roles } from '../../../../app/models/client';
import { IRoom } from '../../../../definition/IRoom';
import { useReactiveValue } from '../../../hooks/useReactiveValue';

export const useRole = (_id): IRoom | undefined =>
	useReactiveValue(useCallback(() => Roles.findOne({ _id }), [_id]));
