import dns from "node:dns";
import { MongoClient } from "mongodb";

import type { CreateMongoFn } from "./types";
import { collection } from "../collection";

dns.setServers(["1.1.1.1"]);

export const create: CreateMongoFn = async ({
    uri,
    database,
    message,
}) => {
    if (
        typeof globalThis !== "undefined" &&
        typeof (globalThis as any).window !== "undefined"
    ) {
        throw new Error(
            "mongodb creation should only be used on the server.",
        );
    }

    if (!uri?.trim()) {
        throw new Error(
            message?.failure || "MongoDB URI is not configured.",
        );
    }

    if (!database?.trim()) {
        throw new Error(
            message?.failure ||
                "MongoDB database name is not configured.",
        );
    }

    const client = new MongoClient(uri);

    try {
        await client.connect();

        const db = client.db(database);

        console.log(message?.success);

        return {
            collection: collection(db),
            db,
            disconnect: () => client.close(),
        };
    } catch (error) {
        await client.close().catch(() => undefined);

        console.error(message?.failure);

        throw error;
    }
};