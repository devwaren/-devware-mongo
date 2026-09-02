import dns from "node:dns";
import { MongoClient } from "mongodb";

import type { CreateMongoFn } from "./types";
import { createService } from "../collection";

dns.setServers([
	"1.1.1.1",
]);

export const createMongo: CreateMongoFn = async ({
	mongoURI,
	databaseName,
	message,
}) => {
	if (
		typeof globalThis !== "undefined" &&
		typeof (globalThis as any).window !== "undefined"
	) {
		throw new Error(
			"createMongo should only be used on the server.",
		);
	}

	if (!mongoURI?.trim()) {
		throw new Error(
			message.failure || "MongoDB URI is not configured.",
		);
	}

	if (!databaseName?.trim()) {
		throw new Error(
			message.failure ||
				"MongoDB database name is not configured.",
		);
	}

	const client = new MongoClient(mongoURI);

	try {
		await client.connect();

		const db = client.db(databaseName);
		const service = createService(db);

		console.log(message.success);

		return {
			service,
			disconnect: () => client.close(),
			db,
		};
	} catch (error) {
		await client.close().catch(() => undefined);

		console.error(message.failure);

		throw error;
	}
};