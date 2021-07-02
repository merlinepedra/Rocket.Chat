import { PreviewBlock, VisibilityTypesInternal } from '@rocket.chat/ui-kit';

type OembedUrlLegacy = {
	url: string;
	meta: Record<string, string>;
}

type OembedMeta = Partial<{
	siteName: string; // nome
	siteUrl: string; // parsedUrl.host
	// siteColor: string; // ogColor
	title: string; // ogTitle
	description: string; // ogDescription
	// author: string; // ??
	image: {
		preview?: string; // base64 low res preview
		src: string;
		dimensions: {
			width?: number;
			height?: number;
		};
	};
	url: string;
	type: string; // OembedType
}>

/*
OembedType
	external - preview com jump to
	embedded - play and preview com jump to
	video - attachment
	image - attachment
	audio - attachment
*/

export const normalizeMeta = ({ url, meta }: OembedUrlLegacy): OembedMeta => {
	const image = meta.ogImage || meta.twitterImage || meta.msapplicationTileImage || meta.oembedThumbnailUrl;
	return Object.fromEntries(Object.entries({
		siteName: meta.ogSiteName,
		siteUrl: meta.ogUrl || meta.oembedProviderUrl,
		title: meta.ogTitle || meta.twitterTitle || meta.title || meta.pageTitle,
		description: meta.ogDescription || meta.twitterDescription || meta.description,
		...image && {
			image: {
				url: image,
				dimensions: {
					...meta.ogImageHeight && { height: meta.ogImageHeight },
					...meta.ogImageHeight && { width: meta.ogImageWidth },
				},
			},
		},
		url,
		type: meta.ogType,
	}).filter(([, value]) => value));
};

export const convertOembedToUiKit = (urls: OembedUrlLegacy[]): PreviewBlock<VisibilityTypesInternal>[] =>
	urls
		.filter(({ meta }) => Boolean(meta))
		.map(normalizeMeta)
		.map(({ title, description, url, image, type }) => ({
			type: 'preview',
			title: {
				type: 'plain_text',
				text: title,
			},
			description: {
				type: 'plain_text',
				text: description,
			},
			...url && { externalUrl: url },
			...image && {
				[image.dimensions.height && image.dimensions ? 'preview' : 'thumb']: image,
			},
		}));
