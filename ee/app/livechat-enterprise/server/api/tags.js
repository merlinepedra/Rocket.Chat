import { API } from '../../../../../app/api/server';
import { findTags, findTagById, findTagsByIds } from './lib/tags';

API.v1.addRoute('livechat/tags.list', { authRequired: true }, {
	get() {
		const { offset, count } = this.getPaginationItems();
		const { sort } = this.parseJsonQuery();
		const { text } = this.queryParams;

		return API.v1.success(Promise.await(findTags({
			userId: this.userId,
			text,
			pagination: {
				offset,
				count,
				sort,
			},
		})));
	},
});

API.v1.addRoute('livechat/tags.getOne', { authRequired: true }, {
	get() {
		const { tagId } = this.queryParams;

		return API.v1.success(Promise.await(findTagById({
			userId: this.userId,
			tagId,
		})));
	},
});

API.v1.addRoute('livechat/tags', { authRequired: true }, {
	get() {
		const { ids } = this.queryParams;

		if (!Array.isArray(ids)) {
			throw new Error('error-invalid-ids');
		}

		return API.v1.success(Promise.await(findTagsByIds({ userId: this.userId, ids })));
	},
});
