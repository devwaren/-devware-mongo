import { MongoClient } from "mongodb";
import type { CreateMongoFn } from "./types";
import { createService } from "../collection";



export const createMongo: CreateMongoFn = async ({
	mongoURI,
	databaseName,
}) => {

	if (typeof globalThis !== "undefined" && typeof (globalThis as any).window !== "undefined") {
		throw new Error("createMongo should only be used on the server.");
	}

	if (!mongoURI?.trim()) {
		throw new Error("MongoDB URI is not configured.");
	}

	if (!databaseName?.trim()) {
		throw new Error("MongoDB database name is not configured.");
	}

	const client = new MongoClient(mongoURI);

	await client.connect();

	const db = client.db(databaseName);
	const service = createService(db);

	return {
		service,
	};
};