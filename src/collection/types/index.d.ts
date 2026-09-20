import type {
	Collection,
	CountDocumentsOptions,
	DeleteOptions,
	Db,
	Filter,
	FilterOperators,
	FindOptions,
	InsertManyResult,
	InsertOneResult,
	OptionalUnlessRequiredId,
	UpdateFilter,
	UpdateOptions,
} from "mongodb";

import type { ZodType } from "zod/v3";

export type CollectionLimit<T> = {
	limit?: number;
	sortBy?: keyof T & string;
	order?: 1 | -1;
	query?: string;
};

export type CollectionConfig<
	T extends Record<string, unknown>,
> = {
	name: string;
	schema: ZodType<T>;
	searchField?: keyof T & string;
	defaultSortBy?: keyof T & string;
};

export type CollectionService<
	T extends Record<string, unknown>,
> = {
	// -------------------------
	// FIND
	// -------------------------

	all: (
		options?: CollectionLimit<T>,
	) => Promise<T[]>;

	collection: (
		options?: CollectionLimit<T>,
	) => Promise<T[]>;

	find: <K extends keyof T & string>(
		field: K | Filter<T>,
		filter?: Filter<T>[K],
		options?: CollectionLimit<T>,
	) => Promise<T[]>;

	findOne: <K extends keyof T & string>(
		field: K | Filter<T>,
		value?: T[K] | FilterOperators<T[K]>,
		options?: FindOptions<T>,
	) => Promise<T | null>;

	// -------------------------
	// INSERT
	// -------------------------

	insertOne: (
		data: OptionalUnlessRequiredId<T>,
		options?: Parameters<
			Collection<T>["insertOne"]
		>[1],
	) => Promise<InsertOneResult<T>>;

	insertMany: (
		data: OptionalUnlessRequiredId<T>[],
		options?: Parameters<
			Collection<T>["insertMany"]
		>[1],
	) => Promise<InsertManyResult<T>>;

	create: (
		data: T,
	) => Promise<T>;

	// -------------------------
	// UPDATE
	// -------------------------

	updateOne: (
		filter: Filter<T>,
		update: UpdateFilter<T>,
		options?: UpdateOptions,
	) => Promise<
		Awaited<
			ReturnType<Collection<T>["updateOne"]>
		>
	>;

	updateMany: (
		filter: Filter<T>,
		update: UpdateFilter<T>,
		options?: UpdateOptions,
	) => Promise<
		Awaited<
			ReturnType<Collection<T>["updateMany"]>
		>
	>;

	findOneAndUpdate: (
		filter: Filter<T>,
		update: UpdateFilter<T>,
		options?: Parameters<
			Collection<T>["findOneAndUpdate"]
		>[2],
	) => Promise<T | null>;

	// -------------------------
	// DELETE
	// -------------------------

	deleteOne: (
		filter: Filter<T>,
		options?: DeleteOptions,
	) => Promise<
		Awaited<
			ReturnType<Collection<T>["deleteOne"]>
		>
	>;

	deleteMany: (
		filter: Filter<T>,
		options?: DeleteOptions,
	) => Promise<
		Awaited<
			ReturnType<Collection<T>["deleteMany"]>
		>
	>;

	// -------------------------
	// COUNT
	// -------------------------

	countDocuments: (
		filter?: Filter<T>,
		options?: CountDocumentsOptions,
	) => Promise<number>;

	estimatedDocumentCount: (
		options?: Parameters<
			Collection<T>["estimatedDocumentCount"]
		>[0],
	) => Promise<number>;

	// -------------------------
	// EXISTS
	// -------------------------

	exists: (
		filter: Filter<T>,
	) => Promise<boolean>;
};

export type CreateServiceFn = (
	db: Db,
) => <T extends Record<string, unknown>>(
	config: CollectionConfig<T>,
) => CollectionService<T>;