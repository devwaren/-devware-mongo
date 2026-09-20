import type { Db } from "mongodb";
import { collection } from "../../collection";

type CreateMongoOptions = {
	uri: string;
	database: string;
	message?: {
		success: string;
		failure: string;
	};
};

type CollectionFactory = ReturnType<typeof collection>;

type Mongo = {
	collection: CollectionFactory;
	disconnect: () => Promise<void>;
	db: Db;
};

export type CreateMongoFn = (
	options: CreateMongoOptions,
) => Promise<Mongo>;

export type {
	CreateMongoOptions,
	Mongo,
	CollectionFactory,
};