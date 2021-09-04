import { API } from '../../../../api/server';
import { Omnichannel } from '../../../../../server/sdk';

API.v1.addRoute('livechat/appearance', { authRequired: true }, {
	get() {
		const { appearance } = Promise.await(Omnichannel.findAppearance({ userId: this.userId }));

		return API.v1.success({
			appearance,
		});
	},
});
