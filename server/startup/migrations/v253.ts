import { Rooms, Settings } from '../../../app/models/server/raw';
// import { IOmnichannelRoom, OmnichannelSourceType } from '../../../definition/IRoom';
import { addMigration } from '../../lib/migrations';

addMigration({
	version: 253,
	async up() {
		await Settings.updateOne(
			{ _id: 'Country' },
			{
				$set: {
					values: 
				},
			},
		);
	},
});
