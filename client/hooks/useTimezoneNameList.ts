// @ts-nocheck
import moment from 'moment-timezone';
import { useMemo } from 'react';

export const useTimezoneNameList = (): unknown[] => useMemo(() => moment.tz.names(), []);
