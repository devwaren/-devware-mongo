import type {
	Db,
	Filter,
	InsertOneResult,
	OptionalUnlessRequiredId,
	UpdateFilter,
	WithId,
} from "mongodb";

export type CollectionLimit<T> = {
	limit?: number;
	sortBy?: keyof T & string;
	order?: 1 | -1;
	query?: string;
};

export type CreateServiceFn = <
	T extends Record<string, unknown>,
>(
	db: Db,
	collection: string,
	searchField?: keyof T & string,
	defaultSortBy?: keyof T & string,
) => {
	all: (
		options?: CollectionLimit<T>,
	) => Promise<WithId<T>[]>;

	collection: (
		options?: CollectionLimit<T>,
	) => Promise<WithId<T>[]>;

	find: <K extends keyof T & string>(
		field: K | Filter<T>,
		filter?: Filter<T>[K],
		options?: CollectionLimit<T>,
	) => Promise<WithId<T>[]>;

	findOne: <K extends keyof T & string>(
		field: K,
		value: T[K],
	) => Promise<WithId<T> | null>;

	findOneAndUpdate: <K extends keyof T & string>(
		field: K,
		value: T[K],
		update: UpdateFilter<T>,
	) => Promise<WithId<T> | null>;

	insertOne: (
		data: OptionalUnlessRequiredId<T>,
	) => Promise<InsertOneResult<T>>;

	create: (
		data: T,
	) => Promise<
		WithId<
			T & {
				created_at: Date;
				updated_at: Date;
			}
		>
	>;
};