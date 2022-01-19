/* Validation with AJV*/
import Ajv, { JSONSchemaType } from 'ajv';

const ajv = new Ajv();

// Generic function
export type FunctionType = <T>(schema: object, data: T) => void;

/*How to use the const ValidFullURLParam, in order to prevent malicious href values with AJV?*/

const validateMessageSchema: JSONSchemaType<FunctionType> = {
	oneOf: [
		{ //checkMessageSchema
			type: 'object',
			properties: {
				_id: {type: 'string'},
				msg: {type: 'string'},
				text: {type: 'string'},
				alias: {type: 'string'},
				emoji: {type: 'string'},
				tmid: {type: 'string'},
				tshow: {type: 'boolean'},
				avatar: {type: 'boolean'},
				attachments: {type: 'unknown', minItems: 1}, //[Match.Any]: array?
				blocks: {type: 'unknown'}
			},
		
			additionalProperties: false
		},

		{ //checkAttachmentSchema
			type: 'object', //array?
			properties: {
				text: {type: 'string'},
				ts: {
					anyOf: [
						{ type: 'string' },
						{ type: 'number' },
					]
				},
				thumb_url: {type: 'boolean'},
				button_alignment: {type: 'string'},
				actions: {type: 'unknown'},
				message_link: {type: 'boolean'},
				collapsed: {type: 'boolean'},
				author_name: {type: 'string'},
				author_link: {type: 'boolean'},
				author_icon: {type: 'boolean'},
				title: {type: 'string'},
				title_link: {type: 'boolean'},
				title_link_download: {type: 'boolean'},
				image_dimensions: {type: 'object'},
				image_url: {type: 'boolean'},
				image_preview: {type: 'string'},
				image_type: {type: 'string'},
				image_size: {type: 'number'},
				audio_url: {type: 'boolean'},
				audio_type: {type: 'string'},
				audio_size: {type: 'number'},
				video_url: {type: 'boolean'},
				video_type: {type: 'string'},
				video_size: {type: 'number'},
				fields: {type: 'array', minItems: 1}, //unknown
		
			},
			
			minItems: 1, //object?
			additionalProperties: false
		},

		{ //checkAttachmentActionsSchema
			type: 'object', //array?
			properties: {
				type: {type: 'string'},
				text: {type: 'string'},
				url: {type: 'boolean'},
				image_url: {type: 'boolean'},
				is_webview: {type: 'boolean'},
				webview_height_ratio: {type: 'string'},
				msg: {type: 'string'},
				msg_in_chat_window: {type: 'boolean'}
			},
		
			minItems: 1, //object?
			additionalProperties: false
		},

		{ //checkAttachmentsFieldsSchema
			type: 'object',
			properties: {
					short: {type: 'boolean'},
					title: {type: 'string'},
					value: {
						anyOf: [
							{ type: 'string' },
							{ type: 'number' },
							{ type: 'boolean' },
						]
					},
			},
		
			minItems: 1, //object?
			additionalProperties: false
		}
	]
};

export const isValidatedMessage = ajv.compile(validateMessageSchema);