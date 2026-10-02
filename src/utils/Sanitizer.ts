import xss from "xss";

const options = {
	whiteList: {},
	stripIgnoreTag: true,
	stripIgnoreTagBody: ["script"],
};

function isNativeObject(value: unknown) {
	return (
		value instanceof File ||
		value instanceof Blob ||
		value instanceof Date ||
		value instanceof URL
	);
}

export function sanitize<T>(value: T): T {
	if (typeof value === "string") {
		return xss(value, options) as T;
	}

	if (isNativeObject(value)) {
		return value;
	}

	if (Array.isArray(value)) {
		return value.map(sanitize) as T;
	}

	if (value && typeof value === "object") {
		return Object.fromEntries(
			Object.entries(value).map(([key, val]) => [
				key,
				sanitize(val),
			]),
		) as T;
	}

	return value;
}