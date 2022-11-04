import { Uploads } from '@rocket.chat/models';

import { addMigration } from '../../lib/migrations';

const batchSize = 5000;
// proportion rate error margin 7%
const epsilon = 0.07;
// 2 seconds
const thumbCreationTimeout = 2000;

const getAspectRatio = (image: Record<string, any>): number => image.identify.size.width / image.identify.size.height;

async function migrateThumbnails(total: number, current: number): Promise<any> {
	const thumbs: any[] = [];
	const cursor = await Uploads.find(
		{ typeGroup: 'image', uploadedAt: { $gte: new Date('2021-08-31T00:00:00.000Z') } },
		{ sort: { rid: 1 } },
	);
	const currentImages = await cursor.skip(current).limit(batchSize).toArray();

	await Promise.all(
		currentImages.map(async (image: any) => {
			const possibleThumbnails = Uploads.find({ name: `thumb-${image.name}` });

			await possibleThumbnails.forEach((thumb: Record<string, any>) => {
				const aspectRatioProportion = getAspectRatio(image) / getAspectRatio(thumb);
				const uploadedAtDelta = thumb.uploadedAt - image.uploadedAt;

				if (uploadedAtDelta < thumbCreationTimeout && Math.abs(1 - aspectRatioProportion) < epsilon) {
					thumbs.push({
						updateOne: {
							filter: { _id: thumb._id },
							update: {
								$set: {
									_hidden: true,
								},
							},
						},
					});
				}
			});
		}),
	);

	const batch = await Uploads.insertMany(thumbs, { ordered: false });

	if (currentImages.length === batchSize) {
		return migrateThumbnails(total, current + batchSize);
	}
	return batch;
}

addMigration({
	version: 282,
	up() {
		// thumbnails were introduced on 3.18 release ( 31 of august ) + add sort
		const total = Promise.await(
			Uploads.col.countDocuments({ typeGroup: 'image', uploadedAt: { $gte: new Date('2021-08-31T00:00:00.000Z') } }),
		);

		Promise.await(migrateThumbnails(total, 0));
	},
});
