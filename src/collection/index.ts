import type {
    Db,
    Filter,
    FilterOperators,
    InsertOneResult,
    OptionalUnlessRequiredId,
    Sort,
    UpdateFilter,
    WithId,
} from "mongodb";

import type { CollectionLimit } from "./types";

export const collection = (db: Db) => <
    T extends Record<string, unknown>,
>(
    collectionName: string,
    searchField: keyof T & string = "title",
    defaultSortBy: keyof T & string = "createdAt",
) => ({
    all: async ({
        limit = 10,
        sortBy = defaultSortBy,
        order = -1,
    }: CollectionLimit<T> = {}) => {
        return db
            .collection<T>(collectionName)
            .find({})
            .sort({ [sortBy]: order } satisfies Sort)
            .limit(limit)
            .toArray();
    },

    collection: async ({
        query = "",
        limit = 10,
        sortBy = defaultSortBy,
        order = -1,
    }: CollectionLimit<T> = {}) => {
        return db
            .collection<T>(collectionName)
            .find({
                [searchField]: {
                    $regex: query,
                    $options: "i",
                },
            } as Filter<T>)
            .sort({ [sortBy]: order } satisfies Sort)
            .limit(limit)
            .toArray();
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
                : {
                      [field]: filter,
                  } as Filter<T>;

        return db
            .collection<T>(collectionName)
            .find(query)
            .sort({ [sortBy]: order } satisfies Sort)
            .limit(limit)
            .toArray();
    },

    findOne: async <K extends keyof T & string>(
        field: K,
        value: T[K] | FilterOperators<T[K]>,
    ) => {
        return db.collection<T>(collectionName).findOne({
            [field]: value,
        } as Filter<T>);
    },

    findOneAndUpdate: async <K extends keyof T & string>(
        field: K,
        value: T[K],
        update: UpdateFilter<T>,
    ) => {
        return db.collection<T>(collectionName).findOneAndUpdate(
            {
                [field]: value,
            } as Filter<T>,
            update,
            {
                returnDocument: "after",
            },
        );
    },

    insertOne: async (
        data: OptionalUnlessRequiredId<T>,
    ): Promise<InsertOneResult<T>> => {
        return db.collection<T>(collectionName).insertOne(data);
    },

    create: async (data: T) => {
        const now = new Date();

        const document = {
            ...data,
            created_at: now,
            updated_at: now,
        };

        const result = await db
            .collection<T>(collectionName)
            .insertOne(
                document as unknown as OptionalUnlessRequiredId<T>,
            );

        return {
            ...document,
            _id: result.insertedId,
        } as unknown as WithId<
            T & {
                created_at: Date;
                updated_at: Date;
            }
        >;
    },
});