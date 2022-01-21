/* eslint-disable @typescript-eslint/camelcase */
import { assert } from 'chai';

import { validateMessage } from './validateMessage';

describe('validateMessage ', () => {
	it('should be a function', () => {
		assert.isFunction(validateMessage);
	});

	it('should return false no param is provided', () => {
		assert.isFalse(validateMessage({}));
		assert.isFalse(validateMessage(null));
		assert.isFalse(validateMessage(undefined));
	});

	it('should return false if the message is not an object', () => {
		assert.isFalse(validateMessage('foo'));
		assert.isFalse(validateMessage(1));
		assert.isFalse(validateMessage(true));
		assert.isFalse(validateMessage(false));
	});

	it('should return false if the message is missing the required properties', () => {
		assert.isFalse(
			validateMessage({
				msg: 'foo',
				rid: 'bar',
			}),
		);
	});

	it('should return true if the message is valid', () => {
		assert.isTrue(
			validateMessage({
				msg: 'foo',
				rid: 'bar',
				u: {
					_id: 'foo',
					username: 'bar',
				},
			}),
		);
		assert.isTrue(
			validateMessage({
				msg: 'foo',
				rid: 'bar',
				u: {
					_id: 'foo',
					username: 'bar',
					name: 'baz',
				},
			}),
		);
	});
	it('should return false if u is invalid', () => {
		assert.isFalse(
			validateMessage({
				msg: 'foo',
				rid: 'bar',
				u: {
					_id: 'foo',
					username: 'bar',
					name: 'baz',
					foo: 'bar',
				},
			}),
		);
	});
	it('should return false if the message attachments is invalid', () => {
		assert.isFalse(
			validateMessage({
				msg: 'foo',
				rid: 'bar',
				u: {
					_id: 'foo',
					username: 'bar',
					name: 'baz',
				},
				attachments: {
					foo: 'bar',
				},
			}),
		);
	});
	it('should return false if the message attachments is empty', () => {
		assert.isFalse(
			validateMessage({
				msg: 'foo',
				rid: 'bar',
				u: {
					_id: 'foo',
					username: 'bar',
					name: 'baz',
				},
				attachments: [],
			}),
		);
	});

	it('should return true if the message attachments is valid', () => {
		assert.isTrue(
			validateMessage({
				msg: 'foo',
				rid: 'bar',
				u: {
					_id: 'foo',
					username: 'bar',
					name: 'baz',
				},
				attachments: [
					{
						author_icon: 'foo',
						author_link: 'bar',
						author_name: 'baz',
						fields: [
							{
								title: 'foo',
								value: 'bar',
								short: true,
							},
						],
						image_url: 'foo',
						image_dimensions: {
							width: 1,
							height: 1,
						},

						mrkdwn_in: ['pretext', 'text', 'fields'],
						pretext: 'foo',
						text: 'bar',
						thumb_url: 'foo',
						color: 'foo',
					},
				],
			}),
		);
	});

	it('should return false if extra properties are provided', () => {
		assert.isFalse(
			validateMessage({
				msg: 'foo',
				rid: 'bar',
				u: {
					_id: 'foo',
					username: 'bar',
				},
				foo: 'bar',
			}),
		);
	});

	it('should return false if the message file is invalid', () => {
		assert.isFalse(
			validateMessage({
				msg: 'foo',
				rid: 'bar',
				u: {
					_id: 'foo',
					username: 'bar',
				},
				file: {
					foo: 'bar',
				},
			}),
		);
	});

	it('should return true if the message file is valid', () => {
		assert.isTrue(
			validateMessage({
				msg: 'foo',
				rid: 'bar',
				u: {
					_id: 'foo',
					username: 'bar',
				},
				file: {
					_id: 'foo',
					name: 'bar',
					size: 1,
					type: 'bar',
					format: 'baz',
				},
			}),
		);
	});
	it('should return false if the message files is invalid', () => {
		assert.isFalse(
			validateMessage({
				msg: 'foo',
				rid: 'bar',
				u: {
					_id: 'foo',
					username: 'bar',
				},
				files: {
					foo: 'bar',
				},
			}),
		);
	});
	it('should return true if the message files is valid', () => {
		assert.isTrue(
			validateMessage({
				msg: 'foo',
				rid: 'bar',
				u: {
					_id: 'foo',
					username: 'bar',
				},
				files: [
					{
						_id: 'foo',
						name: 'bar',
						size: 1,
						type: 'bar',
						format: 'baz',
					},
				],
			}),
		);
	});
});
