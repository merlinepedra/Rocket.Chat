import { EventEmitter } from 'events';

import { Match } from 'meteor/check';
import { Mongo, MongoInternals } from 'meteor/mongo';
import _ from 'underscore';

type IndexKey = string | {
	[key: string]: string | number;
}

type IndexOptions = {
	[key: string]: any;
} | undefined;

interface IQueryOptions {
	sort?: Mongo.SortSpecifier;
	skip?: number;
	limit?: number;
	fields?: Mongo.FieldSpecifier;
	reactive?: boolean;
	transform?: Function | null;
}

interface IUpdateOptions {
	multi?: boolean;
	upsert?: boolean;
}

interface IOplogAction {
	id: string;
	op: {
		op: 'i' | 'u' | 'd';
		o: {
			_id: string;
			$set?: {
				[key: string]: any;
			};
			$unset?: {
				[key: string]: any;
			};
		};
	};
}

interface IModel {
	_id: string;
}

interface ITrashModel extends IModel {
	_deletedAt?: Date;
	__collection__?: string;
}

type QuerySelector<T extends IModel> = Mongo.Selector<T> | Mongo.ObjectID | string;

const baseName = 'rocketchat_';

const trash = new Mongo.Collection<ITrashModel>(`${ baseName }_trash`);

try {
	trash._ensureIndex({ collection: 1 });
	trash._ensureIndex(
		{ _deletedAt: 1 },
		{ expireAfterSeconds: 60 * 60 * 24 * 30 },
	);
} catch (e) {
	console.log(e);
}

// Mongo.Collection<Meteor.User>
export class BaseDb<T extends IModel> extends EventEmitter {
	private name: string;

	private collectionName: string;

	private model: Mongo.Collection<T>;

	public originals: {
		insert: (doc: Mongo.OptionalId<T>, callback?: Function | undefined) => string;
		update: (selector: QuerySelector<T> | Mongo.QueryWithModifiers<T>, modifier: Mongo.Modifier<T>, options?: IUpdateOptions, callback?: Function) => number;
		remove: (selector: QuerySelector<T> | Mongo.QueryWithModifiers<T>, callback?: Function | undefined) => number;
	}

	constructor(model: string | Mongo.Collection<T>, options: { _updatedAtIndexOptions?: IndexOptions } = {}) {
		super();

		if (Match.test(model, String)) {
			this.name = model;
			this.collectionName = this.baseName + this.name;
			this.model = new Mongo.Collection(this.collectionName);
		} else {
			this.name = model._name;
			this.collectionName = this.name;
			this.model = model;
		}

		this.originals = {
			insert: this.model.insert.bind(this.model),
			update: this.model.update.bind(this.model),
			remove: this.model.remove.bind(this.model),
		};

		this.model.insert = this.insert.bind(this);
		this.model.update = this.update.bind(this);
		this.model.remove = this.remove.bind(this);

		// When someone start listening for changes we start oplog if available
		const handleListener = (event: string /* , listener*/): void => {
			if (event !== 'change') {
				return;
			}

			this.removeListener('newListener', handleListener);

			const query = {
				collection: this.collectionName,
			};

			if (!MongoInternals.defaultRemoteCollectionDriver().mongo._oplogHandle) {
				throw new Error(`Error: Unable to find Mongodb Oplog. You must run the server with oplog enabled. Try the following:\n
				1. Start your mongodb in a replicaset mode: mongod --smallfiles --oplogSize 128 --replSet rs0\n
				2. Start the replicaset via mongodb shell: mongo mongo/meteor --eval "rs.initiate({ _id: ''rs0'', members: [ { _id: 0, host: ''localhost:27017'' } ]})"\n
				3. Start your instance with OPLOG configuration: export MONGO_OPLOG_URL=mongodb://localhost:27017/local MONGO_URL=mongodb://localhost:27017/meteor node main.js
				`);
			}

			MongoInternals.defaultRemoteCollectionDriver().mongo._oplogHandle.onOplogEntry(
				query,
				this.processOplogRecord.bind(this),
			);
			// Meteor will handle if we have a value https://github.com/meteor/meteor/blob/5dcd0b2eb9c8bf881ffbee98bc4cb7631772c4da/packages/mongo/oplog_tailing.js#L5
			if (process.env.METEOR_OPLOG_TOO_FAR_BEHIND == null) {
				MongoInternals.defaultRemoteCollectionDriver().mongo._oplogHandle._defineTooFarBehind(
					Number.MAX_SAFE_INTEGER,
				);
			}
		};
		this.on('newListener', handleListener);

		this.tryEnsureIndex({ _updatedAt: 1 }, options._updatedAtIndexOptions);
	}

	get baseName(): string {
		return baseName;
	}

	setUpdatedAt(record: Mongo.Modifier<T> = {}): Mongo.Modifier<T> {
		if (/(^|,)\$/.test(Object.keys(record).join(','))) {
			record.$set = record.$set || {};
			record.$set._updatedAt = new Date();
		} else {
			record._updatedAt = new Date();
		}

		return record;
	}

