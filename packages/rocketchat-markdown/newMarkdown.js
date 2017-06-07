import MarkdownClass from './newMarkdownClass';

const schemes = RocketChat.settings.get('Markdown_SupportSchemesForLink') && RocketChat.settings.get('Markdown_SupportSchemesForLink').split(',').join('|');
const headers = RocketChat.settings.get('Markdown_Headers');
const absoluteUrl = Meteor.absoluteUrl();

const Markdown = new MarkdownClass(schemes, headers, absoluteUrl);

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
	Blaze.registerHelper('RocketChatMarkdownUnescape', text => Markdown.parseNotEscaped(text));
}
