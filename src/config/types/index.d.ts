import type { Db } from "mongodb";
import { createService } from "../../collection";

type CreateMongoOptions = {
	mongoURI: string;
	databaseName: string;
	message: {
		success: string;
		failure: string;
	}
};

type Mongo = {
	service: ReturnType<typeof createService>;
	disconnect: () => Promise<void>;
	db: Db
};

export type CreateMongoFn = (
	options: CreateMongoOptions,
) => Promise<Mongo>;

export type { CreateMongoOptions, Mongo };