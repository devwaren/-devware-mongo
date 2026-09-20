import type { CreateMongoFn } from "./types";
import { collection } from "../collection";

export const create: CreateMongoFn = async ({
	uri,
	database,
	message,
}) => {
	if (
		typeof globalThis !== "undefined" &&
		typeof (globalThis as { window?: unknown }).window !==
			"undefined"
	) {
		throw new Error(
			"MongoDB creation should only be used on the server.",
		);
	}

	if (!uri?.trim()) {
		throw new Error(
			message?.failure ??
				"MongoDB URI is not configured.",
		);
	}

	if (!database?.trim()) {
		throw new Error(
			message?.failure ??
				"MongoDB database name is not configured.",
		);
	}

	const [{ default: dns }, { MongoClient }] =
		await Promise.all([
			import("node:dns"),
			import("mongodb"),
		]);

	dns.setServers(["1.1.1.1"]);

	const client = new MongoClient(uri);

	try {
		await client.connect();

		const db = client.db(database);

		console.log(
			message?.success ??
				"MongoDB connected successfully.",
		);

		return {
			collection: collection(db),
			db,
			disconnect: () => client.close(),
		};
	} catch (error) {
		await client.close().catch(() => undefined);

		console.error(
			message?.failure ??
				"MongoDB connection failed.",
		);

		throw error;
	}
};