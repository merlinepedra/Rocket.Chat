import type { BannerPlatform, IBanner } from '@rocket.chat/core-typings';

export type PushEndpoints = {
   'push.token': {
      POST: (params: {}) => void;
   };
};