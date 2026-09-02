import type { SetEnvFn } from "./types";

const setEnv: SetEnvFn = (name) => {
	const value = process.env[name];

	if (
		typeof globalThis !== "undefined" &&
		typeof (globalThis as any).window !== "undefined"
	) {
		throw new Error(
			"setEnv should only be used on the server.",
		);
	}

	if (!value) {
		throw new Error(`Environment variable ${name} is not defined`);
	}

	return value;
};

export { setEnv };
