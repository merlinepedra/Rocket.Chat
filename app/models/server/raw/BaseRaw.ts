import {
	Collection,
	FindOneOptions,
	FilterQuery,
	Cursor,
	OptionalId,
	WithId,
	CollectionInsertOneOptions,
	InsertWriteOpResult,
	UpdateQuery,
	UpdateOneOptions,
	WriteOpResult,
} from 'mongodb';

interface IModel {
	_id: string;
}

export class BaseRaw<T extends IModel> {
	constructor(public col: Collection<T>) {
		return this;
	}

	async findOneById(_id: string, options?: FindOneOptions): Promise<T | null> {
		return this.findOne({ _id }, options);
	}

	async findOne(query: FilterQuery<T>, options?: FindOneOptions): Promise<T | null> {
		return this.col.findOne(query, options);
	}

	findUsersInRoles() {
		throw new Error('overwrite-function'/* , 'You must overwrite this function in the extended classes'*/);
	}

	find(query: FilterQuery<T>, options?: FindOneOptions): Cursor<T> {
		return this.col.find(query, options);
	}

	async insert(docs: OptionalId<T>, options?: CollectionInsertOneOptions): Promise<InsertWriteOpResult<WithId<T>>> {
		return this.col.insert(docs, options);
	}

	async update(filter: FilterQuery<T>, update: UpdateQuery<T> | Partial<T>, options?: UpdateOneOptions & { multi?: boolean }): Promise<WriteOpResult> {
		return this.col.update(filter, update, options);
	}
}
