/* eslint-env mocha */
import 'babel-polyfill';
import assert from 'assert';

import Markdown from '../newMarkdownClass';

let markdown;
beforeEach(function functionName() {
	markdown = new Markdown(true, true);
});

describe('[Markdown]', () => {
	describe('[Bold Markdown]', () => {
		describe('Sending strings that should not be parsed to bold: ', () => {
			[
				'Hello',
				'*Hello',
				'Hello*',
				'He*llo',
				'***Hello***',
				'***Hello**'
			]
			.forEach(text => {
				it(`it should not return a html with the strong tag with the string ${ text }`, () => {
					assert.notStrictEqual(`<span class="copyonly">*</span><strong>${ text.replace(/\*/g, '') }</strong><span class="copyonly">*</span>`, markdown.parseBold(text));
				});
			});
		});

		describe('Sending strings that should be parsed to bold:', () => {
			[
				'*Hello*',
				'**Hello**'
			].forEach(text => {
				it(`it should return a html with the strong tag with the string ${ text }`, () => {
					assert.strictEqual(`<span class="copyonly">*</span><strong>${ text.replace(/\*/g, '') }</strong><span class="copyonly">*</span>`, markdown.parseBold(text));
				});
			});
		});
		describe('Sending strings that should be partially parsed to bold ', () => {
			[
				'*Hello* this is dog',
				'Rocket cat says *Hello*',
				'He said *Hello* to her',
				'**Hello** this is dog',
				'Rocket cat says **Hello**',
				'He said **Hello** to her'
			].forEach(text => {
				it('it should return a html with a partially parsed to bold', () => {
					assert.equal(markdown.parseBold(text).includes(`<span class="copyonly">*</span><strong>${ text.replace(/\*/g, '') }</strong><span class="copyonly">*</span>`), true);
				});
			});
		});
	});
});

