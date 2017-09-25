/* globals popover */

Meteor.startup(function() {
	RocketChat.MessageAction.addButton({
		id: 'jump-to-search-message',
		icon: 'jump',
		label: 'Jump_to_message',
		context: [
			'search'
		],
		action() {
			const message = this._arguments[1];
			if (window.matchMedia('(max-width: 500px)').matches) {
				Template.instance().tabBar.close();
			}

			RoomHistoryManager.getSurroundingMessages(message, 50);
		},
		order: 100,
		group: 'menu'
	});
});


Template.messageSearch.helpers({
	tSearchMessages() {
		return t('Search_Messages');
	},

	searchResultMessages() {
		const searchResult = Template.instance().searchResult.get();
		if (searchResult) {
			return searchResult.messages;
		}
	},

	hasMore() {
		return Template.instance().hasMore.get();
	},

	currentSearchTerm() {
		return Template.instance().currentSearchTerm.get();
	},

	ready() {
		return Template.instance().ready.get();
	},

	message() {
		return _.extend(this, { customClass: 'search', actionContext: 'search'});
	}
});

Template.messageSearch.events({
	'focus #message-search'(e, template) {
		const config = {
			columns: [
				{
					groups: template.groups
				}
			],

			position: {
				left: document.querySelector('#message-search').getBoundingClientRect().left,
				top : document.querySelector('#message-search').getBoundingClientRect().bottom + 5
			},
			customCSSProperties: {
				width: `${ e.currentTarget.offsetWidth }px`
			},
			data: this,

			activeElement: $(e.currentTarget).parents('.message')[0]
		};

		popover.open(config);
	},

	'blur #message-search'() {
		popover.close();
	},

	'change #message-search'(e, t) {
		t.changeFilter(e.target.value);
	},

	'keydown #message-search'(e) {
		if (e.keyCode === 13) {
			return e.preventDefault();
		}
	},

	'keyup #message-search': _.debounce(function(e, t) {
		t.changeFilter(e.target.value);
		const value = e.target.value.trim();
		if ((value === '') && t.currentSearchTerm.get()) {
			t.currentSearchTerm.set('');
			t.searchResult.set(undefined);
			t.hasMore.set(false);
			return;
		} else if (value === t.currentSearchTerm.get()) {
			return;
		}

		t.hasMore.set(true);
		t.limit.set(20);
		return t.search();
	}, 500),

	'click .load-more button'(e, t) {
		t.limit.set(t.limit.get() + 20);
		return t.search();
	},

	'scroll .js-list': _.throttle(function(e, t) {
		if (e.target.scrollTop >= (e.target.scrollHeight - e.target.clientHeight)) {
			t.limit.set(t.limit.get() + 20);
			return t.search();
		}
	}, 200)
});

Template.messageSearch.onCreated(function() {
	this.currentSearchTerm = new ReactiveVar('');
	this.searchResult = new ReactiveVar;
	this.allFilters = ['from', 'has', 'is', 'before', 'after', 'on', 'order'].map((filter) => {
		return {
			name: t(filter),
			type: 'filter',
			class: 'search-filter',
			description: t(`${ filter }-description`),
			value: `${ filter }:`
		};
	});
	this.currentSearchFilter = new ReactiveVar(this.allFilters);

	this.hasMore = new ReactiveVar(true);
	this.limit = new ReactiveVar(20);
	this.ready = new ReactiveVar(true);
	this.groups = new ReactiveVar([
		{
			title: t('Narrow your search'),
			items: this.allFilters
		}
	]);

	this.changeFilter = (input) => {
		const currFilter = this.allFilters.filter((filter) => { return filter.name.includes(input); });
		console.log(currFilter);
		this.groups.set([
			{
				title: t('Narrow your search'),
				items: currFilter
			}
		]);
	};



	this.search = () => {
		this.ready.set(false);
		const value = this.$('#message-search').val();
		Tracker.nonreactive(() => {
			Meteor.call('messageSearch', value, Session.get('openedRoom'), this.limit.get(), (error, result) => {
				this.currentSearchTerm.set(value);
				this.ready.set(true);
				if ((result != null) && (((result.messages != null ? result.messages.length : undefined) > 0) || ((result.users != null ? result.users.length : undefined) > 0) || ((result.channels != null ? result.channels.length : undefined) > 0))) {
					this.searchResult.set(result);
					if (((result.messages != null ? result.messages.length : undefined) + (result.users != null ? result.users.length : undefined) + (result.channels != null ? result.channels.length : undefined)) < this.limit.get()) {
						this.hasMore.set(false);
					}
				} else {
					this.searchResult.set();
				}
			}
			);
		}
		);
	};
});
