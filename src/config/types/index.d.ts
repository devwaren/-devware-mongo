import type { MongoClient } from "mongodb";
import { createService } from "../../collection";

type CreateMongoOptions = {
	mongoURI: string;
	databaseName: string;
};

type Mongo = {
	service: ReturnType<typeof createService>;
};

export type CreateMongoFn = (options: CreateMongoOptions) =>Promise<Mongo>;