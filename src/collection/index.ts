import type {
	Db,
	DeleteOptions,
	Filter,
	FilterOperators,
	FindOptions,
	FindOneAndUpdateOptions,
	InsertOneResult,
	OptionalUnlessRequiredId,
	Sort,
	UpdateFilter,
	UpdateOptions,
} from "mongodb";

import type { ZodType } from "zod/v3";
import type {
	CollectionLimit,
	CollectionService,
} from "./types";

export type CollectionConfig<
	T extends Record<string, unknown>,
> = {
	name: string;
	schema: ZodType<T>;
	searchField?: keyof T & string;
	defaultSortBy?: keyof T & string;
};

const assertServer = () => {
	if (
		typeof globalThis !== "undefined" &&
		"window" in globalThis
	) {
		throw new Error(
			"MongoDB collection should only be used on the server.",
		);
	}
};

export const collection = (db: Db) => <
	T extends Record<string, unknown>,
>({
	name,
	schema,
	searchField = "title" as keyof T & string,
	defaultSortBy = "createdAt" as keyof T & string,
}: CollectionConfig<T>): CollectionService<T> => {
	assertServer();

	const mongoCollection = db.collection<T>(name);

	/**
	 * MongoDB document -> declared schema.
	 *
	 * Zod object schemas strip unknown properties by default.
	 */
	const parse = (document: unknown): T => {
		return schema.parse(document);
	};

	const parseMany = (documents: unknown[]): T[] => {
		return documents.map(parse);
	};

	return {
		// -------------------------
		// FIND
		// -------------------------

		all: async ({
			limit = 10,
			sortBy = defaultSortBy,
			order = -1,
		}: CollectionLimit<T> = {}) => {
			const results = await mongoCollection
				.find({})
				.sort({ [sortBy]: order } satisfies Sort)
				.limit(limit)
				.toArray();

			return parseMany(results);
		},

		collection: async ({
			query = "",
			limit = 10,
			sortBy = defaultSortBy,
			order = -1,
		}: CollectionLimit<T> = {}) => {
			const results = await mongoCollection
				.find({
					[searchField]: {
						$regex: query,
						$options: "i",
					},
				} as Filter<T>)
				.sort({ [sortBy]: order } satisfies Sort)
				.limit(limit)
				.toArray();

			return parseMany(results);
		},

		find: async <K extends keyof T & string>(
			field: K | Filter<T>,
			filter?: Filter<T>[K],
			{
				limit = 10,
				sortBy = defaultSortBy,
				order = -1,
			}: CollectionLimit<T> = {},
		) => {
			const query: Filter<T> =
				typeof field === "object"
					? field
					: ({
							[field]: filter,
						} as Filter<T>);

			const results = await mongoCollection
				.find(query)
				.sort({ [sortBy]: order } satisfies Sort)
				.limit(limit)
				.toArray();

			return parseMany(results);
		},

		findOne: async <K extends keyof T & string>(
			field: K | Filter<T>,
			value?: T[K] | FilterOperators<T[K]>,
			options?: FindOptions,
		) => {
			const query: Filter<T> =
				typeof field === "object"
					? field
					: ({
							[field]: value,
						} as Filter<T>);

			const result = await mongoCollection.findOne(
				query,
				options,
			);

			return result ? parse(result) : null;
		},

		// -------------------------
		// INSERT
		// -------------------------

		insertOne: async (
			data: OptionalUnlessRequiredId<T>,
			options?: Parameters<
				typeof mongoCollection.insertOne
			>[1],
		): Promise<InsertOneResult<T>> => {
			return mongoCollection.insertOne(data, options);
		},

		insertMany: async (
			data: OptionalUnlessRequiredId<T>[],
			options?: Parameters<
				typeof mongoCollection.insertMany
			>[1],
		) => {
			return mongoCollection.insertMany(data, options);
		},

		create: async (data: T) => {
			const now = new Date();

			const document = {
				...data,
				created_at: now,
				updated_at: now,
			};

			const result = await mongoCollection.insertOne(
				document as unknown as OptionalUnlessRequiredId<T>,
			);

			return parse({
				...document,
				_id: result.insertedId,
			});
		},

		// -------------------------
		// UPDATE
		// -------------------------

		updateOne: async (
			filter: Filter<T>,
			update: UpdateFilter<T>,
			options?: UpdateOptions,
		) => {
			return mongoCollection.updateOne(
				filter,
				update,
				options,
			);
		},

		updateMany: async (
			filter: Filter<T>,
			update: UpdateFilter<T>,
			options?: UpdateOptions,
		) => {
			return mongoCollection.updateMany(
				filter,
				update,
				options,
			);
		},

		findOneAndUpdate: async (
			filter: Filter<T>,
			update: UpdateFilter<T>,
			options?: FindOneAndUpdateOptions,
		) => {
			const result =
				await mongoCollection.findOneAndUpdate(
					filter,
					update,
					{
						returnDocument: "after",
						...options,
					},
				);

			return result ? parse(result) : null;
		},

		// -------------------------
		// DELETE
		// -------------------------

		deleteOne: async (
			filter: Filter<T>,
			options?: DeleteOptions,
		) => {
			return mongoCollection.deleteOne(
				filter,
				options,
			);
		},

		deleteMany: async (
			filter: Filter<T>,
			options?: DeleteOptions,
		) => {
			return mongoCollection.deleteMany(
				filter,
				options,
			);
		},

		// -------------------------
		// COUNT
		// -------------------------

		countDocuments: async (
			filter: Filter<T> = {},
			options?: Parameters<
				typeof mongoCollection.countDocuments
			>[1],
		) => {
			return mongoCollection.countDocuments(
				filter,
				options,
			);
		},

		estimatedDocumentCount: async (
			options?: Parameters<
				typeof mongoCollection.estimatedDocumentCount
			>[0],
		) => {
			return mongoCollection.estimatedDocumentCount(
				options,
			);
		},

		// -------------------------
		// EXISTS
		// -------------------------

		exists: async (filter: Filter<T>) => {
			return (
				(await mongoCollection.countDocuments(filter, {
					limit: 1,
				})) > 0
			);
		},
	};
};