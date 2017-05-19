/*
 * Markdown is a named function that will parse markdown syntax
 * @param {Object} message - The message object
 */

class MarkdownClass {

	constructor() {
		this.schemes = RocketChat.settings.get('Markdown_SupportSchemesForLink') && RocketChat.settings.get('Markdown_SupportSchemesForLink').split(',').join('|');
		this.headers = RocketChat.settings.get('Markdown_Headers');
	}
	parse(text) {
		return this.parseNotEscaped(_.escapeHTML(text));
	}

	parseLinkWithTitle(msg) {
		// Support ![alt text](http://image url)
		return msg.replace(new RegExp(`!\\[([^\\]]+)\\]\\(((?:${ this.schemes }):\\/\\/[^\\)]+)\\)`, 'gm'), function(match, title, url) {
			const target = url.indexOf(Meteor.absoluteUrl()) === 0 ? '' : '_blank';
			return `<a href="${ _.escapeHTML(url) }" title="${ _.escapeHTML(title) }" target="${ _.escapeHTML(target) }"><div class="inline-image" style="background-image: url(${ _.escapeHTML(url) });"></div></a>`;
		});
	}

	parseLinkWithText(msg) {
		// Support [Text](http://link)
		return msg.replace(new RegExp(`\\[([^\\]]+)\\]\\(((?:${ this.schemes }):\\/\\/[^\\)]+)\\)`, 'gm'), function(match, title, url) {
			const target = url.indexOf(Meteor.absoluteUrl()) === 0 ? '' : '_blank';
			return `<a href="${ _.escapeHTML(url) }" target="${ _.escapeHTML(target) }">${ _.escapeHTML(title) }</a>`;
		});
	}

	parseLink(msg) {
		// Support <http://link|Text>
		return msg.replace(new RegExp(`(?:<|&lt;)((?:${ this.schemes }):\\/\\/[^\\|]+)\\|(.+?)(?=>|&gt;)(?:>|&gt;)`, 'gm'), (match, url, title) => {
			const target = url.indexOf(Meteor.absoluteUrl()) === 0 ? '' : '_blank';
			return `<a href="${ _.escapeHTML(url) }" target="${ _.escapeHTML(target) }">${ _.escapeHTML(title) }</a>`;
		});
	}

