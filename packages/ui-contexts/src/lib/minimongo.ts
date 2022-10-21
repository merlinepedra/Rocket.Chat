type BsonType =
	| 1
	| 'double'
	| 2
	| 'string'
	| 3
	| 'object'
	| 4
	| 'array'
	| 5
	| 'binData'
	| 6
	| 'undefined'
	| 7
	| 'objectId'
	| 8
	| 'bool'
	| 9
	| 'date'
	| 10
	| 'null'
	| 11
	| 'regex'
	| 12
	| 'dbPointer'
	| 13
	| 'javascript'
	| 14
	| 'symbol'
	| 15
	| 'javascriptWithScope'
	| 16
	| 'int'
	| 17
	| 'timestamp'
	| 18
	| 'long'
	| 19
	| 'decimal'
	| -1
	| 'minKey'
	| 127
	| 'maxKey'
	| 'number';

export type FieldExpression<T> = {
	$eq?: T | undefined;
	$gt?: T | undefined;
	$gte?: T | undefined;
	$lt?: T | undefined;
	$lte?: T | undefined;
	$in?: T[] | undefined;
	$nin?: T[] | undefined;
	$ne?: T | undefined;
	$exists?: boolean | undefined;
	$type?: BsonType[] | BsonType | undefined;
	$not?: FieldExpression<T> | undefined;
	$expr?: FieldExpression<T> | undefined;
	$jsonSchema?: any;
	$mod?: number[] | undefined;
	$regex?: RegExp | string | undefined;
	$options?: string | undefined;
	$text?:
		| {
				$search: string;
				$language?: string | undefined;
				$caseSensitive?: boolean | undefined;
				$diacriticSensitive?: boolean | undefined;
		  }
		| undefined;
	$where?: string | ((...args: any[]) => any) | undefined;
	$geoIntersects?: any;
	$geoWithin?: any;
	$near?: any;
	$nearSphere?: any;
	$all?: T[] | undefined;
	$elemMatch?: T extends object ? Query<T> : FieldExpression<T> | undefined;
	$size?: number | undefined;
	$bitsAllClear?: any;
	$bitsAllSet?: any;
	$bitsAnyClear?: any;
	$bitsAnySet?: any;
	$comment?: string | undefined;
};

type Flatten<T> = T extends any[] ? T[0] : T;

type Query<T> = { [P in keyof T]?: Flatten<T[P]> | RegExp | FieldExpression<Flatten<T[P]>> } & {
	$or?: Query<T>[] | undefined;
	$and?: Query<T>[] | undefined;
	$nor?: Query<T>[] | undefined;
} & Record<string, any>;