	_doNotMixInclusionAndExclusionFields(options?: IQueryOptions): void {
		if (options && options.fields) {
			const keys = Object.keys(options.fields);
			const removeKeys = keys.filter((key) => options.fields?.[key] === 0);
			if (keys.length > removeKeys.length) {
				removeKeys.forEach((key) => delete options.fields?.[key]);
			}
		}
	}

	find(selector?: QuerySelector<T>, options?: IQueryOptions): Mongo.Cursor<T> {
		this._doNotMixInclusionAndExclusionFields(options);
		return this.model.find(selector, options);
	}

	findById(_id: string, options?: IQueryOptions): Mongo.Cursor<T> {
		return this.find({ _id }, options);
	}

	findOne(selector: QuerySelector<T>, options?: IQueryOptions): T | undefined {
		this._doNotMixInclusionAndExclusionFields(options);
		return this.model.findOne(selector, options);
	}

	findOneById(_id: string, options?: IQueryOptions): T | undefined {
		return this.findOne({ _id }, options);
	}

	findOneByIds(ids: string[], options?: IQueryOptions): T | undefined {
		return this.findOne({ _id: { $in: ids } }, options);
	}

	processOplogRecord(action: IOplogAction): void {
		if (action.op.op === 'i') {
			this.emit('change', {
				action: 'insert',
				clientAction: 'inserted',
				id: action.op.o._id,
				data: action.op.o,
				oplog: true,
			});
			return;
		}

		if (action.op.op === 'u') {
			if (!action.op.o.$set && !action.op.o.$unset) {
				this.emit('change', {
					action: 'update',
					clientAction: 'updated',
					id: action.id,
					data: action.op.o,
					oplog: true,
				});
				return;
			}

			const diff: {[key: string]: any} = {};
			if (action.op.o.$set) {
				for (const key in action.op.o.$set) {
					if (action.op.o.$set.hasOwnProperty(key)) {
						diff[key] = action.op.o.$set[key];
					}
				}
			}

			if (action.op.o.$unset) {
				for (const key in action.op.o.$unset) {
					if (action.op.o.$unset.hasOwnProperty(key)) {
						diff[key] = undefined;
					}
				}
			}

			this.emit('change', {
				action: 'update',
				clientAction: 'updated',
				id: action.id,
				diff,
				oplog: true,
			});
			return;
		}

		if (action.op.op === 'd') {
			this.emit('change', {
				action: 'remove',
				clientAction: 'removed',
				id: action.id,
				oplog: true,
			});
		}
	}

	insert(record: Mongo.OptionalId<T>, callback?: Function): string {
		this.setUpdatedAt(record);

		const result = this.originals.insert(record, callback);

		record._id = result;

		return result;
	}

	update(query: QuerySelector<T>, update: Mongo.Modifier<T>, options: IUpdateOptions = {}): number {
		this.setUpdatedAt(update);

		return this.originals.update(query, update, options);
	}

	upsert(query: QuerySelector<T>, update: Mongo.Modifier<T>, options: IUpdateOptions = {}): number {
		options.upsert = true;
		options._returnObject = true;
		return this.update(query, update, options);
	}

	remove(query: QuerySelector<T>, callback?: Function): number {
		const records = this.model.find(query).fetch();

		const ids = [];
		for (const record of records) {
			ids.push(record._id);

			const trashRecord: ITrashModel = {
				_deletedAt: new Date(),
				__collection__: this.name,
				...record,
			};

			trash.upsert({ _id: record._id }, _.omit(trashRecord, '_id'));
		}

		query = { _id: { $in: ids } };

		return this.originals.remove(query, callback);
	}

	insertOrUpsert(record: Mongo.OptionalId<T>, options?: IUpdateOptions): string {
		if (record._id) {
			const { _id } = record;
			delete record._id;

			this.upsert({ _id }, record, options);
			return _id;
		}

		return this.insert(record);
	}

	ensureIndex(key: IndexKey, options?: IndexOptions): void {
		return this.model._ensureIndex(key, options);
	}

	dropIndex(key: IndexKey): void {
		return this.model._dropIndex(key);
	}

	tryEnsureIndex(key: IndexKey, options?: IndexOptions): void {
		try {
			return this.ensureIndex(key, options);
		} catch (e) {
			console.error('Error creating index:', this.name, '->', key, options, e);
		}
	}

	tryDropIndex(key: IndexKey): void {
		try {
			return this.dropIndex(key);
		} catch (e) {
			console.error('Error dropping index:', this.name, '->', key, e);
		}
	}

	trashFind(query: Mongo.Selector<ITrashModel>, options?: IQueryOptions): Mongo.Cursor<ITrashModel> {
		query.__collection__ = this.name;

		return trash.find(query, options);
	}

	trashFindOneById(_id: string, options?: IQueryOptions): ITrashModel | undefined {
		const query = {
			_id,
			__collection__: this.name,
		};

		return trash.findOne(query, options);
	}

	trashFindDeletedAfter(deletedAt: Date, query: Mongo.Selector<ITrashModel> = {}, options?: IQueryOptions): Mongo.Cursor<ITrashModel> {
		query._deletedAt = {
			$gt: deletedAt,
		};

		return this.trashFind(query, options);
	}
}