	parseH1(msg) {
		// Support # Text for h1
		return msg.replace(/^# (([\S\w\d-_\/\*\.,\\][ \u00a0\u1680\u180e\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]?)+)/gm, '<h1>$1</h1>');
	}
	parseH2(msg) {
		// Support # Text for h2
		return msg.replace(/^## (([\S\w\d-_\/\*\.,\\][ \u00a0\u1680\u180e\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]?)+)/gm, '<h2>$1</h2>');
	}
	parseH3(msg) {
		// Support # Text for h3
		return msg.replace(/^### (([\S\w\d-_\/\*\.,\\][ \u00a0\u1680\u180e\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]?)+)/gm, '<h3>$1</h3>');
	}
	parseH4(msg) {
		// Support # Text for h4
		return msg.replace(/^#### (([\S\w\d-_\/\*\.,\\][ \u00a0\u1680\u180e\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]?)+)/gm, '<h4>$1</h4>');
	}

	parseBold(msg) {
		// Support *text* to make bold
		return msg.replace(/(^|&gt;|[ >_~`])\*{1,2}([^\*\r\n]+)\*{1,2}([<_~`]|\B|\b|$)/gm, '$1<span class="copyonly">*</span><strong>$2</strong><span class="copyonly">*</span>$3');
	}

	parseItalic(msg) {
		// Support _text_ to make italics
		return msg.replace(/(^|&gt;|[ >*~`])\_([^\_\r\n]+)\_([<*~`]|\B|\b|$)/gm, '$1<span class="copyonly">_</span><em>$2</em><span class="copyonly">_</span>$3');
	}

	parseStrike(msg) {
		// Support ~text~ to strike through text
		return msg.replace(/(^|&gt;|[ >_*`])\~{1,2}([^~\r\n]+)\~{1,2}([<_*`]|\B|\b|$)/gm, '$1<span class="copyonly">~</span><strike>$2</strike><span class="copyonly">~</span>$3');
	}

	parseBlockQuote(msg) {
		// Support for block quote
		// >>>
		// Text
		// <<<
		return msg.replace(/(?:&gt;){3}\n+([\s\S]*?)\n+(?:&lt;){3}/g, '<blockquote class="background-transparent-darker-before"><span class="copyonly">&gt;&gt;&gt;</span>$1<span class="copyonly">&lt;&lt;&lt;</span></blockquote>');
	}

	parseQuote(msg) {
		// Support >Text for quote
		return msg.replace(/^&gt;(.*)$/gm, '<blockquote class="background-transparent-darker-before"><span class="copyonly">&gt;</span>$1</blockquote>');
	}

	removeWhiteSpaceBlockQuote(msg) {
		// Remove white-space around blockquote (prevent <br>). Because blockquote is block element.
		msg = msg.replace(/\s*<blockquote class="background-transparent-darker-before">/gm, '<blockquote class="background-transparent-darker-before">');
		return msg.replace(/<\/blockquote>\s*/gm, '</blockquote>');
	}

	removeNewLineBlockQuote(msg) {
		// Remove new-line between blockquotes.
		return msg.replace(/<\/blockquote>\n<blockquote/gm, '</blockquote><blockquote');
	}


	parseNotEscaped(msg) {
		console.log(Object.getOwnPropertyNames(MarkdownClass.prototype));
		Object.getOwnPropertyNames(MarkdownClass.prototype).forEach(method =>{
			if (method === 'constructor' || method === 'parseNotEscaped' || method === 'parse') {
				return;
			}
			console.log(method);
			msg = this[method](msg);
		});

		// Object.getOwnPropertyNames(MarkdownClass.prototype).reduce((msg, method) => ['constructor', 'parseNotEscaped', 'parse'].includes(method) ? msg : this[method](msg), msg);


		// [
		// 	this.parseLinkWithTitle,
		// 	this.parseLinkWithText,
		// 	this.parseLink,

		// 	...(this.headers ? [
		// 		this.parseH1,
		// 		this.parseH2,
		// 		this.parseH3,
		// 		this.parseH4
		// 	] : []),

		// 	this.parseBold,
		// 	this.parseItalic,
		// 	this.parseStrike,
		// 	this.parseBlockQuote,
		// 	this.parseQuote,
		// 	this.removeWhiteSpaceBlockQuote,
		// 	this.removeNewLineBlockQuote
		// ].reduce((msg, fn) => fn(msg), msg);



		// msg = this.parseLinkWithTitle(msg);
		// msg = this.parseLinkWithText(msg);
		// msg = this.parseLink(msg);

		// if (this.headers) {
		// 	msg = this.parseH1(msg);
		// 	msg = this.parseH2(msg);
		// 	msg = this.parseH3(msg);
		// 	msg = this.parseH4(msg);
		// }

		// msg = this.parseBold(msg);
		// msg = this.parseItalic(msg);
		// msg = this.parseStrike(msg);
		// msg = this.parseBlockQuote(msg);
		// msg = this.parseQuote(msg);
		// msg = this.removeWhiteSpaceBlockQuote(msg);
		// msg = this.removeNewLineBlockQuote(msg);

		if (typeof window !== 'undefined' && window !== null ? window.rocketDebug : undefined) { console.log('Markdown', msg); }

		return msg;
	}
}

const Markdown = new MarkdownClass;
RocketChat.Markdown = Markdown;

// renderMessage already did html escape
const MarkdownMessage = (message) => {
	if (_.trim(message != null ? message.html : undefined)) {
		message.html = Markdown.parseNotEscaped(message.html);
	}

	return message;
};

RocketChat.callbacks.add('renderMessage', MarkdownMessage, RocketChat.callbacks.priority.HIGH, 'markdown');

if (Meteor.isClient) {
	Blaze.registerHelper('RocketChatMarkdown', text => Markdown.parse(text));
}
