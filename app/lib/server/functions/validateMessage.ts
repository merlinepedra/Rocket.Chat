/* eslint-disable @typescript-eslint/camelcase */
/* Validation with AJV*/
import Ajv, { JSONSchemaType } from 'ajv';
import formats from 'ajv-formats';

import { IMessage } from '../../../../definition/IMessage';
// import { MessageAttachment } from '../../../../definition/IMessage/MessageAttachment/MessageAttachment';
import { FileProp } from '../../../../definition/IMessage/MessageAttachment/Files/FileProp';
// import { MessageAttachmentAction } from '../../../../definition/IMessage/MessageAttachment/MessageAttachmentAction';
// import { MessageAttachmentDefault } from '../../../../definition/IMessage/MessageAttachment/MessageAttachmentDefault';

const ajv = new Ajv({ formats: { date: true, time: true } });
formats(ajv);

const MessageAttachmentActionSchema = {
	$id: 'chat.rocket.MessageAttachmentAction.json',
	type: 'object',
	properties: {
		title: { type: 'string' },
		ts: { type: 'string', format: 'date-time' },
		collapsed: { type: 'boolean' },
		description: { type: 'string' },
		title_link: { type: 'string' },
		title_link_download: { type: 'boolean' },
		button_alignment: { type: 'string', enum: ['horizontal', 'vertical'] },
		actions: {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					msgId: { type: 'string' },
					type: { type: 'string', enum: ['button'] },
					text: { type: 'string' },
					msg: { type: 'string' },
					url: { type: 'string' },
					image_url: { type: 'string' },
					is_webview: { type: 'boolean' },
					msg_in_chat_window: { type: 'boolean' },
					msg_processing_type: {
						type: 'string',
						enum: ['sendMessage', 'respondWithMessage', 'respondWithQuotedMessage'],
					},
				},
				required: ['type', 'text'],
			},
		},
	},
	required: [],
	additionalProperties: false,
};

const MessageAttachmentDefaultSchema = {
	$id: 'chat.rocket.MessageAttachmentDefault.json',
	type: 'object',
	properties: {
		author_icon: { type: 'string' },
		author_link: { type: 'string' },
		author_name: { type: 'string' },
		fields: {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					title: { type: 'string' },
					value: { type: 'string' },
					short: { type: 'boolean' },
				},
			},
		},
		image_url: { type: 'string' },
		image_dimensions: {
			type: 'object',
			properties: {
				width: { type: 'number' },
				height: { type: 'number' },
			},
		},
		mrkdwn_in: {
			type: 'array',
			items: {
				type: 'string',
				enum: ['text', 'pretext', 'fields'],
			},
		},
		pretext: { type: 'string' },
		text: { type: 'string' },
		thumb_url: { type: 'string' },
		color: { type: 'string' },
	},
	required: [],
	additionalProperties: false,
};

const AttachmentSchema = {
	$id: 'chat.rocket.Attachment.json',
	anyOf: [
		{
			$ref: 'chat.rocket.MessageAttachmentAction.json',
		},
		{
			$ref: 'chat.rocket.MessageAttachmentDefault.json',
		},
	],
};

const FileAttachmentSchema: JSONSchemaType<FileProp> = {
	$id: 'chat.rocket.FileAttachment.json',
	type: 'object',
	properties: {
		_id: {
			type: 'string',
		},
		name: {
			type: 'string',
		},
		type: {
			type: 'string',
		},
		format: {
			type: 'string',
		},
		size: {
			type: 'number',
		},
	},
	required: ['_id', 'name', 'type', 'format', 'size'],
};

const validateMessageSchema = {
	$id: 'chat.rocket.message.json',
	type: 'object',

	properties: {
		t: {
			type: 'string',
			nullable: true,
		},
		msg: {
			type: 'string',
		},
		rid: {
			type: 'string',
		},
		tmid: {
			type: 'string',
			nullable: true,
		},
		groupable: {
			type: 'boolean',
			nullable: true,
		},
		ts: {
			type: 'string',
			format: 'date',
		},
		channels: {
			type: 'array',
			items: {
				type: 'string',
			},
			minItems: 1,
			uniqueItems: true,
			nullable: true,
		},
		mentions: {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					_id: {
						type: 'string',
					},
					type: {
						type: 'string',
						enum: ['user', 'team'],
					},
					name: {
						type: 'string',
						nullable: true,
					},
					username: {
						type: 'string',
						nullable: true,
					},
				},
				required: ['_id', 'type'],
			},
			minItems: 1,
			uniqueItems: true,
			nullable: true,
		},
		alias: {
			type: 'string',
			nullable: true,
		},
		_hidden: {
			type: 'boolean',
			nullable: true,
		},
		imported: {
			type: 'boolean',
			nullable: true,
		},
		replies: {
			type: 'array',
			items: {
				type: 'string',
			},
			nullable: true,
		},
		location: {
			type: 'object',
			properties: {
				type: {
					type: 'string',
					const: 'Point',
				},
				coordinates: {
					type: 'array',
					items: [{ type: 'string' }, { type: 'string' }],
					minItems: 2,
					maxItems: 2,
				},
			},
			required: ['type', 'coordinates'],
			nullable: true,
		},
		starred: {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					_id: {
						type: 'string',
					},
				},
				required: ['_id'],
			},
			nullable: true,
		},
		pinned: {
			type: 'boolean',
			nullable: true,
		},
		drid: {
			type: 'string',
			nullable: true,
		},
		tlm: {
			type: 'string',
			format: 'date',
		},
		dcount: {
			type: 'number',
			nullable: true,
		},
		tcount: {
			type: 'number',
			nullable: true,
		},
		e2e: {
			type: 'string',
			enum: ['pending'],
			nullable: true,
		},
		u: {
			type: 'object',
			properties: {
				_id: {
					type: 'string',
				},
				username: {
					type: 'string',
				},
				name: {
					type: 'string',
					nullable: true,
				},
			},
			required: ['_id', 'username'],
			additionalProperties: false,
		},
		file: {
			$ref: 'chat.rocket.FileAttachment.json',
		},
		files: {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					_id: {
						type: 'string',
					},
					name: {
						type: 'string',
					},
					type: {
						type: 'string',
					},
					format: {
						type: 'string',
					},
					size: {
						type: 'number',
					},
				},
				required: ['_id', 'name', 'type', 'format', 'size'],
				nullable: true,
			},
			nullable: true,
		},
		urls: {
			type: 'array',
			items: {
				type: 'string',
			},
			nullable: true,
		},
		_id: {
			type: 'string',
		},
		_updatedAt: {
			type: 'string',
			format: 'date',
		},
		blocks: {
			type: 'array',
			items: {
				type: 'object',
				required: [],
			},
		},
		md: {
			type: 'array',
			items: {
				type: 'object',
				required: [],
			},
		},
		attachments: {
			type: 'array',
			items: {
				$ref: 'chat.rocket.Attachment.json',
			},
			minItems: 1,
		},
	},
	additionalProperties: false,
	required: ['msg', 'rid', 'u'],
};

export const validateMessage = ajv
	.addSchema(MessageAttachmentActionSchema)
	.addSchema(MessageAttachmentDefaultSchema)
	.addSchema(AttachmentSchema)
	.addSchema(FileAttachmentSchema)
	.compile<IMessage>(validateMessageSchema);
