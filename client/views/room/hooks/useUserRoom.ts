// @ts-nocheck
import { useCallback } from 'react';

import { Rooms } from '../../../../app/models/client';
import { IRoom } from '../../../../definition/IRoom';
import { useReactiveValue } from '../../../hooks/useReactiveValue';

export const useUserRoom = (rid, fields): IRoom | undefined =>
	useReactiveValue(useCallback(() => Rooms.findOne({ _id: rid }, { fields }), [rid, fields]));
