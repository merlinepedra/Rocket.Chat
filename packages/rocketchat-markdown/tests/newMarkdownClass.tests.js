/* eslint-env mocha */
import 'babel-polyfill';
import assert from 'assert';

import Markdown from '../newMarkdownClass';

let markdown;
beforeEach(() => {
	markdown = new Markdown(true, true);
});

describe.only('[Markdown]', () => {
	describe('[Bold Markdown]', () => {
		describe('Should Parse:', () => {
			[
				'*Hello*',
				'**Hello**',
				'*Hello**',
				'**Hello*'
			].forEach(text => {
				it(`it should return a html with the <strong> tag when sending the string ${ text }`, () => {
					assert.strictEqual(markdown.parseBold(text), `<span class="copyonly">*</span><strong>${ text.replace(/\*/g, '') }</strong><span class="copyonly">*</span>`);
				});
			});
		});

		describe('Should NOT Parse: ', () => {
			[
				'Hello',
				'*Hello',
				'Hello*',
				'He*llo',
				'***Hello***',
				'***Hello**',
				'_Hello_',
				'`Hello`'
			]
			.forEach(text => {
				it(`it should NOT return a html with the <strong> tag when sending the string ${ text }`, () => {
					assert.notStrictEqual(markdown.parseBold(text), `<span class="copyonly">*</span><strong>${ text.replace(/\*/g, '') }</strong><span class="copyonly">*</span>`);
				});
			});
		});

		describe('Should Partially Parse: ', () => {
			[
				'*Hello* this is dog',
				'Rocket cat says *Hello*',
				'He said *Hello* to her',
				'**Hello** this is dog',
				'Rocket cat says **Hello**',
				'He said **Hello** to her'
			].forEach(text => {
				it('it should return a string containing a <strong> html tag when sending the string Hello', () => {
					assert.equal(markdown.parseBold(text).includes('<span class="copyonly">*</span><strong>Hello</strong><span class="copyonly">*</span>'), true);
				});
			});
		});
	});

	describe('[Italic Markdown]', () => {
		describe('Should Parse:', () => {
			[
				'_Hello_',
				'_Hi_',
				'_Rocket.Cat_'
			].forEach(text => {
				it(`it should return a html with the <em> tag when sending the string ${ text }`, () => {
					assert.strictEqual(markdown.parseItalic(text), `<span class="copyonly">_</span><em>${ text.replace(/\_/g, '') }</em><span class="copyonly">_</span>`);
				});
			});
		});

		describe('Should Not Parse:', () => {
			[
				'*Hello*',
				'__Hello__',
				'He_llo',
				'_Hello',
				'Hello_'
			].forEach(text => {
				it(`it should not return a html with the <em> tag when sending the string ${ text }`, () => {
					assert.notStrictEqual(markdown.parseItalic(text), `<span class="copyonly">_</span><em>${ text.replace(/\_/g, '') }</em><span class="copyonly">_</span>`);
				});
			});
		});
		describe('Should Partially Parse:', () => {
			[
				'_Hello_ this is dog',
				'Rocket cat says _Hello_',
				'He said _Hello_ to her'
			].forEach(text => {
				it(`it should return a string containing a <em> html tag when sending the string ${ text }`, () => {
					assert.equal(markdown.parseItalic(text).includes('<span class="copyonly">_</span><em>Hello</em><span class="copyonly">_</span>'), true);
				});
			});
		});
	});

	describe('[Strike Markdown]', () => {
		describe('Should Parse:', () => {
			[
				'~Hello~',
				'~~Hello~~',
				'~Hello~~',
				'~~Hello~'
			].forEach(text => {
				it(`it should return a html with the <strike> tag when sending the string ${ text }`, () => {
					assert.strictEqual(markdown.parseStrike(text), `<span class="copyonly">~</span><strike>${ text.replace(/\~/g, '') }</strike><span class="copyonly">~</span>`);
				});
			});
		});
		describe('Should NOT Parse:', () => {
			[
				'Hello~',
				'~Hello',
				'_Hello_',
				'He~llo'
			].forEach(text => {
				it(`it should NOT return a string containing a <strike> html tag when sending the string ${ text }`, () => {
					assert.notStrictEqual(markdown.parseStrike(text), `<span class="copyonly">~</span><strike>${ text.replace(/\~/g, '') }</strike><span class="copyonly">~</span>`);
				});
			});
		});

		describe('Should Partially Parse:', () => {
			[
				'~Hello~ this is dog',
				'Rocket cat says ~Hello~',
				'He said ~Hello~ to her'
			].forEach(text => {
				it(`it should return a string containing a <strike> html tag when sending the string ${ text }`, () => {
					assert.equal(markdown.parseStrike(text).includes('<span class="copyonly">~</span><strike>Hello</strike><span class="copyonly">~</span>'), true);
				});
			});
		});
	});

	describe('[H1 Markdown]', () => {
		describe('Should Parse:', () => {
			[
				'# Hello',
				'# Rocket.Cat',
				'# Hi',
				'# Hello this is dog',
				'# Rocket cat says Hello',
				'# He said Hello to her'
			].forEach(text => {
				it(`it should return a html with the <h1> tag when sending the string ${ text }`, () => {
					assert.strictEqual(markdown.parseH1(text), `<h1>${ text.replace(/\# /g, '') }</h1>`);
				});
			});
		});

		describe('Should Not Parse', () => {
			[
				'#Hello',
				'#Hello#',
				'He#llo',
				'## Hi',
				'### Rocket.Cat',
				'#### Rocket.Chat'
			].forEach(text => {
				it(`it should return a html with the <h1> tag when sending the string ${ text }`, () => {
					assert.notStrictEqual(markdown.parseH1(text), `<h1>${ text.replace(/\# /g, '') }</h1>`, markdown.parseH1(text));
				});
			});
		});
	});

	describe('[H2 Markdown]', () => {
		describe('Should Parse:', () => {
			[
				'## Hello',
				'## Rocket.Cat',
				'## Hi',
				'## Hello this is dog',
				'## Rocket cat says Hello',
				'## He said Hello to her'
			].forEach(text => {
				it(`it should return a html with the <h2> tag when sending the string ${ text }`, () => {
					assert.strictEqual(markdown.parseH2(text), `<h2>${ text.replace(/\## /g, '') }</h2>`);
				});
			});
		});

		describe('Should Not Parse', () => {
			[
				'##Hello',
				'##Hello##',
				'He##llo',
				'# Hi',
				'### Rocket.Cat',
				'#### Rocket.Chat'
			].forEach(text => {
				it(`it should return a html with the <h2> tag when sending the string ${ text }`, () => {
					assert.notStrictEqual(markdown.parseH2(text), `<h2>${ text.replace(/\## /g, '') }</h2>`);
				});
			});
		});
	});

	describe('[H3 Markdown]', () => {
		describe('Should Parse:', () => {
			[
				'### Hello',
				'### Rocket.Cat',
				'### Hi',
				'### Hello this is dog',
				'### Rocket cat says Hello',
				'### He said Hello to her'
			].forEach(text => {
				it(`it should return a html with the <h3> tag when sending the string ${ text }`, () => {
					assert.strictEqual(markdown.parseH3(text), `<h3>${ text.replace(/\### /g, '') }</h3>`);
				});
			});
		});

		describe('Should Not Parse', () => {
			[
				'###Hello',
				'###Hello###',
				'He###llo',
				'# Hi',
				'## Rocket.Cat',
				'#### Rocket.Chat'
			].forEach(text => {
				it(`it should return a html with the <h3> tag when sending the string ${ text }`, () => {
					assert.notStrictEqual(markdown.parseH3(text), `<h3>${ text.replace(/\### /g, '') }</h3>`);
				});
			});
		});
	});

	describe('[H4 Markdown]', () => {
		describe('Should Parse:', () => {
			[
				'#### Hello',
				'#### Rocket.Cat',
				'#### Hi',
				'#### Hello this is dog',
				'#### Rocket cat says Hello',
				'#### He said Hello to her'
			].forEach(text => {
				it(`it should return a html with the <h4> tag when sending the string ${ text }`, () => {
					assert.strictEqual(markdown.parseH4(text), `<h4>${ text.replace(/\#### /g, '') }</h4>`);
				});
			});
		});

		describe('Should Not Parse', () => {
			[
				'####Hello',
				'####Hello####',
				'He####llo',
				'# Hi',
				'## Rocket.Cat',
				'### Rocket.Chat'
			].forEach(text => {
				it(`it should return a html with the <h4> tag when sending the string ${ text }`, () => {
					assert.notStrictEqual(markdown.parseH4(text), `<h4>${ text.replace(/\#### /g, '') }</h4>`);
				});
			});
		});
	});

	describe('[Quote Markdown]', () => {
		describe('Should Parse:', () => {
			[
				'>Hello',
				'>Rocket.Cat',
				'>Hi',
				'> Hello this is dog',
				'> Rocket cat says Hello',
				'> He said Hello to her'
			].forEach(text => {
				it(`it should return a html with the <blockquote> tag when sending the string ${ text }`, () => {
					assert.strictEqual(markdown.parseQuote(text.replace(/\>/g, '&gt;')), `<blockquote class="background-transparent-darker-before"><span class="copyonly">&gt;</span>${ text.replace(/\>/g, '') }</blockquote>`);
				});
			});
		});

		describe('Should NOT Parse:', () => {
			[
				'<Hello',
				'<Rocket.Cat>',
				' >Hi',
				'Hello > this is dog',
				'Roc>ket cat says Hello',
				'He said Hello to her>'
			].forEach(text => {
				it(`it should NOT return a html with the <blockquote> tag when sending the string ${ text }`, () => {
					assert.notStrictEqual(markdown.parseQuote(text.replace(/\>/g, '&gt;')), `<blockquote class="background-transparent-darker-before"><span class="copyonly">&gt;</span>${ text.replace(/\>/g, '') }</blockquote>`);
				});
			});
		});
	});

	describe('[Remove Whitespace from Quote]', () => {
		describe('Should Remove Whitespace:', () => {
			it('it should remove the whitespace outside the tags', () => {
				assert.strictEqual(markdown.removeWhiteSpaceBlockQuote('    <blockquote class="background-transparent-darker-before"><span class="copyonly">&gt;</span> </blockquote>    '), '<blockquote class="background-transparent-darker-before"><span class="copyonly">&gt;</span> </blockquote>');
			});
		});
	});

	describe('[Remove Newline from Quote]', () => {
		describe('Remove Newline:', () => {
			it('it should remove the whitespace outside the tags', () => {
				assert.strictEqual(markdown.removeWhiteSpaceBlockQuote('<blockquote class="background-transparent-darker-before"><span class="copyonly">&gt;</span></blockquote>\n<blockquote'), '<blockquote class="background-transparent-darker-before"><span class="copyonly">&gt;</span></blockquote><blockquote');
			});
		});
	});

});
