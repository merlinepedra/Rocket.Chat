import { createRouteGroup } from '../../lib/createRouteGroup';

export const registerMeetRouter = createRouteGroup('meet', '/meet', () => import('./MeetRouter'));

registerMeetRouter('/omnichannel/:rid', {
	name: 'meet-omnichannel',
	lazyRouteComponent: () => import('./MeetPage'),
});
