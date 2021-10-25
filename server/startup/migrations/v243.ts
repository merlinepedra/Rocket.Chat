import { addMigration } from '../../lib/migrations';
import { Uploads } from '../../../app/models/server';


addMigration({
	version: 243,
	up() {
		const images = Uploads.model.rawCollection().find({ typeGroup: 'image' });
		const getAspectRatio = (image: Record<string, any>): number => image.identify.size.width / image.identify.size.height;

		// proportion rate error margin 7%
		const epsilon = 0.07;

		// 2 seconds
		const thumbCreationTimeout = 2000;

		images.forEach(
			(image: Record<string, any>) => {
				const possibleThumbnails = Uploads.model.rawCollection().find({ name: `thumb-${ image.name }` });
				if (!possibleThumbnails.count()) { return; }

				possibleThumbnails.forEach(
					(thumb: Record<string, any>) => {
						const aspectRatioProportion = getAspectRatio(image) / getAspectRatio(thumb);
						const uploadedAtDelta = thumb.uploadedAt - image.uploadedAt;

						if (uploadedAtDelta < thumbCreationTimeout && (Math.abs(1 - aspectRatioProportion) < epsilon)) {
							Uploads.model.rawCollection().update(
								{
									_id: thumb._id,
								},
								{
									$set: {
										_hidden: true,
									},
								});
						}
					},
				);
			},
		);
	},
});
