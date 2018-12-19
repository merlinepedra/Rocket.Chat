import create from './create';
import send from './send';
import edit from './edit';
import update from './update';

import remove from './remove';
import del from './delete';

export default {
	version: 1,
	settings: {
		$noVersionPrefix: true,
	},
	name: 'message',
	// mixins: [applyMeteorMixin()], // TODO remove
	actions: {
		...create,
		...send,

		...edit,
		...update,

		...remove,
		...del,
	},
};
