import { config } from "dotenv";
import type { SetEnvFn } from "./types";

const isServer =
	typeof globalThis !== "undefined" &&
	!("window" in globalThis);

if (isServer) {
	config({
		quiet: true
	});
}

const setEnv: SetEnvFn = (name) => {
	if (!isServer) {
		throw new Error(
			"setEnv should only be used on the server.",
		);
	}

	const value = process.env[name];

	if (!value?.trim()) {
		throw new Error(
			`Environment variable "${name}" is not defined.`,
		);
	}

	return value;
};

export { setEnv };